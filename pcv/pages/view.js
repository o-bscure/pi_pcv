import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import axios from 'axios'
import { ClipboardCopy } from '../components/clipboard_copy.js'
import { ExportButton } from '../components/exportButton.js'
import { Modal } from '../components/Modal.js'
import { Prompt } from '../components/Prompt.js'

//TODO: results 'recent' only default, with reuturn 'all' queries option
//filter run to not have only whitespace
//
//
//XLS EXPORT BUTTON STUFF
//allow download/flagging when all this.state.tanks.foreach(results != undefined)
//

/*
this.state = {
            tanks: {
                0: {
                    run:
                    tank:
                    results:  {
                            time: [x,x,x,x,]
                            pcv: [y,y,y,y,]
			    flagged: [t,f,t,f]
                    }
                }
            },
        }
*/
export default class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
	    _prompt: false,
	    _prompt_str: "undefined",
	    _prompt_func: undefined,
	    isModal: false,
	    imgModal: undefined,
	    isCopied: false,
	    toCopy: false,
	    toFlag: false,
	    checked: 0,
            tanks: {
                0: {
                    run: "",
                    tank: undefined,
		    results: undefined
                }
            },
        }
	
	this.handleCheck = this.handleCheck.bind(this);
	this.handleSampleNum = this.handleSampleNum.bind(this);
	this.handleFlag = this.handleFlag.bind(this);
	this.handleToFlag = this.handleToFlag.bind(this);
        this.handleRunSelect = this.handleRunSelect.bind(this);
        this.handleTankSelect = this.handleTankSelect.bind(this)
        this.handleAmountSelect = this.handleAmountSelect.bind(this);
        this.handleNewTank = this.handleNewTank.bind(this);
        this.handlePopTank = this.handlePopTank.bind(this);
        this.setTankNumbers = this.setTankNumbers.bind(this);
        this.setRunGlobal = this.setRunGlobal.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
	this.selectModal = this.selectModal.bind(this);
	this.givePrompt = this.givePrompt.bind(this);
	this.deleteEntry = this.deleteEntry.bind(this);
    }

	/*
    componentDidUpdate = () => {
	    if (this.state.to_copy == true) {
		    console.log("COPYING...")
		    var string_to_copy = ``
		    for (let i=0; i<Object.keys(this.state.tanks).length; i++) {
		    	if ((typeof this.state.tanks[i].results) != "undefined" ) {
		    	    var time = this.state.tanks[i].results.time
		    	    var pcv = this.state.tanks[i].results.pcv
		    	    var vol = this.state.tanks[i].results.volume
		    	    for (let j=0; j<pcv.length; j++) {
		    	    	string_to_copy += `${time[j]}\t${pcv[j]}\t${vol[j]}\n`
		    	    }
		    	}
		    }
        	if (typeof window === 'object') {
			console.log(string_to_copy)
        	    if (window.isSecureContext) {
		          navigator.clipboard.writeText(`${string_to_copy}`)
        	    } else {
        	        console.log("insecure context for copying to clipboard")
        	    }

        	} else {
			console.log("not in a window")
		};
		this.setState(prevState => ({
			...prevState,
			to_copy: false
		}))
	    }
    }
    */

    givePrompt(e, f, str) {
	e.preventDefault()
	this.setState({
		_prompt: true,
		_prompt_str: str,
		_prompt_func: f
	})
    }

    deleteEntry(e, run, tank, time) {
	e.preventDefault()
	axios({
		method: 'post',
		url: `/api/delete_request`,
		data: {
			run: run,
			tank: tank,
			time: time,
		},
		timeout: 5000,
	})
	.then((r) => {
		this.handleSubmit(e)
	})
	
    }

    selectModal(e, run, tank, time) {
	    e.preventDefault()

            axios({
                method: 'post',
                url: `/api/image_request`,
		data: {
			run: run,
			tank: tank,
			time: time,
		},
                timeout: 5000,
            })
            .then((r) => {
		    var imgBuffer = r.data
		    console.log(imgBuffer)
		    this.setState({
			isModal: true,
			imgModal: imgBuffer
		    })
	    })

    }

    handleCheck(e) {
	    e.preventDefault()
	    var tank_keys = Object.keys(this.state.tanks)
	    var all_nums = []
	    
	    for (let i=0; i<tank_keys.length; i++) {
		    var nums = []
		    for (let j=0; j<this.state.tanks[tank_keys[i]].results.sample_num.length; j++) {
			    if (!(this.state.tanks[tank_keys[i]].results.flagged[j])) {
				    nums.push(Number(this.state.tanks[tank_keys[i]].results.sample_num[j]))
			    }
		    }
		    all_nums.push(nums)
	    }

	    var all_equal = true
	    for (let k=0; k<all_nums.length; k++) {
		    all_equal = all_equal && (JSON.stringify(all_nums[k]) == JSON.stringify(all_nums[0]))
	    }

	    var export_data = []
	    for (let i=0; i<tank_keys.length; i++) {
		    var export_data_single = []
		    var tank_k = tank_keys[i]
		    var result = this.state.tanks[tank_k].results
		    for (let j=0; j<result.pcv.length; j++) {
			    if (!result.flagged[j]) {
				var tt;
                            	tt = new Date(this.state.tanks[tank_keys[i]].results.time[j])
                            	//tt = new Date(tt.toUTCString()).toLocaleString()
				export_data_single.push({"Experiment": this.state.tanks[tank_k].run, "Tank Name": `Cub ${this.state.tanks[tank_k].tank}`, 
					"Sample Number": `${result.sample_num[j]}`, "Measurement Timestamp": tt, "Measurement Type": "PCV", 
					"Dilution": Number(1), "Measurement Value": Number(result.pcv[j])/Number(result.volume[j])*1000, "Units": "uL/mL", "Equipment": "Manual"})
			    }
			    //dilution used to be result.volume[j]. changed to 1
		    }
		    export_data.push(export_data_single)

	    }
	    var export_ready = []
	    for (let j=0; j<export_data[0].length; j++) {
		    for (let i=0; i<export_data.length; i++) {
			    export_ready.push(export_data[i][j])
		    }
	    }
	    
	    if (all_equal) {
	    	this.setState({
	    	        checked: 1, //0=undefined, 1=good, 2=bad
			export_ready: export_ready
	    	})
	    } else {
	    	this.setState({
	    	        checked: 2, //0=undefined, 1=good, 2=bad
	    	})
	    }


    }

    handleSampleNum(e, tank_index, result_index) {
	    e.preventDefault()
	    var new_num = e.target.value
	    var current_status = this.state.tanks[tank_index].results.sample_num[result_index]
	    var new_list = this.state.tanks[tank_index].results.sample_num
	    new_list[result_index] = new_num
	    this.setState(prevState => ({
		    ...prevState,
		    checked: 0,
		    tanks: {
			    ...prevState.tanks,
			    [tank_index]: {
				    ...prevState.tanks[tank_index],
				    results: {
					    ...prevState.tanks[tank_index].results,
					    sample_num: new_list,
				    }
			    }
		    }
	    }))
    }

    handleFlag(e, tank_index, result_index) {
	    e.preventDefault()
	    var current_status = this.state.tanks[tank_index].results.flagged[result_index]
	    var new_list = this.state.tanks[tank_index].results.flagged
	    new_list[result_index] = !current_status
	    this.setState(prevState => ({
		    ...prevState,
		    checked: 0,
		    tanks: {
			    ...prevState.tanks,
			    [tank_index]: {
				    ...prevState.tanks[tank_index],
				    results: {
					    ...prevState.tanks[tank_index].results,
					    flagged: new_list,
				    }
			    }
		    }
	    }))
    }

    handleToFlag(e) {
	    e.preventDefault()
	    this.setState({
		    toFlag: !(this.state.toFlag),
		    checked: 0,
	    })
    }

    setTankNumbers(e) {
        e.preventDefault()
        const tank_keys = Object.keys(this.state.tanks)
        for (let i=0; i<tank_keys.length; i++) {
            this.setState(prevState => ({
                ...prevState,
		checked: 0,
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
		checked: 0,
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
	    checked: 0,
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
	    checked: 0,
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
	    checked: 0,
            tanks: {
                ...prevState.tanks,
                [current_tank_amount]: {
                    run: "",
                    tank: undefined, 
		    results: undefined,
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
		checked: 0,
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
		let flag_init = []
		let sample_num = []
                for (let i=0; i<r.data.rows.length; i++) {
                    time_results.push(r.data.rows[i].created_at)    
                    pcv_results.push(r.data.rows[i].pcv_value)
                    volume_results.push(r.data.rows[i].volume)
		    flag_init.push(false)
		    sample_num.push(i+2)
                }

                this.setState(prevState => ({
                    ...prevState,
			toCopy: true,
                    tanks: {
                        ...prevState.tanks,
                        [tank_keys[i]]: { 
                            ...prevState.tanks[tank_keys[i]],
                            results: {
                                time: time_results,
                                pcv: pcv_results,
                                volume: volume_results,
				flagged: flag_init,
				sample_num: sample_num,
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
        console.log(this.state)
        var tank_keys = Object.keys(this.state.tanks)

        var badSubmit = false
        if (Object.keys(this.state.tanks).length == 0) {
            badSubmit = true
        }
        var tankrows = []
        for (let i=0; i<Object.keys(this.state.tanks).length; i++) {
            var box_type_run = "flex flex-initial place-self-center place-items-center px-1 w-16 h-7 bg-white focus:outline-none "; //requires trailing space
            var box_type_tank = "flex flex-initial place-self-center w-10 h-7 bg-white focus:outline-none "; //requires trailing space
            if ((typeof this.state.tanks[i].run) == "undefined" || this.state.tanks[i].run == "" || this.state.tanks[i].run == " ") {
                box_type_run = box_type_run.concat("border-2 rounded-md border-red-600")
		box_type_tank = box_type_tank.concat("border rounded-md border-black")
                badSubmit = true
            } else if ((typeof this.state.tanks[i].tank) == "undefined" || Number(this.state.tanks[i].tank) <= 0) {
                box_type_tank = box_type_tank.concat("border-2 rounded-md border-red-600")
                box_type_run = box_type_run.concat("border rounded-md border-black")
                badSubmit = true
            } else {
		console.log(box_type_tank)
                box_type_run = box_type_run.concat("border rounded-md border-black ")
                box_type_tank = box_type_tank.concat("border rounded-md border-black ")
            }
            tankrows.push(
                <div key={i} className="flex flex-rows-1 place-content-evenly w-full"> 
                    <div className="flex flex-col-1 flex-wrap place-content-center">
                        <label className="flex flex-initial place-items-center place-content-center text-lg p-1 w-full">Run</label>
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
            var submitButton=<button onClick={(e) => this.handleSubmit(e)} disabled className="flex flex-initial place-self-center bg-white m-3 p-6 rounded-t-md 
                        font-medium border-2 border-red-500 cursor-not-allowed focus:outline-none ">Submit</button>
        } else {
            var submitButton=<button onClick={(e) => this.handleSubmit(e)} className="flex flex-initial place-self-center bg-white m-3 p-6 rounded-t-md 
                        font-medium border-2 border-green-500 focus:outline-none ">Submit</button>
        }

	    var results_good = true
	    var tank_nums_only = []
	    for (let i=0; i<Object.keys(this.state.tanks).length; i++) {
		    results_good = results_good
			    && (typeof this.state.tanks[tank_keys[i]].results != "undefined") //results are not undefined
		    	    && (this.state.tanks[tank_keys[i]].results.pcv[0] != 'loading...') //results are not temporary
			    && (this.state.tanks[tank_keys[i]].results.pcv.length != 0) //results count >1
		    	    && (this.state.tanks[tank_keys[i]].run == this.state.tanks[tank_keys[0]].run) //run string names are all same
		    tank_nums_only.push(this.state.tanks[tank_keys[i]].tank)
	    }
	    results_good = results_good && ([...new Set(tank_nums_only)].length == tank_nums_only.length) //all tank nums are unique
	    if (results_good && (Object.keys(this.state.tanks).length != 0)) {
		    var flag_button = <button onClick={(e) => this.handleToFlag(e)} className="flex flex-shrink place-self-center place-items-center bg-white m-2 mt-4 p-1 px-2 rounded-md 
                        border border-black hover:bg-black hover:text-white focus:outline-none">flag</button>
	    } else {
		    var flag_button = <div></div>
		    this.state.toFlag = false
	    }

	if (this.state.toFlag) {
		var results_header = <div className="flex w-full place-content-evenly"><div className="text-xl mr-6 ml-4">Time</div><div className="text-xl ">PCV</div><div className="text-xl ">Vol (ul)</div>
			<div className="w-10"></div>
			</div>
		if (this.state.checked == 0) {
			var confirm_sample_num_button = <button onClick={(e) => this.handleCheck(e)} className="flex flex-shrink place-self-center place-items-center bg-white m-2 mt-4 p-1 px-2 rounded-md 
                        border border-black hover:bg-black hover:text-white focus:outline-none">check</button>
		} else if (this.state.checked == 1) {
			var confirm_sample_num_button = <button onClick={(e) => this.handleCheck(e)} className="flex flex-shrink place-self-center place-items-center bg-green-400 m-2 mt-4 p-1 px-2 rounded-md 
                        border border-black focus:outline-none">check</button>
		} else {
			var confirm_sample_num_button = <button onClick={(e) => this.handleCheck(e)} className="flex flex-shrink place-self-center place-items-center bg-red-400 m-2 mt-4 p-1 px-2 rounded-md 
                        border border-black focus:outline-none">check</button>
		}
	} else {
		var confirm_sample_num_button = <div></div>
		var results_header = <div className="flex w-full place-content-evenly"><div className="text-xl mr-6 ml-4">Time</div><div className="text-xl">PCV</div><div className="text-xl">Vol (ul)</div></div>
	}

        var resultrows = []
        for (let i=0; i<tank_keys.length; i++) {
            if (typeof this.state.tanks[tank_keys[i]].results != 'undefined' && (this.state.tanks[tank_keys[i]].results.pcv.length == this.state.tanks[tank_keys[i]].results.time.length)) {
                var results = []
                var result_length = this.state.tanks[tank_keys[i]].results.pcv.length
                if (result_length == 0) {
                    resultrows.push(<div className="flex w-full place-content-center"><div>Empty</div></div>)
                } else if (this.state.toFlag) { 
                    for (let j=0; j<result_length; j++) {
                        var t = this.state.tanks[tank_keys[i]].results.time[j]
                        if (t != ["loading..."]) {
                            t = new Date(this.state.tanks[tank_keys[i]].results.time[j])
                            t = new Date(t.toUTCString()).toLocaleString()
                        }
                        var p = this.state.tanks[tank_keys[i]].results.pcv[j]
                        var v = this.state.tanks[tank_keys[i]].results.volume[j]

			if (this.state.tanks[tank_keys[i]].results.flagged[j]) {
				var individual_flag_button = <button onClick={(e) => this.handleFlag(e, i, j)} className=" bg-red-200 border-2 border-red-800 focus:outline-none">flag</button>
			} else {
				var individual_flag_button = <button onClick={(e) => this.handleFlag(e, i, j)} className=" bg-green-200 border-2 border-green-800 focus:outline-none">flag</button>
			}

                        results.push(
                            <div className="flex w-full place-content-evenly">
                                <div className="flex ">{t}</div>
                                <div className="flex mr-16 ml-6 ">{p}</div>
                                <div className="flex mr-16 ml-6 ">{v}</div>
				{individual_flag_button}
				<input type="number" value={this.state.tanks[tank_keys[i]].results.sample_num[j]} onChange={(e) => this.handleSampleNum(e, i, j)} 
				className="flex flex-initial w-10 bg-white px-1 border border-black rounded-lg" />
                            </div>
                        )
                    }
                	resultrows.push(<div key={i} className="flex flex-col flex-wrap w-full place-self-center p-2">{results}</div>)
                } else {
                    for (let j=0; j<result_length; j++) {
                        var t = this.state.tanks[tank_keys[i]].results.time[j]
                        if (t != ["loading..."]) {
                            t = new Date(this.state.tanks[tank_keys[i]].results.time[j])
                            t = new Date(t.toUTCString()).toLocaleString()
			    var modalButton = <button key={i*100+j} onClick={(e) => this.selectModal(e, this.state.tanks[tank_keys[i]].run, this.state.tanks[tank_keys[i]].tank, new Date(new Date(this.state.tanks[tank_keys[i]].results.time[j]).toUTCString()).toLocaleString())} className="border border-black p-0.5 px-1 rounded-md bg-black text-white" >view</button>
			    var deleteButton = <button key={i*1000+j} onClick={(e) => this.givePrompt(e, (ee) => this.deleteEntry(ee, this.state.tanks[tank_keys[i]].run, this.state.tanks[tank_keys[i]].tank, new Date(new Date(this.state.tanks[tank_keys[i]].results.time[j]).toUTCString()).toLocaleString()), `DELETE "${this.state.tanks[tank_keys[i]].run}" tank ${this.state.tanks[tank_keys[i]].tank} entry ${j+1}?`)} className="border border-black p-0.5 px-1 bg-gray-400 text-black focus:outline-none">del</button>
                        
                        var p = this.state.tanks[tank_keys[i]].results.pcv[j]
                        var v = this.state.tanks[tank_keys[i]].results.volume[j]
			results.push(
                            <div key={j} className="flex w-full place-content-evenly">
				{modalButton}
                                <div className="flex ">{t}</div>
                                <div className="flex mr-16 ml-6 ">{p}</div>
                                <div className="flex mr-16 ml-6 ">{v}</div>
				{deleteButton}
                            </div>
                        )
			}
		}
                resultrows.push(<div key={i} className="flex flex-col flex-wrap w-full place-self-center p-2">{results}</div>)
		}
            } else {
                resultrows.push(<p key={i} className="flex flex-initial place-self-center place-items-center h-20 mt-3 ">X</p>)
            }
        }

	    if (this.state.toCopy) {
		    var string_to_copy = ``
		    for (let i=0; i<Object.keys(this.state.tanks).length; i++) {
		    	if ((typeof this.state.tanks[i].results) != "undefined" ) {
		    	    var time = this.state.tanks[i].results.time
		    	    var pcv = this.state.tanks[i].results.pcv
		    	    var vol = this.state.tanks[i].results.volume
		    	    for (let j=0; j<pcv.length; j++) {
		    	    	string_to_copy += `${time[j]}\t${pcv[j]}\t${vol[j]}\n`
		    	    }
		    	}
		    }
		    var copy_button = <ClipboardCopy copyText={string_to_copy} />
	    } else {
		    var copy_button = <div></div>
	    }

	    if (this.state.checked == 1) {
	    	var exportButton = <ExportButton blocked={false} 
		    data={this.state.export_ready} filename={`${this.state.tanks[Object.keys(this.state.tanks)[0]].run}_PCV`}/>
	    } else {
	    	var exportButton = <ExportButton blocked={true} 
		    data={[
			    {name: 'cat', category: 'animal'},
			    {name: 'hat', category: 'clothing'},
		    ]} filename={'ERROR_BAD_EXPORT'}/>
	    }

        return (
          <div className="w-full h-full min-w-screen min-h-screen bg-white">
	  <div id="prompt-root"></div>
	  <Prompt onClose={() => this.setState({_prompt: false})} show={this.state._prompt} func={this.state._prompt_func} str={this.state._prompt_str} />
	  <div id="modal-root"></div>
	  <Modal onClose={() => this.setState({isModal: false})} show={this.state.isModal}> <img src={`data:image/png;base64,${this.state.imgModal}`}/> </Modal>
          <div className="grid grid-cols-1 w-full h-full min-w-screen min-h-screen bg-white">
            <div className="flex flex-grow">
            <form className="grid grid-cols-2 w-full h-full">
                <div className="flex flex-col flex-nowrap gap-y-1">
                    <div className="flex flex-rows-1 place-content-center m-5 mt-8">
                        <label className="flex flex-inital text-3xl font-semibold pr-4">Tanks</label>
                    </div>
                    <div className="flex flex-row place-content-center">
                        <label className="flex flex-initial text-xl pr-4">Amount</label>
                        <input type="number" id="tank_amount" value={Object.keys(this.state.tanks).length} onChange={(e) => this.handleAmountSelect(e)} 
                            className="flex flex-initial px-1 w-16 bg-white border-2 border-gray-600 rounded-lg focus:outline-none"/>
                    </div>
                    <div className="flex flex-col flex-grow gap-y-3 ">{tankrows}</div>
                </div>

                <div className="flex flex-col flex-nowrap gap-y-1">
		<div className="flex flex-row place-content-center">
                    <label className="flex flex-inital m-5 mt-8 place-self-center text-3xl font-semibold">Results</label>
		    {flag_button}
		    {confirm_sample_num_button}
		</div>
                    {results_header}
                    <div className="flex flex-col flex-grow gap-y-3 ">{resultrows}</div>
                </div>
            </form>
            </div>

            <div className="flex flex-shrink flex-col-1 place-content-center self-end h-20">
                <div className="flex flex-row-1 place-content-around w-full">
                    <button onClick={(e) => this.setTankNumbers(e)} className="flex flex-shrink place-self-center bg-white m-3 p-6 rounded-t-md 
                        border-2 border-black font-medium hover:bg-black hover:text-white focus:outline-none">Auto</button>
                    {submitButton}
		    {exportButton}
                    <Link href="/"><div className="flex flex-shrink place-self-center bg-white m-3 p-6 rounded-t-md cursor-pointer
                        border-2 border-black font-medium hover:bg-black hover:text-white focus:outline-none">Back</div></Link>
                </div>
            </div>
          </div>
	</div>
        )}
}
