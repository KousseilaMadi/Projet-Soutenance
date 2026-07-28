use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize,Clone)]
pub struct Order {
    pub id: i64,
    pub supplier_id: i64,
    pub status: String,
    pub created_at: String,
    pub validated_at: Option<String>
}


#[derive( Debug, Serialize,Deserialize, Clone)]
pub struct OrderWithDetails {
    pub id: i64,
    pub supplier_id: i64,
    pub supplier_name: String,
    pub supplier_contact: Option<String>,
    pub supplier_phone: Option<String>,
    pub supplier_address: Option<String>,
    pub status: String,
    pub created_at: String,
    pub validated_at: Option<String>,
    pub items: Vec<OrderItemWithDetails>
}

#[derive( Debug,Serialize, Deserialize,Clone)]
pub struct OrderItem {
    pub id: i64,
    pub order_id: i64,
    pub product_id: i64,
    pub quantity: f64,
    
}


#[derive(Debug, Serialize, Deserialize,Clone)]
pub struct OrderItemWithDetails {
    pub id: i64,
    pub order_id: i64,
    pub product_id: i64,
    pub product_name: String,
    pub product_reference: String,
    pub unit: String,
    pub quantity: f64,
}