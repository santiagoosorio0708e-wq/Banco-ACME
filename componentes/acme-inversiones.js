import { db } from '../js/base-datos.js';
import { auth } from '../js/autenticacion.js';

class AcmeInversiones extends HTMLElement {
    connectedCallback() {
        this.usuario = auth.obtenerUsuarioActual();
        this.cuenta = db.obtenerCuentaPorUsuario(this.usuario.numeroId);
        
        // Mock simple portfolio persistido en localStorage
        const portafolioKey = `acme_portafolio_${this.usuario.numeroId}`;
        this.portafolio = JSON.parse(localStorage.getItem(portafolioKey)) || {
            acmecoin: 0.0
        };
        
        this.precioActual = 45000 + (Math.random() * 2000 - 1000); // Precio base ~$45,000
        this.historialPrecios = Array.from({length: 12}, (_, i) => this.precioActual * (1 + (Math.random() * 0.1 - 0.05)));
        
        this.render();
        this.iniciarGrafico();
        
        // Actualizar precio cada 3 segundos
        this.intervalo = setInterval(() => this.actualizarPrecio(), 3000);
    }

    disconnectedCallback() {
        clearInterval(this.intervalo);
    }

    guardarPortafolio() {
        const portafolioKey = `acme_portafolio_${this.usuario.numeroId}`;
        localStorage.setItem(portafolioKey, JSON.stringify(this.portafolio));
    }

    render() {
        const valorPortafolio = this.portafolio.acmecoin * this.precioActual;

        this.innerHTML = `
            <div class="grid-2-col">
                <!-- Panel Principal: Gráfico -->
                <div class="card" style="grid-column: 1 / -1;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h2>Trading & Cripto</h2>
                        <div style="text-align: right;">
                            <p style="margin: 0; font-size: 0.9rem; color: var(--text-light);">Precio ACME Coin</p>
                            <h3 id="precio-actual-texto" style="margin: 0; color: var(--primary-color); font-size: 1.8rem;">$${this.precioActual.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</h3>
                        </div>
                    </div>
                    <div style="height: 300px; width: 100%; position: relative;">
                        <canvas id="cryptoChart"></canvas>
                    </div>
                </div>

                <!-- Panel: Mi Portafolio -->
                <div class="card">
                    <h3>Mi Portafolio</h3>
                    <div style="margin-top: 1.5rem; text-align: center;">
                        <p style="font-size: 3rem; margin: 0;">🪙</p>
                        <h4 style="font-size: 1.5rem; margin: 0.5rem 0;">${this.portafolio.acmecoin.toFixed(4)} ACM</h4>
                        <p style="color: var(--text-light);">Valor est. $${valorPortafolio.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</p>
                    </div>
                    
                    <div style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                        <p><strong>Saldo disponible en cuenta:</strong></p>
                        <h4 style="color: var(--success-color);">$${this.cuenta.saldo.toLocaleString()}</h4>
                    </div>
                </div>

                <!-- Panel: Operar -->
                <div class="card">
                    <h3>Operar Mercado</h3>
                    <div id="msg-operacion"></div>
                    
                    <form id="form-operar" style="margin-top: 1.5rem;">
                        <div class="form-group">
                            <label>Tipo de Operación</label>
                            <select id="tipo-op" required>
                                <option value="buy">Comprar (Pagar con Saldo)</option>
                                <option value="sell">Vender (Recibir Saldo)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Monto en USD ($)</label>
                            <input type="number" id="monto-op" min="10" step="0.01" required placeholder="Ej. 1000">
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 1rem;" id="conversion-preview">
                            Recibirás apróx: 0.0000 ACM
                        </p>
                        <button type="submit" class="btn btn-primary" id="btn-submit-op">Ejecutar Operación</button>
                    </form>
                </div>
            </div>
        `;

        this.agregarEventos();
    }

    iniciarGrafico() {
        const ctx = this.querySelector('#cryptoChart').getContext('2d');
        
        // Configurar un gradiente para el gráfico
        let gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(79, 70, 229, 0.5)');
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0.0)');

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 12}, (_, i) => `T-${12-i}`),
                datasets: [{
                    label: 'ACME Coin (USD)',
                    data: this.historialPrecios,
                    borderColor: '#4f46e5',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#4f46e5',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: { display: false },
                    y: {
                        border: { display: false },
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    }
                },
                animation: { duration: 400 }
            }
        });
    }

    actualizarPrecio() {
        // Variación aleatoria del precio (-2% a +2%)
        const variacion = 1 + (Math.random() * 0.04 - 0.02);
        this.precioActual = this.precioActual * variacion;

        // Actualizar DOM
        const precioTxt = this.querySelector('#precio-actual-texto');
        if (precioTxt) {
            precioTxt.textContent = '$' + this.precioActual.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2});
            precioTxt.style.color = variacion >= 1 ? 'var(--success-color)' : 'var(--danger-color)';
            setTimeout(() => { precioTxt.style.color = 'var(--primary-color)'; }, 1000);
        }

        // Actualizar Gráfico
        if (this.chart) {
            this.historialPrecios.shift();
            this.historialPrecios.push(this.precioActual);
            this.chart.update();
        }

        // Actualizar preview
        this.actualizarPreview();
    }

    actualizarPreview() {
        const tipo = this.querySelector('#tipo-op')?.value;
        const montoStr = this.querySelector('#monto-op')?.value;
        const preview = this.querySelector('#conversion-preview');
        
        if (!tipo || !montoStr || !preview) return;
        
        const monto = Number(montoStr) || 0;
        const cantidadAcm = monto / this.precioActual;

        if (tipo === 'buy') {
            preview.textContent = \`Recibirás apróx: \${cantidadAcm.toFixed(6)} ACM\`;
        } else {
            preview.textContent = \`Venderás apróx: \${cantidadAcm.toFixed(6)} ACM\`;
        }
    }

    agregarEventos() {
        const form = this.querySelector('#form-operar');
        const inputMonto = this.querySelector('#monto-op');
        const selectTipo = this.querySelector('#tipo-op');

        inputMonto.addEventListener('input', () => this.actualizarPreview());
        selectTipo.addEventListener('change', () => this.actualizarPreview());

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.ejecutarOperacion(selectTipo.value, Number(inputMonto.value));
        });
    }

    mostrarMensaje(msg, esError = false) {
        const div = this.querySelector('#msg-operacion');
        div.innerHTML = \`<div class="alert \${esError ? 'alert-danger' : 'alert-success'}">\${msg}</div>\`;
        setTimeout(() => { div.innerHTML = ''; }, 4000);
    }

    ejecutarOperacion(tipo, montoUsd) {
        if (montoUsd <= 0) return this.mostrarMensaje('Monto inválido', true);

        const cantidadAcm = montoUsd / this.precioActual;

        try {
            if (tipo === 'buy') {
                if (montoUsd > this.cuenta.saldo) {
                    throw new Error('Saldo en cuenta insuficiente para comprar.');
                }
                // Descontar saldo y agregar cripto
                db.actualizarSaldo(this.cuenta.numeroCuenta, montoUsd, false);
                this.portafolio.acmecoin += cantidadAcm;
                
                db.crearTransaccion({
                    numeroCuenta: this.cuenta.numeroCuenta,
                    tipo: 'Retiro',
                    monto: montoUsd,
                    concepto: \`Compra de \${cantidadAcm.toFixed(4)} ACME Coin\`
                });

                this.mostrarMensaje(\`Compra exitosa de \${cantidadAcm.toFixed(4)} ACM.\`);

            } else {
                if (cantidadAcm > this.portafolio.acmecoin) {
                    throw new Error('No tienes suficientes ACME Coins para vender.');
                }
                // Descontar cripto y agregar saldo
                this.portafolio.acmecoin -= cantidadAcm;
                db.actualizarSaldo(this.cuenta.numeroCuenta, montoUsd, true);

                db.crearTransaccion({
                    numeroCuenta: this.cuenta.numeroCuenta,
                    tipo: 'Consignación',
                    monto: montoUsd,
                    concepto: \`Venta de \${cantidadAcm.toFixed(4)} ACME Coin\`
                });

                this.mostrarMensaje(\`Venta exitosa. +\$\${montoUsd.toLocaleString()}\`);
            }

            this.guardarPortafolio();
            this.cuenta = db.obtenerCuentaPorUsuario(this.usuario.numeroId);
            
            // Re-render partial to update balances without destroying the chart
            this.renderPortafolioSection();

        } catch (err) {
            this.mostrarMensaje(err.message, true);
        }
    }

    renderPortafolioSection() {
        // Una actualización rápida para no perder el chart
        const oldState = this.innerHTML;
        this.render();
        // But re-init the chart on the new canvas!
        this.iniciarGrafico();
        this.mostrarMensaje('Portafolio actualizado.');
    }
}
customElements.define('acme-inversiones', AcmeInversiones);
