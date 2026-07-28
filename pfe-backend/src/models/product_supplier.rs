use serde::{Deserialize, Serialize};

#[derive(Debug,Serialize,Deserialize, Clone)]
pub struct ProductSupplier {
    pub id: i64,
    pub product_id: i64,
    pub supplier_id: i64,
    pub unit_price: f64,
    pub delivery_days: i64,
    pub reliability_score: f64,
}


#[derive(Debug, Serialize,Deserialize,Clone)]
pub struct ProductSupplierWithDetails {
    pub id: i64,
    pub product_id: i64,
    pub product_name: String,
    pub product_reference: String,
    pub unit: String,
    pub supplier_id: i64,
    pub unit_price: f64,
    pub delivery_days: i64,
    pub reliability_score: f64,
}