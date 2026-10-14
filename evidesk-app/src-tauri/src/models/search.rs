use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchResultItem {
    pub id: String,
    pub entity_type: String,
    pub title: String,
    pub subtitle: Option<String>,
    pub snippet: Option<String>,
    pub matched_field: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchAllPayload {
    pub query: String,
    pub limit: Option<i64>,
}
