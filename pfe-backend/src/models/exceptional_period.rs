use serde::{Deserialize, Serialize};

#[derive( Debug, Serialize, Deserialize, Clone)]
pub struct ExceptionalPeriod {
    pub id: i64,
    pub name: String,
    pub start_date: String,
    pub end_date: String,
    pub factor: f64
}