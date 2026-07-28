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
use crate::services::users_service as users_service;

#[derive(Deserialize)]
pub struct CreateUserBody {
    pub username: String,
    pub password: String,
    pub role: String,

}


#[derive(Deserialize)]
pub struct UpdateRoleBody {
    pub role: String,

}
#[derive(Deserialize)]
pub struct ChangePasswordBody {
    pub old_password: String,
    pub new_password: String
}

#[derive(Deserialize)]
pub struct UpdateUsernameBody {
    pub new_username: String
}

pub fn router(state: Arc<AppState>) -> Router {

    Router::new()
        .route("/", get(get_all).post(create))
        .route("/:id", delete(destroy))
        .route("/:id/role", put(update_role))
        .route("/:id/password", put(change_password))
        .route("/:id/username", put(update_username))
        .layer(middleware::from_fn_with_state(state.clone(), auth_middleware))
        .with_state(state)


}

async fn get_all(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {


    require_role(&claims, &["admin"])?;

    let conn = state.pool.get().map_err(internal_error)?;

    users_service::get_all_users(&conn)
        .map(|d| Json(serde_json::json!(d)))
        .map_err(bad_request)
}

async fn create(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(body): Json<CreateUserBody>

) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    require_role(&claims, &["admin"])?;

    let conn = state.pool.get().map_err(internal_error)?;


    users_service::create_user(&conn, &body.username, &body.password, &body.role)
        .map(|id| Json(serde_json::json!({ "id": id })))
        .map_err(bad_request)
}


async fn destroy(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i64>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    require_role(&claims, &["admin"])?;


    let conn = state.pool.get().map_err(internal_error)?;

    users_service::delete_user(&conn, id)
        .map(|_| Json(serde_json::json!({ "success": true })))
        .map_err(bad_request)
}

async fn update_role(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i64>,
    Json(body): Json<UpdateRoleBody>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    require_role(&claims, &["admin"])?;

    let conn = state.pool.get().map_err(internal_error)?;

    users_service::update_role(&conn, id, &body.role)
        .map(|_| Json(serde_json::json!({ "success": true })))
        .map_err(bad_request)
}

async fn change_password(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i64>,
    Json(body): Json<ChangePasswordBody>,

) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    if claims.sub != id && claims.role != "admin" {
        return Err((StatusCode::FORBIDDEN, Json(serde_json::json!({ "error": "Permission denied" }))));
    }


    let conn = state.pool.get().map_err(internal_error)?;

    users_service::change_password(&conn, id, &body.old_password, &body.new_password)
        .map(|_| Json(serde_json::json!({ "success": true })))
        .map_err(bad_request)
}


async fn update_username(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i64>,
    Json(body): Json<UpdateUsernameBody>,
    
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    if claims.sub != id && claims.role != "admin" {

        return Err((StatusCode::FORBIDDEN, Json(serde_json::json!({ "error": "Permission denied" }))));
    }

    let conn = state.pool.get().map_err(internal_error)?;

    users_service::update_username(&conn, id, &body.new_username)
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