class AcmePresupuesto extends HTMLElement {
    connectedCallback() {
        this.usuario = window.auth.obtenerUsuarioActual();
        this.cuenta = window.db.obtenerCuentaPorUsuario(this.usuario.numeroId);
        this.vistaActiva = 'resumen'; 
        this.render();
    }

    obtenerDatos() {
        return window.db.obtenerPresupuesto(this.usuario.numeroId);
    }

    calcularGastoReal() {
        const ahora = new Date();
        const mesActual = ahora.getMonth();
        const anioActual = ahora.getFullYear();
        const txs = window.db.obtenerTransaccionesPorCuenta(this.cuenta.numeroCuenta)
            .filter(t => {
                const f = new Date(t.fecha);
                return f.getMonth() === mesActual && f.getFullYear() === anioActual && t.tipo === 'Retiro';
            });
        return txs.reduce((sum, t) => sum + Number(t.monto), 0);
    }

    render() {
        const datos = this.obtenerDatos();
        const gastoRealTotal = this.calcularGastoReal();
        const presupuestoTotal = datos.categorias.reduce((s, c) => s + c.monto, 0);
        const porcentajeUsado = presupuestoTotal > 0 ? Math.min(100, (gastoRealTotal / presupuestoTotal) * 100) : 0;
        const colorBarra = porcentajeUsado >= 90 ? 'var(--danger-color)' : porcentajeUsado >= 70 ? 'var(--warning-color)' : 'var(--success-color)';
        const mes = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

        const categoriaIconos = {
            'Alimentación': '', 'Transporte': '', 'Vivienda': '',
            'Salud': '', 'Educación': '', 'Entretenimiento': '',
            'Ropa': '', 'Ahorro': '', 'Servicios públicos': '',
            'Otros': ''
        };

        const tarjetasCategorias = datos.categorias.length === 0
            ? `<div style="text-align:center;padding:2rem;color:var(--text-light);">
                <p>No hay categorías en tu presupuesto. ¡Agrega una!</p>
               </div>`
            : datos.categorias.map(cat => {
                const gasto = gastoRealTotal > 0 ? Math.min(cat.monto, gastoRealTotal * (cat.monto / presupuestoTotal)) : 0;
                const pct = cat.monto > 0 ? Math.min(100, (gasto / cat.monto) * 100) : 0;
                const color = pct >= 90 ? 'var(--danger-color)' : pct >= 70 ? 'var(--warning-color)' : 'var(--success-color)';
                const icono = categoriaIconos[cat.nombre] || '';
                return `
                    <div class="pres-cat-card">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                            <span style="font-weight:600;">${icono} ${cat.nombre}</span>
                            <span style="font-size:0.85rem;color:var(--text-light);">$${Number(cat.monto).toLocaleString('es-CO')}</span>
                        </div>
                        <div style="background:#eef;border-radius:99px;height:8px;overflow:hidden;margin-bottom:0.4rem;">
                            <div style="height:100%;width:${pct}%;background:${color};border-radius:99px;transition:width 0.6s;"></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--text-light);">
                            <span>Gastado: $${Math.round(gasto).toLocaleString('es-CO')}</span>
                            <span>${Math.round(pct)}%</span>
                        </div>
                        <button class="btn-eliminar-cat" data-nombre="${cat.nombre}" style="background:none;border:none;color:var(--danger-color);font-size:0.78rem;cursor:pointer;margin-top:0.35rem;padding:0;">✕ Eliminar</button>
                    </div>`;
            }).join('');

        const metasHTML = datos.metas.length === 0
            ? `<p style="color:var(--text-light);text-align:center;padding:1rem;">No tienes metas de ahorro. ¡Crea una!</p>`
            : datos.metas.map(m => {
                const pct = m.objetivo > 0 ? Math.min(100, (m.acumulado / m.objetivo) * 100) : 0;
                const faltante = Math.max(0, m.objetivo - m.acumulado);
                return `
                    <div class="pres-meta-card">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;flex-wrap:wrap;gap:0.5rem;">
                            <strong>${m.icono || ''} ${m.nombre}</strong>
                            <span style="font-size:0.85rem;background:var(--secondary-color);padding:0.2rem 0.6rem;border-radius:8px;">
                                $${Number(m.acumulado).toLocaleString('es-CO')} / $${Number(m.objetivo).toLocaleString('es-CO')}
                            </span>
                        </div>
                        <div style="background:#eee;border-radius:99px;height:10px;overflow:hidden;margin-bottom:0.5rem;">
                            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--primary-color),#42a5f5);border-radius:99px;transition:width 0.6s;"></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:0.82rem;color:var(--text-light);margin-bottom:0.75rem;">
                            <span>${Math.round(pct)}% completado</span>
                            <span>Falta: $${Number(faltante).toLocaleString('es-CO')}</span>
                        </div>
                        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                            <input type="number" class="meta-abonar-input" data-nombre="${m.nombre}" placeholder="Abonar $" min="1" style="flex:1;min-width:120px;padding:0.5rem;border:1px solid var(--border-color);border-radius:6px;font-size:0.9rem;">
                            <button class="btn btn-primary meta-abonar-btn" data-nombre="${m.nombre}" style="flex:1;min-width:100px;padding:0.5rem;font-size:0.9rem;">Abonar</button>
                            <button class="btn-eliminar-meta" data-nombre="${m.nombre}" style="background:none;border:1px solid var(--danger-color);color:var(--danger-color);border-radius:6px;padding:0.5rem 0.75rem;cursor:pointer;font-size:0.85rem;">✕</button>
                        </div>
                    </div>`;
            }).join('');

        this.innerHTML = `
            <style>
                .pres-tabs { display:flex;gap:0.5rem;margin-bottom:1.5rem;flex-wrap:wrap; }
                .pres-tab {
                    padding:0.55rem 1.25rem;border-radius:8px;border:2px solid var(--border-color);
                    background:transparent;cursor:pointer;font-weight:600;font-size:0.9rem;
                    transition:all 0.2s;font-family:var(--font-family);
                }
                .pres-tab.activo { background:var(--primary-color);color:white;border-color:var(--primary-color); }
                .pres-cat-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem;margin-top:1rem; }
                .pres-cat-card { background:white;border:1px solid var(--border-color);border-radius:10px;padding:1rem;box-shadow:var(--shadow-sm); }
                .pres-meta-card { background:white;border:1px solid var(--border-color);border-radius:10px;padding:1.25rem;box-shadow:var(--shadow-sm);margin-bottom:1rem; }
                .pres-kpi-row { display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1.5rem; }
                @media(max-width:580px){ .pres-kpi-row{grid-template-columns:1fr 1fr;} }
                @media(max-width:380px){ .pres-kpi-row{grid-template-columns:1fr;} }
                .pres-kpi { border-radius:12px;padding:1.25rem;text-align:center; }
                .pres-kpi .val { font-size:1.35rem;font-weight:700;margin:0.25rem 0; }
                .pres-kpi .lbl { font-size:0.78rem;opacity:0.85; }
            </style>

            <div style="max-width:880px;margin:0 auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem;">
                    <div>
                        <h3 style="margin:0;">Presupuesto personal</h3>
                        <p style="margin:0.25rem 0 0;color:var(--text-light);">${mes.charAt(0).toUpperCase() + mes.slice(1)}</p>
                    </div>
                </div>

                <div id="alerta-presupuesto" class="alert hidden"></div>

                <!-- KPIs -->
                <div class="pres-kpi-row">
                    <div class="pres-kpi" style="background:linear-gradient(135deg,var(--primary-color),#1a5fd1);color:white;">
                        <div class="lbl">Presupuesto total</div>
                        <div class="val">$${Number(presupuestoTotal).toLocaleString('es-CO')}</div>
                    </div>
                    <div class="pres-kpi" style="background:linear-gradient(135deg,${porcentajeUsado>=80?'var(--danger-color),#c82333':'var(--success-color),#1e7e34'});color:white;">
                        <div class="lbl">Gasto real este mes</div>
                        <div class="val">$${Number(gastoRealTotal).toLocaleString('es-CO')}</div>
                    </div>
                    <div class="pres-kpi" style="background:linear-gradient(135deg,${presupuestoTotal-gastoRealTotal>=0?'#17a2b8,#138496':'var(--danger-color),#c82333'});color:white;">
                        <div class="lbl">${presupuestoTotal-gastoRealTotal>=0?'Disponible':'Déficit'}</div>
                        <div class="val">$${Math.abs(presupuestoTotal-gastoRealTotal).toLocaleString('es-CO')}</div>
                    </div>
                </div>

                <!-- Barra general -->
                <div class="card" style="margin-bottom:1.5rem;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;font-size:0.9rem;">
                        <span style="font-weight:600;">Uso del presupuesto mensual</span>
                        <span style="color:${colorBarra};font-weight:700;">${Math.round(porcentajeUsado)}%</span>
                    </div>
                    <div style="background:#eee;border-radius:99px;height:14px;overflow:hidden;">
                        <div style="height:100%;width:${porcentajeUsado}%;background:${colorBarra};border-radius:99px;transition:width 0.8s;"></div>
                    </div>
                </div>

                ${this.vistaActiva === 'resumen' && datos.categorias.length > 0 ? `
                    <div class="card" style="margin-bottom:1.5rem; height: 300px;">
                        <h4 style="margin-bottom:1rem;">Distribución de Presupuesto</h4>
                        <div style="height: 230px; width:100%; display:flex; justify-content:center;">
                            <canvas id="grafico-presupuesto"></canvas>
                        </div>
                    </div>
                ` : ''}

                <!-- Tabs -->
                <div class="pres-tabs">
                    <button class="pres-tab${this.vistaActiva==='resumen'?' activo':''}" data-vista="resumen">Categorías</button>
                    <button class="pres-tab${this.vistaActiva==='agregar'?' activo':''}" data-vista="agregar">+ Agregar categoría</button>
                    <button class="pres-tab${this.vistaActiva==='metas'?' activo':''}" data-vista="metas">Metas de ahorro</button>
                </div>

                <!-- Contenido según vista -->
                ${this.vistaActiva === 'resumen' ? `<div class="pres-cat-grid">${tarjetasCategorias}</div>` : ''}

                ${this.vistaActiva === 'agregar' ? `
                    <div class="card" style="max-width:500px;">
                        <h4 style="margin-bottom:1.25rem;">Agregar categoría de gasto</h4>
                        <form id="form-categoria">
                            <div class="form-group">
                                <label>Nombre de la categoría *</label>
                                <select id="cat-nombre" required>
                                    <option value="">-- Selecciona --</option>
                                    ${Object.keys(categoriaIconos).map(k => `<option value="${k}">${k}</option>`).join('')}
                                    <option value="custom">Personalizada...</option>
                                </select>
                            </div>
                            <div class="form-group" id="cat-nombre-custom-grup" style="display:none;">
                                <label>Nombre personalizado</label>
                                <input type="text" id="cat-nombre-custom" maxlength="30">
                            </div>
                            <div class="form-group">
                                <label>Monto asignado *</label>
                                <input type="number" id="cat-monto" min="1000" step="1000" placeholder="$0" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Guardar categoría</button>
                        </form>
                    </div>` : ''}

                ${this.vistaActiva === 'metas' ? `
                    <div style="max-width:620px;">
                        <div class="card" style="margin-bottom:1.25rem;">
                            <h4 style="margin-bottom:1rem;">Nueva meta de ahorro</h4>
                            <form id="form-meta">
                                <div class="grid-2-col">
                                    <div class="form-group">
                                        <label>Nombre de la meta *</label>
                                        <input type="text" id="meta-nombre" placeholder="Ej: Viaje a Cartagena" maxlength="40" required>
                                    </div>
                                    <div class="form-group" style="display:none;">
                                        <label>Icono</label>
                                        <select id="meta-icono">
                                            <option value="">Meta</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Monto objetivo *</label>
                                    <input type="number" id="meta-objetivo" min="10000" step="1000" placeholder="Ej: 5000000" required>
                                </div>
                                <button type="submit" class="btn btn-primary">Crear meta</button>
                            </form>
                        </div>
                        <h4 style="margin-bottom:0.75rem;">Mis metas</h4>
                        ${metasHTML}
                    </div>` : ''}
            </div>`;

        this.addEventListeners();
        
        if (this.vistaActiva === 'resumen' && datos.categorias.length > 0) {
            this.inicializarGrafico(datos);
        }
    }

    inicializarGrafico(datos) {
        if (!window.Chart) return;
        const ctx = this.querySelector('#grafico-presupuesto');
        if (!ctx) return;
        
        if (this.grafico) {
            this.grafico.destroy();
        }

        const labels = datos.categorias.map(c => c.nombre);
        const data = datos.categorias.map(c => c.monto);

        this.grafico = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Monto asignado',
                    data: data,
                    backgroundColor: [
                        '#003366', '#42a5f5', '#17a2b8', '#ffc107', '#28a745', '#dc3545', '#6f42c1', '#fd7e14'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });
    }

    addEventListeners() {
        this.querySelectorAll('.pres-tab').forEach(btn => {
            btn.addEventListener('click', () => { this.vistaActiva = btn.dataset.vista; this.render(); });
        });

        // Eliminar categoría
        this.querySelectorAll('.btn-eliminar-cat').forEach(btn => {
            btn.addEventListener('click', () => {
                window.db.eliminarCategoriaPres(this.usuario.numeroId, btn.dataset.nombre);
                this.render();
            });
        });

        // Selector custom
        const selCat = this.querySelector('#cat-nombre');
        if (selCat) {
            selCat.addEventListener('change', () => {
                const grup = this.querySelector('#cat-nombre-custom-grup');
                grup.style.display = selCat.value === 'custom' ? 'block' : 'none';
            });
        }

        // Guardar categoría
        const formCat = this.querySelector('#form-categoria');
        if (formCat) {
            formCat.addEventListener('submit', (e) => {
                e.preventDefault();
                const alerta = this.querySelector('#alerta-presupuesto');
                let nombre = this.querySelector('#cat-nombre').value;
                if (nombre === 'custom') nombre = this.querySelector('#cat-nombre-custom').value.trim();
                const monto = parseFloat(this.querySelector('#cat-monto').value);
                if (!nombre) { this.mostrarAlerta(alerta, 'Ingresa un nombre para la categoría.', 'danger'); return; }
                if (isNaN(monto) || monto < 1000) { this.mostrarAlerta(alerta, 'El monto mínimo es $1.000.', 'danger'); return; }
                window.db.agregarCategoriaPres(this.usuario.numeroId, { nombre, monto });
                this.vistaActiva = 'resumen';
                this.render();
            });
        }

        // Guardar meta
        const formMeta = this.querySelector('#form-meta');
        if (formMeta) {
            formMeta.addEventListener('submit', (e) => {
                e.preventDefault();
                const alerta = this.querySelector('#alerta-presupuesto');
                const nombre = this.querySelector('#meta-nombre').value.trim();
                const objetivo = parseFloat(this.querySelector('#meta-objetivo').value);
                const icono = this.querySelector('#meta-icono') ? this.querySelector('#meta-icono').value : '';
                if (!nombre) { this.mostrarAlerta(alerta, 'Ingresa el nombre de tu meta.', 'danger'); return; }
                if (isNaN(objetivo) || objetivo < 10000) { this.mostrarAlerta(alerta, 'El objetivo mínimo es $10.000.', 'danger'); return; }
                window.db.agregarMeta(this.usuario.numeroId, { nombre, objetivo, acumulado: 0, icono });
                this.render();
            });
        }

        // Abonar a meta
        this.querySelectorAll('.meta-abonar-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const alerta = this.querySelector('#alerta-presupuesto');
                const nombre = btn.dataset.nombre;
                const input = this.querySelector(`.meta-abonar-input[data-nombre="${nombre}"]`);
                const valor = parseFloat(input.value);
                if (isNaN(valor) || valor < 1) { this.mostrarAlerta(alerta, 'Ingresa un valor válido para abonar.', 'danger'); return; }
                if (valor > this.cuenta.saldo) { this.mostrarAlerta(alerta, 'Saldo insuficiente para abonar a la meta.', 'danger'); return; }
                try {
                    this.cuenta.saldo = window.db.actualizarSaldo(this.cuenta.numeroCuenta, valor, false);
                    window.db.crearTransaccion({ numeroCuenta: this.cuenta.numeroCuenta, tipo: 'Retiro', monto: valor, concepto: `Ahorro meta: ${nombre}` });
                    window.db.abonarMeta(this.usuario.numeroId, nombre, valor);
                    this.render();
                } catch (err) { this.mostrarAlerta(alerta, err.message, 'danger'); }
            });
        });

        // Eliminar meta
        this.querySelectorAll('.btn-eliminar-meta').forEach(btn => {
            btn.addEventListener('click', () => {
                window.db.eliminarMeta(this.usuario.numeroId, btn.dataset.nombre);
                this.render();
            });
        });
    }

    mostrarAlerta(el, msg, tipo) {
        if (!el) return;
        el.textContent = msg;
        el.className = `alert alert-${tipo}`;
        el.classList.remove('hidden');
    }
}

customElements.define('acme-presupuesto', AcmePresupuesto);
