use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    middleware,
    routing::{get, post},
    Json, Router,
};

use serde::Deserialize;
use std::sync::Arc;

use crate::state::AppState;

use crate::middleware::auth::{auth_middleware, Claims};

use crate::services::stock_service as stock_service;
use crate::repositories::{storage as storage_repo, storage_history as history_repo};

#[derive(Deserialize)]
pub struct StorageQuery {
    pub query: Option<String>,
}

#[derive(Deserialize)]
pub struct HistoryQuery {
    pub product_query: Option<String>,
    pub movement_type: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>
}

#[derive(Deserialize)]
pub struct MovementBody {
    pub product_id: i64,
    pub movement_type: String,
    pub quantity: f64,
    pub note: Option<String>,

}

pub fn router(state: Arc<AppState>) -> Router {

    Router::new()
        .route("/", get(get_all_storage))
        .route("/:product_id", get(get_storage_by_product))
        .route("/movements", post(record_movement))
        .route("/history", get(get_all_history))
        .route("/history/:product_id", get(get_history_by_product))
        .layer(middleware::from_fn_with_state(state.clone(), auth_middleware))
        .with_state(state)

}


async fn get_all_storage(

    State(state): State<Arc<AppState>>,
    Query(params): Query<StorageQuery>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    let conn = state.pool.get().map_err(internal_error)?;

    let result = match params.query {

        Some(q) if !q.is_empty() => storage_repo::search_storage(&conn, &q),

        _ => storage_repo::get_all_storage(&conn),
    };

    result.map(|d| Json(serde_json::json!(d))).map_err(bad_request)
}

async fn get_storage_by_product(
    State(state): State<Arc<AppState>>,
    Path(product_id): Path<i64>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    let conn = state.pool.get().map_err(internal_error)?;

    storage_repo::get_storage_by_product(&conn, product_id)
        .map(|d| Json(serde_json::json!(d)))
        .map_err(bad_request)

}

async fn record_movement(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(body): Json<MovementBody>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    let conn = state.pool.get().map_err(internal_error)?;

    stock_service::record_movement(
        &conn, &claims,
        body.product_id,
        &body.movement_type,
        body.quantity,
        body.note.as_deref()
    )
    .map(|_| Json(serde_json::json!({ "success": true })))
    .map_err(bad_request)

}

async fn get_all_history(
    State(state): State<Arc<AppState>>,
    Query(params): Query<HistoryQuery>,

) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    let conn = state.pool.get().map_err(internal_error)?;

    let result = if params.product_query.is_some()
        || params.movement_type.is_some()
        || params.start_date.is_some()
        || params.end_date.is_some()
    {

        history_repo::search_history(
            &conn,
            params.product_query.as_deref(),
            params.movement_type.as_deref(),
            params.start_date.as_deref(),
            params.end_date.as_deref(),
        )

    } else {
        history_repo::get_all_history(&conn)
    };

    result.map(|d| Json(serde_json::json!(d))).map_err(bad_request)
}

async fn get_history_by_product(

    State(state): State<Arc<AppState>>,
    Path(product_id): Path<i64>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    let conn = state.pool.get().map_err(internal_error)?;

    history_repo::get_history_by_product(&conn, product_id)
        .map(|d| Json(serde_json::json!(d)))
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