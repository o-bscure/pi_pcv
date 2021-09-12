var { blink_handle, stop_handle } = require('../../../hardware_facing/wraper')
var fs = require('fs')

const handler = async (req, res) => {
    if (req.method != 'POST') {
        res.status(400).json("400: POST requests only")
        return 
    }
  
    try {
        const body = req.body
        const run = body.run
        const tank = body.tank

        const blink_p = await blink_handle()
        let new_remote = JSON.stringify({
            run: run,
            tank: Number(tank)
        })
        fs.writeFileSync('./../remote.json', new_remote)
        blink_p.kill()
	stop_handle()
        res.status(200).json("remote run/tank set")
        
    } catch (e) {
        console.error(e)
        res.status(500).json(e.message)
        return
    }
}

export default handler
