use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExcerptListItem {
    pub id: String,
    pub source_id: String,
    pub source_title: String,
    pub source_kind: String,
    pub preview_text: String,
    pub note: Option<String>,
    pub citation_text: String,
    pub page_label: Option<String>,
    pub topic_names: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchivedExcerptListItem {
    pub id: String,
    pub source_id: String,
    pub source_title: String,
    pub preview_text: String,
    pub archived_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExcerptDetail {
    pub id: String,
    pub source_id: String,
    pub source_title: String,
    pub source_kind: String,
    pub excerpt_text: String,
    pub note: Option<String>,
    pub citation_text: String,
    pub page_label: Option<String>,
    pub topic_names: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateExcerptPayload {
    pub source_id: String,
    pub excerpt_text: String,
    pub note: Option<String>,
    pub page_label: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateExcerptPayload {
    pub id: String,
    pub excerpt_text: String,
    pub note: Option<String>,
    pub page_label: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetExcerptDetailPayload {
    pub id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ArchiveExcerptPayload {
    pub id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RestoreExcerptPayload {
    pub id: String,
}