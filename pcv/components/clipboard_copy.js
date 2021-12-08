import { useState } from 'react'
export function ClipboardCopy({ copyText }) {
	const [isCopied, setIsCopied] = useState(false);

	async function copyTextToClipboard(text) {
		if ('clipboard' in navigator) {
			return await navigator.clipboard.writeText(text);
		} else {
			return document.execCommand('copy', true, text);
		}
	}

	const handleCopyClick = (e) => {
		e.preventDefault()
		copyTextToClipboard(copyText)
		.then(() => {
			setIsCopied(true);
			setTimeout(() => {
				setIsCopied(false);
			}, 1500);
		})
		.catch((err) => {
			console.log(err);
		})
	}

	return (
		<div className="flex place-self-center">
			<input type="text" value={copyText} className="w-0 h-0" readOnly />
			<button onClick= {(e) => handleCopyClick(e)}>
				<span>{isCopied ? 'Copied!' : 'Copy'}</span>
			</button>
		</div>
	
	);
}

