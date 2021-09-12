const { rejects } = require('assert')
const { spawn } =  require('child_process')
const { sign } = require('crypto')
const path = require('path')
blink_f_path = path.join(__dirname, '/blink.py')

async function blink_handle() {
    //console.log(blink_f_path)
    return new Promise((res, rej) => {
        const blink_f = spawn('python3', [blink_f_path])
        blink_f.on('spawn', () => {
            console.log("blinking start")
            //console.log(data.toString())
            res(blink_f)
        })
        blink_f.stdout.on('data', (data) => {
            console.log(`${data}`)
        })
        blink_f.stderr.on('data', (e) => {
            console.log('script error')
            res(blink_f)
        })
        blink_f.on('close', (code, signal) => {
            console.log(`blinking stopped`)
        })
    })

}

module.exports = {
    blink_handle: blink_handle
}

/*
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

f = blink_handle()
.then((r) => {
    sleep(1000).then((rr) => {
        r.kill()
    })
})
*/