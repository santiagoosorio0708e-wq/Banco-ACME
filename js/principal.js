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
        this.timeoutInactividad = null;
        this.inicializar();
    }

    inicializar() {
        window.addEventListener('hashchange', () => this.renderizar());
        document.addEventListener('autenticacion-cambiada', () => this.renderizar());
        
        const eventosActividad = ['mousemove', 'keydown', 'click', 'scroll'];
        eventosActividad.forEach(evt => {
            window.addEventListener(evt, () => this.reiniciarTimeoutInactividad());
        });

        this.renderizar();
    }

    reiniciarTimeoutInactividad() {
        const usuario = auth?.obtenerUsuarioActual();
        if (this.timeoutInactividad) clearTimeout(this.timeoutInactividad);
        if (usuario) {
            this.timeoutInactividad = setTimeout(() => {
                alert('Tu sesión ha expirado por inactividad.');
                auth.cerrarSesion();
            }, 3 * 60 * 1000); // 3 minutos
        }
    }

    renderizar() {
        const usuario = auth?.obtenerUsuarioActual();
        const rutaHash = window.location.hash || '';

        this.contenedor.innerHTML = '';

        this.reiniciarTimeoutInactividad();

        if (usuario) {
            this.contenedor.innerHTML = '<acme-dashboard></acme-dashboard>';
            return;
        }

        if (rutaHash === '#register') {
            this.contenedor.innerHTML = '<acme-register></acme-register>';
        } else if (rutaHash === '#recovery') {
            this.contenedor.innerHTML = '<acme-recovery></acme-recovery>';
        } else {
            this.contenedor.innerHTML = '<acme-login></acme-login>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new Aplicacion();
});
