mod database;
mod models;
mod repositories;
mod routes;
mod middleware;
mod state;
mod services;

use axum::{Router, http::Method};
use std::sync::Arc;
use tower_http::cors::{CorsLayer, Any};
use std::path::PathBuf;
use state::AppState;
use tower_http::services::ServeDir;
use axum::extract::DefaultBodyLimit;

#[tokio::main]
async fn main() {
    let db_path = PathBuf::from("packaging.db");

    let pool = database::init_pool(&db_path);

    database::init_db(&pool).expect("Failed to initialize database");

    let jwt_secret = "cevital_pfe_secret_key_2026".to_string();

    let state = Arc::new(AppState { pool, jwt_secret });


    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any);

    let app = Router::new()
        .nest("/api", routes::create_router(state.clone()))
        .nest_service("/uploads", ServeDir::new("uploads"))
        .layer(cors)
        .layer(DefaultBodyLimit::max(10 * 1024 * 1024));

        
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080")
        .await
        .expect("Failed to bind port 8080");

    println!("Server running on http://0.0.0.0:8080");
    axum::serve(listener, app).await.expect("Server failed");
}