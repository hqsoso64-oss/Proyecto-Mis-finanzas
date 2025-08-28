
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index');
}

function registrarIngreso(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Ingresos_Diarios');
  const monto = parseFloat(data.monto);
  sheet.appendRow([new Date(), monto, data.fuente, data.comentarios]);
  return distribuirIngresoInteligente(monto);
}

function registrarGasto(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Gastos_Diarios');
  const monto = parseFloat(data.monto);
  sheet.appendRow([new Date(), monto, data.categoria, data.comentarios]);
}

function distribuirIngresoInteligente(monto) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Distribucion');
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const metaIndex = headers.indexOf('Meta');
  const montoReqIndex = headers.indexOf('Monto_Requerido');
  const priorIndex = headers.indexOf('Prioridad');
  const porcIndex = headers.indexOf('Porcentaje_Diario');
  const ahorroIndex = headers.indexOf('Ahorro_Acumulado');
  const rows = data.slice(1).map((row, i) => ({
    row: i + 2,
    meta: row[metaIndex],
    req: parseFloat(row[montoReqIndex]) || 0,
    prior: parseFloat(row[priorIndex]) || 0,
    porc: parseFloat(row[porcIndex]) || 0,
    acum: parseFloat(row[ahorroIndex]) || 0
  }));
  rows.sort((a, b) => b.prior - a.prior);
  const distribucionPlan = [];
  let unused = 0;
  for (let row of rows) {
    let montoAhorrar = monto * row.porc + unused;
    const needed = row.req > 0 ? row.req - row.acum : Infinity;
    if (needed > 0) {
      montoAhorrar = Math.min(montoAhorrar, needed);
      row.acum += montoAhorrar;
      unused = (monto * row.porc + unused) - montoAhorrar;
    } else {
      montoAhorrar = 0;
      unused += monto * row.porc;
    }
    distribucionPlan.push({ meta: row.meta, monto: montoAhorrar });
    sheet.getRange(row.row, ahorroIndex + 1).setValue(row.acum);
  }
  return distribucionPlan;
}

function getUltimasCuentasDidi() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cuentas_Didi');
  if (!sheet || sheet.getLastRow() < 2) return null;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => h.toString().trim());
  const expectedHeaders = ['Fecha', 'Saldo_Nequi_Tarjeta', 'Saldo_Nequi_Bolsillo', 'Deuda_Didi', 'Efectivo_Billetera'];
  if (!validateCuentasDidiHeaders(headers, expectedHeaders)) {
    return null;
  }

  const lastRow = sheet.getLastRow();
  const values = sheet.getRange(lastRow, 1, 1, headers.length).getValues()[0];
  const data = {};
  headers.forEach((header, index) => {
    if (header === 'Fecha') {
      data[header] = formatDateValue(values[index]);
    } else {
      data[header] = parseFloat(values[index]) || 0;
    }
  });

  return data;
}

function validateCuentasDidiHeaders(headers, expected) {
  return headers.length === expected.length && headers.every((h, i) => h === expected[i]);
}

function procesarCuentasDidi(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cuentas_Didi');
  if (!sheet) throw new Error('Hoja Cuentas_Didi no encontrada.');
  sheet.appendRow([
    new Date(),
    parseFloat(data.saldoNequiTarjeta),
    parseFloat(data.saldoNequiBolsillo),
    parseFloat(data.deudaDidi),
    parseFloat(data.efectivoBilletera)
  ]);
}

function getTotals() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ingresosSheet = ss.getSheetByName('Ingresos_Diarios');
  const gastosSheet = ss.getSheetByName('Gastos_Diarios');
  const totalIngresos = ingresosSheet.getRange('B:B').getValues().flat().slice(1).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
  const totalGastos = gastosSheet.getRange('B:B').getValues().flat().slice(1).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
  return { totalIngresos, totalGastos };
}

function getGastosByCategory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const gastosSheet = ss.getSheetByName('Gastos_Diarios');
  const data = gastosSheet.getDataRange().getValues();
  const headers = data.shift();
  const categoryIndex = headers.indexOf('Categoría');
  const amountIndex = headers.indexOf('Monto');
  if (categoryIndex === -1 || amountIndex === -1) throw new Error("Columnas 'Categoría' o 'Monto' no encontradas.");
  const gastosByCategory = {};
  data.forEach(row => {
    const category = row[categoryIndex];
    const amount = row[amountIndex];
    if (category && typeof amount === 'number') {
      gastosByCategory[category] = (gastosByCategory[category] || 0) + amount;
    }
  });
  const chartData = [['Categoría', 'Monto']];
  for (const category in gastosByCategory) chartData.push([category, gastosByCategory[category]]);
  return chartData;
}

function getDistribucionData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Distribucion');
  return sheet.getDataRange().getValues();
}

function getDeudasData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Deudas');
  const data = sheet.getDataRange().getValues();
  if (data.length > 1) return data.slice(1);
  return [];
}

function registrarPagoDeuda(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Deudas');
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const deudaIndex = headers.indexOf('Deuda');
  const montoPagadoIndex = headers.indexOf('Monto_Pagado');
  const montoPendienteIndex = headers.indexOf('Monto_Pendiente');
  const fechaPagoIndex = headers.indexOf('Fecha_Último_Pago');
  if (deudaIndex === -1 || montoPagadoIndex === -1 || montoPendienteIndex === -1 || fechaPagoIndex === -1) {
    throw new Error("Faltan las columnas de deuda requeridas.");
  }
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][deudaIndex] == data.deuda) {
      const montoPago = parseFloat(data.monto);
      const montoPagadoActual = parseFloat(allData[i][montoPagadoIndex] || 0);
      const montoPendienteActual = parseFloat(allData[i][montoPendienteIndex] || 0);
      sheet.getRange(i + 1, montoPagadoIndex + 1).setValue(montoPagadoActual + montoPago);
      sheet.getRange(i + 1, montoPendienteIndex + 1).setValue(montoPendienteActual - montoPago);
      sheet.getRange(i + 1, fechaPagoIndex + 1).setValue(new Date());
      break;
    }
  }
}

function formatDateValue(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  } else if (typeof value === 'number') {
    const date = new Date((value - 25569) * 86400 * 1000);
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  }
  return 'N/A';
}
