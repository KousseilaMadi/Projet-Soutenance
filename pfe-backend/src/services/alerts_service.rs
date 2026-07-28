use rusqlite::Connection;
use crate::models::alert::AlertWithDetails;
use crate::repositories::{
    alerts as alerts_repo,
    storage as storage_repo,
    products as products_repo,
    orders as orders_repo,
};

pub fn get_all_alerts(conn: &Connection) -> Result<Vec<AlertWithDetails>, String> {
    alerts_repo::get_all_alerts(conn).map_err(|e| e.to_string())
}

pub fn get_active_alerts(conn: &Connection) -> Result<Vec<AlertWithDetails>, String> {
    alerts_repo::get_alerts_by_status(conn, "active").map_err(|e| e.to_string())
}

pub fn acknowledge_alert(conn: &Connection, alert_id: i64) -> Result<(), String> {
    alerts_repo::update_alert_status(conn, alert_id, "acknowledged")
        .map_err(|e| e.to_string())
}

// pub fn resolve_alert(conn: &Connection, alert_id: i64) -> Result<(), String> {
//     alerts_repo::update_alert_status(conn, alert_id, "resolved")
//         .map_err(|e| e.to_string())
// }

pub fn resolve_alert(conn: &Connection, alert_id: i64) -> Result<(), String> {
    let alert = alerts_repo::get_alert_by_id(conn, alert_id)
        .map_err(|e| e.to_string())?;

    match alert.alert_type.as_str() {
        "low_stock" => {
            let storage = storage_repo::get_storage_by_product(conn, alert.product_id)
                .map_err(|e| e.to_string())?;
            let product = products_repo::get_product_by_id(conn, alert.product_id)
                .map_err(|e| e.to_string())?;

            if storage.quantity <= product.alert_threshold {
                return Err(format!(
                    "Impossible de résoudre : le stock est toujours sous le seuil ({:.0} unités restantes, seuil {:.0})",
                    storage.quantity, product.alert_threshold
                ));
            }
        }
        "forecast" => {
            if let Some(order_id) = alert.order_id {
                let order = orders_repo::get_order_by_id(conn, order_id)
                    .map_err(|e| e.to_string())?;

                if order.status != "validated" {
                    return Err(
                        "Impossible de résoudre : la commande liée n'a pas encore été validée".to_string()
                    );
                }
            } else {
                return Err(
                    "Impossible de résoudre : aucune commande n'a été générée pour cette alerte".to_string()
                );
            }
        }
        "capacity" => {
            let storage = storage_repo::get_storage_by_product(conn, alert.product_id)
                .map_err(|e| e.to_string())?;

            if let Some(max) = storage.max_capacity {
                if storage.quantity >= max {
                    return Err(format!(
                        "Impossible de résoudre : le stock est toujours à capacité maximale ({:.0}/{:.0} unités)",
                        storage.quantity, max
                    ));
                }
            }
        }
        "anomaly" => {
        }
        _ => {}
    }

    alerts_repo::update_alert_status(conn, alert_id, "resolved")
        .map_err(|e| e.to_string())
}