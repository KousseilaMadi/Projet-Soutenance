use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: i64,
    pub username: String,
    pub role: String,
    pub created_at: String
    
}


#[derive(Debug, Serialize, Deserialize,Clone)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}