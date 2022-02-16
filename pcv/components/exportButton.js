import { useExcelDownloder } from 'react-xls';

export function ExportButton({ filename, data }) {
	const { ExcelDownloder, Type } = useExcelDownloder();
	const download_data = {Data: data}
	return (
		<ExcelDownloder data={download_data} filename={filename} type={Type.Button} 
		className="flex flex-initial place-self-center bg-gray-600 m-3 p-6 rounded-t-md font-medium border-2 border-gray-200">
		Download</ExcelDownloder>
	);
}

