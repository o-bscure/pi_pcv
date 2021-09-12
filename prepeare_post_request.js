var fs = require('fs')
const path = require('path')
var axios = require('axios')
var remote = require('./remote.json');
var crypto = require('crypto')

async function prepare_post_request(img_buf, file_type) {
    //console.log(config)
    if (remote.run && remote.tank) {
        const run = remote.run
        const tank = remote.tank

        let new_remote = JSON.stringify({
            run: run,
            tank: Number(tank) + 1
        })
        fs.writeFileSync('remote.json', new_remote)
        var j = 0;

        const imgHash = crypto.createHash('md5').update(img_buf).digest('hex')
        const img_path = path.join(process.cwd(), `/pcv/public/upload_${imgHash}.${file_type}`)
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
            })
            .catch((e) => {
                console.error(e)
            })
        })

    } else {
        console.error("there is no 'tank' or 'run' prepared for remote configuration")
    }
    
}

//example usage
const imgPath = path.join(process.cwd(), '/image.png')
fs.readFile(imgPath, (err, data) => {
    if (err) {
        console.error(err);
        return
    }
    prepare_post_request(data, 'png')
})

//exports.prepare_post_request = prepare_post_request;