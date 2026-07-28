use rusqlite::Connection;
use crate::repositories::{
    product_suppliers as ps_repo,
    orders as orders_repo,
    alerts as alerts_repo,
    storage as storage_repo,
    settings as settings_repo,
    products as products_repo,
};


pub fn create_order_for_product(conn: &Connection, product_id: i64) -> Result<(), String> {

    let suppliers = ps_repo::get_suppliers_for_product(conn, product_id)
        .map_err(|e: rusqlite::Error| e.to_string())?;


    if suppliers.is_empty() {
        return Err(format!("No suppliers found for product {}", product_id));}

    let storage = storage_repo::get_storage_by_product(conn, product_id)
        .map_err(|e: rusqlite::Error| e.to_string())?;

    let product = products_repo::get_product_by_id(conn, product_id)
        .map_err(|e: rusqlite::Error| e.to_string())?;


    let horizon_days = settings_repo::get_setting(conn, "forecast_horizon_days")
        .map_err(|e: rusqlite::Error| e.to_string())?
        .parse::<f64>()
        .map_err(|e: std::num::ParseFloatError| e.to_string())?;


    let weight_price = settings_repo::get_setting(conn, "weight_price")
        .map_err(|e: rusqlite::Error| e.to_string())?
        .parse::<f64>()
        .map_err(|e: std::num::ParseFloatError| e.to_string())?;


    let weight_delivery = settings_repo::get_setting(conn, "weight_delivery")
        .map_err(|e: rusqlite::Error| e.to_string())?
        .parse::<f64>()
        .map_err(|e: std::num::ParseFloatError| e.to_string())?;


    let weight_reliability = settings_repo::get_setting(conn, "weight_reliability")
        .map_err(|e: rusqlite::Error| e.to_string())?
        .parse::<f64>()
        .map_err(|e: std::num::ParseFloatError| e.to_string())?;


    let best_supplier = score_suppliers(
        &suppliers,
        horizon_days,
        weight_price,
        weight_delivery,
        weight_reliability
    );

    let quantity_to_order = compute_order_quantity(
        storage.quantity,
        product.alert_threshold,
        storage.max_capacity,

    );

    let order_id = orders_repo::create_order(conn, best_supplier.supplier_id)
        .map_err(|e: rusqlite::Error| e.to_string())?;

    orders_repo::add_order_item(conn, order_id, product_id, quantity_to_order)
        .map_err(|e: rusqlite::Error| e.to_string())?;


    orders_repo::update_order_status(conn, order_id, "pending")
        .map_err(|e: rusqlite::Error| e.to_string())?;


    let alert = alerts_repo::get_active_forecast_alert_by_product(conn, product_id)
        .map_err(|e: rusqlite::Error| e.to_string())?;

    if let Some(alert) = alert {
        alerts_repo::link_order_to_alert(conn, alert.id, order_id)
            .map_err(|e: rusqlite::Error| e.to_string())?;
    }
    Ok(())}


fn score_suppliers(
    suppliers: &[crate::models::product_supplier::ProductSupplier],
    horizon_days: f64,
    weight_price: f64,
    weight_delivery: f64,
    weight_reliability: f64
) -> &crate::models::product_supplier::ProductSupplier {

    let max_price = suppliers.iter().map(|s| s.unit_price).fold(f64::NEG_INFINITY, f64::max);


    let max_delivery = suppliers.iter().map(|s| s.delivery_days as f64).fold(f64::NEG_INFINITY, f64::max);


    let scored: Vec<(&crate::models::product_supplier::ProductSupplier, f64)> = suppliers
        .iter()
        .map(|s| {
            let price_score = if max_price > 0.0 { 1.0 - (s.unit_price / max_price) } else { 1.0 };

            let delivery_score = if max_delivery > 0.0 { 1.0 - (s.delivery_days as f64 / max_delivery) } else { 1.0 };


            let reliability_score = s.reliability_score;

            let delivery_penalty = if s.delivery_days as f64 > horizon_days { 0.5 } else { 1.0 };


            let total_score = (
                price_score * weight_price +
                delivery_score * weight_delivery +
                reliability_score * weight_reliability
            ) * delivery_penalty;

            (s, total_score)
        })
        .collect();
    scored
        .into_iter()
        .max_by(|a, b| a.1.partial_cmp(&b.1).unwrap())
        .map(|(s, _)| s)
        .unwrap()

}

fn compute_order_quantity(
    current_quantity: f64,
    alert_threshold: f64,
    max_capacity: Option<f64>
) -> f64 {

    let target = match max_capacity {

        Some(max) => max,
        None => alert_threshold * 3.0,
    };
    
    (target - current_quantity).max(0.0)
}