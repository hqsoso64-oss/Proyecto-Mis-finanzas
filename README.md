# 🚀 Gestor Financiero Pro (V2)

¡Bienvenido a la evolución del control financiero personal! Esta **versión 2.0** introduce un rediseño total con **Dark Mode Premium** y mejoras críticas de rendimiento.

![Dashboard Preview](assets/nueva%20interfaz/dasboard.png)

## ✨ Novedades de la Versión 2.0

### 🎨 1. Nueva Interfaz Dark Mode
Hemos migrado a un diseño oscuro profesional (`#050505`) inspirado en plataformas de trading y auditoría de alta gama.
- **Tipografía:** Inter (Google Fonts) para máxima legibilidad.
- **Colorimetría:** Acentos neón para estados financieros (Azul = Balance, Verde = Ingresos, Rojo = Gastos).
- **UX:** Tarjetas con elevación sutil y feedback visual inmediato.

<table>
  <tr>
    <td align="center"><b>Dashboard</b><br><img src="assets/nueva%20interfaz/dasboard.png" width="400"></td>
    <td align="center"><b>Gestión de Deudas</b><br><img src="assets/nueva%20interfaz/Deudas.png" width="400"></td>
  </tr>
  <tr>
    <td align="center"><b>Registro de Movimientos</b><br><img src="assets/nueva%20interfaz/Registro.png" width="400"></td>
    <td align="center"><b>Control de Cuentas (Bubbles)</b><br><img src="assets/nueva%20interfaz/Cuentas.png" width="400"></td>
  </tr>
</table>

### 🛠️ 2. Mejoras Técnicas (Under the Hood)
- **Fix "Ghost Data" en Deudas:** Solucionado el error crítico donde las deudas desaparecían al registrar pagos. Ahora el sistema lee de forma inteligente las columnas `A:D`, ignorando metadatos de auditoría como fechas de actualización.
- **Validación Robusta de Fechas:** Filtros de mes/año refactorizados para garantizar que los reportes siempre muestren datos precisos del periodo actual.
- **Arquitectura Cliente-Servidor:** Nueva capa de comunicación asíncrona que maneja errores de red ("ScriptError: Network") en dispositivos móviles con reintentos automáticos.

### 🧠 3. Funcionalidades Smart
- **Asistente de Distribución:** Al registrar un ingreso, el sistema sugiere automáticamente cómo distribuirlo siguiendo la regla 50/30/20 (o tu configuración personalizada).
- **Indicadores Visuales:** Gráficos de Google Charts integrados con fondo transparente para armonizar con el tema oscuro.

---

## 🚀 Instalación y Uso

Este proyecto funciona sobre **Google Apps Script**.

1. Abre tu hoja de cálculo en Google Sheets.
2. Ve a `Extensiones` > `Apps Script`.
3. Copia el contenido de `Código.gs` en el editor del servidor.
4. Crea un archivo `Index.html` y pega el código del frontend.
5. Despliega como aplicación web (`Implementar` > `Nueva implementación`).

## 👨‍💻 Autor
**John Fredy Muñoz** - Consultor Principal  
*Especialista en Automatización Financiera y Desarrollo de Soluciones Google Workspace.*

---
*Este proyecto es Open Source. Si te gusta esta nueva interfaz, ¡dale una estrella ⭐ al repositorio!*
