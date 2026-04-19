/**
 * acme-tarjeta.js
 * Componente Web: Tarjeta virtual del usuario
 * Muestra la tarjeta de débito virtual, datos básicos y estadísticas del mes.
 */
class AcmeTarjeta extends HTMLElement {
    connectedCallback() {
        this.usuario = window.auth.obtenerUsuarioActual();
        this.cuenta = window.db.obtenerCuentaPorUsuario(this.usuario.numeroId);
        this.mostrarNumero = false;
        this.render();
    }

    calcularEstadisticasMes() {
        const ahora = new Date();
        const txs = window.db.obtenerTransaccionesPorCuenta(this.cuenta.numeroCuenta).filter(t => {
            const f = new Date(t.fecha);
            return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
        });
        const ingresos = txs.filter(t => t.tipo === 'Consignación').reduce((s, t) => s + Number(t.monto), 0);
        const gastos   = txs.filter(t => t.tipo === 'Retiro').reduce((s, t) => s + Number(t.monto), 0);
        return { ingresos, gastos, totalTx: txs.length };
    }

    generarNumeroTarjeta() {
        // Genera un número de tarjeta ficticio basado en el número de cuenta
        const base = this.cuenta.numeroCuenta.padStart(16, '4');
        return base.substring(0, 16).replace(/(\d{4})/g, '$1 ').trim();
    }

    render() {
        const stats = this.calcularEstadisticasMes();
        const numTarjeta = this.generarNumeroTarjeta();
        const numOculto  = '**** **** **** ' + numTarjeta.slice(-4);
        const fechaExp   = new Date(this.cuenta.fechaCreacion);
        fechaExp.setFullYear(fechaExp.getFullYear() + 4);
        const expStr = `${String(fechaExp.getMonth() + 1).padStart(2,'0')}/${String(fechaExp.getFullYear()).slice(-2)}`;
        const nombreTarjeta = `${this.usuario.nombres.split(' ')[0].toUpperCase()} ${this.usuario.apellidos.split(' ')[0].toUpperCase()}`;
        const mes = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

        // Últimos 5 movimientos
        const txsRecientes = window.db.obtenerTransaccionesPorCuenta(this.cuenta.numeroCuenta).slice(0, 5);
        const movimientosHTML = txsRecientes.length === 0
            ? `<p style="color:var(--text-light);text-align:center;padding:1.5rem;">Sin movimientos registrados.</p>`
            : txsRecientes.map(t => {
                const esIngreso = t.tipo === 'Consignación';
                return `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:0.85rem 0;border-bottom:1px solid var(--border-color);">
                    <div style="display:flex;align-items:center;gap:0.75rem;">
                        <div style="width:38px;height:38px;border-radius:50%;background:${esIngreso ? '#d4edda' : '#f8d7da'};display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">
                            ${esIngreso ? '↓' : '↑'}
                        </div>
                        <div>
                            <p style="margin:0;font-size:0.88rem;font-weight:600;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.concepto}</p>
                            <p style="margin:0;font-size:0.75rem;color:var(--text-light);">${new Date(t.fecha).toLocaleDateString('es-CO')}</p>
                        </div>
                    </div>
                    <strong style="color:${esIngreso ? 'var(--success-color)' : 'var(--danger-color)'};font-size:0.95rem;flex-shrink:0;">
                        ${esIngreso ? '+' : '-'} $${Number(t.monto).toLocaleString('es-CO')}
                    </strong>
                </div>`;
            }).join('');

        this.innerHTML = `
            <style>
                .tarjeta-virtual {
                    background: linear-gradient(135deg, #0b3d91 0%, #1565c0 40%, #1a88d1 100%);
                    border-radius: 20px;
                    padding: 2rem;
                    color: white;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(11, 61, 145, 0.4);
                    max-width: 420px;
                    margin: 0 auto 2rem;
                    transition: transform 0.3s;
                    cursor: default;
                    user-select: none;
                }
                .tarjeta-virtual:hover { transform: translateY(-4px) rotateX(2deg); }
                .tarjeta-virtual::before {
                    content: '';
                    position: absolute;
                    top: -60px; right: -60px;
                    width: 220px; height: 220px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.06);
                }
                .tarjeta-virtual::after {
                    content: '';
                    position: absolute;
                    bottom: -80px; left: -40px;
                    width: 260px; height: 260px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.04);
                }
                .chip-tarjeta {
                    width: 44px; height: 34px;
                    background: linear-gradient(135deg, #d4a843, #f0c96a);
                    border-radius: 6px;
                    margin-bottom: 1.5rem;
                    position: relative;
                    z-index: 1;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                }
                .chip-tarjeta::before {
                    content: '';
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%,-50%);
                    width: 28px; height: 22px;
                    border: 1.5px solid rgba(139,90,0,0.4);
                    border-radius: 3px;
                }
                .tarjeta-numero {
                    font-size: 1.3rem;
                    letter-spacing: 0.2em;
                    font-family: 'Courier New', monospace;
                    margin-bottom: 1.25rem;
                    position: relative; z-index: 1;
                }
                .tarjeta-footer {
                    display: flex; justify-content: space-between;
                    align-items: flex-end; position: relative; z-index: 1;
                }
                .tarjeta-label { font-size: 0.65rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.08em; }
                .tarjeta-valor { font-size: 0.95rem; font-weight: 600; }
                .tarjeta-logo-visa {
                    font-size: 1.6rem; font-weight: 900; font-style: italic;
                    letter-spacing: -0.05em; opacity: 0.9;
                }
                .stat-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; }
                @media(max-width: 500px) { .stat-row { grid-template-columns: 1fr 1fr; } }
                .stat-box {
                    background: var(--secondary-color); border-radius: 12px;
                    padding: 1rem; text-align: center;
                }
                .stat-box .s-val { font-size: 1.1rem; font-weight: 700; margin: 0.2rem 0; }
                .stat-box .s-lbl { font-size: 0.75rem; color: var(--text-light); }
                .acciones-tarjeta { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
                .accion-btn {
                    flex: 1; min-width: 100px; padding: 0.75rem 0.5rem;
                    border-radius: 10px; border: 1px solid var(--border-color);
                    background: white; cursor: pointer; text-align: center;
                    font-family: var(--font-family); font-size: 0.82rem; font-weight: 600;
                    color: var(--text-dark); transition: all 0.2s; display: flex;
                    flex-direction: column; align-items: center; gap: 0.3rem;
                }
                .accion-btn:hover { background: var(--primary-color); color: white; border-color: var(--primary-color); transform: translateY(-2px); }
                .accion-btn .accion-icono { font-size: 1.4rem; }
            </style>

            <div style="max-width: 820px; margin: 0 auto;">
                <h3 style="margin-bottom: 0.25rem;">Mi tarjeta virtual</h3>
                <p style="color: var(--text-light); margin-bottom: 1.5rem;">Débito Banco Acme · Cuenta de ahorros</p>

                <!-- Tarjeta visual -->
                <div class="tarjeta-virtual">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;position:relative;z-index:1;">
                        <span style="font-size:0.85rem;font-weight:700;letter-spacing:0.08em;opacity:0.9;">BANCO ACME</span>
                        <span style="font-size:0.75rem;opacity:0.7;">Débito</span>
                    </div>
                    <div class="chip-tarjeta"></div>
                    <div class="tarjeta-numero">${this.mostrarNumero ? numTarjeta : numOculto}</div>
                    <div class="tarjeta-footer">
                        <div>
                            <div class="tarjeta-label">Titular</div>
                            <div class="tarjeta-valor">${nombreTarjeta}</div>
                        </div>
                        <div>
                            <div class="tarjeta-label">Válida hasta</div>
                            <div class="tarjeta-valor">${expStr}</div>
                        </div>
                        <div>
                            <div class="tarjeta-label">CVV</div>
                            <div class="tarjeta-valor">${this.mostrarNumero ? '***' : '***'}</div>
                        </div>
                        <div class="tarjeta-logo-visa">ACME</div>
                    </div>
                </div>

                <!-- Acciones rápidas -->
                <div class="acciones-tarjeta">
                    <button class="accion-btn" id="btn-toggle-numero">
                        <span class="accion-icono"></span>
                        <span>${this.mostrarNumero ? 'Ocultar' : 'Ver número'}</span>
                    </button>
                    <button class="accion-btn" id="btn-copiar-cuenta">
                        <span class="accion-icono"></span>
                        <span>Copiar cuenta</span>
                    </button>
                    <button class="accion-btn" id="btn-bloquear">
                        <span class="accion-icono"></span>
                        <span>Bloquear</span>
                    </button>
                    <button class="accion-btn" id="btn-extracto">
                        <span class="accion-icono"></span>
                        <span>Extracto</span>
                    </button>
                </div>

                <div id="alerta-tarjeta" class="alert hidden"></div>

                <!-- Estadísticas del mes -->
                <h4 style="margin-bottom: 0.75rem;">Estadísticas — ${mes.charAt(0).toUpperCase() + mes.slice(1)}</h4>
                <div class="stat-row">
                    <div class="stat-box">
                        <div class="s-lbl">Saldo disponible</div>
                        <div class="s-val" style="color:var(--primary-color);">$${Number(this.cuenta.saldo).toLocaleString('es-CO')}</div>
                    </div>
                    <div class="stat-box">
                        <div class="s-lbl">Ingresos del mes</div>
                        <div class="s-val" style="color:var(--success-color);">+$${Number(stats.ingresos).toLocaleString('es-CO')}</div>
                    </div>
                    <div class="stat-box">
                        <div class="s-lbl">Gastos del mes</div>
                        <div class="s-val" style="color:var(--danger-color);">-$${Number(stats.gastos).toLocaleString('es-CO')}</div>
                    </div>
                </div>

                <!-- Últimos movimientos -->
                <div class="card" style="margin-top: 0.5rem;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                        <h4 style="margin:0;">Últimos movimientos</h4>
                        <span style="font-size:0.82rem;color:var(--text-light);">${stats.totalTx} transacciones este mes</span>
                    </div>
                    ${movimientosHTML}
                </div>
            </div>`;

        this.addEventListeners();
    }

    addEventListeners() {
        const alerta = this.querySelector('#alerta-tarjeta');

        this.querySelector('#btn-toggle-numero')?.addEventListener('click', () => {
            this.mostrarNumero = !this.mostrarNumero;
            this.render();
        });

        this.querySelector('#btn-copiar-cuenta')?.addEventListener('click', () => {
            navigator.clipboard.writeText(this.cuenta.numeroCuenta).then(() => {
                this.mostrarAlerta(alerta, `Número de cuenta ${this.cuenta.numeroCuenta} copiado al portapapeles.`, 'success');
            }).catch(() => {
                this.mostrarAlerta(alerta, `Cuenta: ${this.cuenta.numeroCuenta}`, 'success');
            });
        });

        this.querySelector('#btn-bloquear')?.addEventListener('click', () => {
            this.mostrarAlerta(alerta, 'El bloqueo de tarjeta es una función disponible en sucursal física o llamando al 01 8000 ACME (2263).', 'danger');
        });

        this.querySelector('#btn-extracto')?.addEventListener('click', () => {
            window.print();
        });
    }

    mostrarAlerta(el, msg, tipo) {
        if (!el) return;
        el.textContent = msg;
        el.className = `alert alert-${tipo}`;
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 5000);
    }
}

customElements.define('acme-tarjeta', AcmeTarjeta);
