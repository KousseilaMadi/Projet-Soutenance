use rusqlite::{Connection, Result, params};
use crate::models::setting::Setting;

pub fn get_all_settings(conn: &Connection) -> Result<Vec<Setting>> {
    
    let mut stmt = conn.prepare(
        "SELECT key, value FROM settings ORDER BY key ASC"
    )?;

    let settings = stmt.query_map([], |row| {

        Ok(Setting {
            key: row.get(0)?,
            value: row.get(1)?
        })
    })?.collect::<Result<Vec<Setting>>>()?;
    Ok(settings)
}

pub fn get_setting(conn: &Connection, key: &str) -> Result<String> {
    conn.query_row(
        "SELECT value FROM settings WHERE key = ?1",
        params![key],
        |row| row.get(0)
    )
}

pub fn update_setting(conn: &Connection, key: &str, value: &str) -> Result<()> {
    conn.execute(
        "UPDATE settings SET value = ?1 WHERE key = ?2",
        params![value, key],
    )?;

    Ok(())
}
