use std::sync::Arc;
use axum::Router;
use crate::state::AppState;


pub mod auth;
pub mod products;
pub mod suppliers;
pub mod stock;
pub mod orders;
pub mod alerts;
pub mod exceptional_periods;
pub mod users;
pub mod settings;

pub fn create_router(state: Arc<AppState>) -> Router {
    
    Router::new()
        .nest("/auth", auth::router(state.clone()))
        .nest("/products",products::router(state.clone()))
        .nest("/suppliers",suppliers::router(state.clone()))
        .nest("/product-suppliers", suppliers::product_suppliers_router(state.clone()))
        .nest("/storage", stock::router(state.clone()))
        .nest("/orders", orders::router(state.clone()))
        .nest("/alerts",alerts::router(state.clone()))
        .nest("/exceptional-periods", exceptional_periods::router(state.clone()))
        .nest("/users", users::router(state.clone()))
        .nest("/settings", settings::router(state.clone()))
}