use rusqlite::Connection;
use crate::repositories::{products as products_repo, storage as storage_repo};
use crate::models::product::Product;
use crate::middleware::auth::Claims;


pub fn get_all_products(conn: &Connection) -> Result<Vec<Product>, String> {
    products_repo::get_all_products(conn).map_err(|e| e.to_string())

}

pub fn search_products(conn: &Connection, query: &str) -> Result<Vec<Product>, String> {
    products_repo::search_products(conn, query).map_err(|e| e.to_string())
}

pub fn get_product_by_id(conn: &Connection, id: i64) -> Result<Product, String> {
    products_repo::get_product_by_id(conn, id).map_err(|e| e.to_string())

}

pub fn create_product(
    conn: &Connection,
    claims: &Claims,
    reference: &str,
    name: &str,
    category: &str,
    unit: &str,
    alert_threshold: f64,
    max_capacity: Option<f64>,

) -> Result<i64, String> {
    let product_id = products_repo::create_product(conn, reference, name, category, unit, alert_threshold)
        .map_err(|e| e.to_string())?;


    storage_repo::init_storage(conn, product_id, max_capacity)
        .map_err(|e| e.to_string())?;

    Ok(product_id)
}



pub fn update_product(
    conn: &Connection,
    id: i64,
    reference: &str,
    name: &str,
    category: &str,
    unit: &str,
    alert_threshold: f64,

) -> Result<(), String> {

    products_repo::update_product(conn, id, reference, name, category, unit, alert_threshold)
        .map_err(|e| e.to_string())
}

pub fn delete_product(conn: &Connection, id: i64) -> Result<(), String> {

    products_repo::delete_product(conn, id).map_err(|e| e.to_string())
}