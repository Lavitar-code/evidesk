mod commands;
mod db;
mod models;

use commands::backup::{export_workspace_backup, import_workspace_backup};
use commands::excerpts::{
    archive_excerpt, create_excerpt, get_excerpt_detail, list_archived_excerpts, list_excerpts,
    restore_excerpt, update_excerpt,
};
use commands::notes::{
    archive_note, create_note, get_note_detail, list_archived_notes, list_notes, restore_note,
    update_note,
};
use commands::search::search_all;
use commands::sources::{
    add_source_to_topic, archive_source, create_url_source, get_source_topic_links,
    import_pdf_source, list_archived_sources, list_sources, remove_source_from_topic,
    restore_source,
};
use commands::system::get_database_status;
use commands::tasks::{
    archive_task, create_task, get_task_detail, list_archived_tasks, list_tasks, restore_task,
    update_task,
};
use commands::topics::{create_topic, get_topic_detail, list_topics};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_database_status,
            list_topics,
            get_topic_detail,
            create_topic,
            list_sources,
            list_archived_sources,
            get_source_topic_links,
            add_source_to_topic,
            remove_source_from_topic,
            create_url_source,
            import_pdf_source,
            archive_source,
            restore_source,
            list_notes,
            list_archived_notes,
            create_note,
            get_note_detail,
            update_note,
            archive_note,
            restore_note,
            list_excerpts,
            list_archived_excerpts,
            create_excerpt,
            get_excerpt_detail,
            update_excerpt,
            archive_excerpt,
            restore_excerpt,
            list_tasks,
            list_archived_tasks,
            create_task,
            get_task_detail,
            update_task,
            archive_task,
            restore_task,
            search_all,
            export_workspace_backup,
            import_workspace_backup
        ])
        .run(tauri::generate_context!())
        .expect("error while running Evidesk application");
}