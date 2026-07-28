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

use crate::middleware::auth::{auth_middleware, Claims, require_role};
use crate::services::alerts_service as alerts_service;

#[derive(Deserialize)]
pub struct AlertsQuery {
    pub status: Option<String>,
    pub alert_type: Option<String>,
}

pub fn router(state: Arc<AppState>) -> Router {

    Router::new()
        .route("/", get(get_all))
        .route("/:id/acknowledge", post(acknowledge))
        .route("/:id/resolve", post(resolve))
        .layer(middleware::from_fn_with_state(state.clone(), auth_middleware))
        .with_state(state)
}

async fn get_all(
    State(state): State<Arc<AppState>>,
    Query(params): Query<AlertsQuery>

) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    let conn = state.pool.get().map_err(internal_error)?;

    
    let result = match params.status.as_deref() {

        Some("active") => alerts_service::get_active_alerts(&conn),

        _ => alerts_service::get_all_alerts(&conn),
    };

    result.map(|d| Json(serde_json::json!(d))).map_err(bad_request)
}

async fn acknowledge(

    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i64>,

) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    require_role(&claims, &["admin", "manager"])?;


    let conn = state.pool.get().map_err(internal_error)?;

    alerts_service::acknowledge_alert(&conn, id)
        .map(|_| Json(serde_json::json!({ "success": true })))
        .map_err(bad_request)

}

async fn resolve(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i64>

) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    require_role(&claims, &["admin", "manager"])?;

    let conn = state.pool.get().map_err(internal_error)?;

    alerts_service::resolve_alert(&conn, id)
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