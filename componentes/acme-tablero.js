class AcmeTablero extends HTMLElement {
    connectedCallback() {
        this.usuario = window.auth.obtenerUsuarioActual();

        if (!this.usuario) {
            window.location.hash = '';
            return;
        }

        this.render();
        this.addEventListeners();
        this.cambiarVista('tx-summary');
    }

    render() {
        this.innerHTML = `
            <div style="display: flex; min-height: 100vh; font-family: var(--font-family);">
                <nav style="width: 260px; background: var(--primary-color); color: var(--white); padding: 2rem 1.5rem; display: flex; flex-direction: column; box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1); z-index: 10;">
                    <div style="margin-bottom: 2.5rem; text-align: center;">
                        <img src="imagenes/logo.png" alt="Logo Banco Acme" class="acme-logo-dash">
                    </div>
                    <ul style="list-style: none; padding: 0; flex-grow: 1;">
                        <li class="menu-item mt-1"><a data-view="tx-summary" class="active" style="display: block; color: var(--white); padding: 0.85rem 1rem; border-radius: 6px; cursor: pointer;">Resumen de transacciones</a></li>
                        <li class="menu-item mt-1"><a data-view="deposit" style="display: block; color: var(--white); padding: 0.85rem 1rem; border-radius: 6px; cursor: pointer;">Consignación electrónica</a></li>
                        <li class="menu-item mt-1"><a data-view="withdraw" style="display: block; color: var(--white); padding: 0.85rem 1rem; border-radius: 6px; cursor: pointer;">Retiro de dinero</a></li>
                        <li class="menu-item mt-1"><a data-view="payment" style="display: block; color: var(--white); padding: 0.85rem 1rem; border-radius: 6px; cursor: pointer;">Pago de servicios públicos</a></li>
                        <li class="menu-item mt-1"><a data-view="certificate" style="display: block; color: var(--white); padding: 0.85rem 1rem; border-radius: 6px; cursor: pointer;">Certificado bancario</a></li>
                    </ul>
                    <div style="margin-top: 2rem;">
                        <button id="boton-cerrar-sesion" class="btn btn-danger" style="width: 100%; font-weight: bold;">Cerrar sesión</button>
                    </div>
                </nav>

                <main style="flex-grow: 1; background: rgba(255, 255, 255, 0.95); padding: 2.5rem; overflow-y: auto; height: 100vh; border-top-left-radius: 15px; border-bottom-left-radius: 15px;">
                    <div style="margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
                        <div>
                            <h2 style="font-size: 1.8rem; color: #333;">Hola, ${this.usuario.nombres} ${this.usuario.apellidos}</h2>
                            <p style="margin: 0; color: var(--text-light);">Gestiona tus movimientos y certificados desde este portal.</p>
                        </div>
                        <span style="background: var(--white); padding: 0.5rem 1.25rem; border-radius: 20px; box-shadow: var(--shadow-sm); font-weight: 600; color: var(--primary-color);">
                            ${this.usuario.tipoId}: ${this.usuario.numeroId}
                        </span>
                    </div>

                    <div id="contenido-tablero"></div>
                </main>
            </div>
            <style>
                .menu-item a {
                    transition: background 0.2s;
                }

                .menu-item a:hover {
                    background: rgba(255, 255, 255, 0.1);
                    text-decoration: none !important;
                }

                .menu-item a.active {
                    background: rgba(255, 255, 255, 0.2) !important;
                    font-weight: 600;
                    border-left: 4px solid var(--white);
                }
            </style>
        `;
    }

    addEventListeners() {
        const botonCerrarSesion = this.querySelector('#boton-cerrar-sesion');
        botonCerrarSesion.addEventListener('click', () => {
            window.auth.cerrarSesion();
        });

        const enlaces = this.querySelectorAll('a[data-view]');
        enlaces.forEach((enlace) => {
            enlace.addEventListener('click', (evento) => {
                enlaces.forEach((elemento) => elemento.classList.remove('active'));
                const vista = evento.target.getAttribute('data-view');
                evento.target.classList.add('active');
                this.cambiarVista(vista);
            });
        });
    }

    cambiarVista(vista) {
        const contenedorContenido = this.querySelector('#contenido-tablero');

        switch (vista) {
            case 'tx-summary':
                contenedorContenido.innerHTML = '<acme-summary></acme-summary>';
                break;
            case 'deposit':
                contenedorContenido.innerHTML = '<acme-transaction type="deposit"></acme-transaction>';
                break;
            case 'withdraw':
                contenedorContenido.innerHTML = '<acme-transaction type="withdraw"></acme-transaction>';
                break;
            case 'payment':
                contenedorContenido.innerHTML = '<acme-transaction type="payment"></acme-transaction>';
                break;
            case 'certificate':
                contenedorContenido.innerHTML = '<acme-certificate></acme-certificate>';
                break;
            default:
                contenedorContenido.innerHTML = '<acme-summary></acme-summary>';
                break;
        }
    }
}

customElements.define('acme-dashboard', AcmeTablero);
