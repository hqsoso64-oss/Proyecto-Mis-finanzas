# 🚀 Guía de Instalación - Gestor Financiero Pro V2.1

¡Bienvenido! Esta guía te mostrará paso a paso cómo configurar el **Gestor Financiero Pro** en tu cuenta de Google.

---

## 📋 Requisitos Previos

- Una cuenta de **Google** activa
- Acceso a [Google Sheets](https://sheets.google.com)
- Este repositorio descargado o copiado localmente

---

## 🔧 Instalación Rápida (5 minutos)

### **Paso 1: Crear un nuevo Google Sheet**

1. Ve a [sheets.google.com](https://sheets.google.com)
2. Haz clic en el botón **"+ Crear"** (Hoja de cálculo en blanco)
3. Dale un nombre a tu hoja: `Mis Finanzas Pro` (o el que prefieras)

### **Paso 2: Crear las hojas necesarias**

Tu Sheet debe tener estas 5 hojas (pestañas):

| Nombre | Descripción |
|--------|-------------|
| **Ingresos_Diarios** | Registra todos tus ingresos |
| **Gastos_Diarios** | Registra todos tus gastos |
| **Distribucion** | Define tus metas de ahorro |
| **Deudas** | Controla tus deudas |
| **Cuentas_Didi** | Saldos de tus cuentas |

**Cómo crearlas:**
1. En tu Sheet, haz clic derecho en la pestaña "Hoja1"
2. Selecciona **"Insertar 1 a la izquierda"**
3. Nombra la nueva hoja
4. Repite hasta tener las 5 hojas

### **Paso 3: Configurar encabezados en cada hoja**

#### 📥 **Hoja: Ingresos_Diarios**
```
Columna A: Fecha
Columna B: Monto
Columna C: Fuente
Columna D: Comentarios
```

#### 📤 **Hoja: Gastos_Diarios**
```
Columna A: Fecha
Columna B: Monto
Columna C: Categoría
Columna D: Comentarios
```

#### 🎯 **Hoja: Distribucion**
```
Columna A: Meta
Columna B: Monto_Requerido
Columna C: Prioridad
Columna D: Porcentaje_Diario
Columna E: Ahorro_Acumulado
```

#### 💳 **Hoja: Deudas**
```
Columna A: Deuda
Columna B: Monto_Inicial
Columna C: Monto_Pagado
Columna D: Monto_Pendiente
Columna E: Fecha_Último_Pago
```

#### 🏦 **Hoja: Cuentas_Didi**
```
Columna A: Fecha
Columna B: Saldo_Nequi_Tarjeta
Columna C: Saldo_Nequi_Bolsillo
Columna D: Deuda_Didi
Columna E: Efectivo_Billetera
```

---

### **Paso 4: Agregar el código (Google Apps Script)**

1. En tu Sheet, ve a **Extensiones** → **Apps Script**
2. Se abrirá una nueva pestaña del editor de Google Apps Script
3. **Borra el código por defecto** que tiene `function myFunction() { }`
4. **Copia y pega el contenido de `Código.gs`** del repositorio
5. **Guarda** el archivo (Ctrl+S o Cmd+S)

### **Paso 5: Crear la interfaz (HTML)**

1. En el editor de Apps Script, haz clic en **"+"** (Crear archivo)
2. Selecciona **"HTML"**
3. Nombra el archivo: `Index`
4. **Copia y pega el contenido de `Index.Html`** del repositorio
5. **Guarda** el archivo

---

### **Paso 6: Desplegar como aplicación web**

1. En el editor de Apps Script, haz clic en **"Implementar"** (botón azul arriba a la derecha)
2. Selecciona **"Nueva implementación"** (o **"Implementar"**)
3. En la ventana que aparece:
   - **Tipo:** Selecciona **"Aplicación web"**
   - **Ejecutar como:** Tu cuenta (automático)
   - **Quién tiene acceso:** **"Solo tú"** (o el dominio si usas empresa)
4. Haz clic en **"Implementar"**
5. **Autoriza** la aplicación (Google pedirá permisos)
6. Copia el **enlace web** que aparece
7. ¡Listo! Ese es tu link de acceso 🎉

---

## ✅ Verificar que funciona

1. Abre el enlace web que copiaste
2. Deberías ver la interfaz del **Gestor Financiero Pro**
3. Ve a la pestaña **"Registros"** y prueba agregar:
   - Un ingreso de ejemplo
   - Un gasto de ejemplo
4. Regresa a tu Google Sheet y verifica que los datos aparecen en `Ingresos_Diarios` y `Gastos_Diarios`
5. ¡Si ves los datos, todo está funcionando! ✨

---

## 🔐 Preguntas de Seguridad Frecuentes

### **P: ¿Es seguro usar esta aplicación?**
**R:** Sí. Google maneja la autenticación automáticamente. Tu datos quedan en tu cuenta de Google, completamente privada.

### **P: ¿Necesito agregar API Keys o credenciales?**
**R:** No. Google Apps Script se vincula automáticamente a tu Sheet.

### **P: ¿Pueden otros ver mis datos?**
**R:** No, a menos que compartas el Sheet. El enlace de la aplicación web solo es accesible por ti (si seleccionaste "Solo tú" en el paso 6).

### **P: ¿Puedo compartir la app con mi familia?**
**R:** Sí, pero tienes dos opciones:
- Compartir el Sheet y darles acceso a ellos
- Crear una nueva implementación para cada persona con su propio Sheet

---

## 🐛 Solución de problemas

### **Problema: "Función no encontrada"**
- Verifica que copiaste TODO el contenido de `Código.gs`
- Guarda el archivo (Ctrl+S)
- Recarga la página web

### **Problema: Los datos no se guardan**
- Verifica que los nombres de las hojas sean exactos (sin espacios extra)
- Comprueba que los encabezados sean correctos
- Abre la consola (F12) para ver errores

### **Problema: "No tienes permiso"**
- En Apps Script, ve a **Configuración** → **Ejecutar como:**
- Asegúrate de que sea tu cuenta

### **Problema: La interfaz se ve mal**
- Limpia el caché del navegador (Ctrl+Shift+Supr)
- Prueba en otro navegador

---

## 🎨 Personalización (Opcional)

### Cambiar tus metas de ahorro

Ve a la hoja **"Distribucion"** y agrega tus metas:

```
Meta                     | Monto_Requerido | Prioridad | Porcentaje_Diario
Fondo de emergencia      | 3,000,000      | 1         | 0.40
Vacaciones              | 2,000,000      | 2         | 0.30
Inversiones             | 1,500,000      | 3         | 0.20
Lujos/Entretenimiento   | 1,000,000      | 4         | 0.10
```

---

## 📚 Características principales

✅ **Dashboard en tiempo real** - Ve tus ingresos, gastos y balance  
✅ **Gráficos de gastos** - Visualiza dónde va tu dinero  
✅ **Coach Financiero IA** - Análisis inteligente de tu situación  
✅ **Gestión de deudas** - Controla y registra pagos  
✅ **Metas personalizadas** - Define y monitorea tu ahorro  
✅ **Interfaz Dark Mode** - Diseño moderno y profesional  

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la sección de **"Solución de problemas"** arriba
2. Abre un [Issue en GitHub](https://github.com/hqsoso64-oss/Proyecto-Mis-finanzas/issues)
3. Verifica que hayas seguido todos los pasos exactamente

---

## 🎓 Próximos pasos

Después de configurar:
- Lee el archivo `README.md` para entender todas las características
- Prueba todas las pestañas (Resumen, Registros, Metas, Deudas, Cuentas)
- Agrega tus datos reales y empieza a gestionar tus finanzas

---

**¡Disfruta tu Gestor Financiero Pro! 🚀💰**

*Última actualización: Enero 2026*
