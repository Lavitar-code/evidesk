use crate::db::connection::open_connection;
use crate::db::init::initialize_database;
use crate::models::source::{
    AddSourceToTopicPayload, ArchiveSourcePayload, ArchivedSourceListItem, CreateUrlSourcePayload,
    GetSourceTopicLinksPayload, ImportPdfSourcePayload, RemoveSourceFromTopicPayload,
    RestoreSourcePayload, SourceListItem, SourceTopicLinkItem, SourceTopicLinksDetail,
};
use rusqlite::{params, OptionalExtension};
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri_plugin_dialog::DialogExt;
use ulid::Ulid;

#[tauri::command]
pub fn list_sources() -> Result<Vec<SourceListItem>, String> {
    initialize_database()?;
    let connection = open_connection()?;

    let mut statement = connection
        .prepare(
            r#"
            SELECT
              s.id,
              s.title,
              s.kind,
              s.url,
              s.description,
              COALESCE(GROUP_CONCAT(t.title, ', '), '') AS topic_names,
              COUNT(st.topic_id) AS topic_count,
              s.created_at,
              s.updated_at
            FROM sources s
            LEFT JOIN source_topics st ON st.source_id = s.id
            LEFT JOIN topics t ON t.id = st.topic_id AND t.archived_at IS NULL
            WHERE s.archived_at IS NULL
            GROUP BY
              s.id,
              s.title,
              s.kind,
              s.url,
              s.description,
              s.created_at,
              s.updated_at
            ORDER BY s.updated_at DESC, s.created_at DESC
            "#,
        )
        .map_err(|error| format!("Failed to prepare source list query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(SourceListItem {
                id: row.get(0)?,
                title: row.get(1)?,
                kind: row.get(2)?,
                url: row.get(3)?,
                description: row.get(4)?,
                topic_names: row.get(5)?,
                topic_count: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|error| format!("Failed to execute source list query: {error}"))?;

    let sources: Result<Vec<_>, _> = rows.collect();

    sources.map_err(|error| format!("Failed to read sources from database: {error}"))
}

#[tauri::command]
pub fn list_archived_sources() -> Result<Vec<ArchivedSourceListItem>, String> {
    initialize_database()?;
    let connection = open_connection()?;

    let mut statement = connection
        .prepare(
            r#"
            SELECT
              s.id,
              s.title,
              s.kind,
              s.url,
              s.description,
              s.archived_at,
              s.updated_at
            FROM sources s
            WHERE s.archived_at IS NOT NULL
            ORDER BY s.archived_at DESC, s.updated_at DESC
            "#,
        )
        .map_err(|error| format!("Failed to prepare archived source list query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(ArchivedSourceListItem {
                id: row.get(0)?,
                title: row.get(1)?,
                kind: row.get(2)?,
                url: row.get(3)?,
                description: row.get(4)?,
                archived_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|error| format!("Failed to execute archived source list query: {error}"))?;

    let items: Result<Vec<_>, _> = rows.collect();

    items.map_err(|error| format!("Failed to read archived sources from database: {error}"))
}

#[tauri::command]
pub fn get_source_topic_links(
    payload: GetSourceTopicLinksPayload,
) -> Result<SourceTopicLinksDetail, String> {
    initialize_database()?;
    let connection = open_connection()?;

    validate_source_exists(&connection, &payload.source_id)?;

    let mut statement = connection
        .prepare(
            r#"
            SELECT
              t.id,
              t.title,
              COALESCE(t.color, '#7aa2ff') AS color
            FROM source_topics st
            INNER JOIN topics t ON t.id = st.topic_id
            WHERE st.source_id = ?1 AND t.archived_at IS NULL
            ORDER BY t.title COLLATE NOCASE ASC
            "#,
        )
        .map_err(|error| format!("Failed to prepare source topic links query: {error}"))?;

    let rows = statement
        .query_map(params![payload.source_id], |row| {
            Ok(SourceTopicLinkItem {
                topic_id: row.get(0)?,
                topic_title: row.get(1)?,
                topic_color: row.get(2)?,
            })
        })
        .map_err(|error| format!("Failed to execute source topic links query: {error}"))?;

    let topics: Result<Vec<_>, _> = rows.collect();

    Ok(SourceTopicLinksDetail {
        source_id: payload.source_id,
        topics: topics.map_err(|error| format!("Failed to read source topic links: {error}"))?,
    })
}

#[tauri::command]
pub fn add_source_to_topic(payload: AddSourceToTopicPayload) -> Result<SourceTopicLinksDetail, String> {
    initialize_database()?;
    let mut connection = open_connection()?;
    let timestamp = current_timestamp_string();

    let tx = connection
        .transaction()
        .map_err(|error| format!("Failed to start source-topic transaction: {error}"))?;

    validate_source_exists_in_tx(&tx, &payload.source_id)?;
    validate_topic_exists(&tx, &payload.topic_id)?;

    tx.execute(
        r#"
        INSERT OR IGNORE INTO source_topics (
          source_id,
          topic_id,
          linked_at
        ) VALUES (?1, ?2, ?3)
        "#,
        params![payload.source_id, payload.topic_id, timestamp],
    )
    .map_err(|error| format!("Failed to link source to topic: {error}"))?;

    tx.execute(
        r#"
        UPDATE sources
        SET updated_at = ?2
        WHERE id = ?1
        "#,
        params![payload.source_id, timestamp],
    )
    .map_err(|error| format!("Failed to update source timestamp: {error}"))?;

    tx.commit()
        .map_err(|error| format!("Failed to commit source-topic transaction: {error}"))?;

    get_source_topic_links(GetSourceTopicLinksPayload {
        source_id: payload.source_id,
    })
}

#[tauri::command]
pub fn remove_source_from_topic(
    payload: RemoveSourceFromTopicPayload,
) -> Result<SourceTopicLinksDetail, String> {
    initialize_database()?;
    let mut connection = open_connection()?;
    let timestamp = current_timestamp_string();

    let tx = connection
        .transaction()
        .map_err(|error| format!("Failed to start source-topic removal transaction: {error}"))?;

    validate_source_exists_in_tx(&tx, &payload.source_id)?;
    validate_topic_exists(&tx, &payload.topic_id)?;

    tx.execute(
        r#"
        DELETE FROM source_topics
        WHERE source_id = ?1 AND topic_id = ?2
        "#,
        params![payload.source_id, payload.topic_id],
    )
    .map_err(|error| format!("Failed to unlink source from topic: {error}"))?;

    tx.execute(
        r#"
        UPDATE sources
        SET updated_at = ?2
        WHERE id = ?1
        "#,
        params![payload.source_id, timestamp],
    )
    .map_err(|error| format!("Failed to update source timestamp: {error}"))?;

    tx.commit()
        .map_err(|error| format!("Failed to commit source-topic removal transaction: {error}"))?;

    get_source_topic_links(GetSourceTopicLinksPayload {
        source_id: payload.source_id,
    })
}

#[tauri::command]
pub fn create_url_source(payload: CreateUrlSourcePayload) -> Result<SourceListItem, String> {
    initialize_database()?;
    let mut connection = open_connection()?;

    let url = payload.url.trim();
    if url.is_empty() {
        return Err("URL is required".to_string());
    }

    let title = payload
        .title
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| url.to_string());

    let description = payload
        .description
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let topic_id = payload
        .topic_id
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let source_id = Ulid::new().to_string();
    let timestamp = current_timestamp_string();

    let tx = connection
        .transaction()
        .map_err(|error| format!("Failed to start source transaction: {error}"))?;

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
        ) VALUES (?1, ?2, 'url', ?3, ?4, ?5, ?6, NULL)
        "#,
        params![source_id, title, url, description, timestamp, timestamp],
    )
    .map_err(|error| format!("Failed to create URL source: {error}"))?;

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
        .map_err(|error| format!("Failed to link source to topic: {error}"))?;
    }

    tx.commit()
        .map_err(|error| format!("Failed to commit source transaction: {error}"))?;

    get_source_by_id(&connection, &source_id)
}

#[tauri::command]
pub fn import_pdf_source(
    app_handle: tauri::AppHandle,
    payload: ImportPdfSourcePayload,
) -> Result<SourceListItem, String> {
    initialize_database()?;
    let mut connection = open_connection()?;

    let file_path = payload.file_path.trim();
    if file_path.is_empty() {
        return Err("File path is required".to_string());
    }

    let file_name = Path::new(file_path)
        .file_name()
        .and_then(|value| value.to_str())
        .ok_or_else(|| "Invalid PDF file path".to_string())?
        .to_string();

    let title = payload
        .title
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .unwrap_or_else(|| file_name.clone());

    let description = payload
        .description
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let topic_id = payload
        .topic_id
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let source_id = Ulid::new().to_string();
    let file_record_id = Ulid::new().to_string();
    let timestamp = current_timestamp_string();

    let metadata = std::fs::metadata(file_path)
        .map_err(|error| format!("Failed to inspect PDF file: {error}"))?;

    let file_size_bytes =
        i64::try_from(metadata.len()).map_err(|_| "PDF file is too large".to_string())?;

    let tx = connection
        .transaction()
        .map_err(|error| format!("Failed to start PDF import transaction: {error}"))?;

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
        ) VALUES (?1, ?2, 'pdf', NULL, ?3, ?4, ?5, NULL)
        "#,
        params![source_id, title, description, timestamp, timestamp],
    )
    .map_err(|error| format!("Failed to create PDF source: {error}"))?;

    tx.execute(
        r#"
        INSERT INTO source_files (
          id,
          source_id,
          original_filename,
          stored_path,
          mime_type,
          file_size_bytes,
          created_at
        ) VALUES (?1, ?2, ?3, ?4, 'application/pdf', ?5, ?6)
        "#,
        params![
            file_record_id,
            source_id,
            file_name,
            file_path,
            file_size_bytes,
            timestamp
        ],
    )
    .map_err(|error| format!("Failed to create source file record: {error}"))?;

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
        .map_err(|error| format!("Failed to link PDF source to topic: {error}"))?;
    }

    tx.commit()
        .map_err(|error| format!("Failed to commit PDF import transaction: {error}"))?;

    let _ = app_handle.dialog();

    get_source_by_id(&connection, &source_id)
}

#[tauri::command]
pub fn archive_source(payload: ArchiveSourcePayload) -> Result<(), String> {
    initialize_database()?;
    let connection = open_connection()?;
    let timestamp = current_timestamp_string();

    let updated_rows = connection
        .execute(
            r#"
            UPDATE sources
            SET archived_at = ?2, updated_at = ?2
            WHERE id = ?1 AND archived_at IS NULL
            "#,
            params![payload.id, timestamp],
        )
        .map_err(|error| format!("Failed to archive source: {error}"))?;

    if updated_rows == 0 {
        return Err("Source not found".to_string());
    }

    Ok(())
}

#[tauri::command]
pub fn restore_source(payload: RestoreSourcePayload) -> Result<(), String> {
    initialize_database()?;
    let connection = open_connection()?;
    let timestamp = current_timestamp_string();

    let updated_rows = connection
        .execute(
            r#"
            UPDATE sources
            SET archived_at = NULL, updated_at = ?2
            WHERE id = ?1 AND archived_at IS NOT NULL
            "#,
            params![payload.id, timestamp],
        )
        .map_err(|error| format!("Failed to restore source: {error}"))?;

    if updated_rows == 0 {
        return Err("Archived source not found".to_string());
    }

    Ok(())
}

fn get_source_by_id(
    connection: &rusqlite::Connection,
    source_id: &str,
) -> Result<SourceListItem, String> {
    connection
        .query_row(
            r#"
            SELECT
              s.id,
              s.title,
              s.kind,
              s.url,
              s.description,
              COALESCE(GROUP_CONCAT(t.title, ', '), '') AS topic_names,
              COUNT(st.topic_id) AS topic_count,
              s.created_at,
              s.updated_at
            FROM sources s
            LEFT JOIN source_topics st ON st.source_id = s.id
            LEFT JOIN topics t ON t.id = st.topic_id AND t.archived_at IS NULL
            WHERE s.id = ?1 AND s.archived_at IS NULL
            GROUP BY
              s.id,
              s.title,
              s.kind,
              s.url,
              s.description,
              s.created_at,
              s.updated_at
            LIMIT 1
            "#,
            params![source_id],
            |row| {
                Ok(SourceListItem {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    kind: row.get(2)?,
                    url: row.get(3)?,
                    description: row.get(4)?,
                    topic_names: row.get(5)?,
                    topic_count: row.get(6)?,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                })
            },
        )
        .map_err(|error| format!("Failed to fetch created source: {error}"))
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

fn validate_source_exists(connection: &rusqlite::Connection, source_id: &str) -> Result<(), String> {
    let existing_source: Option<String> = connection
        .query_row(
            "SELECT id FROM sources WHERE id = ?1 AND archived_at IS NULL LIMIT 1",
            params![source_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| format!("Failed to validate source: {error}"))?;

    if existing_source.is_none() {
        return Err("Source not found".to_string());
    }

    Ok(())
}

fn validate_source_exists_in_tx(
    connection: &rusqlite::Transaction,
    source_id: &str,
) -> Result<(), String> {
    let existing_source: Option<String> = connection
        .query_row(
            "SELECT id FROM sources WHERE id = ?1 AND archived_at IS NULL LIMIT 1",
            params![source_id],
            |row| row.get(0),
        )
        .optional()
        .map_err(|error| format!("Failed to validate source: {error}"))?;

    if existing_source.is_none() {
        return Err("Source not found".to_string());
    }

    Ok(())
}

fn current_timestamp_string() -> String {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(duration) => duration.as_secs().to_string(),
        Err(_) => "0".to_string(),
    }
}