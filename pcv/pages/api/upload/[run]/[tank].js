import { query } from '../../../../lib/db'
import formidable from 'formidable'
import { type } from 'os'
const { spawn } =  require('child_process')

import Filter from 'bad-words'
import axios from 'axios'
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
      res.status(400).json({error: "error parsing uploaded file"})
      return resolve()
    })
  
    form.parse(req, (err, fields, files) => {
      //console.log(err, fields, files) //file object being uploaded
      try {
        //console.log(JSON.stringify(files))
        const file_path = files.file.path
        const run = req.query.run
        const tank = req.query.tank
        const data = {
          path: file_path,
          run: run,
          tank: tank
        }
        axios({
          method: 'post',
          url: 'http://localhost:3000/api/process/',
          timeout: 5000,
          data: data
        })
        .then((r) => {
          res.status(200).json({message: `The file has been uploaded, analyzed, and saved`})
        })
        .catch((e) => {
          console.error(e)
          res.status(500).json({message: "uploaded, but pcv script or database error"})
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