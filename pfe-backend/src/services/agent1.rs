use rusqlite::Connection;

use crate::repositories::{
    storage as storage_repo,
    storage_history as history_repo,
    alerts as alerts_repo,
    settings as settings_repo,
    products as products_repo,
};


pub fn check_stock(conn: &Connection, product_id: i64) -> Result<(), String> {

    let storage = storage_repo::get_storage_by_product(conn, product_id)
        .map_err(|e| e.to_string())?;

    let product = products_repo::get_product_by_id(conn, product_id)
        .map_err(|e| e.to_string())?;

    let active_alerts = alerts_repo::get_alerts_by_product(conn, product_id)
        .map_err(|e| e.to_string())?;

    if storage.quantity <= product.alert_threshold {
        let already_active = active_alerts.iter().any(|a| {

            a.alert_type == "low_stock" && a.status == "active"
        
        });

        if !already_active {

            alerts_repo::create_alert(
                conn,
                product_id,
                "low_stock",

                &format!(

                    "Stock level critical: {:.2} units remaining, threshold is {:.2}",
                    storage.quantity, product.alert_threshold
                ),

            ).map_err(|e| e.to_string())?;
        }

    } else {


        alerts_repo::resolve_alerts_by_product(conn, product_id, "low_stock")
            .map_err(|e| e.to_string())?;
    }
    Ok(())}


pub fn check_anomaly(conn: &Connection, product_id: i64, current_exit: f64) -> Result<(), String> {

    let window_days = settings_repo::get_setting(conn, "anomaly_window_days")
        .map_err(|e| e.to_string())?
        .parse::<i64>()
        .map_err(|e: std::num::ParseIntError| e.to_string())?;

    let z_threshold = settings_repo::get_setting(conn, "anomaly_z_score_threshold")
        .map_err(|e| e.to_string())?
        .parse::<f64>()
        .map_err(|e: std::num::ParseFloatError| e.to_string())?;

    let min_data_points = settings_repo::get_setting(conn, "forecast_min_data_points")
        .map_err(|e| e.to_string())?
        .parse::<usize>()
        .map_err(|e: std::num::ParseIntError| e.to_string())?;

    let recent_exits = history_repo::get_recent_exits_by_product(conn, product_id, window_days)
        .map_err(|e| e.to_string())?;


    if recent_exits.len() < min_data_points {
        return Ok(());

    }

    let quantities: Vec<f64> = recent_exits.iter().map(|e| e.quantity).collect();

    let mean = quantities.iter().sum::<f64>() / quantities.len() as f64;

    let variance = quantities.iter()
        .map(|q| (q - mean).powi(2))
        .sum::<f64>() / quantities.len() as f64;


    let std_dev = variance.sqrt();


    if std_dev == 0.0 {
        return Ok(());

    }

    let z_score = (current_exit - mean) / std_dev;

    if z_score > z_threshold {

        let active_alerts = alerts_repo::get_alerts_by_product(conn, product_id)
            .map_err(|e| e.to_string())?;


        let already_active = active_alerts.iter().any(|a| {
            a.alert_type == "anomaly" && a.status == "active"

        });

        if !already_active {

            alerts_repo::create_alert(
                conn,
                product_id,
                "anomaly",
                &format!(
                    "Unusual exit detected: {:.2} units (mean: {:.2}, std dev: {:.2}, z-score: {:.2})",
                    current_exit, mean, std_dev, z_score
                ),

            ).map_err(|e| e.to_string())?;
        }

    }
    Ok(())
}

pub fn capacity_exceeded(conn: &Connection, product_id: i64) -> Result<(), String> {
    let active_alerts = alerts_repo::get_alerts_by_product(conn, product_id)
        .map_err(|e| e.to_string())?;

    let already_active = active_alerts.iter().any(|a| {
        
        a.alert_type == "capacity" && a.status == "active"
    });

    if !already_active {

        let storage = storage_repo::get_storage_by_product(conn, product_id)
            .map_err(|e| e.to_string())?;

        alerts_repo::create_alert(
            conn,
            product_id,
            "capacity",
            &format!(
                "Entry blocked: would exceed max capacity of {:.2} units",
                storage.max_capacity.unwrap_or(0.0)
            ),

        ).map_err(|e| e.to_string())?;

    }
    Ok(())
}