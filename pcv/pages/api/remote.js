var { blink_handle_red, stop_handle_red} = require('../../../hardware_facing/wraper')
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
        const volume = body.volume

        const blink_p = await blink_handle_red()
        let new_remote = JSON.stringify({
            run: run,
            tank: Number(tank),
            volume: Number(volume)
        })
        fs.writeFileSync('./../remote.json', new_remote)
        blink_p.kill()
	    stop_handle_red()
        res.status(200).json("remote run/tank/volume set")
        
    } catch (e) {
	blink_hanle_red()
        console.error(e)
        res.status(500).json(e)
        return
    }
}

export default handler
