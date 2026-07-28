use rusqlite::Connection;
use crate::repositories::{suppliers as suppliers_repo, product_suppliers as ps_repo};
use crate::models::supplier::Supplier;
use crate::models::product_supplier::{ProductSupplier, ProductSupplierWithDetails};

pub fn get_all_suppliers(conn: &Connection) -> Result<Vec<Supplier>, String> {
    suppliers_repo::get_all_suppliers(conn).map_err(|e| e.to_string())
}

pub fn search_suppliers(conn: &Connection, query: &str) -> Result<Vec<Supplier>, String> {
    suppliers_repo::search_suppliers(conn, query).map_err(|e| e.to_string())
}

pub fn get_supplier_by_id(conn: &Connection, id: i64) -> Result<Supplier, String> {
    suppliers_repo::get_supplier_by_id(conn, id).map_err(|e| e.to_string())
}

pub fn create_supplier(
    conn: &Connection,
    name: &str,
    contact: Option<&str>,
    phone: Option<&str>,
    address: Option<&str>
) -> Result<i64, String> {

    suppliers_repo::create_supplier(conn, name, contact, phone, address)
        .map_err(|e| e.to_string())
}

pub fn update_supplier(
    conn: &Connection,
    id: i64,
    name: &str,
    contact: Option<&str>,
    phone: Option<&str>,
    address: Option<&str>,
    is_active: bool
) -> Result<(), String> {

    suppliers_repo::update_supplier(conn, id, name, contact, phone, address, is_active)
        .map_err(|e| e.to_string())
}

pub fn delete_supplier(conn: &Connection, id: i64) -> Result<(), String> {
    suppliers_repo::delete_supplier(conn, id).map_err(|e| e.to_string())
}

pub fn get_products_for_supplier(conn: &Connection, supplier_id: i64) -> Result<Vec<ProductSupplierWithDetails>, String> {
    ps_repo::get_products_for_supplier_detailed(conn, supplier_id).map_err(|e| e.to_string())
}

pub fn get_suppliers_for_product(conn: &Connection, product_id: i64) -> Result<Vec<ProductSupplier>, String> {
    ps_repo::get_suppliers_for_product(conn, product_id).map_err(|e| e.to_string())
}

pub fn add_product_to_supplier(
    conn: &Connection,
    product_id: i64,
    supplier_id: i64,
    unit_price: f64,
    delivery_days: i64,
    reliability_score: f64,

) -> Result<i64, String> {
    ps_repo::create_product_supplier(conn, product_id, supplier_id, unit_price, delivery_days, reliability_score)
        .map_err(|e| e.to_string())

}

pub fn update_product_supplier(
    conn: &Connection,
    id: i64,
    unit_price: f64,
    delivery_days: i64,
    reliability_score: f64

) -> Result<(), String> {

    ps_repo::update_product_supplier(conn, id, unit_price, delivery_days, reliability_score)
        .map_err(|e| e.to_string())
        
}

pub fn remove_product_from_supplier(conn: &Connection, id: i64) -> Result<(), String> {
    ps_repo::delete_product_supplier(conn, id).map_err(|e| e.to_string())
}