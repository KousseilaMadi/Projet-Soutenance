use axum::{
    extract::{Extension, State},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};

use serde::{Deserialize, Serialize};

use std::sync::Arc;
use crate::state::AppState;

use crate::middleware::auth::{auth_middleware, Claims, generate_token};
use crate::services::auth_service as auth_service;
use crate::repositories::users as users_repo;

use axum::middleware;

#[derive(Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String

}


#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user: crate::models::user::User
}



pub fn router(state: Arc<AppState>) -> Router {
    
    Router::new()
        .route("/login", post(login))
        .route("/me", get(me).layer(middleware::from_fn_with_state(state.clone(), auth_middleware)))
        .with_state(state)
}


async fn login(
    State(state): State<Arc<AppState>>,
    Json(body): Json<LoginRequest>
) -> Result<Json<LoginResponse>, (StatusCode, Json<serde_json::Value>)> {

    let conn = state.pool.get().map_err(|e| (

        StatusCode::INTERNAL_SERVER_ERROR,

        Json(serde_json::json!({ "error": e.to_string() }))

    ))?;

    match auth_service::login(&conn, &body.username, &body.password, &state.jwt_secret) {

        Ok((token, user)) => Ok(Json(LoginResponse { token, user })),

        Err(e) => Err((StatusCode::UNAUTHORIZED, Json(serde_json::json!({ "error": e })))),
    }
}

async fn me(
    Extension(claims): Extension<Claims>,
    State(state): State<Arc<AppState>>

) -> Result<Json<crate::models::user::User>, (StatusCode, Json<serde_json::Value>)> {

    let conn = state.pool.get().map_err(|e| (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(serde_json::json!({ "error": e.to_string() }))

    )
)?;

    users_repo::get_user_by_id(&conn, claims.sub)
        .map(Json)
        .map_err(|e| (StatusCode::NOT_FOUND, Json(serde_json::json!({ "error": e.to_string() }))))
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