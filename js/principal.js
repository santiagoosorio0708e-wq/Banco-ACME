class Aplicacion {
    constructor() {
        this.contenedor = document.getElementById('app-container');
        this.inicializar();
    }

    inicializar() {
        window.addEventListener('hashchange', () => this.renderizar());
        document.addEventListener('autenticacion-cambiada', () => this.renderizar());
        this.renderizar();
    }

    renderizar() {
        const usuario = window.auth.obtenerUsuarioActual();
        const rutaHash = window.location.hash || '';

        this.contenedor.innerHTML = '';

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
