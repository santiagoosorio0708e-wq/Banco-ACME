import { db } from './base-datos.js';
import { auth } from './autenticacion.js';
import '../componentes/acme-admin.js';
import '../componentes/acme-bolsillos.js';
import '../componentes/acme-cajero.js';
import '../componentes/acme-certificado.js';
import '../componentes/acme-inversiones.js';
import '../componentes/acme-login.js';
import '../componentes/acme-notificaciones.js';
import '../componentes/acme-perfil.js';
import '../componentes/acme-prestamo.js';
import '../componentes/acme-presupuesto.js';
import '../componentes/acme-recuperacion.js';
import '../componentes/acme-registro.js';
import '../componentes/acme-reporte.js';
import '../componentes/acme-resumen.js';
import '../componentes/acme-servicios.js';
import '../componentes/acme-simulador.js';
import '../componentes/acme-soporte.js';
import '../componentes/acme-tablero.js';
import '../componentes/acme-tarjeta.js';
import '../componentes/acme-transaccion.js';
import '../componentes/acme-transferencia.js';

class Aplicacion {
    constructor() {
        this.contenedor = document.getElementById('app-container');
        this.inicializar();
    }

    inicializar() {
        // En modelo de prueba siempre aseguramos usuario activo
        auth.obtenerUsuarioActual();

        window.addEventListener('hashchange', () => this.renderizar());
        document.addEventListener('autenticacion-cambiada', () => this.renderizar());

        this.renderizar();
    }

    renderizar() {
        // Modelo de prueba: acceso directo y abierto al portal bancario sin contraseña ni login
        this.contenedor.innerHTML = '<acme-dashboard></acme-dashboard>';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new Aplicacion();
    });
} else {
    window.app = new Aplicacion();
}
