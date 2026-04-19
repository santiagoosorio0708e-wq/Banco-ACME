class AcmeTablero extends HTMLElement {
    connectedCallback() {
        this.usuario = window.auth.obtenerUsuarioActual();
        if (!this.usuario) { window.location.hash = ''; return; }
        this.vistaActual = 'tx-summary';
        this.menuAbierto = false;
        this.render();
        this.cambiarVista('tx-summary');
        
        // Setup clock for dynamic key
        this.intervaloClave = setInterval(() => this.actualizarClaveDinamica(), 1000);
    }

    disconnectedCallback() {
        clearInterval(this.intervaloClave);
    }

    /* ── Definición de módulos del menú ── */
    obtenerModulos() {
        return [
            { grupo: 'Principal',       items: [
                { vista: 'tx-summary',   icono: '', texto: 'Resumen de cuenta' },
                { vista: 'tarjeta',      icono: '', texto: 'Mi tarjeta virtual' },
                { vista: 'bolsillos',    icono: '', texto: 'Bolsillos' },
                { vista: 'notificaciones', icono: '', texto: 'Notificaciones', badge: true }
            ]},
            { grupo: 'Operaciones',     items: [
                { vista: 'deposit',      icono: '', texto: 'Consignación' },
                { vista: 'withdraw',     icono: '', texto: 'Retiro de dinero' },
                { vista: 'transferencia',icono: '', texto: 'Transferencias' },
                { vista: 'payment',      icono: '', texto: 'Pago de servicios' }
            ]},
            { grupo: 'Finanzas',        items: [
                { vista: 'prestamo',     icono: '', texto: 'Mis créditos' },
                { vista: 'simulador',    icono: '', texto: 'Simulador de crédito' },
                { vista: 'presupuesto',  icono: '', texto: 'Presupuesto personal' }
            ]},
            { grupo: 'Documentos',      items: [
                { vista: 'certificate',  icono: '', texto: 'Certificado bancario' }
            ]},
            { grupo: 'Mi cuenta',       items: [
                { vista: 'perfil',       icono: '', texto: 'Mi perfil' },
                { vista: 'soporte',      icono: '', texto: 'Soporte / PQR' }
            ]}
        ];
    }

    construirMenu() {
        const noLeidas = window.db.contarNoLeidas(this.usuario.numeroId);
        return this.obtenerModulos().map(grupo => `
            <li class="menu-grupo-titulo">${grupo.grupo}</li>
            ${grupo.items.map(item => {
                const badge = item.badge && noLeidas > 0
                    ? `<span class="menu-badge">${noLeidas}</span>` : '';
                return `<li class="menu-item">
                    <a data-view="${item.vista}" class="${this.vistaActual === item.vista ? 'active' : ''}">
                        <span class="menu-texto" style="padding-left: 0.5rem;">${item.texto}</span>
                        ${badge}
                    </a>
                </li>`;
            }).join('')}`).join('');
    }

    actualizarClaveDinamica() {
        const el = this.querySelector('#codigo-clave-dinamica');
        if (el) {
            el.textContent = window.auth.obtenerClaveDinamicaActual();
        }
        const barra = this.querySelector('#progreso-clave-dinamica');
        if (barra) {
            const segundosRestantes = 60 - (Math.floor(Date.now() / 1000) % 60);
            const pct = (segundosRestantes / 60) * 100;
            barra.style.width = pct + '%';
        }
    }

    render() {
        const avatarLetras = `${(this.usuario.nombres || '?')[0]}${(this.usuario.apellidos || '?')[0]}`.toUpperCase();

        this.innerHTML = `
            <style>
                /* ── Layout principal ── */
                .tablero-shell {
                    display: flex;
                    min-height: 100vh;
                    font-family: var(--font-family);
                    position: relative;
                }

                /* ── Overlay móvil ── */
                .sidebar-overlay {
                    display: none;
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.5);
                    z-index: 90;
                    backdrop-filter: blur(2px);
                }
                .sidebar-overlay.activo { display: block; }

                /* ── Sidebar ── */
                .sidebar {
                    width: 260px;
                    min-width: 260px;
                    background: linear-gradient(180deg, #0a3480 0%, #0b3d91 60%, #0d4db0 100%);
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    padding: 0;
                    box-shadow: 4px 0 20px rgba(0,0,0,0.15);
                    z-index: 100;
                    transition: transform 0.3s ease;
                    overflow-y: auto;
                    max-height: 100vh;
                    position: sticky;
                    top: 0;
                }

                /* ── Sidebar header ── */
                .sidebar-header {
                    padding: 1.5rem 1.25rem 1rem;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    flex-shrink: 0;
                }
                .sidebar-logo {
                    display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;
                }
                .sidebar-logo img {
                    width: 42px; height: 42px; border-radius: 8px;
                    background: white; padding: 4px; object-fit: contain;
                }
                .sidebar-logo-text {
                    font-size: 1rem; font-weight: 700; letter-spacing: 0.03em;
                }
                .sidebar-logo-text small { display: block; font-size: 0.68rem; opacity: 0.7; font-weight: 400; }

                /* Usuario info */
                .sidebar-user {
                    display: flex; align-items: center; gap: 0.75rem;
                }
                .sidebar-avatar {
                    width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
                    background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.35);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.9rem; font-weight: 700;
                }
                .sidebar-user-info p { margin: 0; font-size: 0.88rem; font-weight: 600; }
                .sidebar-user-info small { font-size: 0.72rem; opacity: 0.65; }

                /* ── Navegación ── */
                .sidebar-nav {
                    flex-grow: 1; padding: 1rem 0.75rem;
                    list-style: none; margin: 0;
                    overflow-y: auto;
                }
                .menu-grupo-titulo {
                    font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em;
                    opacity: 0.5; padding: 1rem 0.75rem 0.35rem;
                    font-weight: 700;
                }
                .menu-item a {
                    display: flex; align-items: center; gap: 0.65rem;
                    padding: 0.65rem 0.85rem; border-radius: 8px;
                    color: rgba(255,255,255,0.82);
                    cursor: pointer; text-decoration: none;
                    font-size: 0.88rem; font-weight: 500;
                    transition: background 0.18s, color 0.18s;
                    position: relative;
                }
                .menu-item a:hover {
                    background: rgba(255,255,255,0.12);
                    color: white;
                }
                .menu-item a.active {
                    background: rgba(255,255,255,0.18);
                    color: white; font-weight: 600;
                    border-left: 3px solid rgba(255,255,255,0.8);
                }
                .menu-badge {
                    margin-left: auto; background: var(--danger-color);
                    color: white; border-radius: 20px; font-size: 0.7rem;
                    padding: 0.1rem 0.45rem; font-weight: 700;
                }

                /* ── Sidebar footer ── */
                .sidebar-footer {
                    padding: 1rem 1.25rem;
                    border-top: 1px solid rgba(255,255,255,0.1);
                    flex-shrink: 0;
                }

                /* ── Área principal ── */
                .tablero-main {
                    flex: 1; min-width: 0;
                    background: #f0f4fc;
                    display: flex; flex-direction: column;
                    overflow-x: hidden;
                }

                /* ── Topbar ── */
                .tablero-topbar {
                    background: white;
                    padding: 0.85rem 1.5rem;
                    display: flex; align-items: center; justify-content: space-between;
                    gap: 1rem; flex-wrap: wrap;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.07);
                    position: sticky; top: 0; z-index: 50;
                }
                .topbar-saludo h2 { font-size: 1.1rem; margin: 0; color: var(--text-dark); }
                .topbar-saludo p  { font-size: 0.8rem; margin: 0; color: var(--text-light); }
                .topbar-right {
                    display: flex; align-items: center; gap: 1rem;
                }
                .topbar-cuenta-badge {
                    background: #eef2ff; color: var(--primary-color);
                    padding: 0.35rem 1rem; border-radius: 20px;
                    font-size: 0.82rem; font-weight: 600;
                    font-family: monospace;
                }
                .btn-hamburguesa {
                    display: none;
                    background: none; border: none; cursor: pointer;
                    font-size: 1.5rem; padding: 0.25rem; line-height: 1;
                    color: var(--primary-color);
                }
                .topbar-token {
                    background: var(--secondary-color);
                    border: 1px solid var(--border-color);
                    padding: 0.35rem 0.8rem;
                    border-radius: 8px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .topbar-token p { margin: 0; font-size: 0.65rem; color: var(--text-light); text-transform: uppercase; font-weight: 600; }
                .topbar-token strong { font-size: 1rem; letter-spacing: 0.15em; color: var(--primary-color); }
                .token-progress {
                    position: absolute; bottom: 0; left: 0; height: 3px; background: var(--primary-color);
                    transition: width 1s linear;
                }

                /* ── Contenido ── */
                .tablero-contenido {
                    flex: 1; padding: 1.75rem;
                    overflow-y: auto; min-height: 0;
                }

                /* ── RESPONSIVE ── */
                @media (max-width: 900px) {
                    .sidebar {
                        position: fixed; left: 0; top: 0;
                        height: 100vh;
                        transform: translateX(-100%);
                        min-height: 100vh;
                    }
                    .sidebar.abierto { transform: translateX(0); }
                    .btn-hamburguesa { display: flex; align-items: center; }
                    .tablero-main { width: 100%; }
                    .tablero-contenido { padding: 1.25rem 1rem; }
                    .topbar-cuenta-badge { display: none; }
                }
                @media (max-width: 500px) {
                    .tablero-contenido { padding: 1rem 0.65rem; }
                    .tablero-topbar { padding: 0.7rem 1rem; }
                }
            </style>

            <div class="tablero-shell">

                <!-- Overlay para cierre en móvil -->
                <div class="sidebar-overlay" id="sidebar-overlay"></div>

                <!-- ── Sidebar ── -->
                <nav class="sidebar" id="sidebar" role="navigation" aria-label="Menú principal">
                    <div class="sidebar-header">
                        <div class="sidebar-logo">
                            <img src="imagenes/logo.png" alt="Banco Acme" onerror="this.style.display='none'">
                            <div class="sidebar-logo-text">
                                Banco Acme
                                <small>Portal transaccional</small>
                            </div>
                        </div>
                        <div class="sidebar-user">
                            <div class="sidebar-avatar">${avatarLetras}</div>
                            <div class="sidebar-user-info">
                                <p>${this.usuario.nombres} ${this.usuario.apellidos}</p>
                                <small>${this.usuario.tipoId}: ${this.usuario.numeroId}</small>
                            </div>
                        </div>
                    </div>

                    <ul class="sidebar-nav" id="sidebar-nav">
                        ${this.construirMenu()}
                    </ul>

                    <div class="sidebar-footer">
                        <button id="btn-cerrar-sesion" class="btn btn-danger" style="width:100%;font-size:0.88rem;padding:0.65rem;">
                            Cerrar sesión
                        </button>
                    </div>
                </nav>

                <!-- ── Área principal ── -->
                <div class="tablero-main">
                    <!-- Topbar -->
                    <header class="tablero-topbar">
                        <button class="btn-hamburguesa" id="btn-hamburguesa" aria-label="Abrir menú">☰</button>
                        <div class="topbar-saludo">
                            <h2>Hola, ${this.usuario.nombres.split(' ')[0]}</h2>
                            <p id="titulo-vista-actual">Resumen de cuenta</p>
                        </div>
                        
                        <div class="topbar-right">
                            <div class="topbar-token">
                                <p>Token Dinámico</p>
                                <strong id="codigo-clave-dinamica">000000</strong>
                                <div class="token-progress" id="progreso-clave-dinamica" style="width: 100%;"></div>
                            </div>
                            <span class="topbar-cuenta-badge" id="badge-cuenta">
                                Cta. ${window.db.obtenerCuentaPorUsuario(this.usuario.numeroId)?.numeroCuenta || '—'}
                            </span>
                        </div>
                    </header>

                    <!-- Contenido dinámico -->
                    <main class="tablero-contenido">
                        <div id="contenido-tablero"></div>
                    </main>
                </div>
            </div>`;

        this.actualizarClaveDinamica();
        this.addEventListeners();
    }

    addEventListeners() {
        /* Hamburguesa */
        const btnHam   = this.querySelector('#btn-hamburguesa');
        const sidebar  = this.querySelector('#sidebar');
        const overlay  = this.querySelector('#sidebar-overlay');

        const abrirMenu = () => { sidebar.classList.add('abierto'); overlay.classList.add('activo'); };
        const cerrarMenu = () => { sidebar.classList.remove('abierto'); overlay.classList.remove('activo'); };

        btnHam?.addEventListener('click', abrirMenu);
        overlay?.addEventListener('click', cerrarMenu);

        /* Cerrar sesión */
        this.querySelector('#btn-cerrar-sesion')?.addEventListener('click', () => window.auth.cerrarSesion());

        /* Ítems de menú */
        this.querySelectorAll('a[data-view]').forEach(a => {
            a.addEventListener('click', () => {
                const vista = a.getAttribute('data-view');
                this.cambiarVista(vista);
                cerrarMenu();
            });
        });
    }

    cambiarVista(vista) {
        this.vistaActual = vista;

        /* Actualizar clases activas */
        this.querySelectorAll('a[data-view]').forEach(a => {
            a.classList.toggle('active', a.getAttribute('data-view') === vista);
        });

        /* Actualizar título en topbar */
        const modulos = this.obtenerModulos().flatMap(g => g.items);
        const modulo  = modulos.find(m => m.vista === vista);
        const tituloEl = this.querySelector('#titulo-vista-actual');
        if (tituloEl && modulo) tituloEl.textContent = `${modulo.texto}`;

        /* Inyectar componente */
        const contenedor = this.querySelector('#contenido-tablero');
        const mapaVistas = {
            'tx-summary':    '<acme-summary></acme-summary>',
            'deposit':       '<acme-transaction type="deposit"></acme-transaction>',
            'withdraw':      '<acme-transaction type="withdraw"></acme-transaction>',
            'payment':       '<acme-transaction type="payment"></acme-transaction>',
            'certificate':   '<acme-certificate></acme-certificate>',
            'transferencia': '<acme-transferencia></acme-transferencia>',
            'simulador':     '<acme-simulador></acme-simulador>',
            'prestamo':      '<acme-prestamo></acme-prestamo>',
            'presupuesto':   '<acme-presupuesto></acme-presupuesto>',
            'soporte':       '<acme-soporte></acme-soporte>',
            'notificaciones':'<acme-notificaciones></acme-notificaciones>',
            'tarjeta':       '<acme-tarjeta></acme-tarjeta>',
            'perfil':        '<acme-perfil></acme-perfil>',
            'bolsillos':     '<acme-bolsillos></acme-bolsillos>'
        };

        contenedor.innerHTML = mapaVistas[vista] ?? '<acme-summary></acme-summary>';

        // Actualizar badge de notificaciones en el menú tras cada cambio
        this._actualizarBadgeNotis();
    }

    _actualizarBadgeNotis() {
        try {
            const n = window.db.contarNoLeidas(this.usuario.numeroId);
            const badge = this.querySelector('a[data-view="notificaciones"] .menu-badge');
            if (badge) {
                badge.textContent = n;
                badge.style.display = n > 0 ? 'inline' : 'none';
            } else if (n > 0) {
                const enlaceNoti = this.querySelector('a[data-view="notificaciones"]');
                if (enlaceNoti && !enlaceNoti.querySelector('.menu-badge')) {
                    const s = document.createElement('span');
                    s.className = 'menu-badge';
                    s.textContent = n;
                    enlaceNoti.appendChild(s);
                }
            }
        } catch (_) { /* silencioso */ }
    }
}

customElements.define('acme-dashboard', AcmeTablero);
