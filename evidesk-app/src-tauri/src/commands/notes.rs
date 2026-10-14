use crate::db::connection::open_connection;
use crate::db::init::initialize_database;
use crate::models::note::{
    ArchiveNotePayload, ArchivedNoteListItem, CreateNotePayload, GetNoteDetailPayload, NoteDetail,
    NoteListItem, RestoreNotePayload, UpdateNotePayload,
};
use rusqlite::{params, OptionalExtension};
use std::time::{SystemTime, UNIX_EPOCH};
use ulid::Ulid;

#[tauri::command]
pub fn list_notes() -> Result<Vec<NoteListItem>, String> {
    initialize_database()?;
    let connection = open_connection()?;

    let mut statement = connection
        .prepare(
            r#"
            SELECT
              s.id,
              s.title,
              n.markdown_content,
              COALESCE(GROUP_CONCAT(t.title, ', '), '') AS topic_names,
              COUNT(st.topic_id) AS topic_count,
              s.created_at,
              s.updated_at
            FROM sources s
            INNER JOIN notes n ON n.source_id = s.id
            LEFT JOIN source_topics st ON st.source_id = s.id
            LEFT JOIN topics t ON t.id = st.topic_id AND t.archived_at IS NULL
            WHERE s.kind = 'note' AND s.archived_at IS NULL
            GROUP BY
              s.id,
              s.title,
              n.markdown_content,
              s.created_at,
              s.updated_at
            ORDER BY s.updated_at DESC, s.created_at DESC
            "#,
        )
        .map_err(|error| format!("Failed to prepare note list query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            let markdown_content: String = row.get(2)?;

            Ok(NoteListItem {
                id: row.get(0)?,
                title: row.get(1)?,
                content_preview: build_preview_text(&markdown_content),
                topic_names: row.get(3)?,
                topic_count: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|error| format!("Failed to execute note list query: {error}"))?;

    let notes: Result<Vec<_>, _> = rows.collect();

    notes.map_err(|error| format!("Failed to read notes from database: {error}"))
}

#[tauri::command]
pub fn list_archived_notes() -> Result<Vec<ArchivedNoteListItem>, String> {
    initialize_database()?;
    let connection = open_connection()?;

    let mut statement = connection
        .prepare(
            r#"
            SELECT
              s.id,
              s.title,
              n.markdown_content,
              s.archived_at,
              s.updated_at
            FROM sources s
            INNER JOIN notes n ON n.source_id = s.id
            WHERE s.kind = 'note' AND s.archived_at IS NOT NULL
            ORDER BY s.archived_at DESC, s.updated_at DESC
            "#,
        )
        .map_err(|error| format!("Failed to prepare archived note list query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            let markdown_content: String = row.get(2)?;
            Ok(ArchivedNoteListItem {
                id: row.get(0)?,
                title: row.get(1)?,
                content_preview: build_preview_text(&markdown_content),
                archived_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|error| format!("Failed to execute archived note list query: {error}"))?;

    let items: Result<Vec<_>, _> = rows.collect();

    items.map_err(|error| format!("Failed to read archived notes from database: {error}"))
}

#[tauri::command]
pub fn get_note_detail(payload: GetNoteDetailPayload) -> Result<NoteDetail, String> {
    initialize_database()?;
    let connection = open_connection()?;

    get_note_detail_by_id(&connection, &payload.id)
}

#[tauri::command]
pub fn create_note(payload: CreateNotePayload) -> Result<NoteListItem, String> {
    initialize_database()?;
    let mut connection = open_connection()?;

    let title = payload.title.trim();
    let markdown_content = payload.markdown_content.trim();

    if title.is_empty() {
        return Err("Note title is required".to_string());
    }

    if markdown_content.is_empty() {
        return Err("Note content cannot be empty".to_string());
    }

    let topic_id = payload
        .topic_id
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let source_id = Ulid::new().to_string();
    let timestamp = current_timestamp_string();

    let tx = connection
        .transaction()
        .map_err(|error| format!("Failed to start note transaction: {error}"))?;

    if let Some(topic_id_value) = topic_id.as_ref() {
        validate_topic_exists(&tx, topic_id_value)?;
    }

    tx.execute(
        r#"
        INSERT INTO sources (
          id,
          title,
          kind,
          url,
          description,
          created_at,
          updated_at,
          archived_at
        ) VALUES (?1, ?2, 'note', NULL, NULL, ?3, ?4, NULL)
        "#,
        params![source_id, title, timestamp, timestamp],
    )
    .map_err(|error| format!("Failed to create note source: {error}"))?;

    tx.execute(
        r#"
        INSERT INTO notes (
          id,
          source_id,
          markdown_content,
          created_at,
          updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5)
        "#,
        params![Ulid::new().to_string(), source_id, markdown_content, timestamp, timestamp],
    )
    .map_err(|error| format!("Failed to create note record: {error}"))?;

    if let Some(topic_id_value) = topic_id.as_ref() {
        tx.execute(
            r#"
            INSERT INTO source_topics (
              source_id,
              topic_id,
              linked_at
            ) VALUES (?1, ?2, ?3)
            "#,
            params![source_id, topic_id_value, timestamp],
        )
        .map_err(|error| format!("Failed to link note to topic: {error}"))?;
    }

    tx.commit()
        .map_err(|error| format!("Failed to commit note transaction: {error}"))?;

    get_note_list_item_by_id(&connection, &source_id)
}

#[tauri::command]
pub fn update_note(payload: UpdateNotePayload) -> Result<NoteDetail, String> {
    initialize_database()?;
    let connection = open_connection()?;

    let title = payload.title.trim();
    let markdown_content = payload.markdown_content.trim();

    if title.is_empty() {
        return Err("Note title is required".to_string());
    }

    if markdown_content.is_empty() {
        return Err("Note content cannot be empty".to_string());
    }

    let timestamp = current_timestamp_string();

    let updated_source_rows = connection
        .execute(
            r#"
            UPDATE sources
            SET
              title = ?2,
              updated_at = ?3
            WHERE id = ?1 AND kind = 'note' AND archived_at IS NULL
            "#,
            params![payload.id, title, timestamp],
        )
        .map_err(|error| format!("Failed to update note source: {error}"))?;

    if updated_source_rows == 0 {
        return Err("Note not found".to_string());
    }

    connection
        .execute(
            r#"
            UPDATE notes
            SET
              markdown_content = ?2,
              updated_at = ?3
            WHERE source_id = ?1
            "#,
            params![payload.id, markdown_content, timestamp],
        )
        .map_err(|error| format!("Failed to update note content: {error}"))?;

    get_note_detail_by_id(&connection, &payload.id)
}

#[tauri::command]
pub fn archive_note(payload: ArchiveNotePayload) -> Result<(), String> {
    initialize_database()?;
    let connection = open_connection()?;
    let timestamp = current_timestamp_string();

    let updated_rows = connection
        .execute(
            r#"
            UPDATE sources
            SET archived_at = ?2, updated_at = ?2
            WHERE id = ?1 AND kind = 'note' AND archived_at IS NULL
            "#,
            params![payload.id, timestamp],
        )
        .map_err(|error| format!("Failed to archive note: {error}"))?;

    if updated_rows == 0 {
        return Err("Note not found".to_string());
    }

    Ok(())
}

#[tauri::command]
pub fn restore_note(payload: RestoreNotePayload) -> Result<(), String> {
    initialize_database()?;
    let connection = open_connection()?;
    let timestamp = current_timestamp_string();

    let updated_rows = connection
        .execute(
            r#"
            UPDATE sources
            SET archived_at = NULL, updated_at = ?2
            WHERE id = ?1 AND kind = 'note' AND archived_at IS NOT NULL
            "#,
            params![payload.id, timestamp],
        )
        .map_err(|error| format!("Failed to restore note: {error}"))?;

    if updated_rows == 0 {
        return Err("Archived note not found".to_string());
    }

    Ok(())
}

fn get_note_list_item_by_id(
    connection: &rusqlite::Connection,
    source_id: &str,
) -> Result<NoteListItem, String> {
    connection
        .query_row(
            r#"
            SELECT
              s.id,
              s.title,
              n.markdown_content,
              COALESCE(GROUP_CONCAT(t.title, ', '), '') AS topic_names,
              COUNT(st.topic_id) AS topic_count,
              s.created_at,
              s.updated_at
            FROM sources s
            INNER JOIN notes n ON n.source_id = s.id
            LEFT JOIN source_topics st ON st.source_id = s.id
            LEFT JOIN topics t ON t.id = st.topic_id AND t.archived_at IS NULL
            WHERE s.id = ?1 AND s.kind = 'note' AND s.archived_at IS NULL
            GROUP BY
              s.id,
              s.title,
              n.markdown_content,
              s.created_at,
              s.updated_at
            LIMIT 1
            "#,
            params![source_id],
            |row| {
                let markdown_content: String = row.get(2)?;

                Ok(NoteListItem {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content_preview: build_preview_text(&markdown_content),
                    topic_names: row.get(3)?,
                    topic_count: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                })
            },
        )
        .map_err(|error| format!("Failed to fetch created note: {error}"))
}

fn get_note_detail_by_id(
    connection: &rusqlite::Connection,
    source_id: &str,
) -> Result<NoteDetail, String> {
    connection
        .query_row(
            r#"
            SELECT
              s.id,
              s.title,
              n.markdown_content,
              COALESCE(GROUP_CONCAT(t.title, ', '), '') AS topic_names,
              COUNT(st.topic_id) AS topic_count,
              s.created_at,
              s.updated_at
            FROM sources s
            INNER JOIN notes n ON n.source_id = s.id
            LEFT JOIN source_topics st ON st.source_id = s.id
            LEFT JOIN topics t ON t.id = st.topic_id AND t.archived_at IS NULL
            WHERE s.id = ?1 AND s.kind = 'note' AND s.archived_at IS NULL
            GROUP BY
              s.id,
              s.title,
              n.markdown_content,
              s.created_at,
              s.updated_at
            LIMIT 1
            "#,
            params![source_id],
            |row| {
                Ok(NoteDetail {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    markdown_content: row.get(2)?,
                    topic_names: row.get(3)?,
                    topic_count: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                })
            },
        )
        .map_err(|error| format!("Failed to fetch note detail: {error}"))
}

fn validate_topic_exists(
    connection: &rusqlite::Transaction,
    topic_id: &str,
) -> Result<(), String> {
    let existing_topic: Option<String> = connection
        .query_row(
            "SELECT id FROM topics WHERE id = ?1 AND archived_at IS NULL LIMIT 1",
            params![topic_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| format!("Failed to validate selected topic: {error}"))?;

    if existing_topic.is_none() {
        return Err("Selected topic does not exist".to_string());
    }

    Ok(())
}

fn build_preview_text(content: &str) -> String {
    let compact = content.split_whitespace().collect::<Vec<_>>().join(" ");

    if compact.len() > 180 {
        format!("{}...", compact.chars().take(180).collect::<String>())
    } else {
        compact
    }
}

fn current_timestamp_string() -> String {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(duration) => duration.as_secs().to_string(),
        Err(_) => "0".to_string(),
    }
}