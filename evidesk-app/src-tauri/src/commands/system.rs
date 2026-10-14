use crate::db::connection::get_database_path;
use crate::db::init::initialize_database;
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DatabaseStatus {
    pub ok: bool,
    pub database_path: String,
    pub message: String,
}

#[tauri::command]
pub fn get_database_status() -> Result<DatabaseStatus, String> {
    initialize_database()?;

    let db_path = get_database_path()?;

    Ok(DatabaseStatus {
        ok: true,
        database_path: db_path.display().to_string(),
        message: "Database initialized successfully".to_string(),
    })
}
