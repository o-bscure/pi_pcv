const path = require('path')
const envPath = path.resolve(process.cwd(), '.env.local')

console.log({ envPath })

require('dotenv').config({ path: envPath })

const mysql = require('mysql2/promise')

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USERNAME,
  password: process.env.MYSQL_PASSWORD,
  port: process.env.MYSQL_PORT,
})

async function query(q) {
  try {
    const results = await (await db).execute(q)
    await (await db).end()
    return results
  } catch (e) {
    throw Error(e.message)
  }
}

// Create fake table for testing
async function migrate() {
  try {
    await query(`
    CREATE TABLE IF NOT EXISTS entries (
      id INT unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
      run VARCHAR(15) NOT NULL,
      tank INT unsigned NOT NULL,
      pcv_value DECIMAL(4,3),
      path VARCHAR(255),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at 
        TIMESTAMP 
        NOT NULL 
        DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP
    );
    `).then((response) => {
      console.log(response)
    })
      
  } catch (e) {
    console.log({message: e})
    console.error('could not run migration, double check your credentials.')
    process.exit(1)
  }
}

migrate().then(() => process.exit())
