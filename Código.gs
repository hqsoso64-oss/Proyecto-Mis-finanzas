
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
  const dataRange = sheet.getDataRange();
  const data = dataRange.getValues();
  if (data.length < 2) return [];
  
  const headers = data[0];
  const metaIndex = headers.indexOf('Meta');
  const montoReqIndex = headers.indexOf('Monto_Requerido');
  const priorIndex = headers.indexOf('Prioridad');
  const porcIndex = headers.indexOf('Porcentaje_Diario');
  const ahorroIndex = headers.indexOf('Ahorro_Acumulado');
  
  // Mapear filas preservando indice original para escritura batch
  const rows = data.slice(1).map((row, i) => ({
    originalIndex: i,
    rowNumber: i + 2,
    meta: row[metaIndex],
    req: parseFloat(row[montoReqIndex]) || 0,
    prior: parseFloat(row[priorIndex]) || 0,
    porc: parseFloat(row[porcIndex]) || 0,
    acum: parseFloat(row[ahorroIndex]) || 0
  }));
  
  // Ordenar para la lógica de distribución
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
  }
  
  // Preparar escritura masiva (Batch Update)
  const ahorroValues = data.slice(1).map(r => [r[ahorroIndex]]); // Copia inicial
  
  rows.forEach(r => {
    ahorroValues[r.originalIndex][0] = r.acum; 
  });
  
  // Escribir todo de una sola vez
  if (ahorroValues.length > 0) {
    sheet.getRange(2, ahorroIndex + 1, ahorroValues.length, 1).setValues(ahorroValues);
  }
  
  return distribucionPlan;
}

function getUltimasCuentasDidi() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cuentas_Didi');
  // Valor por defecto seguro para Frontend
  const defaultData = {
    'Fecha': 'No hay registros',
    'Saldo_Nequi_Tarjeta': 0,
    'Saldo_Nequi_Bolsillo': 0,
    'Deuda_Didi': 0,
    'Efectivo_Billetera': 0
  };

  if (!sheet || sheet.getLastRow() < 2) return defaultData;

  const allValues = sheet.getDataRange().getValues();
  // Headers fila 1 (index 0)
  const headers = allValues[0].map(h => h.toString().trim().toLowerCase());
  
  // Mapeo de nombres de columna flexibles (case-insensitive)
  const mapHeaders = {
    'Saldo_Nequi_Tarjeta': ['saldo_nequi_tarjeta', 'saldo nequi tarjeta', 'tarjeta'],
    'Saldo_Nequi_Bolsillo': ['saldo_nequi_bolsillo', 'saldo nequi bolsillo', 'bolsillo'],
    'Deuda_Didi': ['deuda_didi', 'deuda didi', 'deuda'],
    'Efectivo_Billetera': ['efectivo_billetera', 'efectivo', 'billetera']
  };

  // Obtener última fila con datos
  const lastRowValues = allValues[allValues.length - 1]; // La última fila real de datos
  
  // Buscar índice de fecha
  const fechaIdx = headers.findIndex(h => h.includes('fecha'));
  // Llenar resultado
  const result = { ...defaultData };
  
  if (fechaIdx !== -1) {
    result['Fecha'] = formatDateValue(lastRowValues[fechaIdx]);
  }

  for (const [key, searchTerms] of Object.entries(mapHeaders)) {
    const idx = headers.findIndex(h => searchTerms.some(term => h.includes(term)));
    if (idx !== -1) {
      const val = parseFloat(lastRowValues[idx]);
      result[key] = isNaN(val) ? 0 : val;
    }
  }

  return result;
}

function procesarCuentasDidi(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Cuentas_Didi');
  if (!sheet) throw new Error('Hoja Cuentas_Didi no encontrada.');
  sheet.appendRow([
    new Date(),
    parseFloat(data.saldoNequiTarjeta) || 0,
    parseFloat(data.saldoNequiBolsillo) || 0,
    parseFloat(data.deudaDidi) || 0,
    parseFloat(data.efectivoBilletera) || 0
  ]);
  SpreadsheetApp.flush(); // Guardar
  return getUltimasCuentasDidi(); // Retornar actualizado inmediatamente
}

// Helper para verificar si una fecha es del mes y año actual
function isCurrentMonth(dateObj) {
  if (!dateObj) return false;
  let d = dateObj;
  // Intentar convertir si no es objeto Date
  if (!(d instanceof Date)) {
    d = new Date(dateObj);
  }
  // Verificar si es fecha válida
  if (isNaN(d.getTime())) return false;
  
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function getTotals() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ingresosSheet = ss.getSheetByName('Ingresos_Diarios');
  const gastosSheet = ss.getSheetByName('Gastos_Diarios');
  
  const getSumCurrentMonth = (sheet) => {
    if (!sheet) return 0;
    const dataRange = sheet.getDataRange();
    const data = dataRange.getValues();
    if (data.length < 2) return 0;
    
    const headers = data[0];
    let montoIndex = headers.indexOf('Monto');
    if (montoIndex === -1) montoIndex = 1; // Fallback a columna 2
    
    return data.slice(1).reduce((sum, row) => {
      const fecha = row[0];
      const monto = row[montoIndex];
      // Solo sumar si es número y del mes actual
      if (typeof monto === 'number' && isCurrentMonth(fecha)) {
        return sum + monto;
      }
      return sum;
    }, 0);
  };

  const totalIngresos = getSumCurrentMonth(ingresosSheet);
  const totalGastos = getSumCurrentMonth(gastosSheet);
  
  return { totalIngresos, totalGastos };
}

function getGastosByCategory() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const gastosSheet = ss.getSheetByName('Gastos_Diarios');
  if (!gastosSheet) return [['Categoría', 'Monto']];
  
  const data = gastosSheet.getDataRange().getValues();
  if (data.length < 2) return [['Categoría', 'Monto']];
  
  const headers = data.shift();
  const categoryIndex = headers.indexOf('Categoría');
  const amountIndex = headers.indexOf('Monto');
  
  // Si no encuentra columnas, intenta usar índices fijos (Col 2 y 3) por seguridad
  const catIdx = categoryIndex > -1 ? categoryIndex : 2;
  const amtIdx = amountIndex > -1 ? amountIndex : 1;
  
  const gastosByCategory = {};
  
  data.forEach(row => {
    const fecha = row[0];
    const category = row[catIdx];
    const amount = row[amtIdx];
    
    if (category && typeof amount === 'number' && isCurrentMonth(fecha)) {
      gastosByCategory[category] = (gastosByCategory[category] || 0) + amount;
    }
  });
  
  const chartData = [['Categoría', 'Monto']];
  for (const category in gastosByCategory) chartData.push([category, gastosByCategory[category]]);
  return chartData;
}

function getDistribucionData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Distribucion');
  if (!sheet) return [];
  return sheet.getDataRange().getValues();
}

function getDeudasData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Deudas');
  if (!sheet) return [];
  
  const lastRow = sheet.getLastRow();
  // Si solo hay encabezados (fila 1) o menos, retornamos vacío
  if (lastRow < 2) return [];

  // SOLUCIÓN CLAVE: Leer solo las primeras 4 columnas (A, B, C, D)
  // Ignoramos la columna E (Fecha) para evitar problemas de formato o rangos desiguales
  // getRange(fila_inicio, col_inicio, num_filas, num_columnas)
  const range = sheet.getRange(2, 1, lastRow - 1, 4); 
  const data = range.getValues();
  
  // Filtro robusto: Asegurar que la primera celda (Nombre Deuda) no esté vacía
  return data.filter(row => row[0] && String(row[0]).trim() !== '');
} 

function registrarPagoDeuda(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Deudas');
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const deudaIndex = headers.indexOf('Deuda');
  const montoPagadoIndex = headers.indexOf('Monto_Pagado');
  const montoPendienteIndex = headers.indexOf('Monto_Pendiente');
  const fechaPagoIndex = headers.indexOf('Fecha_Último_Pago');
  
  if (deudaIndex === -1) throw new Error("Columnas de deuda no encontradas.");
  
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][deudaIndex] == data.deuda) {
      const montoPago = parseFloat(data.monto);
      const montoPagadoActual = parseFloat(allData[i][montoPagadoIndex] || 0);
      const montoPendienteActual = parseFloat(allData[i][montoPendienteIndex] || 0);
      
      // Actualizar celdas
      sheet.getRange(i + 1, montoPagadoIndex + 1).setValue(montoPagadoActual + montoPago);
      sheet.getRange(i + 1, montoPendienteIndex + 1).setValue(montoPendienteActual - montoPago);
      sheet.getRange(i + 1, fechaPagoIndex + 1).setValue(new Date());
      break;
    }
  }
  
  SpreadsheetApp.flush(); // Forzar escritura inmediata
  return getDeudasData(); // Retornar datos frescos al frontend
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

/* =========================================
   🧠 MOTOR DE INTELIGENCIA FINANCIERA (COACH)
   ========================================= */

function analizarSaludFinanciera() {
  try {
    // 1. Recopilar Datos Holísticos
    const totals = getTotals(); // { totalIngresos, totalGastos }
    const gastosRaw = getGastosByCategory(); // [['Cat', $$$], ...]
    const deudas = getDeudasData(); // Lista de deudas
    
    // 2. Procesar Métricas Clave
    const ingreso = totals.totalIngresos || 0;
    const gasto = totals.totalGastos || 0;
    const balance = ingreso - gasto;
    const tasaAhorro = ingreso > 0 ? ((balance / ingreso) * 100) : 0;
    
    // Encontrar categoría de mayor gasto
    let topCategoria = { nombre: 'N/A', monto: 0 };
    if (gastosRaw && gastosRaw.length > 1) {
      const categorias = gastosRaw.slice(1).map(r => ({ nombre: r[0], monto: r[1] }));
      categorias.sort((a, b) => b.monto - a.monto);
      if (categorias.length > 0) topCategoria = categorias[0];
    }

    // Calcular deuda total
    let totalDeuda = 0;
    if (deudas && deudas.length > 0) {
      totalDeuda = deudas.reduce((acc, row) => acc + (parseFloat(row[3]) || 0), 0);
    }

    // 3. Generar "Insight" (El Cerebro)
    let titulo = "";
    let mensaje = "";
    let color = "";
    let acciones = [];

    // ESCENARIO 1: DÉFICIT
    if (balance < 0) {
      titulo = "⚠️ Alerta de Déficit Crítico";
      color = "red";
      const deficitPct = ingreso > 0 ? Math.abs(((gasto/ingreso)-1)*100).toFixed(1) : "100";
      mensaje = `Estás gastando un <strong>${deficitPct}% más</strong> de lo que ingresas. Tu mayor fuga es dinero es <strong>${topCategoria.nombre}</strong> con ${formatMoney(topCategoria.monto)}.`;
      acciones = ["Detén gastos hormiga.", `Reduce ${topCategoria.nombre} a la mitad.`];
    } 
    // ESCENARIO 2: AL LÍMITE
    else if (tasaAhorro < 10) {
      titulo = "⚠️ Zona de Riesgo";
      color = "yellow";
      mensaje = `Solo conservas el <strong>${tasaAhorro.toFixed(1)}%</strong> de tus ingresos. `;
      if (totalDeuda > 0) {
        mensaje += `Con deuda de <strong>${formatMoney(totalDeuda)}</strong>, es peligroso.`;
        acciones = ["Audita suscripciones.", `Abona extra a deuda: ${deudas[0][0]}.`];
      } else {
        mensaje += "Sube el margen al 20%.";
        acciones = ["Define una meta de ahorro automática."];
      }
    } 
    // ESCENARIO 3: SALUDABLE
    else {
      titulo = "🚀 Camino a la Libertad";
      color = "green";
      mensaje = `¡Excelente! Ahorras el <strong>${tasaAhorro.toFixed(1)}%</strong>.`;
      if (totalDeuda > 0) {
        mensaje += " Ataca tus deudas agresivamente.";
        acciones = ["Aplica método 'Bola de Nieve'."];
      } else {
        mensaje += " Pon ese dinero a trabajar.";
        acciones = ["Evalúa CDTs o ETFs."];
      }
    }

    return {
      titulo: titulo,
      mensaje: mensaje,
      color: color,
      acciones: acciones,
      metricas: {
        ahorro: Math.round(tasaAhorro) + "%",
        topCat: topCategoria.nombre,
        deudaTotal: formatMoney(totalDeuda)
      }
    };
  } catch (e) {
    // FALLBACK DE SEGURIDAD
    return {
      titulo: "⚠️ Error de Análisis",
      mensaje: "No hay suficientes datos para generar un diagnóstico. " + e.message,
      color: "red",
      acciones: ["Registra al menos un ingreso y un gasto."],
      metricas: { ahorro: "--", topCat: "--", deudaTotal: "--" }
    };
  }
}

function formatMoney(amount) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
}

// --- NUEVAS FUNCIONES: ANALÍTICA AVANZADA (V3 - Robust) ---

// --- HELPER: ROBUST DATE PARSING (DD/MM/YYYY or Date Object) ---
function parseDateSafe(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  
  // Try parsing string DD/MM/YYYY
  if (typeof value === 'string') {
    const parts = value.split('/');
    if (parts.length === 3) {
       // Assuming DD/MM/YYYY
       return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  }
  return new Date(value); // Fallback
}

// --- NUEVAS FUNCIONES: ANALÍTICA AVANZADA (V4 - Robust Date & Structure) ---

function getDashboardAnalytics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  
  const incomeSheets = sheets.filter(s => {
    const name = s.getName();
    return name === 'Ingresos_Diarios' || name.toLowerCase().includes('ingresos');
  });

  let weeklyData = {}; 
  let monthlyData = {}; 
  let sourceStats = {}; 
  
  let bestDay = { date: '', amount: 0, source: '' };
  
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  const currentYear = now.getFullYear();
  let currentMonthStats = { total: 0, bySource: {} };

  let seenTransactions = new Set();

  incomeSheets.forEach(sheet => {
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return;
    
    const headers = data[0].map(h => String(h).toLowerCase());
    const dateIdx = headers.findIndex(h => h.includes('fecha')) > -1 ? headers.findIndex(h => h.includes('fecha')) : 0;
    const amountIdx = headers.findIndex(h => h.includes('monto')) > -1 ? headers.findIndex(h => h.includes('monto')) : 1;
    const sourceIdx = headers.findIndex(h => h.includes('fuente')) > -1 ? headers.findIndex(h => h.includes('fuente')) : 2;

    data.slice(1).forEach(row => {
      let rawDate = row[dateIdx];
      const amount = parseFloat(row[amountIdx]) || 0;
      // CRITICAL FIX: Remove ALL extra spaces and standardize
      let sourceRaw = row[sourceIdx] ? String(row[sourceIdx]) : 'Otros';
      const source = sourceRaw.trim().replace(/\s+/g, ' '); // Normalize spaces

      // Robust Date Parsing
      const date = parseDateSafe(rawDate);
      if (!date || isNaN(date.getTime()) || amount === 0) return;

      const uniqueID = date.toDateString() + "_" + amount + "_" + source;
      if (seenTransactions.has(uniqueID)) return;
      seenTransactions.add(uniqueID);
      
      const sept2025 = new Date(2025, 8, 1);
      if (date < sept2025) return;

      // FIXED: Use Spanish month names array
      const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const monthKey = monthNames[date.getMonth()] + ' ' + date.getFullYear();
      
      // Week Calculation
      const d = new Date(date);
      const day = d.getDay() || 7;
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - day);
      const year = d.getFullYear();
      const weekNo = Math.ceil(( ( (d - new Date(year, 0, 1)) / 86400000) + 1)/7);
      const weekKey = `${year}-${weekNo}`;

      if (!weeklyData[weekKey]) weeklyData[weekKey] = { amount: 0, year: year, week: weekNo };
      weeklyData[weekKey].amount += amount;

      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + amount;
      
      if (!sourceStats[monthKey]) sourceStats[monthKey] = {};
      sourceStats[monthKey][source] = (sourceStats[monthKey][source] || 0) + amount;

      if (amount > bestDay.amount) {
        bestDay = {
          date: Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd/MM/yyyy'),
          amount: amount,
          source: source
        };
      }

      // Current Month Logic
      if (date.getMonth() === currentMonthIdx && date.getFullYear() === currentYear) {
        currentMonthStats.total += amount;
        currentMonthStats.bySource[source] = (currentMonthStats.bySource[source] || 0) + amount;
        
        // DEBUG: Log Didi AND Caro entries specifically
        if (source.toLowerCase().includes('didi') || source.toLowerCase().includes('caro')) {
          Logger.log(`[DEBUG SOURCE] Source: "${source}" | Amount: ${amount} | Date: ${Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd/MM/yyyy')} | MonthIdx: ${date.getMonth()} vs ${currentMonthIdx}`);
        }
      }
    });
  });

  // Calculate Dates for Weeks (for Tooltip)
  let sortedWeeks = Object.keys(weeklyData).sort().map(k => {
      const w = weeklyData[k];
      const simple = new Date(w.year, 0, 1 + (w.week - 1) * 7); 
      const startStr = Utilities.formatDate(simple, Session.getScriptTimeZone(), 'dd/MM');
      return {
          week: k,
          amount: w.amount,
          label: `Semana ${w.week} (${startStr})`
      };
  });

  // Calculating Bests
  let bestMonth = { name: '', amount: 0 };
  for (const [key, val] of Object.entries(monthlyData)) {
    if (val > bestMonth.amount) bestMonth = { name: key, amount: val };
  }
  
  let globalSources = {};
  for (const month in sourceStats) {
      for(const src in sourceStats[month]) {
          globalSources[src] = (globalSources[src] || 0) + sourceStats[month][src];
      }
  }
  let bestSource = { name: '', amount: 0 };
  for (const [src, amt] of Object.entries(globalSources)) {
      if (amt > bestSource.amount) bestSource = { name: src, amount: amt };
  }

  const currentMonthBreakdown = Object.entries(currentMonthStats.bySource)
    .sort((a, b) => b[1] - a[1])
    .map(([source, amount]) => ({ source, amount }));

  // Ensure 'months' and 'sources' are never null/undefined
  // Format current month in SPANISH
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const currentMonthName = monthNames[currentMonthIdx] + ' ' + currentYear;
  
  // DEBUG: Log current month breakdown
  Logger.log(`=== CURRENT MONTH BREAKDOWN (${currentMonthName}) ===`);
  for (const [src, amt] of Object.entries(currentMonthStats.bySource)) {
    Logger.log(`  ${src}: $${amt.toLocaleString()}`);
  }
  Logger.log(`  TOTAL: $${currentMonthStats.total.toLocaleString()}`);
  
  return {
    history: { 
        weeks: sortedWeeks, 
        months: monthlyData || {}, 
        sources: sourceStats || {} 
    },
    bests: { day: bestDay, month: bestMonth, source: bestSource },
    currentMonth: {
      name: currentMonthName,
      total: currentMonthStats.total,
      breakdown: currentMonthBreakdown
    }
  };
}

// --- NUEVAS FUNCIONES: CRYPTO TRACKER (V4 - Multi-API) ---

function setupCryptoSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Inversiones_BTC');
  if (!sheet) {
    sheet = ss.insertSheet('Inversiones_BTC');
    sheet.appendRow(['Fecha', 'COP_Invertido', 'USD_Tasa_Compra', 'USD_Recibidos', 'BTC_Precio_Compra', 'BTC_Recibidos', 'Notas']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function registrarInversionBTC(data) {
  const sheet = setupCryptoSheet();
  const cop = parseFloat(data.cop);
  const tasaUsd = parseFloat(data.tasaUsd);
  const usdAmount = parseFloat(data.usdAmount) || (cop / tasaUsd);
  const btcPrice = parseFloat(data.btcPrice);
  const btcAmount = parseFloat(data.btcAmount);

  sheet.appendRow([
    new Date(),
    cop,
    tasaUsd,
    usdAmount,
    btcPrice,
    btcAmount,
    data.notas || ''
  ]);
  
  return getCryptoData();
}


function getCryptoData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Inversiones_BTC');
  if (!sheet) return { history: [], summary: { totalCop: 0, totalBtc: 0, currentPriceUsd: 0, currentValueUsd: 0 } };

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return { history: [], summary: { totalCop: 0, totalBtc: 0, currentPriceUsd: 0, currentValueUsd: 0 } };

  // Read data from sheet
  let totalCop = 0;
  let totalBtc = 0;
  const history = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const cop = parseFloat(row[1]) || 0;
    const btc = parseFloat(row[5]) || 0;
    
    if (cop === 0 && btc === 0) continue;
    
    totalCop += cop;
    totalBtc += btc;
    
    history.push({
      date: formatDateValue(row[0]),
      cop: cop,
      btc: btc,
      btcPriceAtBuy: row[4]
    });
  }
  
  history.reverse();

  // === GET CURRENT BTC PRICE IN USD ===
  // === GET CURRENT BTC PRICE IN USD (REAL TIME) ===
  let btcUsd = 0;
  
  // Opción 1: CoinDesk (Muy estable para scripts)
  try {
    const res = UrlFetchApp.fetch('https://api.coindesk.com/v1/bpi/currentprice/USD.json', {muteHttpExceptions: true});
    const json = JSON.parse(res.getContentText());
    if (json && json.bpi && json.bpi.USD) {
      btcUsd = json.bpi.USD.rate_float;
      Logger.log('[API SUCCESS] CoinDesk BTC Price: $' + btcUsd);
    }
  } catch(e) { 
    Logger.log('[API ERROR] CoinDesk failed: ' + e);
  }
  
  // Opción 2: CoinGecko (Respaldo)
  if (btcUsd === 0) {
    try {
      const res = UrlFetchApp.fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {muteHttpExceptions: true});
      const json = JSON.parse(res.getContentText());
      if (json && json.bitcoin && json.bitcoin.usd) {
        btcUsd = json.bitcoin.usd;
        Logger.log('[API SUCCESS] CoinGecko BTC Price: $' + btcUsd);
      }
    } catch(e) { 
      Logger.log('[API ERROR] CoinGecko failed: ' + e);
    }
  }

  // Si todo falla, NO inventar precio. Dejar en 0 para alertar error real.
  if (btcUsd === 0) {
    Logger.log('[CRITICAL] No se pudo obtener precio BTC de ninguna API.');
  }
  
  // === CALCULATION IN USD ===
  const portfolioValueUsd = totalBtc * btcUsd;
  
  // === GET DYNAMIC TRM (USD -> COP) ===
  let TRM = 0;
  try {
    const response = UrlFetchApp.fetch('https://api.exchangerate-api.com/v4/latest/USD', {muteHttpExceptions: true});
    const content = response.getContentText();
    Logger.log('[API RAW TRM] ExchangeRate Response: ' + content.substring(0, 500)); 
    const data = JSON.parse(content);
    if (data && data.rates && data.rates.COP) {
      TRM = data.rates.COP;
      Logger.log('[TRM API] Current USD/COP: $' + TRM);
    }
  } catch (e) {
    Logger.log('[TRM API] Error fetching TRM: ' + e);
  }

  // Fallback TRM if API fails
  if (TRM === 0) {
    TRM = 4200;
    Logger.log('[FALLBACK] Using static TRM: $4200');
  }

  const portfolioValueCop = portfolioValueUsd * TRM;
  
  // Log final values
  Logger.log('=== CRYPTO SUMMARY ===');
  Logger.log('Total BTC: ' + totalBtc);
  Logger.log('BTC Price (USD): $' + btcUsd);
  Logger.log('TRM Used: $' + TRM);
  Logger.log('Portfolio Value (USD): $' + portfolioValueUsd);
  Logger.log('Portfolio Value (COP): $' + portfolioValueCop);

  return {
    history: history,
    summary: {
      totalCop: totalCop,
      totalBtc: totalBtc,
      currentValueUsd: portfolioValueUsd,
      currentValueCop: portfolioValueCop,
      currentPriceUsd: btcUsd, // We keep these for completeness
      currentTRM: TRM          // Sending TRM to frontend might be useful
    }
  };}
