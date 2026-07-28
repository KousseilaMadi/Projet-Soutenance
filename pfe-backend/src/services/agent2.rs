use rusqlite::Connection;

use crate::repositories::{
    storage as storage_repo,
    storage_history as history_repo,
    alerts as alerts_repo,
    exceptional_periods as periods_repo,
    settings as settings_repo

};


pub struct ForecastResult {
    pub product_id: i64,
    pub days_until_stockout: f64,
    pub predicted_daily_consumption: f64,
    pub adjusted_daily_consumption: f64
}

pub fn forecast_and_notify(conn: &Connection, product_id: i64) -> Result<Option<ForecastResult>, String> {


    let min_data_points = settings_repo::get_setting(conn, "agent2_min_data_points")
        .map_err(|e| e.to_string())?
        .parse::<usize>()
        .map_err(|e: std::num::ParseIntError| e.to_string())?;

    let horizon_days = settings_repo::get_setting(conn, "forecast_horizon_days")
        .map_err(|e| e.to_string())?
        .parse::<f64>()
        .map_err(|e: std::num::ParseFloatError| e.to_string())?;

    let window_days = settings_repo::get_setting(conn, "anomaly_window_days")
        .map_err(|e| e.to_string())?
        .parse::<i64>()
        .map_err(|e: std::num::ParseIntError| e.to_string())?;

    let exits = history_repo::get_recent_exits_by_product(conn, product_id, window_days)
        .map_err(|e| e.to_string())?;

    if exits.len() < min_data_points {

        return Ok(None);
    }

    let storage = storage_repo::get_storage_by_product(conn, product_id)
        .map_err(|e| e.to_string())?;


    let daily_consumption = compute_daily_consumption(&exits)?;

    if daily_consumption == 0.0 {
        return Ok(None);}

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();

    let future_date = chrono::Local::now()
        .checked_add_signed(chrono::Duration::days(horizon_days as i64))
        .ok_or("Date calculation failed")?
        .format("%Y-%m-%d")
        .to_string();


    let periods = periods_repo::get_periods_in_range(conn, &today, &future_date)
        .map_err(|e| e.to_string())?;

    let adjustment_factor = compute_adjustment_factor(&periods, horizon_days);

    let adjusted_consumption = daily_consumption * adjustment_factor;

    let days_until_stockout = if adjusted_consumption > 0.0 {
        storage.quantity / adjusted_consumption

    } else {

        f64::MAX
    };

    let result = ForecastResult {
        product_id,
        days_until_stockout,
        predicted_daily_consumption: daily_consumption,
        adjusted_daily_consumption: adjusted_consumption
    };

    if days_until_stockout <= horizon_days {

        let existing = alerts_repo::get_active_forecast_alert_by_product(conn, product_id)
            .map_err(|e| e.to_string())?;

        if existing.is_none() {

            alerts_repo::create_alert(
                conn,
                product_id,
                "forecast",
                &format!(
                    "Stock predicted to run out in {:.1} days (daily consumption: {:.2} units, adjusted: {:.2} units)",
                    days_until_stockout, daily_consumption, adjusted_consumption
                ),

            ).map_err(|e| e.to_string())?;
            crate::services::agent3::create_order_for_product(conn, product_id)?;
        }}
    Ok(Some(result))

}

fn compute_daily_consumption(exits: &[crate::models::storage_history::StorageHistory]) -> Result<f64, String> {
    if exits.is_empty() {
        return Ok(0.0);
    }

    let n = exits.len() as f64;

    let x_values: Vec<f64> = (0..exits.len()).map(|i| i as f64).collect();

    let y_values: Vec<f64> = exits.iter().map(|e| e.quantity).collect();


    let x_mean = x_values.iter().sum::<f64>() / n;

    let y_mean = y_values.iter().sum::<f64>() / n;


    let numerator = x_values.iter().zip(y_values.iter())
        .map(|(x, y)| (x - x_mean) * (y - y_mean))
        .sum::<f64>();

    let denominator = x_values.iter()
        .map(|x| (x - x_mean).powi(2))
        .sum::<f64>();

    if denominator == 0.0 {

        return Ok(y_mean);
    }

    let slope = numerator / denominator;

    let intercept = y_mean - slope * x_mean;

    let predicted_next = slope * n + intercept;

    Ok(predicted_next.max(0.0))}


    
fn compute_adjustment_factor(
    periods: &[crate::models::exceptional_period::ExceptionalPeriod],
    horizon_days: f64
) -> f64 {

    if periods.is_empty() {return 1.0;}

    let total_factor: f64 = periods.iter().map(|p| p.factor).sum();


    let average_factor = total_factor / periods.len() as f64;

    1.0 + (average_factor - 1.0) * (periods.len() as f64 / horizon_days)


}