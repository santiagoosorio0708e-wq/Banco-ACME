class AcmeTransaccion extends HTMLElement {
    connectedCallback() {
        this.usuario = window.auth.obtenerUsuarioActual();
        this.cuenta = window.db.obtenerCuentaPorUsuario(this.usuario.numeroId);
        this.tipo = this.getAttribute('type') || 'deposit';
        this.ultimaTransaccion = null;
        this.render();
        this.addEventListeners();
    }

    obtenerConfiguracion() {
        if (this.tipo === 'deposit') {
            return {
                titulo: 'Consignación electrónica',
                etiquetaTipo: 'Consignación',
                concepto: 'Consignación por canal electrónico',
                textoBoton: 'Realizar consignación',
                esConsignacion: true
            };
        }

        if (this.tipo === 'withdraw') {
            return {
                titulo: 'Retiro de dinero',
                etiquetaTipo: 'Retiro',
                concepto: 'Retiro de dinero',
                textoBoton: 'Realizar retiro',
                esConsignacion: false
            };
        }

        return {
            titulo: 'Pago de servicios públicos',
            etiquetaTipo: 'Retiro',
            concepto: null,
            textoBoton: 'Pagar servicio',
            esConsignacion: false
        };
    }

    render() {
        const configuracion = this.obtenerConfiguracion();
        const camposPago = this.tipo === 'payment'
            ? `
                <div class="form-group">
                    <label>Servicio público</label>
                    <select id="tx-servicio" required>
                        <option value="Energía">Energía</option>
                        <option value="Agua">Agua</option>
                        <option value="Gas natural">Gas natural</option>
                        <option value="Internet">Internet</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Referencia del servicio</label>
                    <input type="text" id="tx-referencia-servicio" inputmode="numeric" maxlength="11" pattern="[0-9]{11}" title="Debe contener exactamente 11 números" required>
                </div>
            `
            : '';

        const recibo = this.ultimaTransaccion
            ? `
                <div class="card" id="tx-print-area" style="border: 1px solid var(--border-color); background: #fcfcfd;">
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                        <div>
                            <h4 style="margin: 0;">Resumen de la transacción</h4>
                            <p style="margin: 0.35rem 0 0; color: var(--text-light);">Operación registrada exitosamente.</p>
                        </div>
                        <button type="button" class="btn btn-outline tx-print-btn" style="width: auto; padding: 0.5rem 1rem;">Imprimir resumen</button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                        <div><strong>Fecha:</strong><br>${new Date(this.ultimaTransaccion.fecha).toLocaleString('es-CO')}</div>
                        <div><strong>Referencia:</strong><br>${this.ultimaTransaccion.referencia}</div>
                        <div><strong>Tipo:</strong><br>${this.ultimaTransaccion.tipo}</div>
                        <div><strong>Concepto:</strong><br>${this.ultimaTransaccion.concepto}</div>
                        <div><strong>Valor:</strong><br>$ ${Number(this.ultimaTransaccion.monto).toLocaleString('es-CO')}</div>
                        ${this.ultimaTransaccion.referenciaServicio ? `<div><strong>Referencia del servicio:</strong><br>${this.ultimaTransaccion.referenciaServicio}</div>` : ''}
                    </div>
                </div>
            `
            : '';

        this.innerHTML = `
            <div class="card" style="max-width: 720px; margin: 0 auto;">
                <h3 style="margin-bottom: 1.5rem; text-align: center;">${configuracion.titulo}</h3>

                <div id="alerta-transaccion" class="alert hidden"></div>

                <div style="background: var(--secondary-color); padding: 1rem; border-radius: var(--border-radius); margin-bottom: 1.5rem;">
                    <div class="grid-2-col">
                        <div>
                            <p style="margin-bottom: 0.35rem; color: var(--text-light);">Número de cuenta</p>
                            <strong>${this.cuenta.numeroCuenta}</strong>
                        </div>
                        <div>
                            <p style="margin-bottom: 0.35rem; color: var(--text-light);">Titular</p>
                            <strong>${this.usuario.nombres} ${this.usuario.apellidos}</strong>
                        </div>
                    </div>
                    <div class="mt-2">
                        <p style="margin-bottom: 0.35rem; color: var(--text-light);">Saldo actual</p>
                        <strong style="font-size: 1.35rem; color: var(--primary-color);">$ ${Number(this.cuenta.saldo).toLocaleString('es-CO')}</strong>
                    </div>
                </div>

                <form id="formulario-transaccion">
                    ${camposPago}
                    <div class="form-group">
                        <label>Valor a ${this.tipo === 'deposit' ? 'consignar' : this.tipo === 'withdraw' ? 'retirar' : 'pagar'}</label>
                        <input type="number" id="monto-transaccion" min="1" step="0.01" required>
                    </div>
                    <button type="submit" class="btn btn-primary">${configuracion.textoBoton}</button>
                </form>
            </div>
            ${recibo}
            <style>
                @media print {
                    body * { visibility: hidden; }
                    #tx-print-area, #tx-print-area * { visibility: visible; }
                    #tx-print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; box-shadow: none; }
                    .tx-print-btn { display: none !important; }
                }
            </style>
        `;

        const botonImprimir = this.querySelector('.tx-print-btn');
        if (botonImprimir) {
            botonImprimir.addEventListener('click', () => window.print());
        }
    }

    addEventListeners() {
        const formulario = this.querySelector('#formulario-transaccion');
        const cuadroAlerta = this.querySelector('#alerta-transaccion');
        const campoReferenciaServicio = this.querySelector('#tx-referencia-servicio');

        if (campoReferenciaServicio) {
            campoReferenciaServicio.addEventListener('input', () => {
                campoReferenciaServicio.value = campoReferenciaServicio.value.replace(/\D/g, '').slice(0, 11);
            });
        }

        formulario.addEventListener('submit', (evento) => {
            evento.preventDefault();

            const configuracion = this.obtenerConfiguracion();
            const monto = parseFloat(this.querySelector('#monto-transaccion').value);

            if (isNaN(monto) || monto <= 0) {
                this.mostrarAlerta(cuadroAlerta, 'Por favor ingrese un valor válido.', 'danger');
                return;
            }

            let concepto = configuracion.concepto;
            let referenciaServicio = null;

            if (this.tipo === 'payment') {
                const servicio = this.querySelector('#tx-servicio').value;
                referenciaServicio = this.querySelector('#tx-referencia-servicio').value.replace(/\D/g, '').slice(0, 11).trim();
                this.querySelector('#tx-referencia-servicio').value = referenciaServicio;

                if (!/^\d{11}$/.test(referenciaServicio)) {
                    this.mostrarAlerta(cuadroAlerta, 'La referencia del servicio debe tener exactamente 11 dígitos.', 'danger');
                    return;
                }

                concepto = `Pago de servicio público ${servicio}`;
            }

            try {
                this.cuenta.saldo = window.db.actualizarSaldo(this.cuenta.numeroCuenta, monto, configuracion.esConsignacion);

                this.ultimaTransaccion = window.db.crearTransaccion({
                    numeroCuenta: this.cuenta.numeroCuenta,
                    tipo: configuracion.etiquetaTipo,
                    monto,
                    concepto,
                    referenciaServicio
                });

                this.render();
                this.addEventListeners();
                this.mostrarAlerta(this.querySelector('#alerta-transaccion'), 'Transacción realizada con éxito.', 'success');
            } catch (error) {
                this.mostrarAlerta(cuadroAlerta, error.message, 'danger');
            }
        });
    }

    mostrarAlerta(elemento, mensaje, tipo) {
        elemento.textContent = mensaje;
        elemento.className = `alert alert-${tipo}`;
        elemento.classList.remove('hidden');
    }
}

customElements.define('acme-transaction', AcmeTransaccion);
