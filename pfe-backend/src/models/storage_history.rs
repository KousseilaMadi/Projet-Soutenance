use serde::{ Deserialize, Serialize};

#[derive( Debug,Serialize,Deserialize, Clone)]
pub struct StorageHistory {
    pub id: i64,
    pub product_id: i64,
    pub user_id: Option<i64>,
    pub movement_type: String,
    pub quantity: f64,
    pub note: Option<String>,
    pub created_at: String,
}

#[derive(Debug,Serialize, Deserialize, Clone)]
pub struct StorageHistoryWithDetails {
    pub id: i64,
    pub product_id: i64,
    pub product_name: String,
    pub product_reference: String,
    pub user_id: Option<i64>,
    pub username: Option<String>,
    pub movement_type: String,
    pub quantity: f64,
    pub note: Option<String>,
    pub created_at: String,
}