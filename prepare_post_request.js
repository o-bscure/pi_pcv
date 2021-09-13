var fs = require('fs')
const path = require('path')
var axios = require('axios')
var remote = require('./remote.json');
var crypto = require('crypto')
var { blink_handle, stop_handle } = require('./hardware_facing/wraper')

async function prepare_post_request(img_path_old, file_type) {
    //console.log(config)
    if (remote.run && remote.tank) {
	const blink_p = await blink_handle()
        const img_buf = fs.readFileSync(img_path_old)
        fs.unlinkSync(img_path_old)

        const run = remote.run
        const tank = remote.tank

        let new_remote = JSON.stringify({
            run: run,
            tank: Number(tank) + 1
        })
        fs.writeFileSync('/home/pi/pi_pcv/remote.json', new_remote)
        var j = 0;

        const imgHash = crypto.createHash('md5').update(img_buf).digest('hex')
        const img_path = path.join(__dirname, `/pcv/public/upload_${imgHash}.${file_type}`)
        const data = {
            path: img_path,
            run: run,
            tank: tank
        }
        fs.writeFile(img_path, img_buf, (err) => {
            if (err) throw err
            console.log('file saved, now processing')

            axios({
                method: 'post',
                url: `http://localhost:3000/api/process`,
                timeout: 5000,
                data: data,
            })
            .then((res) => {
                console.log(res.status, res.statusText, res.data)
		        blink_p.kill()
		        stop_handle()
            })
            .catch((e) => {
                console.log("error processing file upload ")
                console.error(e)
		        blink_p.kill()
            })
        })

    } else {
        console.error("there is no 'tank' or 'run' prepared for remote configuration")
    }
    
}


prepare_post_request(process.argv[2], process.argv[3])
