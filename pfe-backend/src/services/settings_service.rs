use rusqlite::Connection;
use crate::repositories::settings as settings_repo;
use crate::models::setting::Setting;

pub fn get_all_settings(conn: &Connection) -> Result<Vec<Setting>, String> {
    settings_repo::get_all_settings(conn).map_err(|e| e.to_string())
}

pub fn update_setting(conn: &Connection, key: &str, value: &str) -> Result<(), String> {
    settings_repo::update_setting(conn, key, value).map_err(|e| e.to_string())
}