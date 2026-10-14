use crate::db::connection::open_connection;
use crate::db::init::initialize_database;
use crate::models::topic::{
    CreateTopicPayload, GetTopicDetailPayload, TopicDetail, TopicListItem,
};
use rusqlite::{params, OptionalExtension};
use std::time::{SystemTime, UNIX_EPOCH};
use ulid::Ulid;

#[tauri::command]
pub fn list_topics() -> Result<Vec<TopicListItem>, String> {
    initialize_database()?;
    let connection = open_connection()?;

    let mut statement = connection
        .prepare(
            r#"
            SELECT
              t.id,
              t.title,
              t.slug,
              t.description,
              t.color,
              COUNT(DISTINCT st.source_id) AS source_count,
              t.created_at,
              t.updated_at
            FROM topics t
            LEFT JOIN source_topics st ON st.topic_id = t.id
            WHERE t.archived_at IS NULL
            GROUP BY
              t.id,
              t.title,
              t.slug,
              t.description,
              t.color,
              t.created_at,
              t.updated_at
            ORDER BY t.updated_at DESC, t.title ASC
            "#,
        )
        .map_err(|error| format!("Failed to prepare topic list query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(TopicListItem {
                id: row.get(0)?,
                title: row.get(1)?,
                slug: row.get(2)?,
                description: row.get(3)?,
                color: row.get(4)?,
                source_count: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|error| format!("Failed to execute topic list query: {error}"))?;

    let topics: Result<Vec<_>, _> = rows.collect();

    topics.map_err(|error| format!("Failed to read topics from database: {error}"))
}

#[tauri::command]
pub fn get_topic_detail(payload: GetTopicDetailPayload) -> Result<TopicDetail, String> {
    initialize_database()?;
    let connection = open_connection()?;

    connection
        .query_row(
            r#"
            SELECT
              t.id,
              t.title,
              t.slug,
              t.description,
              t.color,
              COUNT(DISTINCT st.source_id) AS source_count,
              COUNT(DISTINCT CASE WHEN s.kind = 'note' THEN s.id END) AS note_count,
              COUNT(DISTINCT CASE WHEN e.id IS NOT NULL THEN e.id END) AS excerpt_count,
              COUNT(DISTINCT CASE WHEN s.kind = 'pdf' THEN s.id END) AS pdf_count,
              COUNT(DISTINCT CASE WHEN s.kind = 'url' THEN s.id END) AS url_count,
              COUNT(DISTINCT tt.task_id) AS task_count,
              t.created_at,
              t.updated_at
            FROM topics t
            LEFT JOIN source_topics st ON st.topic_id = t.id
            LEFT JOIN sources s ON s.id = st.source_id AND s.archived_at IS NULL
            LEFT JOIN excerpts e ON e.source_id = s.id
            LEFT JOIN task_topics tt ON tt.topic_id = t.id
            LEFT JOIN tasks tk ON tk.id = tt.task_id AND tk.archived_at IS NULL
            WHERE t.id = ?1 AND t.archived_at IS NULL
            GROUP BY
              t.id,
              t.title,
              t.slug,
              t.description,
              t.color,
              t.created_at,
              t.updated_at
            LIMIT 1
            "#,
            params![payload.id],
            |row| {
                Ok(TopicDetail {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    slug: row.get(2)?,
                    description: row.get(3)?,
                    color: row.get(4)?,
                    source_count: row.get(5)?,
                    note_count: row.get(6)?,
                    excerpt_count: row.get(7)?,
                    pdf_count: row.get(8)?,
                    url_count: row.get(9)?,
                    task_count: row.get(10)?,
                    created_at: row.get(11)?,
                    updated_at: row.get(12)?,
                })
            },
        )
        .optional()
        .map_err(|error| format!("Failed to fetch topic detail: {error}"))?
        .ok_or_else(|| "Topic not found".to_string())
}

#[tauri::command]
pub fn create_topic(payload: CreateTopicPayload) -> Result<TopicListItem, String> {
    initialize_database()?;
    let connection = open_connection()?;

    let title = payload.title.trim();

    if title.is_empty() {
        return Err("Topic title is required".to_string());
    }

    if title.len() > 120 {
        return Err("Topic title is too long".to_string());
    }

    let description = payload
        .description
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let color = payload
        .color
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let slug = slugify(title);
    let timestamp = current_timestamp_string();
    let topic_id = Ulid::new().to_string();

    connection
        .execute(
            r#"
            INSERT INTO topics (
              id,
              title,
              slug,
              description,
              color,
              created_at,
              updated_at,
              archived_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, NULL)
            "#,
            params![topic_id, title, slug, description, color, timestamp, timestamp],
        )
        .map_err(|error| format!("Failed to create topic: {error}"))?;

    connection
        .query_row(
            r#"
            SELECT
              t.id,
              t.title,
              t.slug,
              t.description,
              t.color,
              COUNT(DISTINCT st.source_id) AS source_count,
              t.created_at,
              t.updated_at
            FROM topics t
            LEFT JOIN source_topics st ON st.topic_id = t.id
            WHERE t.id = ?1
            GROUP BY
              t.id,
              t.title,
              t.slug,
              t.description,
              t.color,
              t.created_at,
              t.updated_at
            LIMIT 1
            "#,
            params![topic_id],
            |row| {
                Ok(TopicListItem {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    slug: row.get(2)?,
                    description: row.get(3)?,
                    color: row.get(4)?,
                    source_count: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            },
        )
        .map_err(|error| format!("Failed to fetch created topic: {error}"))
}

fn slugify(input: &str) -> String {
    let mut slug = String::new();
    let mut last_was_dash = false;

    for character in input.chars() {
        if character.is_ascii_alphanumeric() {
            slug.push(character.to_ascii_lowercase());
            last_was_dash = false;
        } else if !last_was_dash {
            slug.push('-');
            last_was_dash = true;
        }
    }

    let trimmed = slug.trim_matches('-').to_string();

    if trimmed.is_empty() {
        "topic".to_string()
    } else {
        trimmed
    }
}

fn current_timestamp_string() -> String {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(duration) => duration.as_secs().to_string(),
        Err(_) => "0".to_string(),
    }
}