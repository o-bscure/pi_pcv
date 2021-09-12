import { query } from '../../../../lib/db'
import formidable from 'formidable'
import { type } from 'os'
const { spawn } =  require('child_process')

import Filter from 'bad-words'
const filter = new Filter()

const path = require('path')
const visionScriptPath = path.join(process.cwd(), '/scripts/middle.py')

const handler = async (req, res) => {
  return new Promise((resolve, reject) => {
    if (req.method != 'POST') {
          res.status(400).json("400: POST requests only")
          return resolve()
        }
    const form = new formidable.IncomingForm({allowEmptyFiles: false});
    form.uploadDir = path.join(process.cwd(), '/public/')
    form.keepExtensions = true
    form.on('error', (data) => {
      res.status(400).json({error: "error"})
      return resolve()
    })
  
    form.parse(req, (err, fields, files) => {
      //console.log(err, fields, files) //file object being uploaded
      try {
        //console.log(JSON.stringify(files))
        const file_path = files.file.path
        const run = req.query.run
        const tank = req.query.tank

        const python = spawn('python', [visionScriptPath, run, tank, file_path]) 
        var pcv_reading;
        python.stdout.on('data', (data) => {
          pcv_reading = Number(data.toString())
          console.log(`pcv read as: ${pcv_reading}`)
        })
        python.stderr.on('data', (data) => {
          console.error(`stderr: ${data}`)
        })
        python.on('close', async (code) => {
          console.log(`closing with status code: ${code}`)
          if (code != 0) {
            res.status(500).json({message: "Internal script error"})
          } else {
            const results = await query(`
              INSERT INTO entries (run, tank, pcv_value, path)
              VALUES (?, ?, ?, ?)
            `,
            [filter.clean(run), tank, pcv_reading, file_path]
            ) 
            .then((response) => {
              res.status(200).json({message: "The file has been uploaded, analyzed, and saved"})
            })
            .catch((e) => {
              console.error(e.message)
              res.status(500).json({message: "Database upload error"})
            })
          }
            return resolve()
        })

      } catch (e) {
        res.status(500).json("500: a file was not provided")
        return resolve()
      }
    })
  })
}

export const config = {
  api: {
    bodyParser: false,
    /*
    bodyParser: {
      sizeLimit: '6mb'
    }
    */
  }
}

export default handler