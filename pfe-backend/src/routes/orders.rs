use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    middleware,
    routing::{get, post, delete},
    Json, Router,
};

use serde::Deserialize;
use std::sync::Arc;


use crate::state::AppState;
use crate::middleware::auth::{auth_middleware, Claims, require_role};
use crate::services::orders_service as orders_service;

#[derive(Deserialize)]
pub struct OrdersQuery {
    pub supplier: Option<String>,
    pub status: Option<String>
}

pub fn router(state: Arc<AppState>) -> Router {

    Router::new()
        .route("/", get(get_all))
        .route("/:id", get(get_by_id).delete(reject))
        .route("/:id/items", get(get_items))
        .route("/:id/validate", post(validate))
        .layer(middleware::from_fn_with_state(state.clone(), auth_middleware))
        .with_state(state)

}

async fn get_all(
    State(state): State<Arc<AppState>>,
    Query(params): Query<OrdersQuery>

) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    let conn = state.pool.get().map_err(internal_error)?;

    orders_service::search_orders(&conn, params.supplier.as_deref(), params.status.as_deref())
        .map(|d| Json(serde_json::json!(d)))
        .map_err(bad_request)
}


async fn get_by_id(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i64>,

) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let conn = state.pool.get().map_err(internal_error)?;

    orders_service::get_order_by_id(&conn, id)
        .map(|d| Json(serde_json::json!(d)))
        .map_err(bad_request)
}


async fn get_items(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i64>,

) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    let conn = state.pool.get().map_err(internal_error)?;

    orders_service::get_order_items(&conn, id)
        .map(|d| Json(serde_json::json!(d)))
        .map_err(bad_request)
}

async fn validate(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i64>

) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    require_role(&claims, &["manager"])?;

    let conn = state.pool.get().map_err(internal_error)?;

    orders_service::validate_order(&conn, id)
        .map(|_| Json(serde_json::json!({ "success": true })))
        .map_err(bad_request)
}

async fn reject(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i64>
    
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    require_role(&claims, &["manager"])?;

    let conn = state.pool.get().map_err(internal_error)?;

    orders_service::reject_order(&conn, id)
        .map(|_| Json(serde_json::json!({ "success": true })))
        .map_err(bad_request)
}

fn internal_error<E: std::fmt::Display>(e: E) -> (StatusCode, Json<serde_json::Value>) {
    (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() })))
}

fn bad_request<E: std::fmt::Display>(e: E) -> (StatusCode, Json<serde_json::Value>) {
    (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": e.to_string() })))
}

fn not_found<E: std::fmt::Display>(e: E) -> (StatusCode, Json<serde_json::Value>) {
    (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": e.to_string() })))
}