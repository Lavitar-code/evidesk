use crate::db::connection::open_connection;
use crate::db::init::initialize_database;
use crate::models::search::{SearchAllPayload, SearchResultItem};
use rusqlite::params;

#[tauri::command]
pub fn search_all(payload: SearchAllPayload) -> Result<Vec<SearchResultItem>, String> {
    initialize_database()?;
    let connection = open_connection()?;

    let trimmed_query = payload.query.trim();

    if trimmed_query.is_empty() {
        return Ok(vec![]);
    }

    let limit = payload.limit.unwrap_or(8).clamp(1, 20);
    let like_query = format!("%{trimmed_query}%");
    let lower_query = trimmed_query.to_ascii_lowercase();

    let mut results: Vec<SearchResultItem> = Vec::new();

    let mut topic_statement = connection
        .prepare(
            r#"
            SELECT
              id,
              title,
              slug,
              description,
              updated_at
            FROM topics
            WHERE archived_at IS NULL
              AND (
                title LIKE ?1
                OR COALESCE(description, '') LIKE ?1
              )
            ORDER BY updated_at DESC, title ASC
            LIMIT ?2
            "#,
        )
        .map_err(|error| format!("Failed to prepare topic search query: {error}"))?;

    let topic_rows = topic_statement
        .query_map(params![like_query, limit], |row| {
            let title: String = row.get(1)?;
            let slug: String = row.get(2)?;
            let description: Option<String> = row.get(3)?;
            let matched_field = if title.to_ascii_lowercase().contains(&lower_query) {
                "title".to_string()
            } else {
                "description".to_string()
            };

            Ok(SearchResultItem {
                id: row.get(0)?,
                entity_type: "topic".to_string(),
                title,
                subtitle: Some(format!("slug: {slug}")),
                snippet: description,
                matched_field,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|error| format!("Failed to execute topic search query: {error}"))?;

    for row in topic_rows {
        results.push(row.map_err(|error| format!("Failed to read topic search result: {error}"))?);
    }

    let mut source_statement = connection
        .prepare(
            r#"
            SELECT
              id,
              kind,
              COALESCE(title, ''),
              description,
              source_url,
              updated_at
            FROM sources
            WHERE archived_at IS NULL
              AND kind != 'note'
              AND (
                COALESCE(title, '') LIKE ?1
                OR COALESCE(description, '') LIKE ?1
                OR COALESCE(source_url, '') LIKE ?1
              )
            ORDER BY updated_at DESC, title ASC
            LIMIT ?2
            "#,
        )
        .map_err(|error| format!("Failed to prepare source search query: {error}"))?;

    let source_rows = source_statement
        .query_map(params![like_query, limit], |row| {
            let kind: String = row.get(1)?;
            let title: String = row.get(2)?;
            let description: Option<String> = row.get(3)?;
            let source_url: Option<String> = row.get(4)?;
            let matched_field = if title.to_ascii_lowercase().contains(&lower_query) {
                "title".to_string()
            } else if description
                .as_ref()
                .map(|value| value.to_ascii_lowercase().contains(&lower_query))
                .unwrap_or(false)
            {
                "description".to_string()
            } else {
                "url".to_string()
            };

            Ok(SearchResultItem {
                id: row.get(0)?,
                entity_type: "source".to_string(),
                title,
                subtitle: Some(kind.to_uppercase()),
                snippet: description.or(source_url),
                matched_field,
                updated_at: row.get(5)?,
            })
        })
        .map_err(|error| format!("Failed to execute source search query: {error}"))?;

    for row in source_rows {
        results.push(row.map_err(|error| format!("Failed to read source search result: {error}"))?);
    }

    let mut note_statement = connection
        .prepare(
            r#"
            SELECT
              s.id,
              COALESCE(s.title, ''),
              n.markdown_content,
              COALESCE(GROUP_CONCAT(t.title, ', '), ''),
              s.updated_at
            FROM sources s
            INNER JOIN notes n ON n.source_id = s.id
            LEFT JOIN source_topics st ON st.source_id = s.id
            LEFT JOIN topics t ON t.id = st.topic_id
            WHERE s.archived_at IS NULL
              AND s.kind = 'note'
              AND (
                COALESCE(s.title, '') LIKE ?1
                OR n.markdown_content LIKE ?1
              )
            GROUP BY
              s.id,
              s.title,
              n.markdown_content,
              s.updated_at
            ORDER BY s.updated_at DESC, s.title ASC
            LIMIT ?2
            "#,
        )
        .map_err(|error| format!("Failed to prepare note search query: {error}"))?;

    let note_rows = note_statement
        .query_map(params![like_query, limit], |row| {
            let title: String = row.get(1)?;
            let content: String = row.get(2)?;
            let topic_names: String = row.get(3)?;
            let matched_field = if title.to_ascii_lowercase().contains(&lower_query) {
                "title".to_string()
            } else {
                "content".to_string()
            };

            Ok(SearchResultItem {
                id: row.get(0)?,
                entity_type: "note".to_string(),
                title,
                subtitle: if topic_names.is_empty() {
                    Some("Markdown note".to_string())
                } else {
                    Some(format!("Topics: {topic_names}"))
                },
                snippet: Some(build_search_snippet(&content, trimmed_query)),
                matched_field,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|error| format!("Failed to execute note search query: {error}"))?;

    for row in note_rows {
        results.push(row.map_err(|error| format!("Failed to read note search result: {error}"))?);
    }

    results.sort_by(|a, b| {
        let a_value = a.updated_at.parse::<i64>().unwrap_or(0);
        let b_value = b.updated_at.parse::<i64>().unwrap_or(0);

        b_value
            .cmp(&a_value)
            .then_with(|| a.entity_type.cmp(&b.entity_type))
            .then_with(|| a.title.cmp(&b.title))
    });

    Ok(results)
}

fn build_search_snippet(content: &str, query: &str) -> String {
    let compact = content.split_whitespace().collect::<Vec<_>>().join(" ");

    if compact.is_empty() {
        return String::new();
    }

    let compact_lower = compact.to_ascii_lowercase();
    let query_lower = query.to_ascii_lowercase();

    if let Some(position) = compact_lower.find(&query_lower) {
        let start = position.saturating_sub(70);
        let end = (position + query.len() + 90).min(compact.len());
        let snippet = compact[start..end].to_string();

        if start > 0 || end < compact.len() {
            format!("...{}...", snippet.trim())
        } else {
            snippet.trim().to_string()
        }
    } else if compact.len() > 180 {
        format!("{}...", compact.chars().take(180).collect::<String>())
    } else {
        compact
    }
}
