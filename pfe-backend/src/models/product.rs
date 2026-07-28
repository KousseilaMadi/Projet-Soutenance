use serde::{ Deserialize, Serialize};

#[derive( Debug, Serialize,Deserialize, Clone)]
pub struct Product {
    pub id: i64,
    pub reference: String,
    pub name: String,
    pub category: String,
    pub unit: String,
    pub alert_threshold: f64,
    pub image_path: Option<String>,
    pub created_at: String,

}