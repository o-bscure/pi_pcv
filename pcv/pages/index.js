import React from 'react'
import Link from 'next/link'
import Head from 'next/head'
import axios from 'axios';

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            run: "",
            tank: 1,
            volume: undefined,
            isSet: undefined 
        }

        this.handleRunSelect = this.handleRunSelect.bind(this)
        this.handleTankSelect = this.handleTankSelect.bind(this)
        this.handleVolumeSelect = this.handleVolumeSelect.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleRunSelect(event) {
        event.preventDefault()
        this.setState(prevState => ({
            run: event.target.value, 
            isSet: undefined
        }))
    }

    handleTankSelect(event) {
        event.preventDefault()
        this.setState(prevState => ({
            tank: Number(event.target.value),
            isSet: undefined
        }))
    }

    handleVolumeSelect(event) {
        event.preventDefault()
        this.setState(prevState => ({
            volume: Number(event.target.value),
            isSet: undefined
        }))
    }

    async handleSubmit(event) {
        event.preventDefault()
        axios({
          method: 'post',
          url: '/api/remote',
          timeout: 5000,
          data: {
              run: this.state.run,
              tank: this.state.tank,
              volume: this.state.volume
          }
        })
        .then((r) => { 
            this.setState((prevState) => ({
                isSet: true
            }))
        })
        .catch((e) => {
            console.error(e)
            this.setState((prevState) => ({
                isSet: false
            }))
        })
    }


    render() {
        console.log(this.state)
	
	var bad_input = /(^\s*$)|(^\s+)/gi

        if (this.state.isSet == undefined ) {
            var buttonType = "flex place-self-center place-content-center place-items-center bg-gray-600 rounded-md w-7/12 h-12 border-2 font-medium focus:outline-none "
            buttonType += "border-gray-100 "
        } else if (this.state.isSet == true) {
            var buttonType = "flex place-self-center place-content-center place-items-center bg-gray-600 rounded-md w-7/12 h-12 border-2 font-medium focus:outline-none "
            buttonType += "border-green-600 "
        } else {
            var buttonType = "flex place-self-center place-content-center place-items-center bg-gray-600 rounded-md w-7/12 h-12 border-2 font-medium focus:outline-none "
            buttonType += "border-red-400 "
        }
        if (!this.state.run || bad_input.test(this.state.run) || (this.state.tank == undefined) || (this.state.tank < 1) || (this.state.volume == undefined) || (this.state.volume < 1)) {
            buttonType += "cursor-not-allowed "
            var button_remote = <button disabled onClick={(e) => this.handleSubmit(e)} className={buttonType}>Set Remote</button>
        } else {
            buttonType += "hover:border-gray-800 "
            var button_remote = <button onClick={(e) => this.handleSubmit(e)} className={buttonType}>Set Remote</button>
        }
        return (
            <div className="grid grid-rows-2 h-screen w-screen bg-gray-400 place-items-center">
                <h1 className="font-sans font-semibold text-5xl">PCV VIEWER</h1>
                <div className="grid grid-cols-4 grid-rows-2 w-full h-full place-items-center">
                    <span/>
                    <Link href="/upload">
                        <button className="rounded-lg border-4 border-indigo-700 p-5 w-40 text-3xl bg-gray-800 text-gray-300 
                        focus:outline-none hover:border-green-500"><p>Upload</p></button>
                    </Link>
                    <Link href="/view">
                        <button className="rounded-lg border-4 border-red-700 p-5 w-40 text-3xl bg-gray-800 text-gray-300
                        focus:outline-none hover:border-yellow-500 hover:bg-gray-800"><p>View</p></button>
                    </Link>
                    <span/>
                    <span/>
                    <div className="col-span-2 flex place-content-center flex-wrap w-full h-full">
                        <div className="grid grid-cols-1 gap-y-2 w-full">
                            <div className="flex w-full place-content-center">
                                <label className="flex flex-inital text-xl mr-1 place-items-center font-semibold">Run</label>
                                <input type="text" id="run" value={this.state.run} onChange={(e) => this.handleRunSelect(e)} 
                                    className="flex flex-initial place-self-center w-16 h-7 bg-gray-400 border-2 border-gray-100 rounded-md focus:outline-none"/>

                                <label className="flex flex-initial text-xl ml-2 mr-1 place-items-center font-semibold">Tank</label>
                                <input type="number" value={this.state.tank} onChange={(e) => this.handleTankSelect(e)} 
                                    className={"flex flex-initial place-self-center w-10 h-7 bg-gray-400 border-2 border-gray-100 rounded-md focus:outline-none"}/>
                                <label className="flex flex-initial text-xl ml-2 mr-1 place-items-center font-semibold">Volume</label>
                                <input type="number" value={this.state.volume} onChange={(e) => this.handleVolumeSelect(e)} 
                                    className={"flex flex-initial place-self-center w-16 h-7 bg-gray-400 border-2 border-gray-100 rounded-md focus:outline-none"}/>
                                <p className="place-self-center">ul</p>
                            </div>

                            {button_remote}
                        </div>
                    </div>
                    <span/>
                </div>
            </div>
        )
    }
}
