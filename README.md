# 🚀 Gestor Financiero Pro (V3.1 - Enterprise Final Edition)

¡Bienvenido a la evolución definitiva del control financiero! La **versión 3.1** transforma este gestor en una suite de inteligencia de negocios personal, añadiendo analítica de grandes datos (históricos) y seguimiento de inversiones en Criptomonedas de nivel institucional.

![Dashboard Preview](assets/New%20V3/DASBOARD.png)

## ✨ Novedades de la Versión 3.1 (Enterprise)

### 📊 1. Motor de Analítica Histórica (Enterprise Engine)
Ya no estás limitado a ver solo el mes actual. El nuevo motor **Analytics** escanea automáticamente todo tu historial de hojas de cálculo (`Ingresos_Septiembre`, `Ingresos_Octubre`...) para ofrecerte insights poderosos:
- **Inteligencia de Datos:** Algoritmos mejorados para detección de fuentes de ingreso y normalización de datos (ej. "Didi", "didi ").
- **Tendencias Semanales:** Gráfica de barras interactivas para visualizar tu crecimiento semanal.
- **Récords:** Detecta automáticamente tu **Mejor Día**, **Mejor Mes** y **Mejor Fuente** histórica.
- **Desglose en Español:** Soporte nativo completo para meses y formatos de fecha regionales.

### ₿ 2. Crypto Tracker (Multi-API System)
Sistema robusto de seguimiento de inversiones BTC con redundancia triple.
- **Triple Redundancia:** Conexión principal a **Coinbase API**, con respaldos automáticos en **Binance** y Fallback estático. Nunca verás un error de conexión.
- **Portafolio Dual-Currency:** Visualización simultánea de tu portafolio en **USD** (Dólares Globaxes) y su equivalente en **COP** (Pesos Colombianos) en tiempo real, calculado con TRM dinámica.
- **Micro-Precisión:** Seguimiento de hasta 8 decimales para satoshis.
- **Registro de Operaciones:** Interfaz optimizada para registrar compras P2P o Exchange.

![Crypto Dashboard](assets/New%20V3/CRYPTO.png)

### 🧠 3. Coach Financiero & Dark Mode (V3)
- **UI Ultra-Premium:** Interfaz oscura `#050505` con acentos neón y *Glassmorphism*.
- **Semáforo Financiero:** Diagnóstico inmediato de Saludable/Riesgo.
- **Cierres Mensuales:** Resúmenes automáticos al final de cada periodo.

---

## 🚀 Instalación y Uso

Este proyecto funciona sobre **Google Apps Script**.

1. **Configuración del Script:**
   - Abre tu hoja de cálculo en Google Sheets.
   - Ve a `Extensiones` > `Apps Script`.
   - Copia el contenido de `Código.gs`.

2. **Interfaz Web:**
   - Crea un archivo `Index.html` en el editor.
   - Pega el código del frontend actualizado.
   - **IMPORTANTE:** Realiza una ejecución manual de la función `getCryptoData` para autorizar los permisos de `UrlFetchApp`.

3. **Despliegue:**
   - Implementar > Nueva implementación > Tipo: Aplicación web > Acceso: Solo yo (recomendado para seguridad).

### ⚙️ Configuración de Datos (Importante)

El sistema es **autónomo**, pero sigue estas reglas para que la analítica funcione:

*   **Historial de Ingresos:** El sistema leerá automáticamente cualquier hoja que contenga "Ingresos" en el nombre.
*   **Permisos de API:** Debido a la integración con Coinbase/Binance, Google te pedirá autorización para conectar a servicios externos. Debes aceptar para ver el precio de BTC.

---

## 👨‍💻 Autor
**John Fredy Muñoz** - Consultor Principal  
*Especialista en Automatización Financiera y Desarrollo de Soluciones Google Workspace.*

---
*Este proyecto es Open Source. Transforma tus finanzas personales en una empresa.*
