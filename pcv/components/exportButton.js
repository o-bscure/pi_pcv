import { useExcelDownloder } from 'react-xls'
export function exportButton() {
	const { ExcelDownloader, Type } = useExcelDownloder();
	const data_to_export = {
				Data1: [
						{ row1: 'word11', row2: 'word21' },
						{ row1: 'word12', row2: 'word22' },
						{ row1: 'word13', row2: 'word23' },
					]
				}
	const exportButton = <ExcelDownloader data={data_to_export} filename={'book'} type={Type.Button}
	    		className="flex flex-initial place-self-center bg-gray-600 m-3 p-6 rounded-t-md font-medium border-2 border-gray-800">download</ExcelDownloader>
	return (
		<ExcelDownloader data={data_to_export} filename={'book'} type={Type.Button}
	    		className="flex flex-initial place-self-center bg-gray-600 m-3 p-6 rounded-t-md font-medium border-2 border-gray-800">download</ExcelDownloader>
	);
}

