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
        const usuario = window.auth?.obtenerUsuarioActual();
        if (this.timeoutInactividad) clearTimeout(this.timeoutInactividad);
        if (usuario) {
            this.timeoutInactividad = setTimeout(() => {
                alert('Tu sesión ha expirado por inactividad.');
                window.auth.cerrarSesion();
            }, 3 * 60 * 1000); // 3 minutos
        }
    }

    renderizar() {
        const usuario = window.auth?.obtenerUsuarioActual();
        const rutaHash = window.location.hash || '';

        this.contenedor.innerHTML = '';

        this.reiniciarTimeoutInactividad();

        if (usuario) {
            if (usuario.rol === 'ADMIN') {
                this.contenedor.innerHTML = '<acme-admin></acme-admin>';
            } else {
                this.contenedor.innerHTML = '<acme-dashboard></acme-dashboard>';
            }
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
