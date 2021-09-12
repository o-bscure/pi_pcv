//THIS WILL WIPE AND RESET THE ENTIRE PCV DATABASE
//THIS WILL WIPE AND RESET THE ENTIRE PCV DATABASE
//THIS WILL WIPE AND RESET THE ENTIRE PCV DATABASE
//THIS WILL WIPE AND RESET THE ENTIRE PCV DATABASE

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
    return results
  } catch (e) {
    throw Error(e.message)
  }
}

async function reset() {
  try {
    await query(`
        DROP TABLE IF EXISTS entries;
    `)
    .then(async (response) => {
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
        `)
        .then((r) => {
            console.log(`migration successfull\t>>>\t${JSON.stringify(r)}`)
        })
    })
    await (await db).end()
  } catch (e) {
    console.log({message: e})
    console.error('could not run migration, double check your credentials.')
    process.exit(1)
  }
}

reset().then(() => process.exit())
