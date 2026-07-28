use rusqlite::{Connection, Result, params};
use crate::models::storage::{Storage, StorageWithProduct};

pub fn get_all_storage(conn: &Connection) -> Result<Vec<StorageWithProduct>> {
    
    let mut stmt = conn.prepare(
        "SELECT s.id, s.product_id, p.name, p.reference, p.category, p.unit,
                s.quantity, s.max_capacity, p.alert_threshold, s.updated_at
        FROM storage s
        JOIN products p ON s.product_id = p.id
        ORDER BY p.name ASC"
    )?;


    let storage = stmt.query_map([], |row| {

        Ok(StorageWithProduct {
            id: row.get(0)?,
            product_id: row.get(1)?,
            product_name: row.get(2)?,
            product_reference: row.get(3)?,
            category: row.get(4)?,
            unit: row.get(5)?,
            quantity: row.get(6)?,
            max_capacity: row.get(7)?,
            alert_threshold: row.get(8)?,
            updated_at: row.get(9)?
})
    })?.collect::<Result<Vec<StorageWithProduct>>>()?;


    Ok(storage)
}

pub fn get_storage_by_product(conn: &Connection, product_id: i64) -> Result<Storage> {

    conn.query_row(
        "SELECT id, product_id, quantity, max_capacity, updated_at
         FROM storage
         WHERE product_id = ?1",
        params![product_id],

        |row| Ok(Storage {
                id: row.get(0)?,
                product_id: row.get(1)?,
                quantity: row.get(2)?,
                max_capacity: row.get(3)?,
                updated_at: row.get(4)?,
            }),

    )
}

pub fn search_storage(conn: &Connection, query: &str) -> Result<Vec<StorageWithProduct>> {
    let search = format!("%{}%", query);

    let mut stmt = conn.prepare(
        "SELECT s.id, s.product_id, p.name, p.reference, p.category, p.unit,
                s.quantity, s.max_capacity, p.alert_threshold, s.updated_at
         FROM storage s
         JOIN products p ON s.product_id = p.id
         WHERE p.name LIKE ?1 OR p.reference LIKE ?1
         ORDER BY p.name ASC"
    )?;
    let storage = stmt.query_map(params![search], |row| {
        Ok(StorageWithProduct {
            id: row.get(0)?,
            product_id: row.get(1)?,
            product_name: row.get(2)?,
            product_reference: row.get(3)?,
            category: row.get(4)?,
            unit: row.get(5)?,
            quantity: row.get(6)?,
            max_capacity: row.get(7)?,
            alert_threshold: row.get(8)?,
            updated_at: row.get(9)?,
        })
    })?.collect::<Result<Vec<StorageWithProduct>>>()?;
    Ok(storage)
}

pub fn update_storage(
    conn: &Connection,
    product_id: i64,
    quantity: f64
) -> Result<()> {
    conn.execute(
        "UPDATE storage
         SET quantity = ?1, updated_at = datetime('now')
         WHERE product_id = ?2",
        params![quantity, product_id],
    )?;
    Ok(())
}

pub fn init_storage(conn: &Connection, product_id: i64, max_capacity: Option<f64>) -> Result<()> {

    conn.execute(
        "INSERT OR IGNORE INTO storage (product_id, quantity, max_capacity)
         VALUES (?1, 0, ?2)",
        params![product_id, max_capacity],
    )?;

    Ok(())
}
