class AcmeDashboard extends HTMLElement {
    connectedCallback() {
        this.user = window.auth.getCurrentUser();
        if(!this.user) {
            window.location.hash = '';
            return;
        }
        this.render();
        this.addEventListeners();
        this.changeView('tx-summary');
    }

    render() {
        this.innerHTML = `
            <div style="display:flex; min-height:100vh; font-family:var(--font-family);">
                <nav style="width:260px; background:var(--primary-color); color:var(--white); padding:2rem 1.5rem; display:flex; flex-direction:column; box-shadow: 2px 0 5px rgba(0,0,0,0.1); z-index:10;">
                    <div style="margin-bottom:2.5rem; text-align:center;">
                        <img src="assets/logo.png" alt="Banco Acme Logo" class="acme-logo-dash">
                    </div>
                    <ul style="list-style:none; padding:0; flex-grow:1;">
                        <li class="menu-item mt-1"><a data-view="tx-summary" class="active" style="display:block;color:var(--white);padding:0.85rem 1rem;border-radius:6px;cursor:pointer;">Resumen de transacciones</a></li>
                        <li class="menu-item mt-1"><a data-view="deposit" style="display:block;color:var(--white);padding:0.85rem 1rem;border-radius:6px;cursor:pointer;">Consignación electrónica</a></li>
                        <li class="menu-item mt-1"><a data-view="withdraw" style="display:block;color:var(--white);padding:0.85rem 1rem;border-radius:6px;cursor:pointer;">Retiro de dinero</a></li>
                        <li class="menu-item mt-1"><a data-view="payment" style="display:block;color:var(--white);padding:0.85rem 1rem;border-radius:6px;cursor:pointer;">Pago de servicios públicos</a></li>
                        <li class="menu-item mt-1"><a data-view="certificate" style="display:block;color:var(--white);padding:0.85rem 1rem;border-radius:6px;cursor:pointer;">Certificado bancario</a></li>
                    </ul>
                    <div style="margin-top:2rem;">
                        <button id="btn-logout" class="btn btn-danger" style="width:100%;font-weight:bold;">Cerrar sesión</button>
                    </div>
                </nav>

                <main style="flex-grow:1; background:rgba(255,255,255,0.95); padding:2.5rem; overflow-y:auto; height:100vh; border-top-left-radius: 15px; border-bottom-left-radius: 15px;">
                    <div style="margin-bottom: 2.5rem; display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;">
                        <div>
                            <h2 style="font-size:1.8rem;color:#333;">Hola, ${this.user.firstName} ${this.user.lastName}</h2>
                            <p style="margin:0;color:var(--text-light);">Gestiona tus movimientos y certificados desde este portal.</p>
                        </div>
                        <span style="background:var(--white);padding:0.5rem 1.25rem;border-radius:20px;box-shadow:var(--shadow-sm);font-weight:600;color:var(--primary-color);">
                            ${this.user.idType}: ${this.user.idNumber}
                        </span>
                    </div>

                    <div id="dashboard-content"></div>
                </main>
            </div>
            <style>
                .menu-item a {
                    transition: background 0.2s;
                }
                .menu-item a:hover {
                    background: rgba(255,255,255,0.1);
                    text-decoration:none !important;
                }
                .menu-item a.active {
                    background: rgba(255,255,255,0.2) !important;
                    font-weight: 600;
                    border-left: 4px solid var(--white);
                }
            </style>
        `;
    }

    addEventListeners() {
        const logoutBtn = this.querySelector('#btn-logout');
        logoutBtn.addEventListener('click', () => {
            window.auth.logout();
        });

        const links = this.querySelectorAll('a[data-view]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                links.forEach(l => l.classList.remove('active'));
                const view = e.target.getAttribute('data-view');
                e.target.classList.add('active');
                this.changeView(view);
            });
        });
    }

    changeView(view) {
        const contentDiv = this.querySelector('#dashboard-content');
        switch(view) {
            case 'tx-summary':
                contentDiv.innerHTML = '<acme-summary type="transactions"></acme-summary>';
                break;
            case 'deposit':
                contentDiv.innerHTML = '<acme-transaction type="deposit"></acme-transaction>';
                break;
            case 'withdraw':
                contentDiv.innerHTML = '<acme-transaction type="withdraw"></acme-transaction>';
                break;
            case 'payment':
                contentDiv.innerHTML = '<acme-transaction type="payment"></acme-transaction>';
                break;
            case 'certificate':
                contentDiv.innerHTML = '<acme-certificate></acme-certificate>';
                break;
        }
    }
}
customElements.define('acme-dashboard', AcmeDashboard);

