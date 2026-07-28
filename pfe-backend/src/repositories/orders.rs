use rusqlite::{Connection, Result, params};
use crate::models::order::{Order, OrderWithDetails, OrderItem, OrderItemWithDetails};

pub fn get_all_orders(conn: &Connection) -> Result<Vec<OrderWithDetails>> {

    let mut stmt = conn.prepare(
        "SELECT o.id, o.supplier_id, s.name, s.contact, s.phone, s.address, o.status, o.created_at, o.validated_at
         FROM orders o
         JOIN suppliers s ON o.supplier_id = s.id
         ORDER BY o.created_at DESC"
    )?;

    let orders = stmt.query_map([], |row| {
        Ok(OrderWithDetails {
            id: row.get(0)?,
            supplier_id: row.get(1)?,
            supplier_name: row.get(2)?,
            supplier_contact: row.get(3)?,
            supplier_phone: row.get(4)?,
            supplier_address: row.get(5)?,
            status: row.get(6)?,
            created_at: row.get(7)?,
            validated_at: row.get(8)?,
            items: vec![],

        })
    })?.collect::<Result<Vec<OrderWithDetails>>>()?;

    Ok(orders)}

pub fn get_order_by_id(conn: &Connection, id: i64) -> Result<OrderWithDetails> {
    let mut order = conn.query_row(
        "SELECT o.id, o.supplier_id, s.name, s.contact, s.phone, s.address, o.status, o.created_at, o.validated_at
         FROM orders o
         JOIN suppliers s ON o.supplier_id = s.id
         WHERE o.id = ?1",
        params![id],

        |row| Ok(OrderWithDetails {
            id: row.get(0)?,
            supplier_id: row.get(1)?,
            supplier_name: row.get(2)?,
            supplier_contact: row.get(3)?,
            supplier_phone: row.get(4)?,
            supplier_address: row.get(5)?,
            status: row.get(6)?,
            created_at: row.get(7)?,
            validated_at: row.get(8)?,
            items: vec![]

        }),
    )?;

    order.items = get_order_items(conn, order.id)?;
    Ok(order)
}

pub fn search_orders(
    conn: &Connection,
    supplier_query: Option<&str>,
    status: Option<&str>
) -> Result<Vec<OrderWithDetails>> {

    let supplier_search = supplier_query.map(|q| format!("%{}%", q));
    let mut query = String::from(
        "SELECT o.id, o.supplier_id, s.name, s.contact, s.phone, s.address, o.status, o.created_at, o.validated_at
         FROM orders o
         JOIN suppliers s ON o.supplier_id = s.id
         WHERE 1=1"
    );


    let mut param_values: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    let mut param_index = 1;

    if let Some(ref ss) = supplier_search {
        query.push_str(&format!(" AND s.name LIKE ?{}", param_index));
        param_values.push(Box::new(ss.clone()));
        param_index += 1;
    }


    if let Some(st) = status {
        query.push_str(&format!(" AND o.status = ?{}", param_index));
        param_values.push(Box::new(st.to_string()));
        param_index += 1;
    }


    let _ = param_index;
    query.push_str(" ORDER BY o.created_at DESC");
    let mut stmt = conn.prepare(&query)?;

    let params_refs: Vec<&dyn rusqlite::ToSql> = param_values.iter().map(|p| p.as_ref()).collect();
    let orders = stmt.query_map(params_refs.as_slice(), |row| {
        Ok(OrderWithDetails {
            id: row.get(0)?,
            supplier_id: row.get(1)?,
            supplier_name: row.get(2)?,
            supplier_contact: row.get(3)?,
            supplier_phone: row.get(4)?,
            supplier_address: row.get(5)?,
            status: row.get(6)?,
            created_at: row.get(7)?,
            validated_at: row.get(8)?,
            items: vec![],
        })
    })?.collect::<Result<Vec<OrderWithDetails>>>()?;
    Ok(orders)
}

pub fn create_order(
    conn: &Connection,
    supplier_id: i64,
) -> Result<i64> {


    conn.execute(
        "INSERT INTO orders (supplier_id, status)
         VALUES (?1, 'draft')",
        params![supplier_id],
    )?;

    Ok(conn.last_insert_rowid())
}

pub fn update_order_status(
    conn: &Connection,
    id: i64,
    status: &str,

) -> Result<()> {

    if status == "validated" {
        conn.execute(
            "UPDATE orders
             SET status = ?1, validated_at = datetime('now')
             WHERE id = ?2",
            params![status, id],
        )?;
    } else {
        conn.execute(
            "UPDATE orders
             SET status = ?1
             WHERE id = ?2",
            params![status, id],
        )?;
    }

    Ok(())
}

pub fn delete_order(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM orders WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn get_order_items(conn: &Connection, order_id: i64) -> Result<Vec<OrderItemWithDetails>> {
    let mut stmt = conn.prepare(
        "SELECT oi.id, oi.order_id, oi.product_id, p.name, p.reference, p.unit, oi.quantity
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?1"

    )?;

    let items = stmt.query_map(params![order_id], |row| {
        Ok(OrderItemWithDetails {
            id: row.get(0)?,
            order_id: row.get(1)?,
            product_id: row.get(2)?,
            product_name: row.get(3)?,
            product_reference: row.get(4)?,
            unit: row.get(5)?,
            quantity: row.get(6)?
        })

    })?.collect::<Result<Vec<OrderItemWithDetails>>>()?;

    Ok(items)
}

pub fn add_order_item(
    conn: &Connection,
    order_id: i64,
    product_id: i64,
    quantity: f64

) -> Result<i64> {
    conn.execute(
        "INSERT INTO order_items (order_id, product_id, quantity)
         VALUES (?1, ?2, ?3)",
        params![order_id, product_id, quantity],
    )?;
    Ok(conn.last_insert_rowid())
}
