use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SourceListItem {
    pub id: String,
    pub title: String,
    pub kind: String,
    pub url: Option<String>,
    pub description: Option<String>,
    pub topic_names: String,
    pub topic_count: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchivedSourceListItem {
    pub id: String,
    pub title: String,
    pub kind: String,
    pub url: Option<String>,
    pub description: Option<String>,
    pub archived_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SourceTopicLinkItem {
    pub topic_id: String,
    pub topic_title: String,
    pub topic_color: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SourceTopicLinksDetail {
    pub source_id: String,
    pub topics: Vec<SourceTopicLinkItem>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateUrlSourcePayload {
    pub url: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub topic_id: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportPdfSourcePayload {
    pub file_path: String,
    pub title: Option<String>,
    pub description: Option<String>,
    pub topic_id: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchiveSourcePayload {
    pub id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RestoreSourcePayload {
    pub id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetSourceTopicLinksPayload {
    pub source_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AddSourceToTopicPayload {
    pub source_id: String,
    pub topic_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RemoveSourceFromTopicPayload {
    pub source_id: String,
    pub topic_id: String,
}