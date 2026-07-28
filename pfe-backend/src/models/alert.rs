use serde::{Deserialize, Serialize};

#[derive( Debug, Serialize, Deserialize, Clone)]
pub struct Alert {
    pub id: i64,
    pub product_id: i64,
    pub order_id: Option<i64>,
    pub alert_type: String,
    pub message: String,
    pub status: String,
    pub created_at: String,
}


#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AlertWithDetails {
    pub id: i64,
    pub product_id: i64,
    pub product_name: String,
    pub product_reference: String,
    pub order_id: Option<i64>,
    pub alert_type: String,
    pub message: String,
    pub status: String,
    pub created_at: String,
}