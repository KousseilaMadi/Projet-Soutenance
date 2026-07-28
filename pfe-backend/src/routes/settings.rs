use axum::{
    extract::{Extension, Path, State},
    http::StatusCode,
    middleware,
    routing::{get, put},
    Json, Router,
};

use serde::Deserialize;
use std::sync::Arc;

use crate::state::AppState;

use crate::middleware::auth::{auth_middleware, Claims, require_role};
use crate::services::settings_service as settings_service;

#[derive(Deserialize)]
pub struct UpdateSettingBody {
    pub value: String
}

pub fn router(state: Arc<AppState>) -> Router {

    Router::new()
        .route("/", get(get_all))
        .route("/:key", put(update))
        .layer(middleware::from_fn_with_state(state.clone(), auth_middleware))
        .with_state(state)
}


async fn get_all(
    State(state): State<Arc<AppState>>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    let conn = state.pool.get().map_err(internal_error)?;

    settings_service::get_all_settings(&conn)
        .map(|d| Json(serde_json::json!(d)))
        .map_err(bad_request)
}

async fn update(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(key): Path<String>,
    Json(body): Json<UpdateSettingBody>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    require_role(&claims, &["admin", "manager"])?;

    let conn = state.pool.get().map_err(internal_error)?;

    settings_service::update_setting(&conn, &key, &body.value)
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