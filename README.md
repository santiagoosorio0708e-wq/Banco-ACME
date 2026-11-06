<a name="readme-top"></a>

<div align="center">

  <h1>🏦 BANCO ACME - PORTAL TRANSACCIONAL</h1>
  <p><strong>Plataforma Bancaria Web Modular, Interactiva y de Demostración Continua</strong></p>

  <!-- Badges / Insignias Dinámicas -->
  <p>
    <a href="https://github.com/santiagoosorio0708e-wq/Banco-ACME"><img src="https://img.shields.io/github/stars/santiagoosorio0708e-wq/Banco-ACME?style=for-the-badge&logo=github&color=0052cc" alt="Stars" /></a>
    <a href="https://github.com/santiagoosorio0708e-wq/Banco-ACME"><img src="https://img.shields.io/github/forks/santiagoosorio0708e-wq/Banco-ACME?style=for-the-badge&logo=github&color=172b4d" alt="Forks" /></a>
    <a href="https://github.com/santiagoosorio0708e-wq/Banco-ACME/issues"><img src="https://img.shields.io/github/issues/santiagoosorio0708e-wq/Banco-ACME?style=for-the-badge&logo=github&color=ff5630" alt="Issues" /></a>
    <a href="https://github.com/santiagoosorio0708e-wq/Banco-ACME/blob/main/LICENSE"><img src="https://img.shields.io/badge/Licencia-MIT-green.svg?style=for-the-badge" alt="Licencia" /></a>
    <img src="https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
    <img src="https://img.shields.io/badge/Web_Components-Custom_Elements-blueviolet?style=for-the-badge" alt="Web Components" />
  </p>
</div>

<br />

<details>
  <summary><strong> Tabla de Contenidos (Clic para desplegar)</strong></summary>
  <ol>
    <li><a href="#acerca-del-proyecto">Acerca del Proyecto</a></li>
    <li><a href="#construido-con">Construido con</a></li>
    <li><a href="#arquitectura-del-sistema">Arquitectura del Sistema</a></li>
    <li><a href="#prerrequisitos">Prerrequisitos</a></li>
    <li><a href="#instalación">Instalación</a></li>
    <li><a href="#uso-y-características">Uso y Características</a></li>
    <li><a href="#pruebas">Pruebas</a></li>
    <li><a href="#hoja-de-ruta">Hoja de Ruta (Roadmap)</a></li>
    <li><a href="#contacto">Contacto</a></li>
  </ol>
</details>

<br />

---

## 📌 Acerca del Proyecto

**Banco Acme** es una aplicación web SPA (Single Page Application) responsiva que recrea un portal transaccional de autogestión bancaria completo. Desarrollada con estándares web modernos nativos, prescinde de frameworks pesados para brindar alto rendimiento, modularidad e interactividad mediante **Web Components autónomos**.

> [!NOTE]
> **Modo Modelo de Prueba Abierto:** Para facilitar la evaluación interactiva de todas las funcionalidades, el portal se encuentra configurado en **modo de prueba abierto**, permitiendo acceso inmediato al tablero financiero sin requerir credenciales ni contraseñas, cargado con saldos, tarjetas y movimientos de prueba preconfigurados.

<p align="right">(<a href="#readme-top">Volver al inicio ⬆</a>)</p>

---

## 🛠 Construido con

* **JavaScript ES6+ (Módulos & Custom Elements):** Arquitectura desacoplada y orientada a componentes.
* **HTML5 Semántico:** Estructura accesible y optimizada.
* **CSS3 Moderno:** Variables nativas, glassmorphism y diseño responsive sin dependencias de frameworks CSS.
* **Chart.js:** Gráficos estadísticos y seguimiento en tiempo real para cotizaciones y criptoactivos.
* **Web Storage API (`localStorage` & `sessionStorage`):** Capa de persistencia local resiliente ante reinicios.

<p align="right">(<a href="#readme-top">Volver al inicio ⬆</a>)</p>

---

## 🏛 Arquitectura del Sistema

El proyecto sigue una estructura limpia, modular y jerárquica:

```text
Banco-ACME/
│
├── index.html                  # Punto de entrada HTML5 del portal
├── README.md                   # Documentación técnica completa
├── refactor.js                 # Script utilitario de migración modular
│
├── css/                        # Estilos modulares y temas
│   ├── base.css                # Reset y estilos elementales
│   ├── components.css          # Estilos de botones, tarjetas y alertas
│   ├── forms.css               # Controles de formulario e inputs
│   ├── layout.css              # Grid, contenedores y layouts
│   ├── styles.css              # Hoja principal consolidadora
│   ├── typography.css          # Tipografías y fuentes
│   └── variables.css           # Paleta de colores e identidades
│
├── js/                         # Núcleo y lógica de negocio
│   ├── base-datos.js           # Motor de persistencia en localStorage
│   ├── autenticacion.js        # Servicio de sesión y tokens de seguridad
│   └── principal.js            # Orquestador del ciclo de vida y renderizado
│
├── imagenes/                   # Activos gráficos
│   └── logo.png                # Identidad visual de Banco Acme
│
└── componentes/                # Catálogo de Web Components nativos
    ├── acme-admin.js           # Panel de administración de créditos y PQRs
    ├── acme-bolsillos.js       # Gestión de bolsillos de ahorro
    ├── acme-cajero.js          # Cajero automático interactivo (ATM)
    ├── acme-certificado.js     # Generación de certificaciones bancarias
    ├── acme-inversiones.js     # Módulo de Trading y Cripto (ACME Coin)
    ├── acme-login.js           # Componente de autenticación
    ├── acme-notificaciones.js  # Centro de alertas y avisos
    ├── acme-perfil.js          # Gestión de datos del titular
    ├── acme-prestamo.js        # Solicitud y radicación de préstamos
    ├── acme-presupuesto.js     # Planeación y presupuestos personales
    ├── acme-recuperacion.js    # Flujo de restablecimiento de contraseña
    ├── acme-registro.js        # Registro de usuarios y apertura de cuentas
    ├── acme-reporte.js         # Reporte de saldos de cuentas activas
    ├── acme-resumen.js         # Resumen general de saldos y movimientos
    ├── acme-servicios.js       # Consulta y pago de facturas de servicios
    ├── acme-simulador.js       # Simulador interactivo de créditos
    ├── acme-soporte.js         # Radicación de PQRs y atención al cliente
    ├── acme-tablero.js         # Dashboard principal y barra de navegación
    ├── acme-tarjeta.js         # Administración de tarjeta débito virtual
    ├── acme-transaccion.js     # Consignaciones, retiros y pagos
    └── acme-transferencia.js   # Transferencias interbancarias
```

<p align="right">(<a href="#readme-top">Volver al inicio ⬆</a>)</p>

---

##  Prerrequisitos

Para ejecutar la aplicación localmente solo necesitas:

* Un navegador web moderno (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari).
* Un servidor web estático local (como la extensión **Live Server** de VS Code, o `npx serve`, o `python -m http.server`).

<p align="right">(<a href="#readme-top">Volver al inicio ⬆</a>)</p>

---

## 🚀 Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/santiagoosorio0708e-wq/Banco-ACME.git
   ```

2. **Acceder al directorio:**
   ```bash
   cd Banco-ACME
   ```

3. **Iniciar el servidor local:**
   * **Con VS Code:** Haz clic derecho en `index.html` y selecciona **"Open with Live Server"**.
   * **Con Node.js:**
     ```bash
     npx serve .
     ```
   * **Con Python:**
     ```bash
     python -m http.server 5500
     ```

4. **Abrir en el navegador:**
   Ingresa a `http://localhost:5500` o `http://127.0.0.1:5500/index.html`.

<p align="right">(<a href="#readme-top">Volver al inicio ⬆</a>)</p>

---

## 💻 Uso y Características

* **Resumen en Tiempo Real:** Visualización de saldo, movimientos recientes y conversión TRM en vivo.
* **Tarjeta Virtual:** Consulta de número de tarjeta, CVV, estado de bloqueo y pagos seguros.
* **Cajero Automático (ATM):** Teclado numérico físico interactivo, dispensación visual de billetes y validación de saldo.
* **Trading & Criptomonedas:** Gráfico dinámico de precios y compra/venta de **ACME Coin**.
* **Gestión de Ahorro y Bolsillos:** Creación de metas de ahorro independientes de la cuenta corriente.
* **Pago de Servicios Públicos:** Consulta simulada de facturas y deducción en línea.
* **Panel Administrativo & Reportes:** Aprobación o rechazo de solicitudes de crédito, gestión de PQRs e impresión de reportes de saldos.
* **Botón de Reinicio Rápido:** En la barra lateral se incluye la opción de restaurar los saldos y transacciones demo con un solo clic.

<p align="right">(<a href="#readme-top">Volver al inicio ⬆</a>)</p>

---

## 🧪 Pruebas

Para verificar la integridad sintáctica y la correcta resolución de dependencias modulares con Node.js:

```bash
# Comprobación de sintaxis en todos los módulos y componentes
node -e "const fs = require('fs'), { execSync } = require('child_process'); const files = ['./js/base-datos.js', './js/autenticacion.js', './js/principal.js', ...fs.readdirSync('./componentes').map(f => './componentes/' + f)]; files.forEach(f => execSync('node --check ' + f)); console.log('¡Todos los archivos pasaron la validación de sintaxis!');"
```

<p align="right">(<a href="#readme-top">Volver al inicio ⬆</a>)</p>

---

## 🗺 Hoja de Ruta (Roadmap)

- [x] Arquitectura basada en Web Components autónomos
- [x] Persistencia de datos en `localStorage` con tolerancia a fallos
- [x] Módulo interactivo de Cajero Automático (ATM)
- [x] Simulador de Trading & Criptoactivos con gráficos
- [x] Soporte para modo de prueba abierto sin fricción de credenciales
- [ ] Exportación de extractos bancarios en formato PDF nativo
- [ ] Modo oscuro / claro configurable por el usuario
- [ ] Soporte multimoneda (USD / EUR / COP)

<p align="right">(<a href="#readme-top">Volver al inicio ⬆</a>)</p>

---

## 📬 Contacto

**Santiago Osorio** - Desarrollador del Proyecto

* **Repositorio:** [https://github.com/santiagoosorio0708e-wq/Banco-ACME](https://github.com/santiagoosorio0708e-wq/Banco-ACME)
* **Organización:** Banco Acme - Portal Transaccional

<p align="right">(<a href="#readme-top">Volver al inicio ⬆</a>)</p>
