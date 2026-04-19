class AcmeTransferencia extends HTMLElement {
    connectedCallback() {
        this.usuario = window.auth.obtenerUsuarioActual();
        this.cuenta = window.db.obtenerCuentaPorUsuario(this.usuario.numeroId);
        this.ultimaTransferencia = null;
        this.render();
    }

    render() {
        const recibo = this.ultimaTransferencia ? `
            <div class="card" id="tf-print-area" style="border-left: 4px solid var(--success-color); background: #f8fff9;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
                    <div>
                        <h4 style="margin:0;color:var(--success-color);">Transferencia exitosa</h4>
                        <p style="margin:0.25rem 0 0;color:var(--text-light);">Operación completada correctamente.</p>
                    </div>
                    <button class="btn btn-outline tf-print-btn" style="width:auto;padding:0.5rem 1rem;">Imprimir resumen</button>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;">
                    <div><strong>Fecha:</strong><br>${new Date(this.ultimaTransferencia.fecha).toLocaleString('es-CO')}</div>
                    <div><strong>Referencia:</strong><br><span style="font-family:monospace;">${this.ultimaTransferencia.referencia}</span></div>
                    <div><strong>Cuenta origen:</strong><br>${this.cuenta.numeroCuenta}</div>
                    <div><strong>Cuenta destino:</strong><br>${this.ultimaTransferencia.cuentaDestino}</div>
                    <div><strong>Valor transferido:</strong><br><strong style="color:var(--success-color);">$ ${Number(this.ultimaTransferencia.monto).toLocaleString('es-CO')}</strong></div>
                    <div><strong>Nuevo saldo:</strong><br>$ ${Number(this.cuenta.saldo).toLocaleString('es-CO')}</div>
                </div>
            </div>
        ` : '';

        this.innerHTML = `
            <style>
                .tf-pasos { display:flex; gap:0.5rem; margin-bottom:1.5rem; flex-wrap:wrap; }
                .tf-paso {
                    flex:1; min-width:80px; padding:0.6rem 0.5rem; text-align:center;
                    border-radius:8px; font-size:0.82rem; font-weight:600;
                    background:var(--secondary-color); color:var(--text-light); border:2px solid transparent;
                    transition: all 0.3s;
                }
                .tf-paso.activo { background:var(--primary-color); color:white; border-color:var(--primary-color); }
                .tf-paso.completado { background:#d4edda; color:#155724; border-color:#c3e6cb; }
                .tf-info-cuenta {
                    background:linear-gradient(135deg,var(--primary-color),#1a5fd1);
                    color:white; border-radius:12px; padding:1.25rem 1.5rem;
                    margin-bottom:1.5rem; display:grid; grid-template-columns:1fr 1fr; gap:1rem;
                }
                .tf-info-cuenta p { margin:0; font-size:0.82rem; opacity:0.8; }
                .tf-info-cuenta strong { font-size:1rem; }
                @media(max-width:500px){ .tf-info-cuenta{ grid-template-columns:1fr; } }
                @media print {
                    body * { visibility:hidden; }
                    #tf-print-area, #tf-print-area * { visibility:visible; }
                    #tf-print-area { position:absolute;left:0;top:0;width:100%;margin:0;box-shadow:none; }
                    .tf-print-btn { display:none !important; }
                }
            </style>

            <div style="max-width:700px;margin:0 auto;">
                <h3 style="margin-bottom:0.5rem;">Transferencia entre cuentas</h3>
                <p style="color:var(--text-light);margin-bottom:1.5rem;">Envía dinero a otra cuenta registrada en Banco Acme de forma segura.</p>

                <div class="tf-pasos">
                    <div class="tf-paso activo" id="tf-paso-1">1. Destinatario</div>
                    <div class="tf-paso" id="tf-paso-2">2. Monto</div>
                    <div class="tf-paso" id="tf-paso-3">3. Verificación</div>
                </div>

                <div class="tf-info-cuenta">
                    <div>
                        <p>Cuenta origen</p>
                        <strong>${this.cuenta.numeroCuenta}</strong>
                    </div>
                    <div>
                        <p>Saldo disponible</p>
                        <strong>$ ${Number(this.cuenta.saldo).toLocaleString('es-CO')}</strong>
                    </div>
                </div>

                <div class="card">
                    <div id="alerta-transferencia" class="alert hidden"></div>

                    <!-- Paso 1: Destinatario -->
                    <div id="tf-seccion-1">
                        <h4 style="margin-bottom:1rem;">¿A qué cuenta deseas transferir?</h4>
                        <div class="form-group">
                            <label>Número de cuenta destino</label>
                            <input type="text" id="tf-cuenta-destino" placeholder="Ej: 4523678901" maxlength="10" inputmode="numeric">
                        </div>
                        <div class="form-group">
                            <label>Concepto / descripción</label>
                            <input type="text" id="tf-concepto" placeholder="Ej: Pago de arriendo, regalo, etc." maxlength="80">
                        </div>
                        <button class="btn btn-primary" id="tf-btn-siguiente-1">Siguiente →</button>
                    </div>

                    <!-- Paso 2: Monto -->
                    <div id="tf-seccion-2" class="hidden">
                        <h4 style="margin-bottom:1rem;">¿Cuánto deseas enviar a este destinatario?</h4>
                        <div id="tf-info-destinatario" style="background:var(--secondary-color);padding:1rem;border-radius:8px;margin-bottom:1rem;font-size:0.9rem;"></div>
                        <div class="form-group">
                            <label>Monto a transferir</label>
                            <input type="number" id="tf-monto" min="1" step="0.01" placeholder="0.00">
                        </div>
                        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem;">
                            ${[10000,50000,100000,200000].map(v=>`<button class="btn btn-secondary tf-monto-rapido" data-valor="${v}" style="flex:1;min-width:80px;padding:0.5rem;font-size:0.85rem;">$${v.toLocaleString('es-CO')}</button>`).join('')}
                        </div>
                        <div style="display:flex;gap:1rem;">
                            <button class="btn btn-secondary" id="tf-btn-anterior-2" style="flex:1;">← Atrás</button>
                            <button class="btn btn-primary" id="tf-btn-siguiente-2" style="flex:2;">Siguiente →</button>
                        </div>
                    </div>

                    <!-- Paso 3: Confirmación con Clave Dinamica-->
                    <div id="tf-seccion-3" class="hidden">
                        <h4 style="margin-bottom:1rem;">Confirmación de seguridad</h4>
                        <div id="tf-resumen-confirmacion" style="background:var(--secondary-color);padding:1.25rem;border-radius:10px;margin-bottom:1.5rem;"></div>
                        
                        <div class="form-group" style="padding-top:1rem; border-top:1px solid var(--border-color);">
                            <label>Clave Dinámica (Ver Token en menú superior)</label>
                            <input type="text" id="tf-clave-dinamica" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder="Ingrese 6 dígitos de seguridad" style="text-align: center; letter-spacing: 0.3em; font-size: 1.2rem;">
                        </div>

                        <div style="display:flex;gap:1rem;">
                            <button class="btn btn-secondary" id="tf-btn-anterior-3" style="flex:1;">← Atrás</button>
                            <button class="btn btn-primary" id="tf-btn-confirmar" style="flex:2;">Confirmar transferencia</button>
                        </div>
                    </div>
                </div>

                ${recibo}
            </div>
        `;
        this.addEventListeners();
    }

    addEventListeners() {
        const printBtn = this.querySelector('.tf-print-btn');
        if (printBtn) printBtn.addEventListener('click', () => window.print());

        // Montos rápidos
        this.querySelectorAll('.tf-monto-rapido').forEach(btn => {
            btn.addEventListener('click', () => {
                this.querySelector('#tf-monto').value = btn.dataset.valor;
            });
        });

        // Paso 1 → 2
        const btn1 = this.querySelector('#tf-btn-siguiente-1');
        if (btn1) btn1.addEventListener('click', () => this.irAPaso2());

        // Paso 2 → 1
        const btn2a = this.querySelector('#tf-btn-anterior-2');
        if (btn2a) btn2a.addEventListener('click', () => this.irAPaso(1));

        // Paso 2 → 3
        const btn2s = this.querySelector('#tf-btn-siguiente-2');
        if (btn2s) btn2s.addEventListener('click', () => this.irAPaso3());

        // Paso 3 → 2
        const btn3a = this.querySelector('#tf-btn-anterior-3');
        if (btn3a) btn3a.addEventListener('click', () => this.irAPaso(2));

        // Confirmar
        const btnConfirmar = this.querySelector('#tf-btn-confirmar');
        if (btnConfirmar) btnConfirmar.addEventListener('click', () => this.confirmarTransferencia());

        // Clave format
        const tfClave = this.querySelector('#tf-clave-dinamica');
        if (tfClave) {
            tfClave.addEventListener('input', () => {
                tfClave.value = tfClave.value.replace(/\D/g, '').slice(0, 6);
            });
        }
    }

    irAPaso2() {
        const alerta = this.querySelector('#alerta-transferencia');
        const cuentaDestino = this.querySelector('#tf-cuenta-destino').value.trim();

        if (!/^\d{10}$/.test(cuentaDestino)) {
            this.mostrarAlerta(alerta, 'El número de cuenta destino debe tener exactamente 10 dígitos.', 'danger');
            return;
        }
        if (cuentaDestino === this.cuenta.numeroCuenta) {
            this.mostrarAlerta(alerta, 'No puedes transferir a tu propia cuenta.', 'danger');
            return;
        }
        const cuentaDestinatario = window.db.obtenerCuentaPorNumero(cuentaDestino);
        if (!cuentaDestinatario) {
            this.mostrarAlerta(alerta, 'La cuenta destino no existe en Banco Acme.', 'danger');
            return;
        }
        const destinatario = window.db.obtenerUsuario(
            window.db.obtenerUsuarios().find(u => u.numeroId === cuentaDestinatario.usuarioId)?.tipoId,
            cuentaDestinatario.usuarioId
        );
        const nombreDestino = destinatario ? `${destinatario.nombres} ${destinatario.apellidos}` : 'Titular';

        alerta.classList.add('hidden');
        this.querySelector('#tf-info-destinatario').innerHTML = `
            <strong>Destinatario:</strong> ${nombreDestino}<br>
            <strong>Cuenta:</strong> ${cuentaDestino}
        `;
        this.irAPaso(2);
    }

    irAPaso3() {
        const alerta = this.querySelector('#alerta-transferencia');
        const monto = parseFloat(this.querySelector('#tf-monto').value);

        if (isNaN(monto) || monto <= 0) {
            this.mostrarAlerta(alerta, 'Ingresa un monto válido mayor a $0.', 'danger');
            return;
        }
        if (monto > this.cuenta.saldo) {
            this.mostrarAlerta(alerta, `Saldo insuficiente. Disponible: $${Number(this.cuenta.saldo).toLocaleString('es-CO')}`, 'danger');
            return;
        }

        const cuentaDestino = this.querySelector('#tf-cuenta-destino').value.trim();
        const concepto = this.querySelector('#tf-concepto').value.trim() || 'Transferencia Banco Acme';

        alerta.classList.add('hidden');
        this.querySelector('#tf-resumen-confirmacion').innerHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                <div><p style="color:var(--text-light);font-size:0.82rem;margin:0;">Desde</p><strong>${this.cuenta.numeroCuenta}</strong></div>
                <div><p style="color:var(--text-light);font-size:0.82rem;margin:0;">Hacia</p><strong>${cuentaDestino}</strong></div>
                <div><p style="color:var(--text-light);font-size:0.82rem;margin:0;">Monto</p><strong style="color:var(--primary-color);font-size:1.2rem;">$${Number(monto).toLocaleString('es-CO')}</strong></div>
                <div><p style="color:var(--text-light);font-size:0.82rem;margin:0;">Concepto</p><strong>${concepto}</strong></div>
            </div>
        `;
        this.querySelector('#tf-paso-2').classList.add('completado');
        this.irAPaso(3);
    }

    irAPaso(num) {
        [1, 2, 3].forEach(n => {
            this.querySelector(`#tf-seccion-${n}`).classList.toggle('hidden', n !== num);
            const paso = this.querySelector(`#tf-paso-${n}`);
            paso.classList.remove('activo', 'completado');
            if (n < num) paso.classList.add('completado');
            if (n === num) paso.classList.add('activo');
        });
    }

    confirmarTransferencia() {
        const alerta = this.querySelector('#alerta-transferencia');
        const clave = this.querySelector('#tf-clave-dinamica').value;

        if (!window.auth.validarClaveDinamica(clave)) {
            this.mostrarAlerta(alerta, 'La clave dinámica es incorrecta o ha expirado.', 'danger');
            return;
        }

        const monto = parseFloat(this.querySelector('#tf-monto').value);
        const cuentaDestino = this.querySelector('#tf-cuenta-destino').value.trim();
        const concepto = this.querySelector('#tf-concepto').value.trim() || 'Transferencia Banco Acme';

        try {
            // Débito cuenta origen
            this.cuenta.saldo = window.db.actualizarSaldo(this.cuenta.numeroCuenta, monto, false);
            // Crédito cuenta destino
            window.db.actualizarSaldo(cuentaDestino, monto, true);

            // Registrar transacciones
            this.ultimaTransferencia = window.db.crearTransaccion({
                numeroCuenta: this.cuenta.numeroCuenta,
                tipo: 'Retiro',
                monto,
                concepto: `Transferencia: ${concepto}`,
                cuentaDestino
            });
            window.db.crearTransaccion({
                numeroCuenta: cuentaDestino,
                tipo: 'Consignación',
                monto,
                concepto: `Transferencia recibida: ${concepto}`,
                cuentaDestino: this.cuenta.numeroCuenta
            });

            this.render();
        } catch (error) {
            this.mostrarAlerta(alerta, error.message, 'danger');
        }
    }

    mostrarAlerta(el, msg, tipo) {
        el.textContent = msg;
        el.className = `alert alert-${tipo}`;
        el.classList.remove('hidden');
    }
}

customElements.define('acme-transferencia', AcmeTransferencia);
