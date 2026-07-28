use rusqlite::{Connection, Result, params};
use crate::models::alert::{Alert, AlertWithDetails};

pub fn get_all_alerts(conn: &Connection) -> Result<Vec<AlertWithDetails>> {
    let mut stmt = conn.prepare(
        "SELECT a.id, a.product_id, p.name, p.reference, a.order_id,
                a.alert_type, a.message, a.status, a.created_at
         FROM alerts a
         JOIN products p ON a.product_id = p.id
         ORDER BY a.created_at DESC"
    )?;
    let alerts = stmt.query_map([], |row| {
        Ok(AlertWithDetails {
            id: row.get(0)?,
            product_id: row.get(1)?,
            product_name: row.get(2)?,
            product_reference: row.get(3)?,
            order_id: row.get(4)?,
            alert_type: row.get(5)?,
            message: row.get(6)?,
            status: row.get(7)?,
            created_at: row.get(8)?,
        })
    })?.collect::<Result<Vec<AlertWithDetails>>>()?;
    Ok(alerts)
}

pub fn get_alerts_by_status(conn: &Connection, status: &str) -> Result<Vec<AlertWithDetails>> {

    let mut stmt = conn.prepare(
        "SELECT a.id, a.product_id, p.name, p.reference, a.order_id,
                a.alert_type, a.message, a.status, a.created_at
         FROM alerts a
         JOIN products p ON a.product_id = p.id
         WHERE a.status = ?1
         ORDER BY a.created_at DESC"
    )?;

    let alerts = stmt.query_map(params![status], |row| {
        Ok(AlertWithDetails {
            id: row.get(0)?,
            product_id: row.get(1)?,
            product_name: row.get(2)?,
            product_reference: row.get(3)?,
            order_id: row.get(4)?,
            alert_type: row.get(5)?,
            message: row.get(6)?,
            status: row.get(7)?,
            created_at: row.get(8)?,
        })
    })?.collect::<Result<Vec<AlertWithDetails>>>()?;
    Ok(alerts)

}

pub fn get_alerts_by_product(conn: &Connection, product_id: i64) -> Result<Vec<Alert>> {
    let mut stmt = conn.prepare(
        "SELECT id, product_id, order_id, alert_type, message, status, created_at
         FROM alerts
         WHERE product_id = ?1
         ORDER BY created_at DESC"
    )?;
    let alerts = stmt.query_map(params![product_id], |row| {
        Ok(Alert {
            id: row.get(0)?,
            product_id: row.get(1)?,
            order_id: row.get(2)?,
            alert_type: row.get(3)?,
            message: row.get(4)?,
            status: row.get(5)?,
            created_at: row.get(6)?,
        })
    })?.collect::<Result<Vec<Alert>>>()?;

    Ok(alerts)
}

pub fn get_active_forecast_alert_by_product(
    conn: &Connection,
    product_id: i64
    
) -> Result<Option<Alert>> {

    let result = conn.query_row(
        "SELECT id, product_id, order_id, alert_type, message, status, created_at
         FROM alerts
         WHERE product_id = ?1 AND alert_type = 'forecast' AND status = 'active'
         LIMIT 1",
        params![product_id],
        |row| Ok(Alert {
            id: row.get(0)?,
            product_id: row.get(1)?,
            order_id: row.get(2)?,
            alert_type: row.get(3)?,
            message: row.get(4)?,
            status: row.get(5)?,
            created_at: row.get(6)?,
        }),
    );
    match result {
        Ok(alert) => Ok(Some(alert)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e),
    }
}

pub fn create_alert(

    conn: &Connection,
    product_id: i64,
    alert_type: &str,
    message: &str
) -> Result<i64> {
    conn.execute(
        "INSERT INTO alerts (product_id, alert_type, message)
         VALUES (?1, ?2, ?3)",
        params![product_id, alert_type, message],
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn update_alert_status(
    conn: &Connection,
    id: i64,
    status: &str

) -> Result<()> {

    conn.execute(
        "UPDATE alerts SET status = ?1 WHERE id = ?2",
        params![status, id],
    )?;

    Ok(())
}

pub fn link_order_to_alert(
    conn: &Connection,
    alert_id: i64,
    order_id: i64
) -> Result<()> {
    conn.execute(
        "UPDATE alerts SET order_id = ?1 WHERE id = ?2",
        params![order_id, alert_id],
    )?;
    Ok(())
}

pub fn resolve_alerts_by_product(conn: &Connection, product_id: i64, alert_type: &str) -> Result<()> {
    conn.execute(
        "UPDATE alerts SET status = 'resolved'
         WHERE product_id = ?1 AND alert_type = ?2 AND status = 'active'",
        params![product_id, alert_type],
    )?;
    Ok(())
}

pub fn get_alert_by_id(conn: &Connection, id: i64) -> Result<Alert> {
    conn.query_row(
        "SELECT id, product_id, order_id, alert_type, message, status, created_at
         FROM alerts WHERE id = ?1",
        params![id],
        |row| Ok(Alert {
            id: row.get(0)?,
            product_id: row.get(1)?,
            order_id: row.get(2)?,
            alert_type: row.get(3)?,
            message: row.get(4)?,
            status: row.get(5)?,
            created_at: row.get(6)?,
        }),
    )
}