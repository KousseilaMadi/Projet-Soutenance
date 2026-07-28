use rusqlite::Connection;
use crate::repositories::users as users_repo;
use crate::models::user::User;


pub fn get_all_users(conn: &Connection) -> Result<Vec<User>, String> {
    users_repo::get_all_users(conn).map_err(|e| e.to_string())
}

pub fn create_user(
    conn: &Connection,
    username: &str,
    password: &str,
    role: &str,

) -> Result<i64, String> {

    if role == "admin" {

        return Err("Cannot create another admin".to_string());
    }

    let existing = users_repo::get_user_by_username(conn, username)
        .map_err(|e| e.to_string())?;

    if existing.is_some() {

        return Err("Username already taken".to_string());
    }

    users_repo::create_user(conn, username, password, role)
        .map_err(|e| e.to_string())
}

pub fn delete_user(conn: &Connection, id: i64) -> Result<(), String> {
    users_repo::delete_user(conn, id).map_err(|e| e.to_string())
}

pub fn update_role(conn: &Connection, id: i64, role: &str) -> Result<(), String> {

    if role == "admin" {

        return Err("Cannot assign admin role".to_string());
    }

    users_repo::update_role(conn, id, role).map_err(|e| e.to_string())
}



pub fn change_password(
    conn: &Connection,
    id: i64,
    old_password: &str,
    new_password: &str


) -> Result<(), String> {

    let user = users_repo::get_user_by_id(conn, id)
        .map_err(|e| e.to_string())?;


    let valid = users_repo::verify_password(conn, &user.username, old_password)
        .map_err(|e| e.to_string())?;

    if valid.is_none() {

        return Err("Old password is incorrect".to_string());
    }

    users_repo::update_password(conn, id, new_password)
        .map_err(|e| e.to_string())
}


pub fn update_username(
    conn: &Connection,
    id: i64,
    new_username: &str,
) -> Result<(), String> {

    let existing = users_repo::get_user_by_username(conn, new_username)
        .map_err(|e| e.to_string())?;

    if existing.is_some() {

        return Err("Username already taken".to_string());
    }

    users_repo::update_username(conn, id, new_username)
        .map_err(|e| e.to_string())}