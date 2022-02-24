import { useExcelDownloder } from 'react-xls';

export function ExportButton({ filename, data, blocked }) {
	const { ExcelDownloder, Type } = useExcelDownloder();
	const download_data = {Data: data}
	if (blocked) {
		return(<button disabled
		className="flex flex-initial place-self-center bg-white m-3 p-6 rounded-t-md font-medium border-2 border-red-500 cursor-not-allowed">
		Download</button>) 
	} else {
		return(<ExcelDownloder data={download_data} filename={filename} type={Type.Button} 
		className="flex flex-initial place-self-center bg-white m-3 p-6 rounded-t-md font-medium border-2 border-green-500">
		Download</ExcelDownloder>)
	}

}

