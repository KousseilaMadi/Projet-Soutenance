use rusqlite::{Connection, Result, params};
use crate::models::product_supplier::{ProductSupplier, ProductSupplierWithDetails};

pub fn get_suppliers_for_product(conn: &Connection, product_id: i64) -> Result<Vec<ProductSupplier>> {
    let mut stmt = conn.prepare(
        "SELECT id, product_id, supplier_id, unit_price, delivery_days, reliability_score
         FROM product_suppliers
         WHERE product_id = ?1
         ORDER BY unit_price ASC"
    )?;


    let product_suppliers = stmt.query_map(params![product_id], |row| {
        Ok(ProductSupplier {
            id: row.get(0)?,
            product_id: row.get(1)?,
            supplier_id: row.get(2)?,
            unit_price: row.get(3)?,
            delivery_days: row.get(4)?,
            reliability_score: row.get(5)?
        })
        
    })?.collect::<Result<Vec<ProductSupplier>>>()?;
    Ok(product_suppliers)
}

pub fn get_products_for_supplier(conn: &Connection, supplier_id: i64) -> Result<Vec<ProductSupplier>> {

    let mut stmt = conn.prepare(
        "SELECT id, product_id, supplier_id, unit_price, delivery_days, reliability_score
         FROM product_suppliers
         WHERE supplier_id = ?1"
    )?;
    let product_suppliers = stmt.query_map(params![supplier_id], |row| {
        Ok(ProductSupplier {
            id: row.get(0)?,
            product_id: row.get(1)?,
            supplier_id: row.get(2)?,
            unit_price: row.get(3)?,
            delivery_days: row.get(4)?,
            reliability_score: row.get(5)?

        })
    })?.collect::<Result<Vec<ProductSupplier>>>()?;
    Ok(product_suppliers)
}

pub fn get_products_for_supplier_detailed(conn: &Connection, supplier_id: i64, ) -> Result<Vec<ProductSupplierWithDetails>> {

    let mut stmt = conn.prepare(
        "SELECT ps.id, ps.product_id, p.name, p.reference, p.unit,
                ps.supplier_id, ps.unit_price, ps.delivery_days, ps.reliability_score
         FROM product_suppliers ps
         JOIN products p ON ps.product_id = p.id
         WHERE ps.supplier_id = ?1
         ORDER BY p.name ASC"
    )?;
    let items = stmt.query_map(params![supplier_id], |row| {
        Ok(ProductSupplierWithDetails {
            id: row.get(0)?,
            product_id: row.get(1)?,
            product_name: row.get(2)?,
            product_reference: row.get(3)?,
            unit: row.get(4)?,
            supplier_id: row.get(5)?,
            unit_price: row.get(6)?,
            delivery_days: row.get(7)?,
            reliability_score: row.get(8)?
        })
    })?.collect::<Result<Vec<ProductSupplierWithDetails>>>()?;
    Ok(items)
}

pub fn create_product_supplier(
    conn: &Connection,
    product_id: i64,
    supplier_id: i64,
    unit_price: f64,
    delivery_days: i64,
    reliability_score: f64,

) -> Result<i64> {
    
    conn.execute(
        "INSERT INTO product_suppliers (product_id, supplier_id, unit_price, delivery_days, reliability_score)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![product_id, supplier_id, unit_price, delivery_days, reliability_score],
    )?;

    Ok(conn.last_insert_rowid())
}

pub fn update_product_supplier(
    conn: &Connection,
    id: i64,
    unit_price: f64,
    delivery_days: i64,
    reliability_score: f64

) -> Result<()> {

    conn.execute(
        "UPDATE product_suppliers
         SET unit_price = ?1, delivery_days = ?2, reliability_score = ?3
         WHERE id = ?4",
        params![unit_price, delivery_days, reliability_score, id],
    )?;
    Ok(())
}

pub fn delete_product_supplier(conn: &Connection, id: i64) -> Result<()> {

    conn.execute("DELETE FROM product_suppliers WHERE id = ?1", params![id])?;

    Ok(())}
