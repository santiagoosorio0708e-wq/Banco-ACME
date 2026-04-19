/**
 * acme-soporte.js
 * Componente Web: Centro de soporte — PQR (Peticiones, Quejas y Reclamos)
 * Permite al usuario radicar solicitudes y ver el historial.
 */
class AcmeSoporte extends HTMLElement {
    connectedCallback() {
        this.usuario = window.auth.obtenerUsuarioActual();
        this.vista = 'lista'; // 'lista' | 'nueva'
        this.categoriaActiva = 'todos';
        this.render();
    }

    render() {
        const pqrs = window.db.obtenerPQRsPorUsuario(this.usuario.numeroId);
        const categorias = ['todos', 'Petición', 'Queja', 'Reclamo', 'Sugerencia'];

        const filtrados = this.categoriaActiva === 'todos'
            ? pqrs
            : pqrs.filter(p => p.tipo === this.categoriaActiva);

        const badgeEstado = (estado) => {
            const map = {
                'Abierto': '#fff3cd:#856404',
                'En revisión': '#d1ecf1:#0c5460',
                'Cerrado': '#d4edda:#155724',
                'Rechazado': '#f8d7da:#721c24'
            };
            const [bg, color] = (map[estado] || '#eee:#333').split(':');
            return `<span style="background:${bg};color:${color};padding:0.2rem 0.7rem;border-radius:20px;font-size:0.78rem;font-weight:600;">${estado}</span>`;
        };

        const tarjetas = filtrados.length === 0
            ? `<div style="text-align:center;padding:3rem;color:var(--text-light);">
                <p>No hay solicitudes en esta categoría.</p>
               </div>`
            : filtrados.map(p => `
                <div class="pqr-card">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.75rem;">
                        <div>
                            <span class="pqr-tipo-badge pqr-${p.tipo.toLowerCase()}">${p.tipo}</span>
                            <h4 style="margin:0.35rem 0 0;">${p.asunto}</h4>
                        </div>
                        ${badgeEstado(p.estado)}
                    </div>
                    <p style="color:var(--text-light);font-size:0.9rem;margin-bottom:0.75rem;line-height:1.5;">${p.descripcion}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;color:var(--text-light);">
                        <span>🗓 ${new Date(p.fecha).toLocaleString('es-CO')}</span>
                        <span style="font-family:monospace;">Rad: ${p.radicado}</span>
                    </div>
                    ${p.respuesta ? `
                        <div style="margin-top:1rem;padding:0.85rem;background:#d4edda;border-radius:8px;border-left:3px solid var(--success-color);">
                            <strong style="font-size:0.82rem;color:#155724;">Respuesta del banco:</strong>
                            <p style="margin:0.35rem 0 0;font-size:0.9rem;color:#155724;">${p.respuesta}</p>
                        </div>` : ''}
                </div>`).join('');

        const formulario = `
            <div class="card" style="max-width:700px;margin:0 auto;">
                <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
                    <button id="btn-volver-pqr" class="btn btn-secondary" style="width:auto;padding:0.5rem 1rem;">← Volver</button>
                    <h3 style="margin:0;">Nueva solicitud</h3>
                </div>
                <div id="alerta-pqr" class="alert hidden"></div>
                <form id="form-pqr">
                    <div class="grid-2-col">
                        <div class="form-group">
                            <label>Tipo de solicitud *</label>
                            <select id="pqr-tipo" required>
                                <option value="">-- Selecciona --</option>
                                <option value="Petición">Petición</option>
                                <option value="Queja">Queja</option>
                                <option value="Reclamo">Reclamo</option>
                                <option value="Sugerencia">Sugerencia</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Canal de atención</label>
                            <select id="pqr-canal">
                                <option value="Portal web">Portal web</option>
                                <option value="App móvil">App móvil</option>
                                <option value="Sucursal">Sucursal física</option>
                                <option value="Cajero">Cajero automático</option>
                                <option value="Línea telefónica">Línea telefónica</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Asunto *</label>
                        <input type="text" id="pqr-asunto" placeholder="Ej: Cobro no reconocido en mi cuenta" maxlength="100" required>
                    </div>
                    <div class="form-group">
                        <label>Descripción detallada *</label>
                        <textarea id="pqr-descripcion" rows="5" style="width:100%;padding:0.75rem;border:1px solid var(--border-color);border-radius:var(--border-radius);font-family:var(--font-family);font-size:1rem;resize:vertical;" placeholder="Describe con detalle tu solicitud, queja o reclamo..." required></textarea>
                    </div>
                    <div class="form-group">
                        <label>Número de cuenta relacionado (opcional)</label>
                        <input type="text" id="pqr-cuenta" value="${this.cuenta?.numeroCuenta || ''}" readonly style="background:#f5f5f5;">
                    </div>
                    <div style="background:#d1ecf1;padding:0.9rem 1rem;border-radius:8px;margin-bottom:1.25rem;font-size:0.87rem;color:#0c5460;">
                        Banco Acme tiene hasta <strong>15 días hábiles</strong> para dar respuesta a Quejas y Reclamos, y <strong>30 días hábiles</strong> para Peticiones, conforme a la normativa de la Superfinanciera.
                    </div>
                    <button type="submit" class="btn btn-primary">Radicar solicitud</button>
                </form>
            </div>`;

        this.innerHTML = `
            <style>
                .pqr-card {
                    background:white;border:1px solid var(--border-color);
                    border-radius:12px;padding:1.25rem 1.5rem;margin-bottom:1rem;
                    box-shadow:var(--shadow-sm);transition:box-shadow 0.2s;
                }
                .pqr-card:hover { box-shadow:var(--shadow-md); }
                .pqr-tipo-badge {
                    display:inline-block;padding:0.2rem 0.7rem;border-radius:4px;
                    font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;
                }
                .pqr-petición { background:#cce5ff;color:#004085; }
                .pqr-queja   { background:#f8d7da;color:#721c24; }
                .pqr-reclamo { background:#fff3cd;color:#856404; }
                .pqr-sugerencia { background:#d4edda;color:#155724; }
                .pqr-filtros { display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.25rem; }
                .pqr-filtro {
                    padding:0.4rem 1rem;border-radius:20px;border:1px solid var(--border-color);
                    background:transparent;cursor:pointer;font-size:0.85rem;font-weight:500;
                    transition:all 0.2s;font-family:var(--font-family);
                }
                .pqr-filtro.activo { background:var(--primary-color);color:white;border-color:var(--primary-color); }
                textarea:focus { outline:none;border-color:var(--primary-color);box-shadow:0 0 0 3px rgba(11,61,145,0.1); }
            </style>
            <div style="max-width:820px;margin:0 auto;">
                ${this.vista === 'lista' ? `
                    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1.25rem;">
                        <div>
                            <h3 style="margin:0;">Centro de soporte — PQR</h3>
                            <p style="margin:0.25rem 0 0;color:var(--text-light);">Radica peticiones, quejas, reclamos y sugerencias.</p>
                        </div>
                        <button class="btn btn-primary" id="btn-nueva-pqr" style="width:auto;padding:0.65rem 1.5rem;">+ Nueva solicitud</button>
                    </div>
                    <div class="pqr-filtros">
                        ${categorias.map(c => `<button class="pqr-filtro${this.categoriaActiva === c ? ' activo' : ''}" data-cat="${c}">${c === 'todos' ? 'Todas' : c}</button>`).join('')}
                    </div>
                    ${tarjetas}
                ` : formulario}
            </div>`;

        this.cuenta = window.db.obtenerCuentaPorUsuario(this.usuario.numeroId);
        this.addEventListeners();
    }

    addEventListeners() {
        const btnNueva = this.querySelector('#btn-nueva-pqr');
        if (btnNueva) btnNueva.addEventListener('click', () => { this.vista = 'nueva'; this.render(); });

        const btnVolver = this.querySelector('#btn-volver-pqr');
        if (btnVolver) btnVolver.addEventListener('click', () => { this.vista = 'lista'; this.render(); });

        this.querySelectorAll('.pqr-filtro').forEach(btn => {
            btn.addEventListener('click', () => {
                this.categoriaActiva = btn.dataset.cat;
                this.render();
            });
        });

        const form = this.querySelector('#form-pqr');
        if (form) form.addEventListener('submit', (e) => { e.preventDefault(); this.radicarPQR(); });
    }

    radicarPQR() {
        const alerta = this.querySelector('#alerta-pqr');
        const tipo = this.querySelector('#pqr-tipo').value;
        const asunto = this.querySelector('#pqr-asunto').value.trim();
        const descripcion = this.querySelector('#pqr-descripcion').value.trim();
        const canal = this.querySelector('#pqr-canal').value;

        if (!tipo) { this.mostrarAlerta(alerta, 'Selecciona el tipo de solicitud.', 'danger'); return; }
        if (!asunto) { this.mostrarAlerta(alerta, 'El asunto es obligatorio.', 'danger'); return; }
        if (descripcion.length < 20) { this.mostrarAlerta(alerta, 'La descripción debe tener al menos 20 caracteres.', 'danger'); return; }

        window.db.crearPQR({
            usuarioId: this.usuario.numeroId,
            tipo, asunto, descripcion, canal,
            numeroCuenta: this.cuenta?.numeroCuenta || null,
            estado: 'Abierto',
            respuesta: null
        });

        this.vista = 'lista';
        this.categoriaActiva = 'todos';
        this.render();
    }

    mostrarAlerta(el, msg, tipo) {
        if (!el) return;
        el.textContent = msg;
        el.className = `alert alert-${tipo}`;
        el.classList.remove('hidden');
    }
}

customElements.define('acme-soporte', AcmeSoporte);
