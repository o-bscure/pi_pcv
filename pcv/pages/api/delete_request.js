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
		DELETE FROM entries WHERE run=? AND tank=? AND created_at=?
	`,
	[run, tank, time_form]
	)

	console.log(run, tank, time_form)
	res.status(200).json(`run ${run}, tank ${tank}, time ${time_form}, deleted`)

} 

export default hanlder
