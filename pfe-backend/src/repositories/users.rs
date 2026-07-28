use rusqlite::{Connection, Result, params};
use crate::models::user::User;
use bcrypt::{hash, verify, DEFAULT_COST};


pub fn get_all_users(conn: &Connection) -> Result<Vec<User>> {

    let mut stmt = conn.prepare(
        "SELECT id, username, role, created_at
         FROM users
         ORDER BY username ASC"
    )?;


    let users = stmt.query_map([], |row| {

        Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            role: row.get(2)?,
            created_at: row.get(3)?
        })
    })?.collect::<Result<Vec<User>>>()?;
    Ok(users)
}


pub fn get_user_by_id(conn: &Connection, id: i64) -> Result<User> {

    conn.query_row(
        "SELECT id, username, role, created_at
         FROM users
         WHERE id = ?1",
        params![id],
        |row| Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            role: row.get(2)?,
            created_at: row.get(3)?

        }),

    )
}



pub fn get_user_by_username(conn: &Connection, username: &str) -> Result<Option<User>> {

    let result = conn.query_row(
        "SELECT id, username, role, created_at
         FROM users
         WHERE username = ?1",
        params![username],
        |row| Ok(User {
            id: row.get(0)?,
            username: row.get(1)?,
            role: row.get(2)?,
            created_at: row.get(3)?
        }),
    );


    match result {
        Ok(user) => Ok(Some(user)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e)
    }
}

pub fn verify_password(conn: &Connection, username: &str, password: &str) -> Result<Option<User>> {

    let result = conn.query_row(
        "SELECT id, username, role, created_at, password_hash
         FROM users
         WHERE username = ?1",
        params![username],
        |row| Ok((
            User {
                id: row.get(0)?,
                username: row.get(1)?,
                role: row.get(2)?,
                created_at: row.get(3)?,
            },
            row.get::<_, String>(4)?

        )),
    );


    match result {

        Ok((user, hash)) => {

            if verify(password, &hash).unwrap_or(false) {
                
                Ok(Some(user))

            } else {

                Ok(None)
            }
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),

        Err(e) => Err(e),
    }
}


pub fn update_username(conn: &Connection, id: i64, username: &str) -> Result<()> {
    conn.execute(

        "UPDATE users SET username = ?1 WHERE id = ?2",
        params![username, id],
    )?;

    Ok(())
}

pub fn update_role(conn: &Connection, id: i64, role: &str) -> Result<()> {

    conn.execute(
        "UPDATE users SET role = ?1 WHERE id = ?2",
        params![role, id],
    )?;
    Ok(())
}

pub fn create_user(

    conn: &Connection,
    username: &str,
    password: &str,
    role: &str
) -> Result<i64> {
    let password_hash = hash(password, DEFAULT_COST)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;

    conn.execute(
        "INSERT INTO users (username, password_hash, role)
         VALUES (?1, ?2, ?3)",
        params![username, password_hash, role],

    )?;
    Ok(conn.last_insert_rowid())
}

pub fn update_password(

    conn: &Connection,
    id: i64,
    new_password: &str

) -> Result<()> {
    let password_hash = hash(new_password, DEFAULT_COST)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;


    conn.execute(
        "UPDATE users SET password_hash = ?1 WHERE id = ?2",
        params![password_hash, id],
    )?;

    Ok(())
}

pub fn delete_user(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM users WHERE id = ?1", params![id])?;

    Ok(())
}

