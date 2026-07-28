use rusqlite::{Connection, Result, params};
use crate::models::product::{Product};

pub fn get_all_products(conn: &Connection) -> Result<Vec<Product>> {

    let mut stmt = conn.prepare(
        "SELECT id, reference, name, category, unit, alert_threshold, image_path, created_at 
         FROM products 
         ORDER BY name ASC"
    )?;

    let products = stmt.query_map([], |row| {

        Ok(Product {

            id: row.get(0)?,
            reference: row.get(1)?,
            name: row.get(2)?,
            category: row.get(3)?,
            unit: row.get(4)?,
            alert_threshold: row.get(5)?,
            image_path: row.get(6)?,
            created_at: row.get(7)?
        })
    })?.collect::<Result<Vec<Product>>>()?;
    Ok(products)}

pub fn get_product_by_id(conn: &Connection, id: i64) -> Result<Product> {

    conn.query_row(
        "SELECT id, reference, name, category, unit, alert_threshold, image_path, created_at 
         FROM products 
         WHERE id = ?1",
        params![id],
        |row| Ok(Product {

            id: row.get(0)?,
            reference: row.get(1)?,
            name: row.get(2)?,
            category: row.get(3)?,
            unit: row.get(4)?,
            alert_threshold: row.get(5)?,
            image_path: row.get(6)?,
            created_at: row.get(7)?

        }),
    )
}

pub fn search_products(conn: &Connection, query: &str) -> Result<Vec<Product>> {

    let search = format!("%{}%", query);


    let mut stmt = conn.prepare(
        "SELECT id, reference, name, category, unit, alert_threshold, image_path, created_at
         FROM products
         WHERE name LIKE ?1 OR reference LIKE ?1
         ORDER BY name ASC"
    )?;


    let products = stmt.query_map(params![search], |row| {
        Ok(Product {
            id: row.get(0)?,
            reference: row.get(1)?,
            name: row.get(2)?,
            category: row.get(3)?,
            unit: row.get(4)?,
            alert_threshold: row.get(5)?,
            image_path: row.get(6)?,
            created_at: row.get(7)?,
        })
    })?.collect::<Result<Vec<Product>>>()?;

    Ok(products)
}

pub fn update_product_image(conn: &Connection, id: i64, image_path: &str) -> Result<()> {

    conn.execute(
        "UPDATE products SET image_path = ?1 WHERE id = ?2",
        params![image_path, id],
    )?;
    Ok(())
}

pub fn create_product(
    conn: &Connection,
    reference: &str,
    name: &str,
    category: &str,
    unit: &str,
    alert_threshold: f64

) -> Result<i64> {
    conn.execute(
        "INSERT INTO products (reference, name, category, unit, alert_threshold)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![reference, name, category, unit, alert_threshold],
    )?;
    Ok(conn.last_insert_rowid())}

pub fn update_product(
    conn: &Connection,
    id: i64,
    reference: &str,
    name: &str,
    category: &str,
    unit: &str,
    alert_threshold: f64,
) -> Result<()> {
    conn.execute(
        "UPDATE products 
         SET reference = ?1, name = ?2, category = ?3, unit = ?4, alert_threshold = ?5
         WHERE id = ?6",
        params![reference, name, category, unit, alert_threshold, id],
    )?;

    Ok(())
}

pub fn delete_product(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM products WHERE id = ?1", params![id])?;

    Ok(())
}