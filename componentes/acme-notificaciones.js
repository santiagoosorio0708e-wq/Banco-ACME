class AcmeNotificaciones extends HTMLElement {
    connectedCallback() {
        this.usuario = window.auth.obtenerUsuarioActual();
        this.filtro = 'todas';
        this.render();
    }

    obtenerNotificaciones() {
        const notis = window.db.obtenerNotificaciones(this.usuario.numeroId);
        const cuenta = window.db.obtenerCuentaPorUsuario(this.usuario.numeroId);
        
        if (cuenta) {
            const txs = window.db.obtenerTransaccionesPorCuenta(cuenta.numeroCuenta).slice(0, 5);
            txs.forEach(tx => {
                const yaExiste = notis.find(n => n.referenciaOrigen === tx.referencia);
                if (!yaExiste) {
                    const esIngreso = tx.tipo === 'Consignación';
                    notis.unshift({
                        id: `tx-${tx.referencia}`,
                        referenciaOrigen: tx.referencia,
                        tipo: 'transaccion',
                        titulo: esIngreso ? 'Ingreso recibido' : 'Débito registrado',
                        mensaje: `${tx.concepto} — $${Number(tx.monto).toLocaleString('es-CO')}`,
                        fecha: tx.fecha,
                        leida: false,
                        icono: esIngreso ? 'IN' : 'OUT',
                        color: esIngreso ? '#d4edda' : '#f8d7da'
                    });
                }
            });
        }

        const sistemaNotiIds = ['bienvenida', 'seguridad', 'actualizacion'];
        const sistemaMsgs = [
            { id: 'bienvenida', titulo: '¡Bienvenido a Banco Acme!', mensaje: 'Gracias por usar nuestro portal transaccional. Puedes gestionar tus operaciones de forma segura desde aquí.', tipo: 'sistema', color: '#cce5ff' },
            { id: 'seguridad', titulo: 'Consejo de seguridad', mensaje: 'Nunca compartas tu contraseña ni datos de inicio de sesión con nadie. Banco Acme jamás te los pedirá.', tipo: 'sistema', color: '#fff3cd' },
            { id: 'actualizacion', titulo: 'Portal actualizado', mensaje: 'Hemos añadido nuevos módulos: transferencias, simulador de crédito, presupuesto y más.', tipo: 'sistema', color: '#d4edda' }
        ];
        sistemaMsgs.forEach(s => {
            if (!notis.find(n => n.id === s.id)) {
                notis.push({ ...s, id: s.id, fecha: new Date().toISOString(), leida: false, icono: 'INFO' });
            }
        });

        window.db.guardarNotificaciones(this.usuario.numeroId, notis);
        return notis;
    }

    render() {
        const todasNotis = this.obtenerNotificaciones();
        const filtros = [
            { key: 'todas', label: 'Todas' },
            { key: 'no-leidas', label: 'No leídas' },
            { key: 'transaccion', label: 'Transacciones' },
            { key: 'sistema', label: 'Sistema' }
        ];

        const filtradas = todasNotis.filter(n => {
            if (this.filtro === 'todas') return true;
            if (this.filtro === 'no-leidas') return !n.leida;
            return n.tipo === this.filtro;
        });

        const noLeidasCount = todasNotis.filter(n => !n.leida).length;

        const tarjetas = filtradas.length === 0
            ? `<div style="text-align:center;padding:3rem;color:var(--text-light);"><p>No hay notificaciones en esta categoría.</p></div>`
            : filtradas.map(n => `
                <div class="noti-card${n.leida ? ' leida' : ''}" data-id="${n.id}" style="border-left:4px solid ${n.leida ? 'var(--border-color)' : 'var(--primary-color)'};background:${n.leida ? 'white' : n.color || '#f0f4ff'};">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.75rem;">
                        <div style="display:flex;gap:0.75rem;align-items:flex-start;flex:1;">
                            <span style="font-size:0.8rem; font-weight: bold; background: rgba(0,0,0,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">${n.icono || 'MSG'}</span>
                            <div style="flex:1;">
                                <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                                    <strong style="font-size:0.95rem;">${n.titulo}</strong>
                                    ${!n.leida ? '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--primary-color);"></span>' : ''}
                                </div>
                                <p style="margin:0.25rem 0 0;color:var(--text-light);font-size:0.88rem;line-height:1.5;">${n.mensaje}</p>
                                <p style="margin:0.35rem 0 0;color:var(--text-light);font-size:0.78rem;">
                                    ${new Date(n.fecha).toLocaleString('es-CO')}
                                </p>
                            </div>
                        </div>
                        ${!n.leida ? `<button class="btn-marcar-leida" data-id="${n.id}" title="Marcar como leída" style="background:none;border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.78rem;color:var(--text-light);white-space:nowrap;flex-shrink:0;">Leída</button>` : `<span style="color:var(--text-light);font-size:0.78rem;flex-shrink:0;">Leída</span>`}
                    </div>
                </div>`).join('');

        this.innerHTML = `
            <style>
                .noti-card { border-radius:10px; padding:1.1rem 1.25rem; margin-bottom:0.75rem; transition:box-shadow 0.2s, opacity 0.2s; border: 1px solid rgba(0,0,0,0.06); }
                .noti-card:hover { box-shadow:var(--shadow-md); }
                .noti-card.leida { opacity:0.72; }
                .noti-filtros { display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.25rem; }
                .noti-filtro { padding:0.4rem 1rem; border-radius:20px; border:1px solid var(--border-color); background:transparent; cursor:pointer; font-size:0.85rem; font-weight:500; transition:all 0.2s; font-family:var(--font-family); }
                .noti-filtro.activo { background:var(--primary-color);color:white;border-color:var(--primary-color); }
            </style>
            <div style="max-width:800px;margin:0 auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;margin-bottom:1.25rem;">
                    <div>
                        <h3 style="margin:0;">Notificaciones
                            ${noLeidasCount > 0 ? `<span style="background:var(--danger-color);color:white;font-size:0.75rem;padding:0.15rem 0.5rem;border-radius:20px;margin-left:0.5rem;vertical-align:middle;">${noLeidasCount}</span>` : ''}
                        </h3>
                        <p style="margin:0.25rem 0 0;color:var(--text-light);">${noLeidasCount} sin leer de ${todasNotis.length} en total.</p>
                    </div>
                    ${noLeidasCount > 0 ? `<button class="btn btn-secondary" id="btn-marcar-todas" style="width:auto;padding:0.5rem 1.25rem;font-size:0.88rem;">Marcar todas como leídas</button>` : ''}
                </div>
                <div class="noti-filtros">
                    ${filtros.map(f => `<button class="noti-filtro${this.filtro === f.key ? ' activo' : ''}" data-filtro="${f.key}">${f.label}</button>`).join('')}
                </div>
                ${tarjetas}
            </div>`;
        this.addEventListeners();
    }

    addEventListeners() {
        this.querySelectorAll('.noti-filtro').forEach(btn => {
            btn.addEventListener('click', () => { this.filtro = btn.dataset.filtro; this.render(); });
        });
        this.querySelectorAll('.btn-marcar-leida').forEach(btn => {
            btn.addEventListener('click', () => { window.db.marcarNotificacionLeida(this.usuario.numeroId, btn.dataset.id); this.render(); });
        });
        const btnTodas = this.querySelector('#btn-marcar-todas');
        if (btnTodas) {
            btnTodas.addEventListener('click', () => { window.db.marcarTodasLeidas(this.usuario.numeroId); this.render(); });
        }
    }
}
customElements.define('acme-notificaciones', AcmeNotificaciones);
