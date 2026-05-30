import * as XLSX from 'xlsx';

export type XlsxRow = (string | number | null | undefined)[];

export function downloadXlsx(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: XlsxRow[],
) {
  const data = [headers, ...rows.map((row) => row.map((cell) => (cell == null ? '' : cell)))];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}
