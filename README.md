# Portal de Citas y Logística - Leche Gloria S.A.

Sistema web integral desarrollado con **Node.js (Express)** y **React 19 (TypeScript, Tailwind CSS)** para la gestión, programación, validación de Órdenes de Compra (OC), control de palets, recepción en garita y liquidación de citas de proveedores en las plantas de **Leche Gloria S.A.** (Planta Huachipa y centros de distribución).

---

## 🚀 Cómo Ejecutar el Proyecto en Visual Studio Code

### Requisitos Previos
- **Node.js**: Versión 18 o superior (recomendado Node.js 20 LTS o superior).
- **Visual Studio Code**: [Descargar VS Code](https://code.visualstudio.com/).
- **NPM** (incluido automáticamente con Node.js).

---

### Pasos de Ejecución Rápida

1. **Abrir el proyecto en Visual Studio Code**:
   - Abre VS Code.
   - Selecciona **Archivo (File) > Abrir Carpeta (Open Folder...)**.
   - Selecciona la carpeta raíz de este proyecto.

2. **Abrir la Terminal Integrada**:
   - En VS Code, presiona `Ctrl + ñ` (o `Ctrl + ~` en teclado en inglés) o ve a **Terminal > Nueva Terminal**.

3. **Instalar Dependencias** (si es la primera vez que se descarga o clona):
   ```bash
   npm install
   ```

4. **Iniciar el Servidor Node.js en Modo Desarrollo**:
   ```bash
   npm run dev
   ```
   > El servidor Express con middleware Vite se iniciará automáticamente en:
   > 👉 **http://localhost:3000**

5. **Abrir en el Navegador**:
   - Abre tu navegador preferido (Chrome, Edge, Firefox) y entra a `http://localhost:3000`.

---

### Scripts Disponibles en `package.json`

| Comando | Descripción |
|---|---|
| `npm run dev` | Ejecuta el servidor Node.js (`server.ts` con `tsx`) y el cliente React en vivo en el puerto 3000. |
| `npm run build` | Compila los assets de Vite para producción y empaqueta el servidor con `esbuild` en `dist/server.cjs`. |
| `npm start` | Inicia el servidor compilado de producción (`node dist/server.cjs`). |
| `npm run lint` | Ejecuta la verificación estricta de tipos de TypeScript (`tsc --noEmit`). |

---

## 🔑 Cuentas y Contraseñas de Acceso (Demostración)

Todos los usuarios cuentan con la contraseña inicial por defecto: **`gloria2025`**.  
Cada usuario puede cambiar su contraseña en cualquier momento desde el botón **"Cambiar Contraseña"** en la barra superior.

| Rol | Nombre | Correo Electrónico | Contraseña por Defecto |
|---|---|---|---|---|
| **Administrador** | Ing. Carlos Cayetano | `Carlos.Cayetano@gloria.com.pe` | `gloria2025` | **Acceso Total**: Ve y accede a todas las cuentas |
| **Recepcionista** | Walter Chauca Ramos | `recepcion.huachipa@gloria.com.pe` | `gloria2025` | **Acceso Restringido**: Solo accede a su cuenta |
| **Proveedor 1** | Envases y Empaques SAC | `logistica@envasesperu.com.pe` | `gloria2025` | **Acceso Restringido**: Solo accede a su cuenta |
| **Proveedor 2** | Industrias Gráficas Centro | `despacho@graficascentro.pe` | `gloria2025` | **Acceso Restringido**: Solo accede a su cuenta |
| **Proveedor 3** | Cartones de Exportación | `coordinacion@cartonex.com.pe` | `gloria2025` | **Acceso Restringido**: Solo accede a su cuenta |

> 🔒 **Regla Estricta de Accesos (RBAC):**  
> Los usuarios con perfil **PROVEEDOR** y **RECEPCIONISTA** solo pueden acceder a sus cuentas y operaciones autorizadas. Únicamente el perfil **ADMINISTRADOR (Ing. Carlos Cayetano)** cuenta con autorización para ver y acceder a todas las cuentas del portal.

---

## 📦 Características Principales del Sistema

1. **Gestión de Órdenes de Compra (OC) y Palets**:
   - Registro de múltiples OCs y posiciones SAP por cada cita.
   - Cálculo automático del total de palets y control de capacidad máxima por bahía.
   - Nivel de urgencia diferenciado (Normal vs. Urgente para líneas críticas).

2. **Carga y Visualización de Documentos PDF**:
   - Soporte para adjuntar Guías de Remisión SUNAT, Órdenes de Compra y Certificados de Calidad.
   - Visor integrado con ficha técnica oficial Gloria y descarga directa de archivos PDF generados con `jspdf`.

3. **Control Operativo de Garita y Almacén**:
   - Flujo de estados: *Solicitada → Confirmada → En Garita (Llegó) → En Descarga → Atención Terminada → Liquidada*.
   - Asignación de bahías de descarga (Huachipa 01 a 06).
   - Registro con fechador y hora de llegada, inicio de descarga, término y liquidación.
   - Control de discrepancia de palets recibidos vs. facturados.

4. **Trazabilidad y Auditoría de Cambios**:
   - Historial cronológico inmutable con autor, rol, fecha/hora y valor anterior vs. nuevo.

5. **Notificaciones Automáticas por Correo Electrónico**:
   - Generación de correos corporativos formateados con enlaces directos para **Gmail**, **Outlook** y cliente de correo local.

6. **Pase Digital de Ingreso a Planta con QR**:
   - Ficha imprimible con código de expediente y validación en garita de seguridad.

7. **Exportación a Formato .XLZX / Excel (Exclusivo Administrador y Recepcionista)**:
   - Descarga consolidada de todas las citas y métricas en formato .XLSX (y .XLSX) con hojas de cálculo estructuradas y columnas autoajustadas para Microsoft Excel.
   - Opción visible y disponible únicamente para usuarios con perfil **ADMINISTRADOR** y **RECEPCIONISTA**. Los usuarios con perfil **PROVEEDOR** no tienen acceso a la descarga de reportes generales.

8. **Control de Acceso por Roles (RBAC)**:
   - Proveedores y Recepcionistas operan exclusivamente en su propia cuenta sin visibilidad de otros usuarios.
   - El Administrador (Ing. Carlos Cayetano) dispone de un panel exclusivo para ver, filtrar, inspeccionar y acceder a todas las cuentas registradas.
   - Solo Administrador y Recepcionista pueden ver y ejecutar la descarga del reporte en Excel (.XLSX / .XLSX).
