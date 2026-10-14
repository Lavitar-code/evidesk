use crate::db::connection::open_connection;
use crate::db::init::initialize_database;
use crate::models::task::{
    ArchiveTaskPayload, ArchivedTaskListItem, CreateTaskPayload, GetTaskDetailPayload, RestoreTaskPayload,
    TaskDetail, TaskListItem, UpdateTaskPayload,
};
use rusqlite::{params, OptionalExtension};
use std::time::{SystemTime, UNIX_EPOCH};
use ulid::Ulid;

#[tauri::command]
pub fn list_tasks() -> Result<Vec<TaskListItem>, String> {
    initialize_database()?;
    let connection = open_connection()?;

    let mut statement = connection
        .prepare(
            r#"
            SELECT
              t.id,
              t.title,
              t.description,
              t.status,
              t.priority,
              t.due_at,
              COALESCE(GROUP_CONCAT(tp.title, ', '), '') AS topic_names,
              COUNT(tt.topic_id) AS topic_count,
              t.created_at,
              t.updated_at
            FROM tasks t
            LEFT JOIN task_topics tt ON tt.task_id = t.id
            LEFT JOIN topics tp ON tp.id = tt.topic_id AND tp.archived_at IS NULL
            WHERE t.archived_at IS NULL
            GROUP BY
              t.id,
              t.title,
              t.description,
              t.status,
              t.priority,
              t.due_at,
              t.created_at,
              t.updated_at
            ORDER BY
              CASE t.status
                WHEN 'todo' THEN 0
                WHEN 'in_progress' THEN 1
                WHEN 'done' THEN 2
                ELSE 3
              END,
              CASE t.priority
                WHEN 'high' THEN 0
                WHEN 'medium' THEN 1
                WHEN 'low' THEN 2
                ELSE 3
              END,
              t.updated_at DESC
            "#,
        )
        .map_err(|error| format!("Failed to prepare task list query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(TaskListItem {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                status: row.get(3)?,
                priority: row.get(4)?,
                due_at: row.get(5)?,
                topic_names: row.get(6)?,
                topic_count: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        })
        .map_err(|error| format!("Failed to execute task list query: {error}"))?;

    let tasks: Result<Vec<_>, _> = rows.collect();

    tasks.map_err(|error| format!("Failed to read tasks from database: {error}"))
}

#[tauri::command]
pub fn list_archived_tasks() -> Result<Vec<ArchivedTaskListItem>, String> {
    initialize_database()?;
    let connection = open_connection()?;

    let mut statement = connection
        .prepare(
            r#"
            SELECT
              t.id,
              t.title,
              t.description,
              t.status,
              t.priority,
              t.archived_at,
              t.updated_at
            FROM tasks t
            WHERE t.archived_at IS NOT NULL
            ORDER BY t.archived_at DESC, t.updated_at DESC
            "#,
        )
        .map_err(|error| format!("Failed to prepare archived task list query: {error}"))?;

    let rows = statement
        .query_map([], |row| {
            Ok(ArchivedTaskListItem {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                status: row.get(3)?,
                priority: row.get(4)?,
                archived_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|error| format!("Failed to execute archived task list query: {error}"))?;

    let items: Result<Vec<_>, _> = rows.collect();

    items.map_err(|error| format!("Failed to read archived tasks from database: {error}"))
}

#[tauri::command]
pub fn get_task_detail(payload: GetTaskDetailPayload) -> Result<TaskDetail, String> {
    initialize_database()?;
    let connection = open_connection()?;
    get_task_detail_by_id(&connection, &payload.id)
}

#[tauri::command]
pub fn create_task(payload: CreateTaskPayload) -> Result<TaskListItem, String> {
    initialize_database()?;
    let mut connection = open_connection()?;

    let title = payload.title.trim();

    if title.is_empty() {
        return Err("Task title is required".to_string());
    }

    if title.len() > 200 {
        return Err("Task title is too long".to_string());
    }

    let description = payload
        .description
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let status = normalize_status(payload.status.as_deref().unwrap_or("todo"))?;
    let priority = normalize_priority(payload.priority.as_deref().unwrap_or("medium"))?;

    let due_at = payload
        .due_at
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let topic_id = payload
        .topic_id
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let task_id = Ulid::new().to_string();
    let timestamp = current_timestamp_string();

    let tx = connection
        .transaction()
        .map_err(|error| format!("Failed to start task transaction: {error}"))?;

    if let Some(topic_id_value) = topic_id.as_ref() {
        validate_topic_exists(&tx, topic_id_value)?;
    }

    tx.execute(
        r#"
        INSERT INTO tasks (
          id,
          title,
          description,
          status,
          priority,
          due_at,
          created_at,
          updated_at,
          archived_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, NULL)
        "#,
        params![
            task_id,
            title,
            description,
            status,
            priority,
            due_at,
            timestamp,
            timestamp
        ],
    )
    .map_err(|error| format!("Failed to create task: {error}"))?;

    if let Some(topic_id_value) = topic_id.as_ref() {
        tx.execute(
            r#"
            INSERT INTO task_topics (
              task_id,
              topic_id,
              linked_at
            ) VALUES (?1, ?2, ?3)
            "#,
            params![task_id, topic_id_value, timestamp],
        )
        .map_err(|error| format!("Failed to link task to topic: {error}"))?;
    }

    tx.commit()
        .map_err(|error| format!("Failed to commit task transaction: {error}"))?;

    get_task_list_item_by_id(&connection, &task_id)
}

#[tauri::command]
pub fn update_task(payload: UpdateTaskPayload) -> Result<TaskDetail, String> {
    initialize_database()?;
    let connection = open_connection()?;

    let title = payload.title.trim();

    if title.is_empty() {
        return Err("Task title is required".to_string());
    }

    if title.len() > 200 {
        return Err("Task title is too long".to_string());
    }

    let description = payload
        .description
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let due_at = payload
        .due_at
        .as_ref()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty());

    let status = normalize_status(&payload.status)?;
    let priority = normalize_priority(&payload.priority)?;
    let timestamp = current_timestamp_string();

    let updated_rows = connection
        .execute(
            r#"
            UPDATE tasks
            SET
              title = ?2,
              description = ?3,
              status = ?4,
              priority = ?5,
              due_at = ?6,
              updated_at = ?7
            WHERE id = ?1 AND archived_at IS NULL
            "#,
            params![
                payload.id,
                title,
                description,
                status,
                priority,
                due_at,
                timestamp
            ],
        )
        .map_err(|error| format!("Failed to update task: {error}"))?;

    if updated_rows == 0 {
        return Err("Task not found".to_string());
    }

    get_task_detail_by_id(&connection, &payload.id)
}

#[tauri::command]
pub fn archive_task(payload: ArchiveTaskPayload) -> Result<(), String> {
    initialize_database()?;
    let connection = open_connection()?;
    let timestamp = current_timestamp_string();

    let updated_rows = connection
        .execute(
            r#"
            UPDATE tasks
            SET archived_at = ?2, updated_at = ?2
            WHERE id = ?1 AND archived_at IS NULL
            "#,
            params![payload.id, timestamp],
        )
        .map_err(|error| format!("Failed to archive task: {error}"))?;

    if updated_rows == 0 {
        return Err("Task not found".to_string());
    }

    Ok(())
}

#[tauri::command]
pub fn restore_task(payload: RestoreTaskPayload) -> Result<(), String> {
    initialize_database()?;
    let connection = open_connection()?;
    let timestamp = current_timestamp_string();

    let updated_rows = connection
        .execute(
            r#"
            UPDATE tasks
            SET archived_at = NULL, updated_at = ?2
            WHERE id = ?1 AND archived_at IS NOT NULL
            "#,
            params![payload.id, timestamp],
        )
        .map_err(|error| format!("Failed to restore task: {error}"))?;

    if updated_rows == 0 {
        return Err("Archived task not found".to_string());
    }

    Ok(())
}

fn get_task_list_item_by_id(
    connection: &rusqlite::Connection,
    task_id: &str,
) -> Result<TaskListItem, String> {
    connection
        .query_row(
            r#"
            SELECT
              t.id,
              t.title,
              t.description,
              t.status,
              t.priority,
              t.due_at,
              COALESCE(GROUP_CONCAT(tp.title, ', '), '') AS topic_names,
              COUNT(tt.topic_id) AS topic_count,
              t.created_at,
              t.updated_at
            FROM tasks t
            LEFT JOIN task_topics tt ON tt.task_id = t.id
            LEFT JOIN topics tp ON tp.id = tt.topic_id AND tp.archived_at IS NULL
            WHERE t.id = ?1 AND t.archived_at IS NULL
            GROUP BY
              t.id,
              t.title,
              t.description,
              t.status,
              t.priority,
              t.due_at,
              t.created_at,
              t.updated_at
            LIMIT 1
            "#,
            params![task_id],
            |row| {
                Ok(TaskListItem {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    description: row.get(2)?,
                    status: row.get(3)?,
                    priority: row.get(4)?,
                    due_at: row.get(5)?,
                    topic_names: row.get(6)?,
                    topic_count: row.get(7)?,
                    created_at: row.get(8)?,
                    updated_at: row.get(9)?,
                })
            },
        )
        .map_err(|error| format!("Failed to fetch created task: {error}"))
}

fn get_task_detail_by_id(
    connection: &rusqlite::Connection,
    task_id: &str,
) -> Result<TaskDetail, String> {
    connection
        .query_row(
            r#"
            SELECT
              t.id,
              t.title,
              t.description,
              t.status,
              t.priority,
              t.due_at,
              COALESCE(GROUP_CONCAT(tp.title, ', '), '') AS topic_names,
              COUNT(tt.topic_id) AS topic_count,
              t.created_at,
              t.updated_at
            FROM tasks t
            LEFT JOIN task_topics tt ON tt.task_id = t.id
            LEFT JOIN topics tp ON tp.id = tt.topic_id AND tp.archived_at IS NULL
            WHERE t.id = ?1 AND t.archived_at IS NULL
            GROUP BY
              t.id,
              t.title,
              t.description,
              t.status,
              t.priority,
              t.due_at,
              t.created_at,
              t.updated_at
            LIMIT 1
            "#,
            params![task_id],
            |row| {
                Ok(TaskDetail {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    description: row.get(2)?,
                    status: row.get(3)?,
                    priority: row.get(4)?,
                    due_at: row.get(5)?,
                    topic_names: row.get(6)?,
                    topic_count: row.get(7)?,
                    created_at: row.get(8)?,
                    updated_at: row.get(9)?,
                })
            },
        )
        .map_err(|error| format!("Failed to fetch task detail: {error}"))
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

fn normalize_status(value: &str) -> Result<String, String> {
    match value.trim() {
        "todo" => Ok("todo".to_string()),
        "in_progress" => Ok("in_progress".to_string()),
        "done" => Ok("done".to_string()),
        _ => Err("Invalid task status".to_string()),
    }
}

fn normalize_priority(value: &str) -> Result<String, String> {
    match value.trim() {
        "low" => Ok("low".to_string()),
        "medium" => Ok("medium".to_string()),
        "high" => Ok("high".to_string()),
        _ => Err("Invalid task priority".to_string()),
    }
}

fn current_timestamp_string() -> String {
    match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(duration) => duration.as_secs().to_string(),
        Err(_) => "0".to_string(),
    }
}