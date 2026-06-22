// Excel read helper - uses ExcelJS
const ExcelJS = require('exceljs');

async function readWorkbook(filePath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];
  if (!ws) throw new Error('Workbook has no worksheets');

  const rows = [];
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const values = row.values; // 1-indexed; values[0] is undefined
    const obj = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const header = ws.getRow(1).getCell(colNumber).value;
      const key = header ? String(header).trim() : `col${colNumber}`;
      obj[key] = cell.value;
    });
    if (rowNumber > 1) rows.push(obj);
  });

  return rows;
}

module.exports = { readWorkbook };
