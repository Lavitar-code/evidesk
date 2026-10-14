use crate::db::connection::open_connection;
use crate::db::init::initialize_database;
use crate::models::excerpt::{
    ArchiveExcerptPayload, ArchivedExcerptListItem, CreateExcerptPayload, ExcerptDetail,
    ExcerptListItem, GetExcerptDetailPayload, RestoreExcerptPayload, UpdateExcerptPayload,
};
use rusqlite::{params, OptionalExtension};
use std::time::{SystemTime, UNIX_EPOCH};
use ulid::Ulid;

#[tauri::command]
pub fn list_excerpts() -> Result<Vec<ExcerptListItem>, String> {
    initialize_database()?;
    let connection = open_connection()?;

    let mut statement = connection
        .prepare(
            r#"
            SELECT
              e.id,
              e.source_id,
              COALESCE(s.title, '') AS source_title,
              s.kind,
              e.excerpt_text,
              e.note,
              e.citation_text,
              e.page_label,
              COALESCE(GROUP_CONCAT(t.title, ', '), '') AS topic_names,
              e.created_at,
              e.updated_at
            FROM excerpts e
            INNER JOIN sources s ON s.id = e.source_id
            LEFT JOIN source_topics st ON st.source_id = s.id
            LEFT JOIN topics t ON t.id = st.topic_id AND t.archived_at IS NULL
            WHERE s.archived_at IS NULL
            GROUP BY
              e.id,
              e.source_id,
              s.title,
              s.kind,
              e.excerpt_text,
              e.note,
              e.citation_text,
              e.page_label,
              e.created_at,
              e.updated_at
            ORDER BY e.updated_at DESC, e.created_at DESC
            "#,
        )
        .map_err(|error| format!("Failed to prepare excerpt list query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            let excerpt_text: String = row.get(4)?;

            Ok(ExcerptListItem {
                id: row.get(0)?,
                source_id: row.get(1)?,
                source_title: row.get(2)?,
                source_kind: row.get(3)?,
                preview_text: build_preview_text(&excerpt_text),
                note: row.get(5)?,
                citation_text: row.get(6)?,
                page_label: row.get(7)?,
                topic_names: row.get(8)?,
                created_at: row.get(9)?,
                updated_at: row.get(10)?,
            })
        })
        .map_err(|error| format!("Failed to execute excerpt list query: {error}"))?;

    let excerpts: Result<Vec<_>, _> = rows.collect();

    excerpts.map_err(|error| format!("Failed to read excerpts from database: {error}"))
}

#[tauri::command]
pub fn list_archived_excerpts() -> Result<Vec<ArchivedExcerptListItem>, String> {
    initialize_database()?;
    let connection = open_connection()?;

    let mut statement = connection
        .prepare(
            r#"
            SELECT
              e.id,
              e.source_id,
              COALESCE(s.title, '') AS source_title,
              e.excerpt_text,
              s.archived_at,
              s.updated_at
            FROM excerpts e
            INNER JOIN sources s ON s.id = e.source_id
            WHERE s.archived_at IS NOT NULL
            ORDER BY s.archived_at DESC, s.updated_at DESC
            "#,
        )
        .map_err(|error| format!("Failed to prepare archived excerpt list query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            let excerpt_text: String = row.get(3)?;
            Ok(ArchivedExcerptListItem {
                id: row.get(0)?,
                source_id: row.get(1)?,
                source_title: row.get(2)?,
                preview_text: build_preview_text(&excerpt_text),
                archived_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })
        .map_err(|error| format!("Failed to execute archived excerpt list query: {error}"))?;

    let items: Result<Vec<_>, _> = rows.collect();

    items.map_err(|error| format!("Failed to read archived excerpts from database: {error}"))
}

#[tauri::command]
pub fn get_excerpt_detail(payload: GetExcerptDetailPayload) -> Result<ExcerptDetail, String> {
    initialize_database()?;
    let connection = open_connection()?;

    get_excerpt_detail_by_id(&connection, &payload.id)
}

#[tauri::command]
pub fn create_excerpt(payload: CreateExcerptPayload) -> Result<ExcerptListItem, String> {
    initialize_database()?;
    let mut connection = open_connection()?;

    let source_id = payload.source_id.trim();
    let excerpt_text = payload.excerpt_text.trim();

    if source_id.is_empty() {
        return Err("Source is required".to_string());
    }

    if excerpt_text.is_empty() {
        return Err("Excerpt text cannot be empty".to_string());
    }

    let note = payload
        .note
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let page_label = payload
        .page_label
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let tx = connection
        .transaction()
        .map_err(|error| format!("Failed to start excerpt transaction: {error}"))?;

    let source_row: Option<(String, String, Option<String>)> = tx
        .query_row(
            r#"
            SELECT
              COALESCE(s.title, '') AS source_title,
              s.kind,
              sf.original_filename
            FROM sources s
            LEFT JOIN source_files sf ON sf.source_id = s.id
            WHERE s.id = ?1 AND s.archived_at IS NULL
            LIMIT 1
            "#,
            params![source_id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .optional()
        .map_err(|error| format!("Failed to validate selected source: {error}"))?;

    let (source_title, source_kind, original_filename) =
        source_row.ok_or_else(|| "Selected source does not exist".to_string())?;

    let citation_text = build_citation_text(
        &source_title,
        &source_kind,
        original_filename.as_deref(),
        page_label.as_deref(),
    );

    let excerpt_id = Ulid::new().to_string();
    let timestamp = current_timestamp_string();

    tx.execute(
        r#"
        INSERT INTO excerpts (
          id,
          source_id,
          excerpt_text,
          note,
          page_label,
          citation_text,
          created_at,
          updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
        "#,
        params![
            excerpt_id,
            source_id,
            excerpt_text,
            note,
            page_label,
            citation_text,
            timestamp,
            timestamp
        ],
    )
    .map_err(|error| format!("Failed to create excerpt: {error}"))?;

    tx.commit()
        .map_err(|error| format!("Failed to commit excerpt transaction: {error}"))?;

    get_excerpt_list_item_by_id(&connection, &excerpt_id)
}

#[tauri::command]
pub fn update_excerpt(payload: UpdateExcerptPayload) -> Result<ExcerptDetail, String> {
    initialize_database()?;
    let connection = open_connection()?;

    let excerpt_text = payload.excerpt_text.trim();

    if excerpt_text.is_empty() {
        return Err("Excerpt text cannot be empty".to_string());
    }

    let note = payload
        .note
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let page_label = payload
        .page_label
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let source_row: Option<(String, String, Option<String>)> = connection
        .query_row(
            r#"
            SELECT
              COALESCE(s.title, '') AS source_title,
              s.kind,
              sf.original_filename
            FROM excerpts e
            INNER JOIN sources s ON s.id = e.source_id
            LEFT JOIN source_files sf ON sf.source_id = s.id
            WHERE e.id = ?1 AND s.archived_at IS NULL
            LIMIT 1
            "#,
            params![payload.id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .optional()
        .map_err(|error| format!("Failed to load excerpt source context: {error}"))?;

    let (source_title, source_kind, original_filename) =
        source_row.ok_or_else(|| "Excerpt not found".to_string())?;

    let citation_text = build_citation_text(
        &source_title,
        &source_kind,
        original_filename.as_deref(),
        page_label.as_deref(),
    );

    let timestamp = current_timestamp_string();

    let updated_rows = connection
        .execute(
            r#"
            UPDATE excerpts
            SET
              excerpt_text = ?2,
              note = ?3,
              page_label = ?4,
              citation_text = ?5,
              updated_at = ?6
            WHERE id = ?1
            "#,
            params![
                payload.id,
                excerpt_text,
                note,
                page_label,
                citation_text,
                timestamp
            ],
        )
        .map_err(|error| format!("Failed to update excerpt: {error}"))?;

    if updated_rows == 0 {
        return Err("Excerpt not found".to_string());
    }

    get_excerpt_detail_by_id(&connection, &payload.id)
}

#[tauri::command]
pub fn archive_excerpt(payload: ArchiveExcerptPayload) -> Result<(), String> {
    initialize_database()?;
    let connection = open_connection()?;
    let timestamp = current_timestamp_string();

    let updated_rows = connection
        .execute(
            r#"
            UPDATE sources
            SET archived_at = ?2, updated_at = ?2
            WHERE id = (
              SELECT source_id
              FROM excerpts
              WHERE id = ?1
              LIMIT 1
            ) AND archived_at IS NULL
            "#,
            params![payload.id, timestamp],
        )
        .map_err(|error| format!("Failed to archive excerpt source: {error}"))?;

    if updated_rows == 0 {
        return Err("Excerpt not found".to_string());
    }

    Ok(())
}

#[tauri::command]
pub fn restore_excerpt(payload: RestoreExcerptPayload) -> Result<(), String> {
    initialize_database()?;
    let connection = open_connection()?;
    let timestamp = current_timestamp_string();

    let updated_rows = connection
        .execute(
            r#"
            UPDATE sources
            SET archived_at = NULL, updated_at = ?2
            WHERE id = (
              SELECT source_id
              FROM excerpts
              WHERE id = ?1
              LIMIT 1
            ) AND archived_at IS NOT NULL
            "#,
            params![payload.id, timestamp],
        )
        .map_err(|error| format!("Failed to restore excerpt source: {error}"))?;

    if updated_rows == 0 {
        return Err("Archived excerpt not found".to_string());
    }

    Ok(())
}

fn get_excerpt_list_item_by_id(
    connection: &rusqlite::Connection,
    excerpt_id: &str,
) -> Result<ExcerptListItem, String> {
    connection
        .query_row(
            r#"
            SELECT
              e.id,
              e.source_id,
              COALESCE(s.title, '') AS source_title,
              s.kind,
              e.excerpt_text,
              e.note,
              e.citation_text,
              e.page_label,
              COALESCE(GROUP_CONCAT(t.title, ', '), '') AS topic_names,
              e.created_at,
              e.updated_at
            FROM excerpts e
            INNER JOIN sources s ON s.id = e.source_id
            LEFT JOIN source_topics st ON st.source_id = s.id
            LEFT JOIN topics t ON t.id = st.topic_id AND t.archived_at IS NULL
            WHERE e.id = ?1 AND s.archived_at IS NULL
            GROUP BY
              e.id,
              e.source_id,
              s.title,
              s.kind,
              e.excerpt_text,
              e.note,
              e.citation_text,
              e.page_label,
              e.created_at,
              e.updated_at
            LIMIT 1
            "#,
            params![excerpt_id],
            |row| {
                let excerpt_text: String = row.get(4)?;

                Ok(ExcerptListItem {
                    id: row.get(0)?,
                    source_id: row.get(1)?,
                    source_title: row.get(2)?,
                    source_kind: row.get(3)?,
                    preview_text: build_preview_text(&excerpt_text),
                    note: row.get(5)?,
                    citation_text: row.get(6)?,
                    page_label: row.get(7)?,
                    topic_names: row.get(8)?,
                    created_at: row.get(9)?,
                    updated_at: row.get(10)?,
                })
            },
        )
        .map_err(|error| format!("Failed to fetch created excerpt: {error}"))
}

fn get_excerpt_detail_by_id(
    connection: &rusqlite::Connection,
    excerpt_id: &str,
) -> Result<ExcerptDetail, String> {
    connection
        .query_row(
            r#"
            SELECT
              e.id,
              e.source_id,
              COALESCE(s.title, '') AS source_title,
              s.kind,
              e.excerpt_text,
              e.note,
              e.citation_text,
              e.page_label,
              COALESCE(GROUP_CONCAT(t.title, ', '), '') AS topic_names,
              e.created_at,
              e.updated_at
            FROM excerpts e
            INNER JOIN sources s ON s.id = e.source_id
            LEFT JOIN source_topics st ON st.source_id = s.id
            LEFT JOIN topics t ON t.id = st.topic_id AND t.archived_at IS NULL
            WHERE e.id = ?1 AND s.archived_at IS NULL
            GROUP BY
              e.id,
              e.source_id,
              s.title,
              s.kind,
              e.excerpt_text,
              e.note,
              e.citation_text,
              e.page_label,
              e.created_at,
              e.updated_at
            LIMIT 1
            "#,
            params![excerpt_id],
            |row| {
                Ok(ExcerptDetail {
                    id: row.get(0)?,
                    source_id: row.get(1)?,
                    source_title: row.get(2)?,
                    source_kind: row.get(3)?,
                    excerpt_text: row.get(4)?,
                    note: row.get(5)?,
                    citation_text: row.get(6)?,
                    page_label: row.get(7)?,
                    topic_names: row.get(8)?,
                    created_at: row.get(9)?,
                    updated_at: row.get(10)?,
                })
            },
        )
        .map_err(|error| format!("Failed to fetch excerpt detail: {error}"))
}

fn build_preview_text(content: &str) -> String {
    let compact = content.split_whitespace().collect::<Vec<_>>().join(" ");

    if compact.len() > 180 {
        format!("{}...", compact.chars().take(180).collect::<String>())
    } else {
        compact
    }
}

fn build_citation_text(
    source_title: &str,
    source_kind: &str,
    original_filename: Option<&str>,
    page_label: Option<&str>,
) -> String {
    let base = if !source_title.trim().is_empty() {
        source_title.trim().to_string()
    } else if let Some(filename) = original_filename {
        filename.to_string()
    } else {
        "Untitled source".to_string()
    };

    match source_kind {
        "pdf" => {
            if let Some(page) = page_label {
                format!("{base} — p. {page}")
            } else {
                format!("{base} — PDF")
            }
        }
        "note" => format!("{base} — Note"),
        "url" => format!("{base} — Web source"),
        _ => format!("{base} — Source"),
    }
}

fn current_timestamp_string() -> String {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(duration) => duration.as_secs().to_string(),
        Err(_) => "0".to_string(),
    }
}