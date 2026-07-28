use rusqlite::Connection;
use crate::repositories::{orders as orders_repo, alerts as alerts_repo};
use crate::models::order::{OrderWithDetails, OrderItemWithDetails};

pub fn get_all_orders(conn: &Connection) -> Result<Vec<OrderWithDetails>, String> {
    orders_repo::get_all_orders(conn).map_err(|e| e.to_string())
}


pub fn search_orders(
    conn: &Connection,
    supplier_query: Option<&str>,
    status: Option<&str>
) -> Result<Vec<OrderWithDetails>, String> {
    orders_repo::search_orders(conn, supplier_query, status).map_err(|e| e.to_string())
}


pub fn get_order_by_id(conn: &Connection, id: i64) -> Result<OrderWithDetails, String> {
    orders_repo::get_order_by_id(conn, id).map_err(|e| e.to_string())
}


pub fn get_order_items(conn: &Connection, order_id: i64) -> Result<Vec<OrderItemWithDetails>, String> {
    orders_repo::get_order_items(conn, order_id).map_err(|e| e.to_string())
}

pub fn validate_order(conn: &Connection, order_id: i64) -> Result<(), String> {
    orders_repo::update_order_status(conn, order_id, "validated")
        .map_err(|e| e.to_string())?;

    let alert = alerts_repo::get_all_alerts(conn)
        .map_err(|e| e.to_string())?
        .into_iter()
        .find(|a| a.order_id == Some(order_id));


    if let Some(alert) = alert {

        alerts_repo::update_alert_status(conn, alert.id, "resolved")
            .map_err(|e| e.to_string())?;
    }


    Ok(())
}

pub fn reject_order(conn: &Connection, order_id: i64) -> Result<(), String> {
    
    orders_repo::delete_order(conn, order_id).map_err(|e| e.to_string())
}