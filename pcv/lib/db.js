const path = require('path')
const envPath = path.resolve(process.cwd(), '.env.local')

//console.log({ envPath })

require('dotenv').config({ path: envPath })

const mysql = require('mysql2/promise')

export async function query(q, values) {
  try {
    const db = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      port: process.env.MYSQL_PORT,
    })
    const [rows, fields]= await db.execute(q, values);
    db.end();
    return [rows, fields]
  } catch (e) {
    throw Error(e.message)
  }
}
