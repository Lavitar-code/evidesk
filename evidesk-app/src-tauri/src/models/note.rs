use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NoteListItem {
    pub id: String,
    pub title: String,
    pub content_preview: String,
    pub topic_names: String,
    pub topic_count: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchivedNoteListItem {
    pub id: String,
    pub title: String,
    pub content_preview: String,
    pub archived_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NoteDetail {
    pub id: String,
    pub title: String,
    pub markdown_content: String,
    pub topic_names: String,
    pub topic_count: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateNotePayload {
    pub title: String,
    pub markdown_content: String,
    pub topic_id: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateNotePayload {
    pub id: String,
    pub title: String,
    pub markdown_content: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetNoteDetailPayload {
    pub id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchiveNotePayload {
    pub id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RestoreNotePayload {
    pub id: String,
}