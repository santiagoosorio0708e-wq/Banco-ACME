class AcmeAdmin extends HTMLElement {
    connectedCallback() {
        this.vistaActual = 'prestamos';
        this.render();
        this.addEventListeners();
    }

    render() {
        const prestamos = window.db.obtenerTodosLosPrestamos();
        const pqrs = window.db.obtenerTodosLosPQRs();

        let contenido = '';
        if (this.vistaActual === 'prestamos') {
            contenido = `
                <div class="card" style="margin-top: 1rem;">
                    <h3>Gestión de Préstamos Solicitados</h3>
                    ${prestamos.length === 0 ? '<p>No hay préstamos solicitados.</p>' : `
                    <div class="table-responsive">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="border-bottom: 2px solid var(--border-color);">
                                    <th style="padding: 0.5rem;">Radicado</th>
                                    <th style="padding: 0.5rem;">Cédula Cliente</th>
                                    <th style="padding: 0.5rem;">Monto</th>
                                    <th style="padding: 0.5rem;">Estado</th>
                                    <th style="padding: 0.5rem;">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${prestamos.map(p => `
                                    <tr style="border-bottom: 1px solid var(--border-color);">
                                        <td style="padding: 0.5rem;">${p.radicado}</td>
                                        <td style="padding: 0.5rem;">${p.usuarioId}</td>
                                        <td style="padding: 0.5rem;">$${Number(p.monto).toLocaleString('es-CO')}</td>
                                        <td style="padding: 0.5rem;">
                                            <span style="padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.85rem; background: ${p.estado === 'Aprobado' ? 'var(--success-color)' : p.estado === 'Rechazado' ? 'var(--danger-color)' : 'var(--warning-color)'}; color: ${p.estado === 'Pendiente' ? '#000' : '#fff'};">
                                                ${p.estado}
                                            </span>
                                        </td>
                                        <td style="padding: 0.5rem;">
                                            ${p.estado === 'Pendiente' ? `
                                                <button class="btn btn-primary btn-sm admin-aprobar-loan" data-id="${p.radicado}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; margin-right: 0.5rem;">Aprobar</button>
                                                <button class="btn btn-secondary btn-sm admin-rechazar-loan" data-id="${p.radicado}" style="background:var(--danger-color); padding: 0.3rem 0.6rem; font-size: 0.8rem;">Rechazar</button>
                                            ` : 'Resuelto'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    `}
                </div>
            `;
        } else {
            contenido = `
                <div class="card" style="margin-top: 1rem;">
                    <h3>Gestión de PQRs</h3>
                    ${pqrs.length === 0 ? '<p>No hay PQRs radicados.</p>' : `
                    <div style="display:flex; flex-direction:column; gap:1rem;">
                        ${pqrs.map(p => `
                            <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px;">
                                <div style="display:flex; justify-content: space-between;">
                                    <strong>${p.radicado} - ${p.tipo}</strong>
                                    <span style="font-size: 0.8rem; padding: 0.2rem 0.5rem; background: ${p.estado === 'Abierto' ? 'var(--warning-color)' : 'var(--success-color)'}; color: ${p.estado === 'Abierto'? '#000':'#fff'}; border-radius:4px;">${p.estado}</span>
                                </div>
                                <p style="margin: 0.5rem 0; font-size: 0.9rem;"><strong>Cliente ID:</strong> ${p.usuarioId}</p>
                                <p style="margin: 0.5rem 0; font-size: 0.9rem;"><strong>Asunto:</strong> ${p.asunto}</p>
                                <p style="margin: 0.5rem 0; font-size: 0.9rem;"><strong>Detalle:</strong> ${p.detalle}</p>
                                ${p.estado === 'Abierto' ? `
                                    <div style="margin-top: 1rem;">
                                        <textarea id="respuesta-${p.radicado}" placeholder="Escribir respuesta al cliente..." style="width:100%; min-height:60px; padding:0.5rem; border:1px solid var(--border-color); border-radius:4px; margin-bottom: 0.5rem;"></textarea>
                                        <button class="btn btn-primary btn-sm admin-responder-pqr" data-id="${p.radicado}">Enviar Respuesta y Cerrar</button>
                                    </div>
                                ` : `
                                    <div style="margin-top: 1rem; padding: 0.75rem; background: #e9ecef; border-radius:4px; font-size:0.9rem;">
                                        <strong>Respuesta enviada:</strong> ${p.respuesta}
                                    </div>
                                `}
                            </div>
                        `).join('')}
                    </div>
                    `}
                </div>
            `;
        }

        this.innerHTML = `
            <div style="background: var(--primary-color); padding: 1rem 2rem; color: white; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; display:flex; align-items:center; gap:0.5rem;">
                    <img src="imagenes/logo.png" style="height:30px; filter: brightness(0) invert(1);" alt="Logo">
                    Panel de Administrador
                </h2>
                <button class="btn btn-secondary admin-btn-logout" style="border-color: white; color: white;">Cerrar sesión</button>
            </div>
            <div class="container" style="max-width: 1000px; margin: 2rem auto;">
                
                <div style="display:flex; gap: 1rem; margin-bottom: 1rem;">
                    <button class="btn ${this.vistaActual === 'prestamos' ? 'btn-primary' : 'btn-secondary'}" id="admin-tab-prestamos">Solicitudes de Préstamos</button>
                    <button class="btn ${this.vistaActual === 'pqrs' ? 'btn-primary' : 'btn-secondary'}" id="admin-tab-pqrs">Bandeja de PQRs</button>
                </div>

                ${contenido}

            </div>
        `;
    }

    addEventListeners() {
        this.querySelector('.admin-btn-logout').addEventListener('click', () => {
            window.auth.cerrarSesion();
        });

        this.querySelector('#admin-tab-prestamos').addEventListener('click', () => {
            this.vistaActual = 'prestamos';
            this.render();
            this.addEventListeners();
        });

        this.querySelector('#admin-tab-pqrs').addEventListener('click', () => {
            this.vistaActual = 'pqrs';
            this.render();
            this.addEventListeners();
        });

        this.querySelectorAll('.admin-aprobar-loan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Confirma que desea aprobar este préstamo?')) {
                    window.db.actualizarEstadoPrestamo(id, 'Aprobado');
                    this.render();
                    this.addEventListeners();
                }
            });
        });

        this.querySelectorAll('.admin-rechazar-loan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Confirma que desea rechazar este préstamo?')) {
                    window.db.actualizarEstadoPrestamo(id, 'Rechazado');
                    this.render();
                    this.addEventListeners();
                }
            });
        });

        this.querySelectorAll('.admin-responder-pqr').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const respuesta = this.querySelector('#respuesta-' + id).value;
                if (!respuesta.trim()) {
                    alert('Debe escribir una respuesta para cerrar el PQR.');
                    return;
                }
                if (confirm('¿Confirma enviar esta respuesta y cerrar el caso?')) {
                    window.db.responderPQR(id, respuesta);
                    this.render();
                    this.addEventListeners();
                }
            });
        });
    }
}

customElements.define('acme-admin', AcmeAdmin);
