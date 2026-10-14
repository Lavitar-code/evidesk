use crate::db::connection::open_connection;
use crate::db::init::initialize_database;
use crate::models::backup::{
    BackupExcerpt, BackupNote, BackupSource, BackupSourceFile, BackupSourceTopic, BackupTask,
    BackupTopic, ImportWorkspaceBackupPayload, WorkspaceBackup, WorkspaceBackupMeta,
};
use rusqlite::params;
use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};

#[tauri::command]
pub fn export_workspace_backup() -> Result<WorkspaceBackupMeta, String> {
    initialize_database()?;
    let connection = open_connection()?;

    let backup = WorkspaceBackup {
        version: "1".to_string(),
        exported_at: current_timestamp_string(),
        topics: load_topics(&connection)?,
        sources: load_sources(&connection)?,
        source_topics: load_source_topics(&connection)?,
        source_files: load_source_files(&connection)?,
        notes: load_notes(&connection)?,
        excerpts: load_excerpts(&connection)?,
        tasks: load_tasks(&connection)?,
    };

    let backup_json = serde_json::to_string_pretty(&backup)
        .map_err(|error| format!("Failed to serialize workspace backup: {error}"))?;

    let mut path = std::env::current_dir()
        .map_err(|error| format!("Failed to get current directory: {error}"))?;
    path.push(format!("evidesk-backup-{}.json", backup.exported_at));

    fs::write(&path, backup_json)
        .map_err(|error| format!("Failed to write workspace backup file: {error}"))?;

    Ok(WorkspaceBackupMeta {
        exported_at: backup.exported_at,
        path: path.to_string_lossy().to_string(),
    })
}

#[tauri::command]
pub fn import_workspace_backup(payload: ImportWorkspaceBackupPayload) -> Result<(), String> {
    initialize_database()?;
    let mut connection = open_connection()?;

    let raw = fs::read_to_string(&payload.file_path)
        .map_err(|error| format!("Failed to read backup file: {error}"))?;

    let backup: WorkspaceBackup = serde_json::from_str(&raw)
        .map_err(|error| format!("Failed to parse backup JSON: {error}"))?;

    let tx = connection
        .transaction()
        .map_err(|error| format!("Failed to start backup import transaction: {error}"))?;

    for topic in backup.topics {
        tx.execute(
            r#"
            INSERT OR REPLACE INTO topics (
              id,
              title,
              slug,
              description,
              color,
              created_at,
              updated_at,
              archived_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
            "#,
            params![
                topic.id,
                topic.title,
                topic.slug,
                topic.description,
                topic.color,
                topic.created_at,
                topic.updated_at,
                topic.archived_at
            ],
        )
        .map_err(|error| format!("Failed to import topic: {error}"))?;
    }

    for source in backup.sources {
        tx.execute(
            r#"
            INSERT OR REPLACE INTO sources (
              id,
              title,
              kind,
              url,
              description,
              created_at,
              updated_at,
              archived_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
            "#,
            params![
                source.id,
                source.title,
                source.kind,
                source.url,
                source.description,
                source.created_at,
                source.updated_at,
                source.archived_at
            ],
        )
        .map_err(|error| format!("Failed to import source: {error}"))?;
    }

    for source_topic in backup.source_topics {
        tx.execute(
            r#"
            INSERT OR REPLACE INTO source_topics (
              source_id,
              topic_id,
              linked_at
            ) VALUES (?1, ?2, ?3)
            "#,
            params![source_topic.source_id, source_topic.topic_id, source_topic.linked_at],
        )
        .map_err(|error| format!("Failed to import source-topic link: {error}"))?;
    }

    for source_file in backup.source_files {
        tx.execute(
            r#"
            INSERT OR REPLACE INTO source_files (
              id,
              source_id,
              original_filename,
              stored_path,
              mime_type,
              file_size_bytes,
              created_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
            "#,
            params![
                source_file.id,
                source_file.source_id,
                source_file.original_filename,
                source_file.stored_path,
                source_file.mime_type,
                source_file.file_size_bytes,
                source_file.created_at
            ],
        )
        .map_err(|error| format!("Failed to import source file: {error}"))?;
    }

    for note in backup.notes {
        tx.execute(
            r#"
            INSERT OR REPLACE INTO notes (
              id,
              source_id,
              markdown_content,
              created_at,
              updated_at
            ) VALUES (?1, ?2, ?3, ?4, ?5)
            "#,
            params![
                note.id,
                note.source_id,
                note.markdown_content,
                note.created_at,
                note.updated_at
            ],
        )
        .map_err(|error| format!("Failed to import note: {error}"))?;
    }

    for excerpt in backup.excerpts {
        tx.execute(
            r#"
            INSERT OR REPLACE INTO excerpts (
              id,
              source_id,
              excerpt_text,
              note,
              citation_text,
              page_label,
              created_at,
              updated_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
            "#,
            params![
                excerpt.id,
                excerpt.source_id,
                excerpt.selected_text,
                excerpt.note,
                excerpt.citation_text,
                excerpt.page_label,
                excerpt.created_at,
                excerpt.updated_at
            ],
        )
        .map_err(|error| format!("Failed to import excerpt: {error}"))?;
    }

    for task in backup.tasks {
        tx.execute(
            r#"
            INSERT OR REPLACE INTO tasks (
              id,
              title,
              description,
              status,
              priority,
              due_at,
              created_at,
              updated_at,
              archived_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            "#,
            params![
                task.id,
                task.title,
                task.description,
                task.status,
                task.priority,
                task.due_at,
                task.created_at,
                task.updated_at,
                task.archived_at
            ],
        )
        .map_err(|error| format!("Failed to import task: {error}"))?;
    }

    tx.commit()
        .map_err(|error| format!("Failed to commit workspace backup import: {error}"))?;

    Ok(())
}

fn load_topics(connection: &rusqlite::Connection) -> Result<Vec<BackupTopic>, String> {
    let mut statement = connection
        .prepare(
            "SELECT id, title, slug, description, color, created_at, updated_at, archived_at FROM topics",
        )
        .map_err(|error| format!("Failed to prepare topics backup query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(BackupTopic {
                id: row.get(0)?,
                title: row.get(1)?,
                slug: row.get(2)?,
                description: row.get(3)?,
                color: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
                archived_at: row.get(7)?,
            })
        })
        .map_err(|error| format!("Failed to execute topics backup query: {error}"))?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("Failed to read topics for backup: {error}"))
}

fn load_sources(connection: &rusqlite::Connection) -> Result<Vec<BackupSource>, String> {
    let mut statement = connection
        .prepare(
            "SELECT id, title, kind, url, description, created_at, updated_at, archived_at FROM sources",
        )
        .map_err(|error| format!("Failed to prepare sources backup query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(BackupSource {
                id: row.get(0)?,
                title: row.get(1)?,
                kind: row.get(2)?,
                url: row.get(3)?,
                description: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
                archived_at: row.get(7)?,
            })
        })
        .map_err(|error| format!("Failed to execute sources backup query: {error}"))?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("Failed to read sources for backup: {error}"))
}

fn load_source_topics(connection: &rusqlite::Connection) -> Result<Vec<BackupSourceTopic>, String> {
    let mut statement = connection
        .prepare("SELECT source_id, topic_id, linked_at FROM source_topics")
        .map_err(|error| format!("Failed to prepare source_topics backup query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(BackupSourceTopic {
                source_id: row.get(0)?,
                topic_id: row.get(1)?,
                linked_at: row.get(2)?,
            })
        })
        .map_err(|error| format!("Failed to execute source_topics backup query: {error}"))?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("Failed to read source_topics for backup: {error}"))
}

fn load_source_files(connection: &rusqlite::Connection) -> Result<Vec<BackupSourceFile>, String> {
    let mut statement = connection
        .prepare(
            "SELECT id, source_id, original_filename, stored_path, mime_type, file_size_bytes, created_at FROM source_files",
        )
        .map_err(|error| format!("Failed to prepare source_files backup query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(BackupSourceFile {
                id: row.get(0)?,
                source_id: row.get(1)?,
                original_filename: row.get(2)?,
                stored_path: row.get(3)?,
                mime_type: row.get(4)?,
                file_size_bytes: row.get(5)?,
                created_at: row.get(6)?,
            })
        })
        .map_err(|error| format!("Failed to execute source_files backup query: {error}"))?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("Failed to read source_files for backup: {error}"))
}

fn load_notes(connection: &rusqlite::Connection) -> Result<Vec<BackupNote>, String> {
    let mut statement = connection
        .prepare("SELECT id, source_id, markdown_content, created_at, updated_at FROM notes")
        .map_err(|error| format!("Failed to prepare notes backup query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(BackupNote {
                id: row.get(0)?,
                source_id: row.get(1)?,
                markdown_content: row.get(2)?,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })
        .map_err(|error| format!("Failed to execute notes backup query: {error}"))?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("Failed to read notes for backup: {error}"))
}

fn load_excerpts(connection: &rusqlite::Connection) -> Result<Vec<BackupExcerpt>, String> {
    let mut statement = connection
        .prepare(
            "SELECT id, source_id, excerpt_text, note, citation_text, page_label, created_at, updated_at FROM excerpts",
        )
        .map_err(|error| format!("Failed to prepare excerpts backup query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(BackupExcerpt {
                id: row.get(0)?,
                source_id: row.get(1)?,
                selected_text: row.get(2)?,
                note: row.get(3)?,
                citation_text: row.get(4)?,
                page_label: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|error| format!("Failed to execute excerpts backup query: {error}"))?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("Failed to read excerpts for backup: {error}"))
}

fn load_tasks(connection: &rusqlite::Connection) -> Result<Vec<BackupTask>, String> {
    let mut statement = connection
        .prepare(
            "SELECT id, title, description, status, priority, due_at, created_at, updated_at, archived_at FROM tasks",
        )
        .map_err(|error| format!("Failed to prepare tasks backup query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(BackupTask {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                status: row.get(3)?,
                priority: row.get(4)?,
                due_at: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
                archived_at: row.get(8)?,
            })
        })
        .map_err(|error| format!("Failed to execute tasks backup query: {error}"))?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("Failed to read tasks for backup: {error}"))
}

fn current_timestamp_string() -> String {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(duration) => duration.as_secs().to_string(),
        Err(_) => "0".to_string(),
    }
}