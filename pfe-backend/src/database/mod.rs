use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;

use rusqlite::Connection;

use std::path::Path;

pub type DbPool = Pool<SqliteConnectionManager>;
pub type DbConn = r2d2::PooledConnection<SqliteConnectionManager>;

pub mod seed;
pub fn init_pool(db_path: &Path) -> DbPool {

    let manager = SqliteConnectionManager::file(db_path)
        .with_init(|conn| {
            conn.execute_batch("
                PRAGMA foreign_keys = ON;
                PRAGMA journal_mode = WAL;
            ")
        });
    Pool::builder()
        .max_size(10)
        .build(manager)
        .expect("failed to create connection pool")
}

pub fn init_db(pool: &DbPool) -> rusqlite::Result<()> {
    let conn = pool.get().expect("failed to get connection from pool.");

    conn.execute_batch(include_str!("db.sql"))?;
    let table_count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM sqlite_master WHERE type='table'",
        [],
        |row| row.get(0),
    )?;
    println!("DB initialized | {} tables found", table_count);

    drop(conn);

    let mut conn = pool.get().expect("failed to get connection");
    seed::seed_if_empty(&mut conn)?;

    Ok(())
}