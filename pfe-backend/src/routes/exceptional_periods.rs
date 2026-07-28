use axum::{
    extract::{Extension, Path, State},
    http::StatusCode,
    middleware,
    routing::{get, post, put, delete},
    Json, Router,
};


use serde::Deserialize;

use std::sync::Arc;
use crate::state::AppState;

use crate::middleware::auth::{auth_middleware, Claims, require_role};
use crate::repositories::exceptional_periods as periods_repo;


#[derive(Deserialize)]
pub struct PeriodBody {
    pub name: String,
    pub start_date: String,
    pub end_date: String,
    pub factor: f64

}

pub fn router(state: Arc<AppState>) -> Router {

    Router::new()
        .route("/", get(get_all).post(create))
        .route("/:id", put(update).delete(destroy))
        .layer(middleware::from_fn_with_state(state.clone(), auth_middleware))
        .with_state(state)


}


async fn get_all(
    State(state): State<Arc<AppState>>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    let conn = state.pool.get().map_err(internal_error)?;

    periods_repo::get_all_exceptional_periods(&conn)
        .map(|d| Json(serde_json::json!(d)))
        .map_err(bad_request)
    

}


async fn create(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(body): Json<PeriodBody>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {


    require_role(&claims, &["admin", "manager"])?;

    let conn = state.pool.get().map_err(internal_error)?;

    periods_repo::create_exceptional_period(&conn, &body.name, &body.start_date, &body.end_date, body.factor)
        .map(|id| Json(serde_json::json!({ "id": id })))
        .map_err(bad_request)


}

async fn update(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i64>,
    Json(body): Json<PeriodBody>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    require_role(&claims, &["admin", "manager"])?;

    let conn = state.pool.get().map_err(internal_error)?;


    periods_repo::update_exceptional_period(&conn, id, &body.name, &body.start_date, &body.end_date, body.factor)
        .map(|_| Json(serde_json::json!({ "success": true })))
        .map_err(bad_request)
}


async fn destroy(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i64>

) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    require_role(&claims, &["admin", "manager"])?;


    let conn = state.pool.get().map_err(internal_error)?;

    periods_repo::delete_exceptional_period(&conn, id)
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