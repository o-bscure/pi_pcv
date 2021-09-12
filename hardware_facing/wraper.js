const { rejects } = require('assert')
const { spawn } =  require('child_process')
const { sign } = require('crypto')
const path = require('path')
//const blink_f_path = path.join(__dirname, '/blink.py')
blink_f_path = path.join("/home/pi/pi_pcv", "./hardware_facing/blink.py")
stop_f_path = path.join("/home/pi/pi_pcv", "./hardware_facing/stop.py")

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
	    console.log(e.toString())
            console.log('blink script error')
            res(blink_f)
        })
        blink_f.on('close', (code, signal) => {
            console.log(`blinking paused`)
        })
    })

}

async function stop_handle() {
    //console.log(blink_f_path)
    return new Promise((res, rej) => {
        const blink_f = spawn('python3', [stop_f_path])
        blink_f.on('spawn', () => {
            console.log("turning light off")
            //console.log(data.toString())
            res(blink_f)
        })
        blink_f.stdout.on('data', (data) => {
            console.log(`${data}`)
        })
        blink_f.stderr.on('data', (e) => {
	    console.log(e.toString())
            console.log('stop script error')
            res(blink_f)
        })
        blink_f.on('close', (code, signal) => {
            console.log(`light off`)
        })
    })

}

module.exports = {
    blink_handle: blink_handle,
    stop_handle: stop_handle
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
