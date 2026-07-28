use rusqlite::{Connection, Result, params};
use crate::models::storage_history::{StorageHistory, StorageHistoryWithDetails};


pub fn get_history_by_product(conn: &Connection, product_id: i64) -> Result<Vec<StorageHistoryWithDetails>> {

    let mut stmt = conn.prepare(
        "SELECT sh.id, sh.product_id, p.name, p.reference, sh.user_id, u.username,
                sh.movement_type, sh.quantity, sh.note, sh.created_at
         FROM storage_history sh
         JOIN products p ON sh.product_id = p.id
         LEFT JOIN users u ON sh.user_id = u.id
         WHERE sh.product_id = ?1
         ORDER BY sh.created_at DESC"

    )?;

    let history = stmt.query_map(params![product_id], |row| {
        Ok(StorageHistoryWithDetails {
            id: row.get(0)?,
            product_id: row.get(1)?,
            product_name: row.get(2)?,
            product_reference: row.get(3)?,
            user_id: row.get(4)?,
            username: row.get(5)?,
            movement_type: row.get(6)?,
            quantity: row.get(7)?,
            note: row.get(8)?,
            created_at: row.get(9)?
        })

    })?.collect::<Result<Vec<StorageHistoryWithDetails>>>()?;


    Ok(history)
}


pub fn get_all_history(conn: &Connection) -> Result<Vec<StorageHistoryWithDetails>> {
    let mut stmt = conn.prepare(
        "SELECT sh.id, sh.product_id, p.name, p.reference, sh.user_id, u.username,
                sh.movement_type, sh.quantity, sh.note, sh.created_at
         FROM storage_history sh
         JOIN products p ON sh.product_id = p.id
         LEFT JOIN users u ON sh.user_id = u.id
         ORDER BY sh.created_at DESC"

    )?;

    let history = stmt.query_map([], |row| {
        Ok(StorageHistoryWithDetails {
            id: row.get(0)?,
            product_id: row.get(1)?,
            product_name: row.get(2)?,
            product_reference: row.get(3)?,
            user_id: row.get(4)?,
            username: row.get(5)?,
            movement_type: row.get(6)?,
            quantity: row.get(7)?,
            note: row.get(8)?,
            created_at: row.get(9)?
        })

    })?.collect::<Result<Vec<StorageHistoryWithDetails>>>()?;

    Ok(history)
}


pub fn get_exits_by_product(conn: &Connection, product_id: i64) -> Result<Vec<StorageHistory>> {
    let mut stmt = conn.prepare(
        "SELECT id, product_id, user_id, movement_type, quantity, note, created_at
         FROM storage_history
         WHERE product_id = ?1 AND movement_type = 'exit'
         ORDER BY created_at ASC"

    )?;

    let history = stmt.query_map(params![product_id], |row| {
        Ok(StorageHistory {
            id: row.get(0)?,
            product_id: row.get(1)?,
            user_id: row.get(2)?,
            movement_type: row.get(3)?,
            quantity: row.get(4)?,
            note: row.get(5)?,
            created_at: row.get(6)?

        })

    })?.collect::<Result<Vec<StorageHistory>>>()?;


    Ok(history)
}

pub fn get_recent_exits_by_product(conn: &Connection, product_id: i64, days: i64) -> Result<Vec<StorageHistory>> {
    
    let mut stmt = conn.prepare(
        "SELECT id, product_id, user_id, movement_type, quantity, note, created_at
         FROM storage_history
         WHERE product_id = ?1 
         AND movement_type = 'exit'
         AND created_at >= datetime('now', ?2)
         ORDER BY created_at ASC"
    )?;


    let days_param = format!("-{} days", days);

    let history = stmt.query_map(params![product_id, days_param], |row| {
        Ok(StorageHistory {
            id: row.get(0)?,
            product_id: row.get(1)?,
            user_id: row.get(2)?,
            movement_type: row.get(3)?,
            quantity: row.get(4)?,
            note: row.get(5)?,
            created_at: row.get(6)?,
        })

    })?.collect::<Result<Vec<StorageHistory>>>()?;
    Ok(history)}

pub fn record_movement(
    conn: &Connection,
    product_id: i64,
    user_id: i64,
    movement_type: &str,
    quantity: f64,
    note: Option<&str>
) -> Result<i64> {

    conn.execute(
        "INSERT INTO storage_history (product_id, user_id, movement_type, quantity, note)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![product_id, user_id, movement_type, quantity, note],
    )?;


    Ok(conn.last_insert_rowid())}



pub fn search_history(
    conn: &Connection,
    product_query: Option<&str>,
    movement_type: Option<&str>,
    start_date: Option<&str>,
    end_date: Option<&str>,
) -> Result<Vec<StorageHistoryWithDetails>> {

    let product_search = product_query.map(|q| format!("%{}%", q));

    let mut query = String::from(
        "SELECT sh.id, sh.product_id, p.name, p.reference, sh.user_id, u.username,
                sh.movement_type, sh.quantity, sh.note, sh.created_at
         FROM storage_history sh
         JOIN products p ON sh.product_id = p.id
         LEFT JOIN users u ON sh.user_id = u.id
         WHERE 1=1"
    );

    let mut param_values: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    let mut param_index = 1;

    if let Some(ref ps) = product_search {
        query.push_str(&format!(" AND (p.name LIKE ?{0} OR p.reference LIKE ?{0})", param_index));
        param_values.push(Box::new(ps.clone()));
        param_index += 1;
    }



    if let Some(mt) = movement_type {
        query.push_str(&format!(" AND sh.movement_type = ?{}", param_index));
        param_values.push(Box::new(mt.to_string()));
        param_index += 1;
    }

    if let Some(sd) = start_date {
        query.push_str(&format!(" AND sh.created_at >= ?{}", param_index));
        param_values.push(Box::new(format!("{} 00:00:00", sd)));
        param_index += 1;
    }


    if let Some(ed) = end_date {
        query.push_str(&format!(" AND sh.created_at <= ?{}", param_index));
        param_values.push(Box::new(format!("{} 23:59:59", ed)));
        param_index += 1;
    }


    let _ = param_index;
    query.push_str(" ORDER BY sh.created_at DESC");

    let mut stmt = conn.prepare(&query)?;
    let params_refs: Vec<&dyn rusqlite::ToSql> = param_values.iter().map(|p| p.as_ref()).collect();

    let history = stmt.query_map(params_refs.as_slice(), |row| {

        Ok(StorageHistoryWithDetails {
            id: row.get(0)?,
            product_id: row.get(1)?,
            product_name: row.get(2)?,
            product_reference: row.get(3)?,
            user_id: row.get(4)?,
            username: row.get(5)?,
            movement_type: row.get(6)?,
            quantity: row.get(7)?,
            note: row.get(8)?,
            created_at: row.get(9)?
        })
    })?.collect::<Result<Vec<StorageHistoryWithDetails>>>()?;
    Ok(history)
}
