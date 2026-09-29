import { db } from '../js/base-datos.js';
import { auth } from '../js/autenticacion.js';

class AcmeServicios extends HTMLElement {
    connectedCallback() {
        this.usuario = auth.obtenerUsuarioActual();
        this.cuenta = db.obtenerCuentaPorUsuario(this.usuario.numeroId);
        
        // Estado del formulario
        this.servicioSeleccionado = null;
        this.facturaConsultada = null; // Guardará el monto aleatorio generado
        
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="card">
                <h2>Pago de Servicios Públicos</h2>
                <p>Paga tus facturas de forma rápida y segura sin salir de casa.</p>
                
                <div id="msg-servicios"></div>

                <div class="grid-2-col" style="margin-top: 2rem;">
                    <!-- Panel Selección de Servicio -->
                    <div>
                        <div class="form-group">
                            <label>Selecciona el servicio a pagar</label>
                            <select id="select-empresa">
                                <option value="" disabled selected>-- Elige una opción --</option>
                                <option value="Acueducto">Acueducto y Alcantarillado</option>
                                <option value="Energia">Compañía Eléctrica (Luz)</option>
                                <option value="Gas">Gas Natural</option>
                                <option value="Internet">Internet y Telefonía</option>
                                <option value="Tv">Televisión Satelital</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Referencia de Pago (Número de contrato)</label>
                            <input type="text" id="input-referencia" placeholder="Ej. 12345678" maxlength="15">
                        </div>
                        <button class="btn btn-secondary" id="btn-consultar">Consultar Factura</button>
                    </div>

                    <!-- Panel Resumen de Factura -->
                    <div id="panel-factura" style="background: rgba(255,255,255,0.4); padding: 1.5rem; border-radius: 12px; border: 1px dashed var(--border-color); display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
                        <p style="color: var(--text-light); font-size: 0.9rem;">Consulta tu referencia para ver el valor a pagar</p>
                    </div>
                </div>
            </div>
        `;

        this.agregarEventos();
    }

    agregarEventos() {
        const btnConsultar = this.querySelector('#btn-consultar');
        
        btnConsultar.addEventListener('click', () => {
            const empresa = this.querySelector('#select-empresa').value;
            const referencia = this.querySelector('#input-referencia').value.trim();

            if (!empresa) {
                return this.mostrarMensaje('Por favor selecciona una empresa de servicios.', true);
            }
            if (referencia.length < 4) {
                return this.mostrarMensaje('La referencia debe tener al menos 4 caracteres.', true);
            }

            this.consultarFactura(empresa, referencia);
        });
    }

    consultarFactura(empresa, referencia) {
        // Simular un tiempo de consulta (loading)
        const panelFactura = this.querySelector('#panel-factura');
        panelFactura.innerHTML = \`<div class="blinking-cursor">Consultando base de datos de \${empresa}...</div>\`;

        setTimeout(() => {
            // Generar un monto aleatorio entre $20,000 y $250,000
            const montoAleatorio = Math.floor(Math.random() * 230000) + 20000;
            const fechaVencimiento = new Date();
            fechaVencimiento.setDate(fechaVencimiento.getDate() + Math.floor(Math.random() * 15));

            this.facturaConsultada = {
                empresa,
                referencia,
                monto: montoAleatorio,
                vencimiento: fechaVencimiento.toLocaleDateString()
            };

            this.mostrarResumenFactura();
        }, 1200);
    }

    mostrarResumenFactura() {
        if (!this.facturaConsultada) return;
        const panelFactura = this.querySelector('#panel-factura');

        panelFactura.innerHTML = \`
            <h3 style="margin-bottom: 0.5rem; color: var(--primary-color);">Factura Encontrada</h3>
            <p><strong>Empresa:</strong> \${this.facturaConsultada.empresa}</p>
            <p><strong>Referencia:</strong> \${this.facturaConsultada.referencia}</p>
            <p><strong>Vence:</strong> \${this.facturaConsultada.vencimiento}</p>
            <h2 style="margin: 1rem 0; font-size: 2.2rem;">$\${this.facturaConsultada.monto.toLocaleString()}</h2>
            <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 1rem;">Saldo disponible: $\${this.cuenta.saldo.toLocaleString()}</p>
            <button class="btn btn-primary" id="btn-pagar-factura">Pagar Factura</button>
        \`;

        this.querySelector('#btn-pagar-factura').addEventListener('click', () => this.pagarFactura());
    }

    pagarFactura() {
        try {
            const monto = this.facturaConsultada.monto;
            
            if (monto > this.cuenta.saldo) {
                throw new Error('Fondos insuficientes para pagar esta factura.');
            }

            // Realizar el pago
            db.actualizarSaldo(this.cuenta.numeroCuenta, monto, false);
            
            db.crearTransaccion({
                numeroCuenta: this.cuenta.numeroCuenta,
                tipo: 'Retiro',
                monto: monto,
                concepto: \`Pago de servicio \${this.facturaConsultada.empresa} - Ref: \${this.facturaConsultada.referencia}\`
            });

            this.cuenta = db.obtenerCuentaPorUsuario(this.usuario.numeroId);
            this.facturaConsultada = null; // Limpiar

            this.mostrarMensaje('¡Pago exitoso! Transacción registrada correctamente.');
            
            // Resetear UI
            this.querySelector('#select-empresa').value = '';
            this.querySelector('#input-referencia').value = '';
            const panelFactura = this.querySelector('#panel-factura');
            panelFactura.innerHTML = \`<div style="color: var(--success-color); font-weight: bold; font-size: 1.2rem;">✓ Factura Pagada</div>\`;
            
        } catch (error) {
            this.mostrarMensaje(error.message, true);
        }
    }

    mostrarMensaje(msg, esError = false) {
        const div = this.querySelector('#msg-servicios');
        div.innerHTML = \`<div class="alert \${esError ? 'alert-danger' : 'alert-success'}">\${msg}</div>\`;
        setTimeout(() => { div.innerHTML = ''; }, 5000);
    }
}
customElements.define('acme-servicios', AcmeServicios);
