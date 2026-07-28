use axum::{
    extract::{Extension, Multipart, Path, Query, State},
    http::StatusCode,
    middleware,
    routing::{get, post, put, delete},
    Json, Router,
};


use serde::Deserialize;
use std::sync::Arc;

use crate::state::AppState;
use crate::middleware::auth::{auth_middleware, Claims, require_role};
use crate::services::products_service as products_service;

use std::path::PathBuf;
use tokio::io::AsyncWriteExt;
use bytes::Bytes;


#[derive(Deserialize)]
pub struct SearchQuery {
    pub query: Option<String>,

}


#[derive(Deserialize)]
pub struct CreateProductBody {
    pub reference: String,
    pub name: String,
    pub category: String,
    pub unit: String,
    pub alert_threshold: f64,
    pub max_capacity: Option<f64>
}

#[derive(Deserialize)]
pub struct UpdateProductBody {
    pub reference: String,
    pub name: String,
    pub category: String,
    pub unit: String,
    pub alert_threshold: f64
}

pub fn router(state: Arc<AppState>) -> Router {

    Router::new()
        .route("/", get(get_all).post(create))
        .route("/:id", get(get_by_id).put(update).delete(destroy))
        .route("/:id/suppliers", get(get_suppliers))
        .route("/:id/image", post(upload_image))
        .layer(middleware::from_fn_with_state(state.clone(), auth_middleware))
        .with_state(state)

}

async fn get_all(

    State(state): State<Arc<AppState>>,
    Query(params): Query<SearchQuery>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let conn = state.pool.get().map_err(internal_error)?;

    let result = match params.query {
        Some(q) if !q.is_empty() => products_service::search_products(&conn, &q),
        _ => products_service::get_all_products(&conn),
    };

    result.map(|d| Json(serde_json::json!(d))).map_err(bad_request)

}

async fn get_by_id(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i64>,

) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    let conn = state.pool.get().map_err(internal_error)?;

    products_service::get_product_by_id(&conn, id)
        .map(|d| Json(serde_json::json!(d)))
        .map_err(not_found)

}

async fn create(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(body): Json<CreateProductBody>,

) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    require_role(&claims, &["admin", "manager"])?;

    let conn = state.pool.get().map_err(internal_error)?;

    products_service::create_product(
        &conn, &claims,
        &body.reference, &body.name, &body.category,
        &body.unit, body.alert_threshold, body.max_capacity,
    )

    .map(|id| Json(serde_json::json!({ "id": id })))
    .map_err(bad_request)
}

async fn update(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i64>,
    Json(body): Json<UpdateProductBody>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    require_role(&claims, &["admin", "manager"])?;

    let conn = state.pool.get().map_err(internal_error)?;
    

    products_service::update_product(
        &conn, id,
        &body.reference, &body.name, &body.category,
        &body.unit, body.alert_threshold,
    )
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

    products_service::delete_product(&conn, id)
        .map(|_| Json(serde_json::json!({ "success": true })))
        .map_err(bad_request)
}

async fn get_suppliers(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i64>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    let conn = state.pool.get().map_err(internal_error)?;

    crate::services::suppliers_service::get_suppliers_for_product(&conn, id)
        .map(|d| Json(serde_json::json!(d)))
        .map_err(bad_request)
}

async fn upload_image(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i64>,
    mut multipart: Multipart
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    require_role(&claims, &["admin", "manager"])?;

    let uploads_dir = PathBuf::from("uploads/products");

    tokio::fs::create_dir_all(&uploads_dir).await
        .map_err(|e: std::io::Error| internal_error(e))?;

    loop {

        let field_result = multipart.next_field().await;

        match field_result {
            Err(e) => return Err(internal_error(e)),

            Ok(None) => break,

            Ok(Some(field)) => {

                let file_name = field.file_name()
                    .unwrap_or("image.jpg")
                    .to_string();


                let extension = file_name
                    .split('.')
                    .last()
                    .unwrap_or("jpg")
                    .to_lowercase();


                if !["jpg", "jpeg", "png", "webp"].contains(&extension.as_str()) {

                    return Err(bad_request("Invalid file type".to_string()));

                }

                let stored_name = format!("product_{}_{}.{}", id, uuid::Uuid::new_v4(), extension);
                let file_path = uploads_dir.join(&stored_name);

                let image_path = format!("uploads/products/{}", stored_name);

                let data: bytes::Bytes = field.bytes().await
                    .map_err(|e| internal_error(e))?;

                let mut file = tokio::fs::File::create(&file_path).await
                    .map_err(|e: std::io::Error| internal_error(e))?;

                file.write_all(&data).await
                    .map_err(|e: std::io::Error| internal_error(e))?;

                let conn = state.pool.get().map_err(|e| internal_error(e))?;
                crate::repositories::products::update_product_image(&conn, id, &image_path)
                    .map_err(|e| bad_request(e))?;

                return Ok(Json(serde_json::json!({
                    "success": true,
                    "image_path": image_path
                })


            ));

            }
            
        }
    }

    Err(bad_request("No file uploaded".to_string()))

    
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