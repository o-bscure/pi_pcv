const { rejects } = require('assert')
const { spawn } =  require('child_process')
const { sign } = require('crypto')
const path = require('path')
//const blink_f_path = path.join(__dirname, '/blink.py')
blink_f_path_green = path.join("/home/pi/pi_pcv", "./hardware_facing/blink_green.py")
stop_f_path_green = path.join("/home/pi/pi_pcv", "./hardware_facing/stop_green.py")
blink_f_path_red = path.join("/home/pi/pi_pcv", "./hardware_facing/blink_red.py")
stop_f_path_red = path.join("/home/pi/pi_pcv", "./hardware_facing/stop_red.py")

async function blink_handle_green() {
    return new Promise((res, rej) => {
        const blink_f = spawn('python3', [blink_f_path_green])
        blink_f.on('spawn', () => {
            console.log("green blinking start")
            res(blink_f)
        })
        blink_f.stdout.on('data', (data) => {
            console.log(`${data}`)
        })
        blink_f.stderr.on('data', (e) => {
	    console.log(e.toString())
            console.log('green blink script error')
            res(blink_f)
        })
        blink_f.on('close', (code, signal) => {
            console.log(`green blinking paused`)
        })
    })

}

async function stop_handle_green() {
    return new Promise((res, rej) => {
        const blink_f = spawn('python3', [stop_f_path_green])
        blink_f.on('spawn', () => {
            console.log("turning green light off")
            res(blink_f)
        })
        blink_f.stdout.on('data', (data) => {
            console.log(`${data}`)
        })
        blink_f.stderr.on('data', (e) => {
	    console.log(e.toString())
            console.log('green stop script error')
            res(blink_f)
        })
        blink_f.on('close', (code, signal) => {
            console.log(`green light off`)
        })
    })

}

async function blink_handle_red() {
    return new Promise((res, rej) => {
        const blink_f = spawn('python3', [blink_f_path_red])
        blink_f.on('spawn', () => {
            console.log("red blinking start")
            res(blink_f)
        })
        blink_f.stdout.on('data', (data) => {
            console.log(`${data}`)
        })
        blink_f.stderr.on('data', (e) => {
	    console.log(e.toString())
            console.log('red blink script error')
            res(blink_f)
        })
        blink_f.on('close', (code, signal) => {
            console.log(`red blinking paused`)
        })
    })

}

async function stop_handle_red() {
    return new Promise((res, rej) => {
        const blink_f = spawn('python3', [stop_f_path_red])
        blink_f.on('spawn', () => {
            console.log("turning red light off")
            res(blink_f)
        })
        blink_f.stdout.on('data', (data) => {
            console.log(`${data}`)
        })
        blink_f.stderr.on('data', (e) => {
	    console.log(e.toString())
            console.log('stop red script error')
            res(blink_f)
        })
        blink_f.on('close', (code, signal) => {
            console.log(`red light off`)
        })
    })

}

module.exports = {
    blink_handle_green: blink_handle_green,
    stop_handle_green: stop_handle_green,
    blink_handle_red: blink_handle_red,
    stop_handle_red: stop_handle_red

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
