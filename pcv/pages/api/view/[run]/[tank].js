import { query } from '../../../../lib/db'

import Filter from 'bad-words'
const filter = new Filter()

const handler = async (req, res) => {
        if (req.method != 'GET') {
            res.status(400).json("400: GET requests only")
            return
        }

        const run = filter.clean(req.query.run)
        const tank = req.query.tank

        const [rows, fields] = await query(`
                SELECT id, tank, volume, pcv_value, created_at
                FROM entries
                WHERE run = ?
                AND tank = ?
                ORDER BY tank ASC;
            `,
            [run, tank])
            .catch((e) => {
                console.error(e)
                res.status(500).json("the query failed")
                return
            })

        console.log(run, rows)

        res.status(200).json({run, rows})
        return 

    }

export default handler