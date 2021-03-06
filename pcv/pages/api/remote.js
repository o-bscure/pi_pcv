var { blink_handle_red, stop_handle_red} = require('../../../hardware_facing/wraper')
var fs = require('fs')
var remote = require('../../../remote.json')

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

        let new_remote = JSON.stringify({
            "prev": {
                run: remote.prev.run,
                tank: Number(remote.prev.tank),
                volume: Number(remote.prev.volume)
            },
            "next": {
                run: run,
                tank: Number(tank),
                volume: Number(volume)
            }
        })
        fs.writeFileSync('./../remote.json', new_remote)
        res.status(200).json("remote run/tank/volume set")
        
    } catch (e) {
	blink_hanle_red()
        console.error(e)
        res.status(500).json(e)
        return
    }
}

export default handler
