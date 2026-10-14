use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TopicListItem {
    pub id: String,
    pub title: String,
    pub slug: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub source_count: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TopicDetail {
    pub id: String,
    pub title: String,
    pub slug: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub source_count: i64,
    pub note_count: i64,
    pub excerpt_count: i64,
    pub pdf_count: i64,
    pub url_count: i64,
    pub task_count: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTopicPayload {
    pub title: String,
    pub description: Option<String>,
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetTopicDetailPayload {
    pub id: String,
}