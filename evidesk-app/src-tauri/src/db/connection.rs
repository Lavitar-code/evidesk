use rusqlite::Connection;
use std::fs;
use std::path::PathBuf;

const APP_DIR_NAME: &str = "Evidesk";
const DATA_DIR_NAME: &str = "data";
const DB_FILE_NAME: &str = "app.db";

pub fn ensure_data_dir() -> Result<PathBuf, String> {
    let base_dir = dirs::data_local_dir()
        .ok_or_else(|| "Could not resolve local app data directory".to_string())?;

    let app_dir = base_dir.join(APP_DIR_NAME);
    let data_dir = app_dir.join(DATA_DIR_NAME);

    fs::create_dir_all(&data_dir)
        .map_err(|error| format!("Failed to create data directory: {error}"))?;

    Ok(data_dir)
}

pub fn get_database_path() -> Result<PathBuf, String> {
    let data_dir = ensure_data_dir()?;
    Ok(data_dir.join(DB_FILE_NAME))
}

pub fn open_connection() -> Result<Connection, String> {
    let db_path = get_database_path()?;

    let connection = Connection::open(&db_path)
        .map_err(|error| format!("Failed to open SQLite database: {error}"))?;

    connection
        .execute("PRAGMA foreign_keys = ON;", [])
        .map_err(|error| format!("Failed to enable foreign keys: {error}"))?;

    Ok(connection)
}
