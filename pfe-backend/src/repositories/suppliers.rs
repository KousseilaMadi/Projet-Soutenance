use rusqlite::{Connection, Result, params};
use crate::models::supplier::Supplier;

pub fn get_all_suppliers(conn: &Connection) -> Result<Vec<Supplier>> {

    let mut stmt = conn.prepare(
        "SELECT id, name, contact, phone, address, is_active
         FROM suppliers
         ORDER BY name ASC"
    )?;

    let suppliers = stmt.query_map([], |row| {

        Ok(Supplier {
            id: row.get(0)?,
            name: row.get(1)?,
            contact: row.get(2)?,
            phone: row.get(3)?,
            address: row.get(4)?,
            is_active: row.get::<_, i64>(5)? != 0
        })
    })?.collect::<Result<Vec<Supplier>>>()?;


    Ok(suppliers)
}

pub fn get_supplier_by_id(conn: &Connection, id: i64) -> Result<Supplier> {

    conn.query_row(
        "SELECT id, name, contact, phone, address, is_active
         FROM suppliers
         WHERE id = ?1",
        params![id],
        |row| Ok(Supplier {
            id: row.get(0)?,
            name: row.get(1)?,
            contact: row.get(2)?,
            phone: row.get(3)?,
            address: row.get(4)?,
            is_active: row.get::<_, i64>(5)? != 0

        }),
    )
}

pub fn search_suppliers(conn: &Connection, query: &str) -> Result<Vec<Supplier>> {

    let search = format!("%{}%", query);

    let mut stmt = conn.prepare(
        "SELECT id, name, contact, phone, address, is_active
         FROM suppliers
         WHERE name LIKE ?1
         ORDER BY name ASC"

    )?;

    let suppliers = stmt.query_map(params![search], |row| {

        Ok(Supplier {
            id: row.get(0)?,
            name: row.get(1)?,
            contact: row.get(2)?,
            phone: row.get(3)?,
            address: row.get(4)?,
            is_active: row.get::<_, i64>(5)? != 0
        })

    })?.collect::<Result<Vec<Supplier>>>()?;

    Ok(suppliers)
    
}

pub fn create_supplier(
    conn: &Connection,
    name: &str,
    contact: Option<&str>,
    phone: Option<&str>,
    address: Option<&str>
) -> Result<i64> {

    conn.execute(
        "INSERT INTO suppliers (name, contact, phone, address)
         VALUES (?1, ?2, ?3, ?4)",
        params![name, contact, phone, address],
    )?;

    Ok(conn.last_insert_rowid())
}


pub fn update_supplier(
    conn: &Connection,
    id: i64,
    name: &str,
    contact: Option<&str>,
    phone: Option<&str>,
    address: Option<&str>,
    is_active: bool,

) -> Result<()> {

    conn.execute(
        "UPDATE suppliers
         SET name = ?1, contact = ?2, phone = ?3, address = ?4, is_active = ?5
         WHERE id = ?6",
        params![name, contact, phone, address, is_active as i64, id],
    )?;
    Ok(())
}


pub fn delete_supplier(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM suppliers WHERE id = ?1", params![id])?;

    Ok(())

}
