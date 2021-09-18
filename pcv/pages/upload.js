import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import axios from 'axios'
import useSWR from 'swr'
import { find_bad_tanks } from '../lib/badTanks.js'
//TODO: strip trailing whitepsace from run entry

export default class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            run: "",
            files: {},
            bad_tanks: [],
        }

        this.handleRunSelect = this.handleRunSelect.bind(this);
        this.handleVolumeSelect = this.handleVolumeSelect.bind(this);
        this.handleTankSelect = this.handleTankSelect.bind(this)
        this.handleFileSelect = this.handleFileSelect.bind(this);
        this.setTankNumbers = this.setTankNumbers.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    
    setTankNumbers(e) {
        e.preventDefault()
        const file_keys = Object.keys(this.state.files)
        for (let i=0; i<file_keys.length; i++) {
            this.setState(prevState => ({
                ...prevState,
                files: {
                    ...prevState.files,
                    [file_keys[i]]: {
                        ...prevState.files[file_keys[i]],
                        tank: String(i+1)
                    }
                },
                bad_tanks: []
            }))
        }
    }

    setVolumeGlobal(e, volume) {
        e.preventDefault()
        const file_keys = Object.keys(this.state.files)
        for (let i=0; i<file_keys.length; i++) {
            this.setState(prevState => ({
                ...prevState,
                files: {
                    ...prevState.files,
                    [file_keys[i]]: {
                        ...prevState.files[file_keys[i]],
                        volume: volume
                    }
                },
            }))
        }
    }

    handleTankSelect(event, filenumber) {
        event.preventDefault()
        var bad_tanks = find_bad_tanks(this.state.files, filenumber, event.target.value) 
        this.setState(prevState => ({
            ...prevState,
            files: {
                ...prevState.files,
                [filenumber]: {
                    ...prevState.files[filenumber],
                    tank: event.target.value
                }
            },
            bad_tanks: bad_tanks
        }))
    }

    handleRunSelect(event) {
        event.preventDefault()
        this.setState(prevState => ({
            run: event.target.value 
        }))
    }

    handleVolumeSelect(event, filenumber) {
        event.preventDefault()
        var bad_tanks = find_bad_tanks(this.state.files, filenumber, this.state.files[filenumber].tank) 
        this.setState(prevState => ({
            ...prevState,
            files: {
                ...prevState.files,
                [filenumber]: {
                    ...prevState.files[filenumber],
                    volume: event.target.value
                }
            },
            bad_tanks: bad_tanks
        }))
    }

    handleFileSelect(event, filenumber) {
        event.preventDefault()
        const f = event.target.files[0]
        this.setState(prevState => ({
            ...prevState,
            files: {
                ...prevState.files,
                [filenumber]: { 
                    ...prevState.files[filenumber],
                    img: f,
                }
            }
        }))
    }

    async handleSubmit(event) { 
        event.preventDefault()
        const file_keys = Object.keys(this.state.files)
        for (let i=0; i<file_keys.length; i++) {
            var formData = new FormData();
            let current_file = this.state.files[file_keys[i]];
            formData.append("file", current_file.img)
            formData.append("volume", current_file.volume)

            this.setState(prevState => ({
                ...prevState,
                files: {
                    ...prevState.files,
                    [file_keys[i]]: { 
                        ...prevState.files[file_keys[i]],
                        pcv: 'loading...',
                    }
                }
            }))

            //const { data, error } = useSWR(`/api/view/${this.state.run}/${this.state.files[file_keys[i]].tank}`, fetcher)
            axios({
                method: 'post',
                url: `/api/upload/${this.state.run}/${current_file.tank}`,
                timeout: 5000,
                data: formData,
            })
            .then((response) => {
                axios({
                    method: 'get',
                    url: `/api/view/${this.state.run}/${current_file.tank}`,
                    timeout: 5000,
                })
                .then((r) => {
                    //console.log(r)
                    this.setState(prevState => ({
                            ...prevState,
                            files: {
                                ...prevState.files,
                                [file_keys[i]]: { 
                                    ...prevState.files[file_keys[i]],
                                    pcv: r.data.rows[r.data.rows.length-1].pcv_value,
                                }
                            }
                        }))
                    })
                .catch((e) => {
                    console.error(e.message)
                })
            })
            .catch(e => {
                console.error(e.message)
            })
        }
    }

    render() {
        console.log(this.state)
        var file_keys = Object.keys(this.state.files)

        if ((this.state.bad_tanks.length > 0) || (this.state.run == "") || (Object.keys(this.state.files).length == 0) || (
            Object.keys(this.state.files).reduce((hasTank, fileKey) => {
                return (hasTank || (typeof this.state.files[fileKey].tank == "undefined"))
            }, false)
        )) {
            var submitButton=<button onClick={(e) => this.handleSubmit(e)} disabled className="flex flex-initial place-self-center bg-gray-600 m-0 p-6 rounded-t-md 
                        border-4 border-red-600 cursor-not-allowed focus:outline-none font-medium hover:ring hover:ring-gray-300 active:bg-indigo-300">Submit</button>
        } else {
            var submitButton=<button onClick={(e) => this.handleSubmit(e)} className="flex flex-initial place-self-center bg-gray-600 m-0 p-6 rounded-t-md 
                        border-4 border-green-600 font-medium focus:outline-none hover:ring hover:ring-gray-300 active:bg-indigo-300">Submit</button>
        }

        var filerows = [];
        for (let i=0; i<file_keys.length+1; i++) {
            filerows.push(<input type="file" key={i} accept="image/*" onChange={(e) => this.handleFileSelect(e, i)} className="flex flex-initial h-10 "/>)
        }

        var tankrows = []
        for (let i=0; i<file_keys.length; i++) {
            var box_type = "flex flex-initial place-self-center w-16 h-7 bg-gray-400 border-2 rounded-md focus:outline-none ";
            if (typeof this.state.files[i].tank == "undefined" || this.state.bad_tanks.includes(this.state.files[i].tank)) {
                box_type = box_type.concat("border-red-600")
            } else {
                box_type = box_type.concat("border-gray-100")
            }
            tankrows.push(
                <div key={i} className="flex flex-rows-1 h-10 place-content-evenly w-full">
                    <div className="flex flex-row-1 flex-wrap place-content-center">
                        <label htmlFor="tank" className="flex flex-initial place-items-center mr-1">Tank No. </label>
                        <input type="number" name="tank" id="tank" value={this.state.files[i].tank} onChange={(e) => this.handleTankSelect(e, i)} className={box_type}/>
                    </div>
                    <div className="flex flex-row-1 flex-wrap place-content-center">
                        <label htmlFor="volume" className="flex flex-initial place-items-center place-content-center p-1 h-full">Volume</label>
                        <input type="number" name="volume" id="volume" value={this.state.files[i].volume} onChange={(ee) => this.handleVolumeSelect(ee, i)} className={box_type}/>
                        <p className="place-self-center m-0.5">ul</p>
                        <div className="flex p-1 place-items-center place-content-center h-full ">
                            <button onClick={(e) => this.setVolumeGlobal(e, this.state.files[i].volume)} className="bg-gray-600 rounded-sm pl-2 pr-2 text-l 
                            text-gray-200 focus:outline-none">Set All</button>
                        </div>
                    </div>
                </div>
            )
        }

        var resultrows = []
        for (let i=0; i<file_keys.length; i++) {
            if (typeof this.state.files[file_keys[i]].pcv != 'undefined') {
                resultrows.push(<p key={i} className="flex flex-initial place-self-center h-10 ">{this.state.files[file_keys[i]].pcv}</p>)
            } else {
                resultrows.push(<p key={i} className="flex flex-initial place-self-center h-10 ">X</p>)
            }
        }

        let imgs = Object.keys(this.state.files).map((imgkey) => <img key={imgkey} src={this.state.files[imgkey].img} />)
        /* console.log(imgs) */

        return (
          <div className="grid grid-cols-1 w-screen h-screen bg-gray-400">
            <form className="grid grid-cols-3 w-full h-full">
                <div className="flex flex-col flex-nowrap gap-y-5">
                    <div className="flex flex-rows-1 place-content-center m-5 mt-8">
                        <label className="flex flex-inital text-2xl pr-4 font-semibold">Enter Run</label>
                        <input type="text" id="run" value={this.state.run} onChange={(e) => this.handleRunSelect(e)} 
                            className="flex flex-initial w-20 bg-gray-400 border-2 border-gray-700 rounded-lg focus:outline-none"/>
                    </div>
                    <div className="flex flex-col flex-grow gap-y-5 ">{tankrows}</div>
                    <button onClick={(e) => this.setTankNumbers(e)} className="flex flex-initial place-self-center bg-gray-600 m-0 p-6 rounded-t-md 
                        border-2 border-gray-200 font-medium active:bg-red-600 focus:outline-none">Auto</button>
                </div>

                <div className="flex flex-col flex-nowrap gap-y-5">
                    <label className="flex flex-inital m-5 mt-8 place-self-center text-2xl font-semibold">Select PCV image</label>
                    <div className="flex flex-col flex-grow gap-y-5 ">{filerows}</div>
                    {submitButton}
                </div>

                <div className="flex flex-col flex-nowrap gap-y-5">
                    <label className="flex flex-inital m-5 mt-8 place-self-center text-2xl font-semibold">Results</label>
                    <div className="flex flex-col flex-grow gap-y-5 ">{resultrows}</div>
                    <Link href="/"><div className="flex flex-shrink place-self-center bg-gray-600 m-0 p-6 rounded-t-md cursor-pointer
                        border-2 border-gray-200 font-medium active:bg-red-600 focus:outline-none">Back</div></Link>
                </div>
            </form>
          </div>
        )}
}