use serde::{Deserialize, Serialize};

#[derive(Debug,Serialize, Deserialize, Clone)]
pub struct Storage {
    pub id: i64,
    pub product_id: i64,
    pub quantity: f64,
    pub max_capacity: Option<f64>,
    pub updated_at: String

}

#[derive( Debug, Serialize,Deserialize,Clone)]
pub struct StorageWithProduct {
    pub id: i64,
    pub product_id: i64,
    pub product_name: String,
    pub product_reference: String,
    pub category: String,
    pub unit: String,
    pub quantity: f64,
    pub max_capacity: Option<f64>,
    pub alert_threshold: f64,
    pub updated_at: String,
    
}