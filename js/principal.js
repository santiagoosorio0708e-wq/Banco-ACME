class App {
    constructor() {
        this.container = document.getElementById('app-container');
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.render());
        document.addEventListener('auth-changed', () => this.render());
        this.render();
    }

    render() {
        const user = window.auth.getCurrentUser();
        const hash = window.location.hash || '';

        this.container.innerHTML = ''; // Limpiar vista

        if (user) {
            this.container.innerHTML = '<acme-dashboard></acme-dashboard>';
        } else {
            // Rutas para páginas públicas
            if (hash === '#register') {
                this.container.innerHTML = '<acme-register></acme-register>';
            } else if (hash === '#recovery') {
                this.container.innerHTML = '<acme-recovery></acme-recovery>';
            } else {
                this.container.innerHTML = '<acme-login></acme-login>';
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
