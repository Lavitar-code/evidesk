use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceBackup {
    pub version: String,
    pub exported_at: String,
    pub topics: Vec<BackupTopic>,
    pub sources: Vec<BackupSource>,
    pub source_topics: Vec<BackupSourceTopic>,
    pub source_files: Vec<BackupSourceFile>,
    pub notes: Vec<BackupNote>,
    pub excerpts: Vec<BackupExcerpt>,
    pub tasks: Vec<BackupTask>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupTopic {
    pub id: String,
    pub title: String,
    pub slug: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub archived_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupSource {
    pub id: String,
    pub title: String,
    pub kind: String,
    pub url: Option<String>,
    pub description: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub archived_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupSourceTopic {
    pub source_id: String,
    pub topic_id: String,
    pub linked_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupSourceFile {
    pub id: String,
    pub source_id: String,
    pub original_filename: String,
    pub stored_path: String,
    pub mime_type: String,
    pub file_size_bytes: i64,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupNote {
    pub id: String,
    pub source_id: String,
    pub markdown_content: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupExcerpt {
    pub id: String,
    pub source_id: String,
    pub selected_text: String,
    pub note: Option<String>,
    pub citation_text: String,
    pub page_label: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupTask {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub status: String,
    pub priority: String,
    pub due_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub archived_at: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkspaceBackupMeta {
    pub exported_at: String,
    pub path: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportWorkspaceBackupPayload {
    pub file_path: String,
}