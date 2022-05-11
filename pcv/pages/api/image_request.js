import fs from 'fs'
import path from 'path'
import { query } from '../../lib/db'

const hanlder = async (req, res) => {
	const body = req.body

	const run = body.run
	const tank = body.tank
	const time = body.time
	var time_array = time.match(/[\w]+/g)
	if ((time_array[time_array.length - 1] == "PM") && (Number(time_array[3]) != 12)) {
		time_array[3] = String(Number(time_array[3])+12)
	}
	for (let i=0; i<time_array.length-1; i++) {
		if (time_array[i].length < 2) {
			time_array[i] = "0"+time_array[i]
		}
	}
	var time_form = time_array[2]+"-"+time_array[0]+"-"+time_array[1]+" "+time_array[3]+":"+time_array[4]+":"+time_array[5]

	console.log(run, tank, time_form)

	const [rows, fields] = await query(`
		SELECT path FROM entries WHERE run=? AND tank=? AND created_at=?
	`,
	[run, tank, time_form]
	)

	console.log(run, tank, time_form)

	var p = rows[0].path
	var p2 = p.substring(0, p.length-4)+"_analyzed.png"
	console.log(p2)

	if (fs.existsSync(p2)) {
		const file_path = path.resolve(p2)
		const imgBuffer = fs.readFileSync(file_path, {encoding: 'base64'})
		res.setHeader('Content-Type', 'image/png')
		res.send(imgBuffer)
		res.status(200)
	} else {
		const file_path = path.resolve(p)
		const imgBuffer = fs.readFileSync(file_path, {encoding: 'base64'})
		res.setHeader('Content-Type', 'image/png')
		res.send(imgBuffer)
		res.status(200)
	}

} 

export default hanlder
