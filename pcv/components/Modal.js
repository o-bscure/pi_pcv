import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

export function Modal({ show, onClose, children }) {
	const [isBrowser, setIsBrowser] = useState(false);

	useEffect(() => {
		setIsBrowser(true);
	}, []);

	const handleCloseClick = (e) => {
		e.preventDefault();
		onClose()
	}

	const modalContent = show ? (
		<div className="flex absolute w-full h-full justify-center items-center">
		<div className="flex bg-blue-100 w-1/2 h-1/2 p-10 rounded-md items-center justify-center">
			<a href="#" onClick={handleCloseClick} className="flex justify-items-end text-3xl">
			x
			</a>
			{children}
		</div>
		</div>
	) : null;

	if (isBrowser) {
		return ReactDOM.createPortal(
			modalContent,
			document.getElementById("modal-root")
		);
	} else {
		return null;
	}
}
