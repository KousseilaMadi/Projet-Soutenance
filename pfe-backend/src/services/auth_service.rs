use rusqlite::Connection;
use crate::repositories::users as users_repo;
use crate::middleware::auth::{generate_token, Claims};

pub fn login(
    conn: &Connection,
    username: &str,
    password: &str,
    jwt_secret: &str

) -> Result<(String, crate::models::user::User), String> {


    match users_repo::verify_password(conn, username, password) {

        Ok(Some(user)) => {

            let token = generate_token(user.id, &user.username, &user.role, jwt_secret)
                .map_err(|e| e.to_string())?;

            Ok((token, user))
    }
        Ok(None) => Err("Invalid username or password".to_string()),

        Err(e) => Err(e.to_string()),
        
    }
}