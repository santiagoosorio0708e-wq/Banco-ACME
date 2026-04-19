/**Calcula cuotas, intereses y tabla de amortización para un préstamo hipotético.
 */
class AcmeSimulador extends HTMLElement {
    connectedCallback() {
        this.resultado = null;
        this.render();
    }

    calcular(capital, tasaMensual, plazo) {
        // Fórmula de amortización francesa
        const r = tasaMensual / 100;
        const cuota = capital * (r * Math.pow(1 + r, plazo)) / (Math.pow(1 + r, plazo) - 1);
        const totalPagar = cuota * plazo;
        const totalIntereses = totalPagar - capital;

        // Tabla de amortización (primeros 12 meses o completa si < 12)
        const tabla = [];
        let saldo = capital;
        for (let i = 1; i <= plazo; i++) {
            const interes = saldo * r;
            const abono = cuota - interes;
            saldo -= abono;
            tabla.push({ cuotaNum: i, cuota, interes, abono, saldo: Math.max(0, saldo) });
        }
        return { cuota, totalPagar, totalIntereses, tabla };
    }

    render() {
        const res = this.resultado;

        let tablaHTML = '';
        if (res) {
            const filas = res.tabla.slice(0, 12).map(f => `
                <tr>
                    <td data-label="Cuota #">${f.cuotaNum}</td>
                    <td data-label="Valor cuota">$${f.cuota.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    <td data-label="Interés" style="color:var(--danger-color);">$${f.interes.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    <td data-label="Abono capital" style="color:var(--success-color);">$${f.abono.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                    <td data-label="Saldo">$${f.saldo.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                </tr>`).join('');
            tablaHTML = `
                <div class="card" style="margin-top:1.5rem;">
                    <h4 style="margin-bottom:1rem;">Tabla de amortización ${res.tabla.length > 12 ? '(primeras 12 cuotas)' : ''}</h4>
                    <div style="overflow-x:auto;">
                        <table style="width:100%;border-collapse:collapse;text-align:right;">
                            <thead>
                                <tr style="background:var(--secondary-color);">
                                    <th style="padding:0.75rem;text-align:center;">Cuota #</th>
                                    <th style="padding:0.75rem;">Valor cuota</th>
                                    <th style="padding:0.75rem;color:var(--danger-color);">Interés</th>
                                    <th style="padding:0.75rem;color:var(--success-color);">Abono capital</th>
                                    <th style="padding:0.75rem;">Saldo</th>
                                </tr>
                            </thead>
                            <tbody>${filas}</tbody>
                        </table>
                    </div>
                </div>`;
        }

        this.innerHTML = `
            <style>
                .sim-resumen {
                    display:grid; grid-template-columns: repeat(3,1fr); gap:1rem; margin-top:1.5rem;
                }
                @media(max-width:600px){ .sim-resumen{ grid-template-columns:1fr; } }
                .sim-kpi {
                    background:linear-gradient(135deg,var(--primary-color),#1565c0);
                    color:white; border-radius:12px; padding:1.25rem; text-align:center;
                }
                .sim-kpi .kpi-val { font-size:1.5rem; font-weight:700; margin:0.25rem 0; }
                .sim-kpi .kpi-label { font-size:0.8rem; opacity:0.8; }
                .sim-tipo-btn {
                    flex:1; padding:0.6rem 0.5rem; border-radius:8px; border:2px solid var(--border-color);
                    background:transparent; cursor:pointer; font-weight:600; transition:all 0.2s;
                    font-family:var(--font-family); font-size:0.9rem;
                }
                .sim-tipo-btn.activo { background:var(--primary-color); color:white; border-color:var(--primary-color); }
                .sim-rangos { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
                @media(max-width:500px){ .sim-rangos{ grid-template-columns:1fr; } }
                input[type=range] { -webkit-appearance:none; width:100%; height:6px; border-radius:3px;
                    background:linear-gradient(to right, var(--primary-color) 0%, var(--border-color) 0%);
                    outline:none; margin-top:0.5rem; }
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance:none; width:20px; height:20px; border-radius:50%;
                    background:var(--primary-color); cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,0.2);
                }
            </style>

            <div style="max-width:800px;margin:0 auto;">
                <h3 style="margin-bottom:0.25rem;">Simulador de crédito</h3>
                <p style="color:var(--text-light);margin-bottom:1.5rem;">Calcula la cuota mensual y tabla de amortización de un crédito. Solo simulación, no genera una solicitud real.</p>

                <div class="card">
                    <div id="alerta-sim" class="alert hidden"></div>

                    <div style="margin-bottom:1.5rem;">
                        <label style="margin-bottom:0.75rem;display:block;">Tipo de crédito</label>
                        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                            <button class="sim-tipo-btn activo" data-tipo="consumo" data-tasa="1.9" data-plazo-max="60">Consumo</button>
                            <button class="sim-tipo-btn" data-tipo="vivienda" data-tasa="0.9" data-plazo-max="240">Vivienda</button>
                            <button class="sim-tipo-btn" data-tipo="vehiculo" data-tasa="1.2" data-plazo-max="84">Vehículo</button>
                            <button class="sim-tipo-btn" data-tipo="libre" data-tasa="2.1" data-plazo-max="48">Libre inversión</button>
                        </div>
                    </div>

                    <div class="sim-rangos">
                        <div class="form-group">
                            <label>Monto del crédito: <strong id="sim-label-capital">$0</strong></label>
                            <input type="range" id="sim-capital" min="1000000" max="500000000" step="500000" value="20000000">
                        </div>
                        <div class="form-group">
                            <label>Plazo (meses): <strong id="sim-label-plazo">12</strong></label>
                            <input type="range" id="sim-plazo" min="3" max="60" step="1" value="12">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Tasa de interés mensual (%): <strong id="sim-label-tasa">1.9%</strong></label>
                        <input type="range" id="sim-tasa" min="0.5" max="3.5" step="0.1" value="1.9">
                    </div>

                    <button class="btn btn-primary" id="sim-calcular">Calcular cuota</button>
                </div>

                ${res ? `
                <div class="sim-resumen">
                    <div class="sim-kpi">
                        <div class="kpi-label">Cuota mensual estimada</div>
                        <div class="kpi-val">$${Math.round(res.cuota).toLocaleString('es-CO')}</div>
                    </div>
                    <div class="sim-kpi" style="background:linear-gradient(135deg,var(--danger-color),#c82333);">
                        <div class="kpi-label">Total intereses</div>
                        <div class="kpi-val">$${Math.round(res.totalIntereses).toLocaleString('es-CO')}</div>
                    </div>
                    <div class="sim-kpi" style="background:linear-gradient(135deg,var(--success-color),#1e7e34);">
                        <div class="kpi-label">Total a pagar</div>
                        <div class="kpi-val">$${Math.round(res.totalPagar).toLocaleString('es-CO')}</div>
                    </div>
                </div>
                ${tablaHTML}
                ` : ''}
            </div>
        `;
        this.addEventListeners();
    }

    addEventListeners() {
        const rangos = ['capital', 'plazo', 'tasa'];
        rangos.forEach(id => {
            const input = this.querySelector(`#sim-${id}`);
            const label = this.querySelector(`#sim-label-${id}`);
            if (!input) return;
            input.addEventListener('input', () => {
                if (id === 'capital') label.textContent = `$${Number(input.value).toLocaleString('es-CO')}`;
                else if (id === 'plazo') label.textContent = input.value;
                else label.textContent = `${input.value}%`;
                // actualizar gradiente
                const min = input.min, max = input.max, val = input.value;
                const pct = ((val - min) / (max - min)) * 100;
                input.style.background = `linear-gradient(to right, var(--primary-color) ${pct}%, var(--border-color) ${pct}%)`;
            });
            // init label
            if (id === 'capital') label.textContent = `$${Number(input.value).toLocaleString('es-CO')}`;
        });

        // Tipo de crédito
        this.querySelectorAll('.sim-tipo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.querySelectorAll('.sim-tipo-btn').forEach(b => b.classList.remove('activo'));
                btn.classList.add('activo');
                const tasa = btn.dataset.tasa;
                const plazoMax = btn.dataset.plazoMax;
                const inputTasa = this.querySelector('#sim-tasa');
                const inputPlazo = this.querySelector('#sim-plazo');
                inputTasa.value = tasa;
                inputPlazo.max = plazoMax;
                if (parseFloat(inputPlazo.value) > parseFloat(plazoMax)) inputPlazo.value = plazoMax;
                this.querySelector('#sim-label-tasa').textContent = `${tasa}%`;
                this.querySelector('#sim-label-plazo').textContent = inputPlazo.value;
            });
        });

        const btnCalc = this.querySelector('#sim-calcular');
        if (btnCalc) {
            btnCalc.addEventListener('click', () => {
                const capital = parseFloat(this.querySelector('#sim-capital').value);
                const tasa = parseFloat(this.querySelector('#sim-tasa').value);
                const plazo = parseInt(this.querySelector('#sim-plazo').value);
                this.resultado = this.calcular(capital, tasa, plazo);
                this.render();
                this.querySelector('.sim-resumen')?.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }
}

customElements.define('acme-simulador', AcmeSimulador);
