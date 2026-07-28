use serde::{Deserialize,Serialize};

#[derive(Debug, Serialize,Deserialize,Clone)]
pub struct Supplier {
    pub id: i64,
    pub name: String,
    pub contact: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub is_active: bool

}