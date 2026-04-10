# Banco Acme - Portal Transaccional

Este proyecto es una aplicación web responsiva, segura y funcional que simula un portal bancario para el "Banco Acme". Está construido íntegramente con tecnologías web estándar (Vanilla JavaScript, HTML5 y CSS3), sin el uso de frameworks pesados, con un enfoque en la modularidad a través de Web Components.

## Características Principales

*   **Single Page Application (SPA):** Navegación fluida y dinámica sin recargar la página.
*   **Autenticación de Usuarios:** Sistema completo de registro, inicio de sesión y recuperación de contraseñas.
*   **Gestión de Cuentas:** Visualización de saldo actual y número de cuenta.
*   **Transacciones Bancarias:** Permite realizar depósitos, retiros y pagos de servicios con validaciones de fondos en tiempo real.
*   **Generación de Certificados:** Emisión de certificaciones bancarias descargables/imprimibles.
*   **Persistencia de Datos Local:** Utiliza la API de `localStorage` del navegador para simular una base de datos real (guardando usuarios, cuentas y transacciones).
*   **Diseño Web Moderno:** Interfaz de usuario profesional basada en CSS puro con tipografía "Inter", diseño adaptable (responsive) para dispositivos móviles y animaciones fluidas.

##  Estructura del Proyecto

El código está organizado de manera modular y escalable:

```text
proyecto portal transaccional/
│
├── index.html               # Punto de entrada de la aplicación. Carga todos los scripts, componentes y estilos.
├── README.md                # Archivo de documentación (este archivo).
│
├── css/
│   └── styles.css           # Archivo principal de estilos CSS con variables (Custom Properties) para consistencia de diseño.
│
├── js/
│   ├── base-datos.js        # Simula un motor de base de datos interceptando llamadas al 'localStorage'.
│   ├── autenticacion.js     # Contiene la lógica de negocio para la gestión de sesiones (login, logout, validación).
│   └── principal.js         # Orquestador principal de la app. Gestiona el enrutamiento y muestra el componente correcto en el DOM.
│
└── componentes/             # Directorio que contiene todos los Web Components personalizados.
    ├── acme-login.js        # Componente para el formulario de inicio de sesión.
    ├── acme-registro.js     # Componente para la creación de nuevos usuarios y cuentas asociadas.
    ├── acme-recuperacion.js # Componente para simular la recuperación de contraseñas.
    ├── acme-tablero.js      # Componente contenedor post-login (Dashboard o menú lateral/superior).
    ├── acme-resumen.js      # Componente que muestra el resumen de la cuenta (saldo, número, movimientos recientes).
    ├── acme-transaccion.js  # Componente con formularios para depósitos, retiros y pagos.
    └── acme-certificado.js  # Componente para visualizar y generar un certificado bancario en formato imprimible.
```

## ¿Cómo funciona a nivel de código?

El desarrollo de este portal se basa en tres pilares arquitectónicos:

### 1. Web Components (Componentes Web)
La interfaz de usuario está construida usando **Custom Elements** (Elementos Personalizados). Cada archivo en la carpeta `componentes/` define una clase de JavaScript que hereda de `HTMLElement`. Esto permite encapsular el HTML, CSS (en línea o referido) y lógica de presentación, creando etiquetas HTML nuevas y reutilizables (por ejemplo, `<acme-login></acme-login>`).

### 2. Base de Datos Virtual (`js/base-datos.js`)
Para evitar la necesidad de un servidor y una base de datos real (backend), el proyecto maneja el estado de la información a través de la API `Window.localStorage`. 
La clase `Database` se instancia de manera global (`window.db = new Database();`) y provee métodos estructurales para:
- Crear y buscar usuarios en la clave `acmeUsers`.
- Crear y actualizar cuentas (saldos) en la clave `acmeAccounts`.
- Guardar el historial de movimientos en la clave `acmeTransactions`.

### 3. Enrutamiento y Estado (`js/principal.js` y `js/autenticacion.js`)
El archivo `index.html` contiene un contenedor vacío: `<div id="app-container"></div>`.
El script `principal.js` escucha eventos personalizados (Custom Events) emitidos por los componentes. Dependiendo de si un usuario ha iniciado sesión (validado por `autenticacion.js`) y de la "ruta" seleccionada, `principal.js` vacía el `app-container` e inyecta dinámicamente el componente Web correspondiente para renderizar la pantalla correcta.

##  ¿Cómo ejecutar el proyecto?

Dado que está construido con tecnologías puramente del lado del cliente y no se utilizan módulos estandarizados restrictivos (ES modules con `type="module"`), ejecutar la aplicación es sumamente sencillo:

1.  Descarga o clona este directorio en tu máquina local.
2.  Abre el archivo `index.html` directamente en cualquier navegador web moderno (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
3.  *Opcional pero recomendado:* Si usas un editor como Visual Studio Code, puedes utilizar la extensión **Live Server** para abrir el proyecto, lo que facilita el refresco automático si haces cambios en el código.

**Notas Importantes:** Al estar la información almacenada en el `localStorage` del navegador, ten en cuenta que los datos creados (nuevos usuarios, saldos, etc.) se perderán si navegas en modo incógnito o si borras la caché o datos del navegador.
