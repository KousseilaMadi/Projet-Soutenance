use rusqlite::{Connection, Result, params};
use crate::models::exceptional_period::ExceptionalPeriod;


pub fn get_all_exceptional_periods(conn: &Connection) -> Result<Vec<ExceptionalPeriod>> {

    let mut stmt = conn.prepare(
        "SELECT id, name, start_date, end_date, factor
         FROM exceptional_periods
         ORDER BY start_date ASC"
    )?;

    let periods = stmt.query_map([], |row| {
        Ok(ExceptionalPeriod {
            id: row.get(0)?,
            name: row.get(1)?,
            start_date: row.get(2)?,
            end_date: row.get(3)?,
            factor: row.get(4)?,
        })
    })?.collect::<Result<Vec<ExceptionalPeriod>>>()?;

    Ok(periods)
}

pub fn get_active_periods(conn: &Connection, date: &str,) -> Result<Vec<ExceptionalPeriod>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, start_date, end_date, factor
         FROM exceptional_periods
         WHERE start_date <= ?1 AND end_date >= ?1"
    )?;

    
    let periods = stmt.query_map(params![date], |row| {
        Ok(ExceptionalPeriod {
            id: row.get(0)?,
            name: row.get(1)?,
            start_date: row.get(2)?,
            end_date: row.get(3)?,
            factor: row.get(4)?,
        })
    })?.collect::<Result<Vec<ExceptionalPeriod>>>()?;

    Ok(periods)
}

pub fn get_periods_in_range(conn: &Connection, start: &str,
    end: &str) -> Result<Vec<ExceptionalPeriod>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, start_date, end_date, factor
         FROM exceptional_periods
         WHERE start_date <= ?2 AND end_date >= ?1"
    )?;


    let periods = stmt.query_map(params![start, end], |row| {
        Ok(ExceptionalPeriod {
            id: row.get(0)?,
            name: row.get(1)?,
            start_date: row.get(2)?,
            end_date: row.get(3)?,
            factor: row.get(4)?,
        })
    })?.collect::<Result<Vec<ExceptionalPeriod>>>()?;
    Ok(periods)
}

pub fn create_exceptional_period(
    conn: &Connection,
    name: &str,
    start_date: &str,
    end_date: &str,
    factor: f64
) -> Result<i64> {

    conn.execute(
        "INSERT INTO exceptional_periods (name, start_date, end_date, factor)
         VALUES (?1, ?2, ?3, ?4)",
        params![name, start_date, end_date, factor],
    )?;
    Ok(conn.last_insert_rowid())}

pub fn update_exceptional_period(
    conn: &Connection,
    id: i64,
    name: &str,
    start_date: &str,
    end_date: &str,
    factor: f64,

) -> Result<()> {
    conn.execute(
        "UPDATE exceptional_periods
         SET name = ?1, start_date = ?2, end_date = ?3, factor = ?4
         WHERE id = ?5",
        params![name, start_date, end_date, factor, id],
    )?;
    Ok(())
}

pub fn delete_exceptional_period(conn: &Connection, id: i64) -> Result<()> {
    conn.execute(
        "DELETE FROM exceptional_periods WHERE id = ?1",
        params![id],
    )?;

    Ok(())
}

