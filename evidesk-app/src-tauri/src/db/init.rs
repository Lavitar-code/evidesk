use crate::db::connection::open_connection;

pub fn initialize_database() -> Result<(), String> {
    let connection = open_connection()?;

    connection
        .execute_batch(
            r#"
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS topics (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              slug TEXT NOT NULL UNIQUE,
              description TEXT,
              color TEXT NOT NULL,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              archived_at TEXT
            );

            CREATE TABLE IF NOT EXISTS sources (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              kind TEXT NOT NULL,
              url TEXT,
              description TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              archived_at TEXT
            );

            CREATE TABLE IF NOT EXISTS source_topics (
              source_id TEXT NOT NULL,
              topic_id TEXT NOT NULL,
              linked_at TEXT NOT NULL,
              PRIMARY KEY (source_id, topic_id),
              FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
              FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS source_files (
              id TEXT PRIMARY KEY,
              source_id TEXT NOT NULL,
              original_filename TEXT NOT NULL,
              stored_path TEXT NOT NULL,
              mime_type TEXT NOT NULL,
              file_size_bytes INTEGER NOT NULL,
              created_at TEXT NOT NULL,
              FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS notes (
              id TEXT PRIMARY KEY,
              source_id TEXT NOT NULL UNIQUE,
              markdown_content TEXT NOT NULL,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS excerpts (
              id TEXT PRIMARY KEY,
              source_id TEXT NOT NULL,
              excerpt_text TEXT NOT NULL,
              note TEXT,
              page_label TEXT,
              citation_text TEXT NOT NULL,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS tasks (
              id TEXT PRIMARY KEY,
              title TEXT NOT NULL,
              description TEXT,
              status TEXT NOT NULL,
              priority TEXT NOT NULL,
              due_at TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL,
              archived_at TEXT
            );

            CREATE TABLE IF NOT EXISTS task_topics (
              task_id TEXT NOT NULL,
              topic_id TEXT NOT NULL,
              linked_at TEXT NOT NULL,
              PRIMARY KEY (task_id, topic_id),
              FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
              FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS tags (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              normalized_name TEXT NOT NULL UNIQUE,
              color TEXT,
              created_at TEXT NOT NULL,
              updated_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);
            CREATE INDEX IF NOT EXISTS idx_topics_archived_at ON topics(archived_at);

            CREATE INDEX IF NOT EXISTS idx_sources_kind ON sources(kind);
            CREATE INDEX IF NOT EXISTS idx_sources_archived_at ON sources(archived_at);
            CREATE INDEX IF NOT EXISTS idx_sources_updated_at ON sources(updated_at);

            CREATE INDEX IF NOT EXISTS idx_source_topics_topic_id ON source_topics(topic_id);
            CREATE INDEX IF NOT EXISTS idx_source_topics_source_id ON source_topics(source_id);

            CREATE INDEX IF NOT EXISTS idx_source_files_source_id ON source_files(source_id);

            CREATE INDEX IF NOT EXISTS idx_notes_source_id ON notes(source_id);
            CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at);

            CREATE INDEX IF NOT EXISTS idx_excerpts_source_id ON excerpts(source_id);
            CREATE INDEX IF NOT EXISTS idx_excerpts_updated_at ON excerpts(updated_at);

            CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
            CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
            CREATE INDEX IF NOT EXISTS idx_tasks_archived_at ON tasks(archived_at);
            CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);

            CREATE INDEX IF NOT EXISTS idx_task_topics_topic_id ON task_topics(topic_id);
            CREATE INDEX IF NOT EXISTS idx_task_topics_task_id ON task_topics(task_id);

            CREATE INDEX IF NOT EXISTS idx_tags_normalized_name ON tags(normalized_name);
            "#,
        )
        .map_err(|error| format!("Failed to initialize base database schema: {error}"))?;

    ensure_column_exists(
        &connection,
        "sources",
        "url",
        "ALTER TABLE sources ADD COLUMN url TEXT",
    )?;

    ensure_column_exists(
        &connection,
        "sources",
        "description",
        "ALTER TABLE sources ADD COLUMN description TEXT",
    )?;

    ensure_column_exists(
        &connection,
        "sources",
        "archived_at",
        "ALTER TABLE sources ADD COLUMN archived_at TEXT",
    )?;

    ensure_column_exists(
        &connection,
        "topics",
        "description",
        "ALTER TABLE topics ADD COLUMN description TEXT",
    )?;

    ensure_column_exists(
        &connection,
        "topics",
        "archived_at",
        "ALTER TABLE topics ADD COLUMN archived_at TEXT",
    )?;

    ensure_column_exists(
        &connection,
        "tasks",
        "description",
        "ALTER TABLE tasks ADD COLUMN description TEXT",
    )?;

    ensure_column_exists(
        &connection,
        "tasks",
        "status",
        "ALTER TABLE tasks ADD COLUMN status TEXT NOT NULL DEFAULT 'todo'",
    )?;

    ensure_column_exists(
        &connection,
        "tasks",
        "priority",
        "ALTER TABLE tasks ADD COLUMN priority TEXT NOT NULL DEFAULT 'medium'",
    )?;

    ensure_column_exists(
        &connection,
        "tasks",
        "due_at",
        "ALTER TABLE tasks ADD COLUMN due_at TEXT",
    )?;

    ensure_column_exists(
        &connection,
        "tasks",
        "archived_at",
        "ALTER TABLE tasks ADD COLUMN archived_at TEXT",
    )?;

    ensure_column_exists(
        &connection,
        "excerpts",
        "note",
        "ALTER TABLE excerpts ADD COLUMN note TEXT",
    )?;

    ensure_column_exists(
        &connection,
        "excerpts",
        "page_label",
        "ALTER TABLE excerpts ADD COLUMN page_label TEXT",
    )?;

    ensure_column_exists(
        &connection,
        "excerpts",
        "citation_text",
        "ALTER TABLE excerpts ADD COLUMN citation_text TEXT NOT NULL DEFAULT ''",
    )?;

    Ok(())
}

fn ensure_column_exists(
    connection: &rusqlite::Connection,
    table_name: &str,
    column_name: &str,
    alter_sql: &str,
) -> Result<(), String> {
    let mut statement = connection
        .prepare(&format!("PRAGMA table_info({table_name})"))
        .map_err(|error| format!("Failed to inspect table {table_name}: {error}"))?;

    let rows = statement
        .query_map([], |row| row.get::<_, String>(1))
        .map_err(|error| format!("Failed to read schema info for {table_name}: {error}"))?;

    let mut found = false;

    for row in rows {
        let existing_name =
            row.map_err(|error| format!("Failed to parse schema row for {table_name}: {error}"))?;
        if existing_name == column_name {
            found = true;
            break;
        }
    }

    if !found {
        connection
            .execute(alter_sql, [])
            .map_err(|error| format!("Failed to alter table {table_name}: {error}"))?;
    }

    Ok(())
}