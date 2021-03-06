import { query } from '../../lib/db'
const { spawn } =  require('child_process')

import Filter from 'bad-words'
const filter = new Filter()

const path = require('path')
const visionScriptPath = path.join(process.cwd(), '/scripts/pcv_script.py')


const handler = async (req, res) => {
  return new Promise((resolve, reject) => {
    if (req.method != 'POST') {
          res.status(400).json("400: POST requests only")
          return resolve()
        }
  
    const body = req.body

    const file_path = body.path
    const run = body.run
    const tank = body.tank
    const volume = body.volume

    const python = spawn('python3', [visionScriptPath, file_path]) 
    var pcv_reading;
    python.stdout.on('data', (data) => {
      pcv_reading = Number(data.toString())
      console.log(`pcv read as: ${pcv_reading}`)
    })
    python.stderr.on('data', (data) => {
      pcv_reading = Number(9.999)
      console.log(`script error: ${data}`)
      //console.error(`stderr: ${data}`)
    })
    python.on('close', async (code) => {
      console.log(`python visualization script closing with status code: ${code}`)
      if ((code != 0) || pcv_reading > 5 || pcv_reading < 0.3 || pcv_reading == 9.999) {
        console.error("Internal python visualization script script error")
        res.status(500).json({message: "Internal python visualization script error"})
      } else {
        const results = await query(`
          INSERT INTO entries (run, tank, volume, pcv_value, path)
          VALUES (?, ?, ?, ?, ?)
        `,
        [filter.clean(run), tank, volume, pcv_reading, file_path]
        ) 
        .then((response) => {
          console.log("Database upload successful")
          res.status(200).json({message: "The file has been uploaded, analyzed, and saved"})
        })
        .catch((e) => {
          console.error(`Database response: ${e.message}`)
          res.status(500).json({message: "Database upload error"})
        })
      }
        return resolve()
    })
  })
}

export default handler
