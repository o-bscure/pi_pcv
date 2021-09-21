import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import axios from 'axios'
//TODO: results 'recent' only default, with reuturn 'all' queries option
//filter run to not have only whitespace

/*
this.state = {
            tanks: {
                0: {
                    run:
                    tank:
                    results:  {
                            time: [x,x,x,x,]
                            pcv: [y,y,y,y,]
                    }
                }
            },
        }
*/
export default class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tanks: {
                0: {
                    run: "",
                    tank: undefined 
                }
            },
        }

        this.handleRunSelect = this.handleRunSelect.bind(this);
        this.handleTankSelect = this.handleTankSelect.bind(this)
        this.handleAmountSelect = this.handleAmountSelect.bind(this);
        this.handleNewTank = this.handleNewTank.bind(this);
        this.handlePopTank = this.handlePopTank.bind(this);
        this.setTankNumbers = this.setTankNumbers.bind(this);
        this.setRunGlobal = this.setRunGlobal.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    
    setTankNumbers(e) {
        e.preventDefault()
        const tank_keys = Object.keys(this.state.tanks)
        for (let i=0; i<tank_keys.length; i++) {
            this.setState(prevState => ({
                ...prevState,
                tanks: {
                    ...prevState.tanks,
                    [tank_keys[i]]: {
                        ...prevState.tanks[tank_keys[i]],
                        tank: String(i+1)
                    }
                },
            }))
        }
    }

    setRunGlobal(e, run) {
        e.preventDefault()
        const tank_keys = Object.keys(this.state.tanks)
        for (let i=0; i<tank_keys.length; i++) {
            this.setState(prevState => ({
                ...prevState,
                tanks: {
                    ...prevState.tanks,
                    [tank_keys[i]]: {
                        ...prevState.tanks[tank_keys[i]],
                        run: run
                    }
                },
            }))
        }
    }

    handleTankSelect(event, tanknumber) {
        event.preventDefault()
        this.setState(prevState => ({
            ...prevState,
            tanks: {
                ...prevState.tanks,
                [tanknumber]: {
                    ...prevState.tanks[tanknumber],
                    tank: event.target.value
                }
            },
        }))
    }

    handleRunSelect(event, tanknumber) {
        event.preventDefault()
        this.setState(prevState => ({
            ...prevState,
            tanks: {
                ...prevState.tanks,
                [tanknumber]: {
                    ...prevState.tanks[tanknumber],
                    run: event.target.value
                }
            }
        }))
    }

    handleNewTank(e) {
        e.preventDefault()
        var current_tank_amount = Object.keys(this.state.tanks).length
        this.setState(prevState => ({
            ...prevState,
            tanks: {
                ...prevState.tanks,
                [current_tank_amount]: {
                    run: "",
                    tank: undefined 
                }
            }
        }))
    }

    handlePopTank(e) {
        e.preventDefault()
        var current_tank_amount = Object.keys(this.state.tanks).length
        var { ['tanks']: tankValues, ...noTanks }= this.state;
        var { [Object.keys(this.state.tanks)[current_tank_amount-1]]: removedTank, ...tanksWithout } = tankValues
        var final = { ...noTanks, ['tanks']: tanksWithout }
        this.setState(final)
    }
    
    handleAmountSelect(event) {
        event.preventDefault()
        var amount = event.target.value
        var current_tank_amount = Object.keys(this.state.tanks).length
        if (current_tank_amount < amount) {
            var to_make = amount - current_tank_amount
            for (let i=0; i<to_make; i++) {
                this.handleNewTank(event)
            }
        } else {
            var to_pop = current_tank_amount - amount
            for (let i=0; i<to_pop; i++) {
                this.handlePopTank(event)
            }
        }
    }

    async handleSubmit(event) { 
        event.preventDefault()
        const tank_keys = Object.keys(this.state.tanks)
        for (let i=0; i<tank_keys.length; i++) {
            let current_tank = this.state.tanks[tank_keys[i]];

            this.setState(prevState => ({
                ...prevState,
                tanks: {
                    ...prevState.tanks,
                    [tank_keys[i]]: { 
                        ...prevState.tanks[tank_keys[i]],
                        results: {
                                time: ['loading...',],
                                pcv: ['loading...',],
                                volume: ['loading...']
                        }
                    }
                }
            }))

            axios({
                method: 'get',
                url: `/api/view/${current_tank.run}/${current_tank.tank}`,
                timeout: 5000,
            })
            .then((r) => {
                let time_results = [];
                let pcv_results = [];
                let volume_results = [];
                for (let i=0; i<r.data.rows.length; i++) {
                    time_results.push(r.data.rows[i].created_at)    
                    pcv_results.push(r.data.rows[i].pcv_value)
                    volume_results.push(r.data.rows[i].volume)
                }

                this.setState(prevState => ({
                    ...prevState,
                    tanks: {
                        ...prevState.tanks,
                        [tank_keys[i]]: { 
                            ...prevState.tanks[tank_keys[i]],
                            results: {
                                time: time_results,
                                pcv: pcv_results,
                                volume: volume_results,
                            },
                        }
                    }
                }))
            })
            .catch(e => {
                console.error(e.message)
            })
        }
    }

    render() {
        //console.log(this.state)
        var tank_keys = Object.keys(this.state.tanks)

        var badSubmit = false
        if (Object.keys(this.state.tanks).length == 0) {
            badSubmit = true
        }
        var tankrows = []
        for (let i=0; i<Object.keys(this.state.tanks).length; i++) {
            var box_type_run = "flex flex-initial place-self-center place-items-center w-16 h-7 bg-gray-400 border-2 rounded-md focus:outline-none ";
            var box_type_tank = "flex flex-initial place-self-center w-10 h-7 bg-gray-400 border-2 rounded-md focus:outline-none ";
            if ((typeof this.state.tanks[i].run) == "undefined" || this.state.tanks[i].run == "" || this.state.tanks[i].run == " ") {
                box_type_run = box_type_run.concat("border-red-600")
                badSubmit = true
            } else if ((typeof this.state.tanks[i].tank) == "undefined" || Number(this.state.tanks[i].tank) == 0) {
                box_type_tank = box_type_tank.concat("border-red-600")
                badSubmit = true
            } else {
                box_type_run = box_type_run.concat("border-gray-100")
                box_type_tank = box_type_tank.concat("border-gray-100")
            }
            tankrows.push(
                <div key={i} className="flex flex-rows-1 place-content-evenly w-full"> 
                    <div className="flex flex-col-1 flex-wrap place-content-center">
                        <label className="flex flex-initial place-items-center place-content-center p-1 w-full">Run</label>
                        <input type="text" value={this.state.tanks[tank_keys[i]].run} onChange={(e) => this.handleRunSelect(e, i)} className={box_type_run}/>
                        <div className="flex p-1 place-items-center place-content-center w-full ">
                            <button onClick={(e) => this.setRunGlobal(e, this.state.tanks[tank_keys[i]].run)} className="bg-gray-600 rounded-sm pl-2 pr-2 text-l 
                            text-gray-200 focus:outline-none">Set All</button>
                        </div>
                    </div>
                    <div className="flex flex-row place-items-center">
                        <label className="flex flex-initial place-items-center mr-1">Tank No. </label>
                        <input type="number" value={this.state.tanks[tank_keys[i]].tank} onChange={(e) => this.handleTankSelect(e, i)} className={box_type_tank}/>
                    </div>
                </div>
            )
        }

        if (badSubmit) {
            var submitButton=<button onClick={(e) => this.handleSubmit(e)} disabled className="flex flex-initial place-self-center bg-gray-600 m-3 p-6 rounded-t-md 
                        font-medium border-4 border-red-500 cursor-not-allowed focus:outline-none hover:ring hover:ring-gray-300 active:bg-indigo-300">Submit</button>
        } else {
            var submitButton=<button onClick={(e) => this.handleSubmit(e)} className="flex flex-initial place-self-center bg-gray-600 m-3 p-6 rounded-t-md 
                        font-medium border-4 border-green-500 focus:outline-none hover:ring hover:ring-gray-300 active:bg-indigo-300">Submit</button>
        }

        var resultrows = []
        for (let i=0; i<tank_keys.length; i++) {
            if (typeof this.state.tanks[tank_keys[i]].results != 'undefined' && (this.state.tanks[tank_keys[i]].results.pcv.length == this.state.tanks[tank_keys[i]].results.time.length)) {
                var results = []
                var result_length = this.state.tanks[tank_keys[i]].results.pcv.length
                if (result_length == 0) {
                    results.push(<div className="flex w-full place-content-center">Empty</div>)
                } else {
                    for (let j=0; j<result_length; j++) {
                        var t = this.state.tanks[tank_keys[i]].results.time[j]
                        if (t != ["loading..."]) {
                            t = new Date(this.state.tanks[tank_keys[i]].results.time[j])
                            t = new Date(t.toUTCString()).toLocaleString()
                        }
                        var p = this.state.tanks[tank_keys[i]].results.pcv[j]
                        var v = this.state.tanks[tank_keys[i]].results.volume[j]
                        results.push(
                            <div className="flex w-full place-content-evenly">
                                <div className="flex ">{t}</div>
                                <div className="flex mr-16 ml-6 ">{p}</div>
                                <div className="flex mr-16 ml-6 ">{v}</div>
                            </div>
                        )
                    }
                }
                resultrows.push(<div key={i} className="flex flex-col flex-wrap w-full place-self-center p-2">{results}</div>)
            } else {
                resultrows.push(<p key={i} className="flex flex-initial place-self-center place-items-center h-20 mt-3 ">X</p>)
            }
        }

        return (
          <div className="grid grid-cols-1 w-screen h-screen bg-gray-400">
            <div className="flex flex-grow">
            <form className="grid grid-cols-2 w-full h-full">
                <div className="flex flex-col flex-nowrap gap-y-1">
                    <div className="flex flex-rows-1 place-content-center m-5 mt-8">
                        <label className="flex flex-inital text-3xl font-semibold pr-4">Tanks</label>
                    </div>
                    <div className="flex flex-row place-content-center">
                        <label className="flex flex-initial text-xl pr-4">Amount</label>
                        <input type="number" id="tank_amount" value={Object.keys(this.state.tanks).length} onChange={(e) => this.handleAmountSelect(e)} 
                            className="flex flex-initial w-20 bg-gray-400 border-2 border-gray-700 rounded-lg focus:outline-none"/>
                    </div>
                    <div className="flex flex-col flex-grow gap-y-3 ">{tankrows}</div>
                </div>

                <div className="flex flex-col flex-nowrap gap-y-1">
                    <label className="flex flex-inital m-5 mt-8 place-self-center text-3xl font-semibold">Results</label>
                    <div className="flex w-full place-content-evenly"><div className="text-xl mr-6 ml-4">Time</div><div className="text-xl">PCV</div><div className="text-xl">Vol (ul)</div></div>
                    <div className="flex flex-col flex-grow gap-y-3 ">{resultrows}</div>
                </div>
            </form>
            </div>

            <div className="flex flex-shrink flex-col-1 place-content-center self-end h-20">
                <div className="flex flex-row-1 place-content-around w-full">
                    <button onClick={(e) => this.setTankNumbers(e)} className="flex flex-shrink place-self-center bg-gray-600 m-3 p-6 rounded-t-md 
                        border-2 border-gray-200 font-medium active:bg-red-600 focus:outline-none">Auto</button>
                    {submitButton}
                    <Link href="/"><div className="flex flex-shrink place-self-center bg-gray-600 m-3 p-6 rounded-t-md cursor-pointer
                        border-2 border-gray-200 font-medium active:bg-red-600 focus:outline-none">Back</div></Link>
                </div>
            </div>
          </div>
        )}
}
