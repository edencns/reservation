import * as XLSX from 'xlsx';

export interface ExcelSheet {
  name: string;
  data: Record<string, string | number | boolean | null | undefined>[];
}

export function exportToExcel(filename: string, sheets: ExcelSheet[]) {
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheet.data);
    // 컬럼 너비 자동 조정
    if (sheet.data.length > 0) {
      const keys = Object.keys(sheet.data[0]);
      ws['!cols'] = keys.map(k => ({
        wch: Math.max(
          k.length * 2,
          ...sheet.data.map(row => String(row[k] ?? '').length),
          10
        ),
      }));
    }
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  }
  XLSX.writeFile(wb, `${filename}_${new Date().toLocaleDateString('ko-KR').replace(/\. /g, '-').replace('.', '')}.xlsx`);
}
