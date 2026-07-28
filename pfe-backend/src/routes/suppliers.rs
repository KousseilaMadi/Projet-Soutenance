use axum::{
    extract::{Extension, Path, Query, State},
    http::StatusCode,
    middleware,
    routing::{get, post, put, delete},
    Json, Router,
};
use serde::Deserialize;
use std::sync::Arc;
use crate::state::AppState;
use crate::middleware::auth::{auth_middleware, Claims, require_role};
use crate::services::suppliers_service as suppliers_service;

#[derive(Deserialize)]
pub struct SearchQuery {
    pub query: Option<String>,
}

#[derive(Deserialize)]
pub struct CreateSupplierBody {
    pub name: String,
    pub contact: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>
}



#[derive(Deserialize)]
pub struct UpdateSupplierBody {
    pub name: String,
    pub contact: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub is_active: bool
}


#[derive(Deserialize)]
pub struct ProductSupplierBody {
    pub product_id: Option<i64>,
    pub supplier_id: Option<i64>,
    pub unit_price: f64,
    pub delivery_days: i64,
    pub reliability_score: f64

}

pub fn router(state: Arc<AppState>) -> Router {

    Router::new()
        .route("/", get(get_all).post(create))
        .route("/:id", get(get_by_id).put(update).delete(destroy))
        .route("/:id/products", get(get_products))
        .layer(middleware::from_fn_with_state(state.clone(), auth_middleware))
        .with_state(state)
}


pub fn product_suppliers_router(state: Arc<AppState>) -> Router {


    Router::new()
        .route("/", post(add_product_supplier))
        .route("/:id", put(update_product_supplier).delete(remove_product_supplier))
        .layer(middleware::from_fn_with_state(state.clone(), auth_middleware))
        .with_state(state)
}


async fn get_all(
    State(state): State<Arc<AppState>>,
    Query(params): Query<SearchQuery>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {


    let conn = state.pool.get().map_err(internal_error)?;

    let result = match params.query {
        Some(q) if !q.is_empty() => suppliers_service::search_suppliers(&conn, &q),
        _ => suppliers_service::get_all_suppliers(&conn),
    };
    result.map(|d| Json(serde_json::json!(d))).map_err(bad_request)
}



async fn get_by_id(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i64>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    let conn = state.pool.get().map_err(internal_error)?;


    suppliers_service::get_supplier_by_id(&conn, id)
        .map(|d| Json(serde_json::json!(d)))
        .map_err(bad_request)
}

async fn create(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(body): Json<CreateSupplierBody>

) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {


    require_role(&claims, &["admin", "manager"])?;

    let conn = state.pool.get().map_err(internal_error)?;

    suppliers_service::create_supplier(
        &conn,
        &body.name,
        body.contact.as_deref(),
        body.phone.as_deref(),
        body.address.as_deref()
    )
    .map(|id| Json(serde_json::json!({ "id": id })))
    .map_err(bad_request)}


async fn update(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i64>,
    Json(body): Json<UpdateSupplierBody>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {


    require_role(&claims, &["admin", "manager"])?;

    let conn = state.pool.get().map_err(internal_error)?;

    suppliers_service::update_supplier(
        &conn, id,
        &body.name,
        body.contact.as_deref(),
        body.phone.as_deref(),
        body.address.as_deref(),
        body.is_active
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


    suppliers_service::delete_supplier(&conn, id)
        .map(|_| Json(serde_json::json!({ "success": true })))
        .map_err(bad_request)
}

async fn get_products(
    State(state): State<Arc<AppState>>,
    Path(id): Path<i64>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {


    let conn = state.pool.get().map_err(internal_error)?;

    suppliers_service::get_products_for_supplier(&conn, id)
        .map(|d| Json(serde_json::json!(d)))
        .map_err(bad_request)}

async fn add_product_supplier(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Json(body): Json<ProductSupplierBody>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {


    require_role(&claims, &["admin", "manager"])?;

    let conn = state.pool.get().map_err(internal_error)?;

    let product_id = body.product_id.ok_or_else(|| bad_request("product_id required".to_string()))?;


    let supplier_id = body.supplier_id.ok_or_else(|| bad_request("supplier_id required".to_string()))?;


    suppliers_service::add_product_to_supplier(
        &conn, product_id, supplier_id,
        body.unit_price, body.delivery_days, body.reliability_score

    )
    .map(|id| Json(serde_json::json!({ "id": id })))
    .map_err(bad_request)
}


async fn update_product_supplier(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i64>,
    Json(body): Json<ProductSupplierBody>
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {


    require_role(&claims, &["admin", "manager"])?;

    let conn = state.pool.get().map_err(internal_error)?;


    suppliers_service::update_product_supplier(
        &conn, id,
        body.unit_price, body.delivery_days, body.reliability_score
    )
    .map(|_| Json(serde_json::json!({ "success": true })))
    .map_err(bad_request)
}

async fn remove_product_supplier(
    State(state): State<Arc<AppState>>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<i64>

) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {

    require_role(&claims, &["admin", "manager"])?;

    let conn = state.pool.get().map_err(internal_error)?;

    suppliers_service::remove_product_from_supplier(&conn, id)
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