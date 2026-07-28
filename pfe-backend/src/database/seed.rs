use rusqlite::{Connection, Result};

pub fn seed_if_empty(conn: &mut Connection) -> Result<()> {

    let user_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM users",
        [],
        |row| row.get(0),
    )?;

    if user_count == 0 {

        println!("seeding database with demo data...");

        let tx = conn.transaction()?;

    
        tx.execute_batch(include_str!("seed.sql"))?;

        tx.commit()?;

        println!("database seeded .");
    }
    Ok(())
    
}