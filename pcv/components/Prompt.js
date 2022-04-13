import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

export function Prompt({ show, onClose, func, str }) {
	const [isBrowser, setIsBrowser] = useState(false);

	useEffect(() => {
		setIsBrowser(true);
	}, []);

	const handleCloseClick = (e) => {
		e.preventDefault();
		onClose()
	}

	const handleYes = (e) => {
		e.preventDefault();
		func(e)
		handleCloseClick(e)
	}

	const modalContent = show ? (
		<div className="flex absolute w-full h-full justify-center items-center">
		<div className="flex flex-col bg-gray-400 h-1/2 p-10 rounded-md items-center justify-center border-2 border-black">
			<div className="grid grid-rows-2 w-full h-full ">
				<div className="flex place-self-center text-2xl">{str}</div>
				<div className="flex flex-row place-content-center gap-x-6">
					<button onClick={handleYes} className="p-2 m-2 text-lg text-white bg-black" >YES</button>
					<button onClick={handleCloseClick} className="p-2 m-2 text-lg text-white bg-black" >NO</button>
				</div>
			</div>
			<div className="flex items-center justify-center ">CAUTION: This is permanent</div>
		</div>
		</div>
	) : null;

	if (isBrowser) {
		return ReactDOM.createPortal(
			modalContent,
			document.getElementById("prompt-root")
		);
	} else {
		return null;
	}
}
