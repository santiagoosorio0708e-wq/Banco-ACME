/**
 * acme-prestamo.js
 * Componente Web: Solicitud de préstamos / créditos
 * Permite al usuario solicitar un crédito y ver el estado de sus solicitudes previas.
 */
class AcmePrestamo extends HTMLElement {
    connectedCallback() {
        this.usuario = window.auth.obtenerUsuarioActual();
        this.cuenta = window.db.obtenerCuentaPorUsuario(this.usuario.numeroId);
        this.vista = 'lista'; // 'lista' | 'solicitar'
        this.render();
    }

    render() {
        const prestamos = window.db.obtenerPrestamosPorUsuario(this.usuario.numeroId);

        const estadoBadge = (estado) => {
            const mapa = {
            return `<span style="background:${s.bg};color:${s.color};padding:0.25rem 0.75rem;border-radius:20px;font-size:0.8rem;font-weight:600;">${estado}</span>`;
        };

        const tarjetasPrestamos = prestamos.length === 0
            ? `<div style="text-align:center;padding:3rem 1rem;color:var(--text-light);">
                <p>No tienes solicitudes de crédito registradas.</p>
               </div>`
            : prestamos.map(p => `
                <div class="prestamo-tarjeta">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;margin-bottom:1rem;">
                        <div>
                            <h4 style="margin:0;">${p.tipoPrestamo}</h4>
                            <p style="margin:0.25rem 0 0;color:var(--text-light);font-size:0.85rem;">Radicado: <span style="font-family:monospace;">${p.radicado}</span></p>
                        </div>
                        ${estadoBadge(p.estado)}
                    </div>
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0.75rem;">
                        <div>
                            <p style="margin:0;font-size:0.78rem;color:var(--text-light);text-transform:uppercase;font-weight:600;">Monto solicitado</p>
                            <strong>$${Number(p.monto).toLocaleString('es-CO')}</strong>
                        </div>
                        <div>
                            <p style="margin:0;font-size:0.78rem;color:var(--text-light);text-transform:uppercase;font-weight:600;">Plazo</p>
                            <strong>${p.plazo} meses</strong>
                        </div>
                        <div>
                            <p style="margin:0;font-size:0.78rem;color:var(--text-light);text-transform:uppercase;font-weight:600;">Fecha solicitud</p>
                            <strong>${new Date(p.fecha).toLocaleDateString('es-CO')}</strong>
                        </div>
                        <div>
                            <p style="margin:0;font-size:0.78rem;color:var(--text-light);text-transform:uppercase;font-weight:600;">Destino</p>
                            <strong>${p.destino}</strong>
                        </div>
                    </div>
                        <div style="margin-top:1rem;padding:0.75rem;background:#fff3cd;border-radius:8px;font-size:0.85rem;color:#856404;">
                            Tu solicitud está siendo evaluada. Recibirás respuesta en 2 a 5 días hábiles.
                        </div>` : ''}
                    ${p.estado === 'Aprobado' ? `
                        <div style="margin-top:1rem;">
                            <button class="btn btn-primary btn-desembolsar" data-radicado="${p.radicado}" data-monto="${p.monto}" style="max-width:220px;">
                                Solicitar desembolso
                            </button>
                        </div>` : ''}
                </div>`).join('');

        const formulario = `
            <div class="card" style="max-width:720px;margin:0 auto;">
                <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
                    <button id="btn-volver-lista" class="btn btn-secondary" style="width:auto;padding:0.5rem 1rem;">← Volver</button>
                    <h3 style="margin:0;">Nueva solicitud de crédito</h3>
                </div>

                <div id="alerta-prestamo" class="alert hidden"></div>

                <div style="background:var(--secondary-color);padding:1rem;border-radius:10px;margin-bottom:1.5rem;display:flex;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;">
                    <div>
                        <p style="margin:0;font-size:0.82rem;color:var(--text-light);">Titular</p>
                        <strong>${this.usuario.nombres} ${this.usuario.apellidos}</strong>
                    </div>
                    <div>
                        <p style="margin:0;font-size:0.82rem;color:var(--text-light);">Cuenta vinculada</p>
                        <strong>${this.cuenta.numeroCuenta}</strong>
                    </div>
                </div>

                <form id="form-prestamo">
                    <div class="grid-2-col">
                        <div class="form-group">
                            <label>Tipo de crédito *</label>
                            <select id="pr-tipo" required>
                                <option value="">-- Selecciona --</option>
                                <option value="Crédito de consumo">Crédito de consumo</option>
                                <option value="Crédito de vivienda">Crédito de vivienda</option>
                                <option value="Crédito vehicular">Crédito vehicular</option>
                                <option value="Libre inversión">Libre inversión</option>
                                <option value="Microcrédito">Microcrédito</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Monto solicitado *</label>
                            <input type="number" id="pr-monto" min="500000" max="500000000" step="100000" placeholder="Ej: 10000000" required>
                        </div>
                        <div class="form-group">
                            <label>Plazo (meses) *</label>
                            <select id="pr-plazo" required>
                                <option value="">-- Selecciona --</option>
                                ${[6,12,18,24,36,48,60,72,84].map(m => `<option value="${m}">${m} meses</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Destino del crédito *</label>
                            <input type="text" id="pr-destino" placeholder="Ej: Compra de vehículo" maxlength="80" required>
                        </div>
                        <div class="form-group">
                            <label>Ingresos mensuales *</label>
                            <input type="number" id="pr-ingresos" min="1" step="1000" placeholder="Ej: 3500000" required>
                        </div>
                        <div class="form-group">
                            <label>Actividad económica *</label>
                            <select id="pr-actividad" required>
                                <option value="">-- Selecciona --</option>
                                <option value="Empleado">Empleado</option>
                                <option value="Independiente">Independiente</option>
                                <option value="Empresario">Empresario</option>
                                <option value="Pensionado">Pensionado</option>
                                <option value="Estudiante">Estudiante</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Información adicional</label>
                        <textarea id="pr-descripcion" rows="3" style="width:100%;padding:0.75rem;border:1px solid var(--border-color);border-radius:var(--border-radius);font-family:var(--font-family);font-size:1rem;resize:vertical;" placeholder="Cuéntanos brevemente para qué destinarás el crédito..."></textarea>
                    </div>
                    <div style="background:#d1ecf1;padding:1rem;border-radius:8px;margin-bottom:1.5rem;font-size:0.88rem;color:#0c5460;">
                        Esta es una solicitud digital. Banco Acme evaluará tu información y te notificará el resultado en un plazo de 2 a 5 días hábiles.
                    </div>
                    <button type="submit" class="btn btn-primary">Enviar solicitud</button>
                </form>
            </div>`;

        this.innerHTML = `
            <style>
                .prestamo-tarjeta {
                    background:white; border:1px solid var(--border-color);
                    border-radius:12px; padding:1.5rem; margin-bottom:1rem;
                    box-shadow:var(--shadow-sm); transition: box-shadow 0.2s;
                }
                .prestamo-tarjeta:hover { box-shadow:var(--shadow-md); }
                textarea:focus { outline:none; border-color:var(--primary-color); box-shadow:0 0 0 3px rgba(11,61,145,0.1); }
            </style>
            <div style="max-width:820px;margin:0 auto;">
                ${this.vista === 'lista' ? `
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
                        <div>
                            <h3 style="margin:0;">Mis créditos</h3>
                            <p style="margin:0.25rem 0 0;color:var(--text-light);">Gestiona tus solicitudes de préstamo.</p>
                        </div>
                        <button class="btn btn-primary" id="btn-nueva-solicitud" style="width:auto;padding:0.65rem 1.5rem;">+ Nueva solicitud</button>
                    </div>
                    <div id="alerta-prestamo-lista" class="alert hidden"></div>
                    ${tarjetasPrestamos}
                ` : formulario}
            </div>`;

        this.addEventListeners();
    }

    addEventListeners() {
        const btnNueva = this.querySelector('#btn-nueva-solicitud');
        if (btnNueva) btnNueva.addEventListener('click', () => { this.vista = 'solicitar'; this.render(); });

        const btnVolver = this.querySelector('#btn-volver-lista');
        if (btnVolver) btnVolver.addEventListener('click', () => { this.vista = 'lista'; this.render(); });

        const form = this.querySelector('#form-prestamo');
        if (form) form.addEventListener('submit', (e) => { e.preventDefault(); this.enviarSolicitud(); });

        this.querySelectorAll('.btn-desembolsar').forEach(btn => {
            btn.addEventListener('click', () => this.desembolsar(btn.dataset.radicado, parseFloat(btn.dataset.monto)));
        });
    }

    enviarSolicitud() {
        const alerta = this.querySelector('#alerta-prestamo');
        const tipo = this.querySelector('#pr-tipo').value;
        const monto = parseFloat(this.querySelector('#pr-monto').value);
        const plazo = parseInt(this.querySelector('#pr-plazo').value);
        const destino = this.querySelector('#pr-destino').value.trim();
        const ingresos = parseFloat(this.querySelector('#pr-ingresos').value);
        const actividad = this.querySelector('#pr-actividad').value;
        const descripcion = this.querySelector('#pr-descripcion').value.trim();

        if (!tipo || !plazo || !actividad) {
            this.mostrarAlerta(alerta, 'Por favor completa todos los campos obligatorios.', 'danger');
            return;
        }
        if (isNaN(monto) || monto < 500000) {
            this.mostrarAlerta(alerta, 'El monto mínimo de crédito es $500.000.', 'danger');
            return;
        }
        if (isNaN(ingresos) || ingresos < 1) {
            this.mostrarAlerta(alerta, 'Ingresa tus ingresos mensuales.', 'danger');
            return;
        }

        const cuotaEstimada = monto / plazo;
        if (cuotaEstimada > ingresos * 0.4) {
            this.mostrarAlerta(alerta, `La cuota estimada ($${Math.round(cuotaEstimada).toLocaleString('es-CO')}/mes) supera el 40% de tus ingresos. Considera reducir el monto o ampliar el plazo.`, 'danger');
            return;
        }

        window.db.crearPrestamo({
            usuarioId: this.usuario.numeroId,
            numeroCuenta: this.cuenta.numeroCuenta,
            tipoPrestamo: tipo,
            monto,
            plazo,
            destino,
            ingresos,
            actividad,
            descripcion,
            estado: 'Pendiente'
        });

        this.vista = 'lista';
        this.render();
        const alertaLista = this.querySelector('#alerta-prestamo-lista');
        this.mostrarAlerta(alertaLista, 'Solicitud enviada correctamente. Recibirás respuesta en 2 a 5 días hábiles.', 'success');
    }

    desembolsar(radicado, monto) {
        const alerta = this.querySelector('#alerta-prestamo-lista');
        try {
            window.db.actualizarSaldo(this.cuenta.numeroCuenta, monto, true);
            window.db.crearTransaccion({
                numeroCuenta: this.cuenta.numeroCuenta,
                tipo: 'Consignación',
                monto,
                concepto: `Desembolso crédito ${radicado}`
            });
            window.db.actualizarEstadoPrestamo(radicado, 'Desembolsado');
            this.cuenta = window.db.obtenerCuentaPorUsuario(this.usuario.numeroId);
            this.render();
            this.mostrarAlerta(this.querySelector('#alerta-prestamo-lista'), `Desembolso exitoso. Se acreditaron $${Number(monto).toLocaleString('es-CO')} a tu cuenta.`, 'success');
        } catch (err) {
            this.mostrarAlerta(alerta, err.message, 'danger');
        }
    }

    mostrarAlerta(el, msg, tipo) {
        if (!el) return;
        el.textContent = msg;
        el.className = `alert alert-${tipo}`;
        el.classList.remove('hidden');
    }
}

customElements.define('acme-prestamo', AcmePrestamo);
