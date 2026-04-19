class AcmeResumen extends HTMLElement {
    connectedCallback() {
        this.usuario = window.auth.obtenerUsuarioActual();
        this.cuenta = window.db.obtenerCuentaPorUsuario(this.usuario.numeroId);
        this.trmActual = null;
        this.obtenerTRM();
        this.render();
    }

    async obtenerTRM() {
        try {
            const respuesta = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await respuesta.json();
            this.trmActual = data.rates.COP;
            this.render();
        } catch(e) {
            this.trmActual = 'Error de conexión';
            this.render();
        }
    }

    render() {
        // En caso de que se haya actualizado el saldo o haya nuevas transacciones
        this.cuenta = window.db.obtenerCuentaPorUsuario(this.usuario.numeroId);
        const _todasTransacciones = window.db.obtenerTransaccionesPorCuenta(this.cuenta.numeroCuenta);
        // Sólo tomamos las 5 más recientes para el dashboard
        const transacciones = _todasTransacciones.slice(0, 5);

        let cuerpoTabla = '';

        if (transacciones.length === 0) {
            cuerpoTabla = '<tr><td colspan="5" class="text-center" style="padding: 2rem;">No hay transacciones recientes.</td></tr>';
        } else {
            transacciones.forEach((transaccion) => {
                const esConsignacion = transaccion.tipo === 'Consignación' || transaccion.tipo === 'Abono';
                const color = esConsignacion ? 'var(--success-color)' : 'var(--danger-color)';
                const signo = esConsignacion ? '+' : '-';

                cuerpoTabla += `
                    <tr style="transition: background 0.2s;">
                        <td data-label="Fecha" style="padding: 1rem; border-bottom: 1px solid var(--border-color);">${new Date(transaccion.fecha).toLocaleString('es-CO')}</td>
                        <td data-label="Referencia" style="padding: 1rem; border-bottom: 1px solid var(--border-color); font-family: monospace; color: #555;">${transaccion.referencia}</td>
                        <td data-label="Tipo" style="padding: 1rem; border-bottom: 1px solid var(--border-color);">${transaccion.tipo}</td>
                        <td data-label="Concepto" style="padding: 1rem; border-bottom: 1px solid var(--border-color);">${transaccion.concepto}</td>
                        <td data-label="Valor" style="padding: 1rem; border-bottom: 1px solid var(--border-color); color: ${color}; font-weight: bold; text-align: right;">${signo} $ ${Number(transaccion.monto).toLocaleString('es-CO')}</td>
                    </tr>
                `;
            });
        }

        this.innerHTML = `
            <style>
                .resumen-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                @media(min-width: 900px) {
                    .resumen-grid { grid-template-columns: 1fr 2fr; }
                }
                
                .saldo-card {
                    background: linear-gradient(135deg, var(--primary-color) 0%, rgb(52, 107, 194) 100%);
                    color: white;
                    border-radius: 16px;
                    padding: 2rem;
                    box-shadow: var(--shadow-md);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .saldo-card:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-lg);
                }
                .saldo-card::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    right: -20%;
                    width: 250px;
                    height: 250px;
                    background: rgba(255,255,255,0.08);
                    border-radius: 50%;
                }
                .saldo-card::before {
                    content: '';
                    position: absolute;
                    bottom: -30%;
                    left: -10%;
                    width: 150px;
                    height: 150px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 50%;
                }
                .saldo-card h3 { color: rgba(255,255,255,0.85); font-size: 1.05rem; margin-bottom: 0.5rem; }
                .saldo-card .saldo-valor { font-size: 2.6rem; font-weight: 800; margin-bottom: 1rem; letter-spacing: -1px; z-index: 1; }
                .saldo-card .cuenta-info { font-size: 0.95rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.2); z-index: 1; }

                .quick-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                }
                @media(min-width: 600px) {
                    .quick-actions-grid { grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
                }
                @media(min-width: 1024px) {
                    .quick-actions-grid { grid-template-columns: repeat(4, 1fr); }
                }

                .action-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem 1rem;
                    text-align: center;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.04);
                    cursor: pointer;
                    transition: all 0.25s ease;
                    border: 1px solid rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.85rem;
                }
                .action-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px rgba(0,0,0,0.1);
                    border-color: rgba(11, 61, 145, 0.2);
                }
                .action-icon {
                    width: 54px;
                    height: 54px;
                    border-radius: 14px;
                    background: var(--secondary-color);
                    color: var(--primary-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                    transition: background 0.3s, color 0.3s;
                }
                .action-card:hover .action-icon {
                    background: var(--primary-color);
                    color: white;
                }
                .action-card span {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-dark);
                }

                .trm-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: white;
                    padding: 0.85rem 1.5rem;
                    border-radius: 50px;
                    box-shadow: var(--shadow-sm);
                    font-size: 0.95rem;
                    font-weight: 600;
                    width: max-content;
                    margin-bottom: 1.5rem;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .trm-indicator span { color: var(--primary-color); font-size: 1.05rem; }
                
                tr:hover { background-color: var(--secondary-color); }
                
                .movimientos-header {
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center; 
                    margin-bottom: 1.25rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid var(--border-color);
                }
                .movimientos-header h3 { margin: 0; font-size: 1.3rem; color: var(--text-dark); }
            </style>
            
            <div class="trm-indicator">
                🌎 USD Hoy: <span>${this.trmActual ? (typeof this.trmActual === 'number' ? '$' + Number(this.trmActual).toLocaleString('es-CO') + ' COP' : this.trmActual) : 'Cargando...'}</span>
            </div>

            <div class="resumen-grid">
                <!-- Saldo Card -->
                <div class="saldo-card">
                    <h3>Saldo Disponible</h3>
                    <div class="saldo-valor">$${Number(this.cuenta.saldo).toLocaleString('es-CO')}</div>
                    <div class="cuenta-info">Cuenta de Ahorros • ${this.cuenta.numeroCuenta.slice(-4)}</div>
                </div>

                <!-- Acciones Rápidas -->
                <div>
                    <h3 style="margin-bottom: 1.25rem; color: var(--text-dark); font-size: 1.3rem;">Operaciones Frecuentes</h3>
                    <div class="quick-actions-grid">
                        <div class="action-card" data-action="transferencia">
                            <div class="action-icon">💸</div>
                            <span>Transferir</span>
                        </div>
                        <div class="action-card" data-action="payment">
                            <div class="action-icon">🧾</div>
                            <span>Pagar</span>
                        </div>
                        <div class="action-card" data-action="deposit">
                            <div class="action-icon">📥</div>
                            <span>Consignar</span>
                        </div>
                        <div class="action-card" data-action="bolsillos">
                            <div class="action-icon">💰</div>
                            <span>Bolsillos</span>
                        </div>
                        <div class="action-card" data-action="prestamo">
                            <div class="action-icon">🏦</div>
                            <span>Créditos</span>
                        </div>
                        <div class="action-card" data-action="simulador">
                            <div class="action-icon">📊</div>
                            <span>Simulador</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Movimientos Recientes -->
            <div class="card" style="padding: 1.75rem;">
                <div class="movimientos-header">
                    <h3>Últimos Movimientos</h3>
                    <button class="btn btn-outline" style="width: auto; padding: 0.5rem 1.25rem; font-size: 0.85rem; border-radius: 50px;" id="btn-ver-todos">Ver resumen detallado</button>
                </div>
                
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="background: var(--secondary-color);">
                                <th style="padding: 1rem; border-top-left-radius: 8px;">Fecha</th>
                                <th style="padding: 1rem;">Referencia</th>
                                <th style="padding: 1rem;">Tipo</th>
                                <th style="padding: 1rem;">Concepto</th>
                                <th style="padding: 1rem; text-align: right; border-top-right-radius: 8px;">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cuerpoTabla}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.addEventListeners();
    }
    
    addEventListeners() {
        const dashboard = document.querySelector('acme-dashboard');
        
        // Acciones rápidas
        this.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', () => {
                const view = card.getAttribute('data-action');
                if(dashboard && view) {
                    dashboard.cambiarVista(view);
                }
            });
        });
        
        // Ver resumen detallado -> lleva a certificados (donde pueden ver extractos/lista full)
        const btnVerTodos = this.querySelector('#btn-ver-todos');
        if(btnVerTodos) {
            btnVerTodos.addEventListener('click', () => {
                if(dashboard) dashboard.cambiarVista('certificate');
            });
        }
    }
}

customElements.define('acme-summary', AcmeResumen);
