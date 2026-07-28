use rusqlite::Connection;
use crate::repositories::{storage as storage_repo, storage_history as history_repo};
use crate::services::{agent1, agent2};
use crate::middleware::auth::Claims;

pub fn record_movement(
    conn: &Connection,
    claims: &Claims,
    product_id: i64,
    movement_type: &str,
    quantity: f64,
    note: Option<&str>
) -> Result<(), String> {
    let current = storage_repo::get_storage_by_product(conn, product_id)
        .map_err(|e| e.to_string())?;

    let new_quantity = match movement_type {

        "entry" => {
            if let Some(max) = current.max_capacity {

                if current.quantity + quantity > max {

                    agent1::capacity_exceeded(conn, product_id)?;
                    return Err("Exceeds storage capacity".to_string());
                }
            }
            current.quantity + quantity
        }


        "exit" => {
            if quantity > current.quantity {

                return Err("Insufficient stock".to_string());
            }
            quantity
        }
        _ => return Err("Invalid movement type".to_string()),
    };

    if movement_type == "exit" {

        agent1::check_anomaly(conn, product_id, quantity)?;
    }


    history_repo::record_movement(conn, product_id, claims.sub, movement_type, quantity, note)
        .map_err(|e| e.to_string())?;


    let final_quantity = if movement_type == "exit" {

        current.quantity - new_quantity

    } else {

        new_quantity
    };

    storage_repo::update_storage(conn, product_id, final_quantity)
        .map_err(|e| e.to_string())?;

    agent1::check_stock(conn, product_id)?;

    if movement_type == "exit" {

        agent2::forecast_and_notify(conn, product_id)?;
    }
    Ok(())
}