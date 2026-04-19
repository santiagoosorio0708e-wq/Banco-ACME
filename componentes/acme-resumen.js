class AcmeResumen extends HTMLElement {
    connectedCallback() {
        this.usuario = window.auth.obtenerUsuarioActual();
        this.cuenta = window.db.obtenerCuentaPorUsuario(this.usuario.numeroId);
        this.paginaActiva = 1;
        this.porPagina = 5;
        this.trmActual = null;
        this.obtenerTRM();
        this.render();
    }

    async obtenerTRM() {
        try {
            const respuesta = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await respuesta.json();
            this.trmActual = data.rates.COP;
            this.render();
        } catch(e) {
            this.trmActual = 'Error de conexión';
            this.render();
        }
    }

    render() {
        const _todasTransacciones = window.db.obtenerTransaccionesPorCuenta(this.cuenta.numeroCuenta);
        const totalPaginas = Math.ceil(_todasTransacciones.length / this.porPagina) || 1;
        const indexInicio = (this.paginaActiva - 1) * this.porPagina;
        const transacciones = _todasTransacciones.slice(indexInicio, indexInicio + this.porPagina);

        let cuerpoTabla = '';

        if (_todasTransacciones.length === 0) {
            cuerpoTabla = '<tr><td colspan="5" class="text-center" style="padding: 2rem;">No hay transacciones registradas para esta cuenta.</td></tr>';
        } else {
            transacciones.forEach((transaccion) => {
                const esConsignacion = transaccion.tipo === 'Consignación';
                const color = esConsignacion ? 'var(--success-color)' : 'var(--danger-color)';
                const signo = esConsignacion ? '+' : '-';

                cuerpoTabla += `
                    <tr style="transition: background 0.2s;">
                        <td data-label="Fecha" style="padding: 1rem; border-bottom: 1px solid var(--border-color);">${new Date(transaccion.fecha).toLocaleString('es-CO')}</td>
                        <td data-label="Referencia" style="padding: 1rem; border-bottom: 1px solid var(--border-color); font-family: monospace; color: #555;">${transaccion.referencia}</td>
                        <td data-label="Tipo" style="padding: 1rem; border-bottom: 1px solid var(--border-color);">${transaccion.tipo}</td>
                        <td data-label="Concepto" style="padding: 1rem; border-bottom: 1px solid var(--border-color);">${transaccion.concepto}</td>
                        <td data-label="Valor" style="padding: 1rem; border-bottom: 1px solid var(--border-color); color: ${color}; font-weight: bold; text-align: right;">${signo} $ ${Number(transaccion.monto).toLocaleString('es-CO')}</td>
                    </tr>
                `;
            });
        }

        this.innerHTML = `
            <div class="card" id="print-area">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <div>
                        <h3 style="margin: 0;">Resumen de transacciones</h3>
                        <p style="margin: 0.35rem 0 0; color: var(--text-light);">Últimos 10 movimientos de la cuenta ${this.cuenta.numeroCuenta}.</p>
                    </div>
                    <button class="btn btn-outline print-btn" style="width: auto; padding: 0.5rem 1rem;">Imprimir resumen</button>
                </div>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="background: var(--secondary-color);">
                                <th style="padding: 1rem;">Fecha</th>
                                <th style="padding: 1rem;">Referencia</th>
                                <th style="padding: 1rem;">Tipo</th>
                                <th style="padding: 1rem;">Concepto</th>
                                <th style="padding: 1rem; text-align: right;">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cuerpoTabla}
                        </tbody>
                    </table>
                </div>
                ${_todasTransacciones.length > 0 ? `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border-color);">
                        <button class="btn btn-secondary btn-sm" id="btn-ant-pag" ${this.paginaActiva === 1 ? 'disabled' : ''}>Anterior</button>
                        <span style="font-size:0.9rem;">Página ${this.paginaActiva} de ${totalPaginas}</span>
                        <button class="btn btn-secondary btn-sm" id="btn-sig-pag" ${this.paginaActiva === totalPaginas ? 'disabled' : ''}>Siguiente</button>
                    </div>
                ` : ''}

                <!-- Indicador de divisa externa API -->
                <div style="margin-top:2rem; padding:1rem; background: var(--secondary-color); border-radius:8px; display:inline-block;">
                    <strong>Indicador Externo (API):</strong> 
                    Precio del Dólar (USD) hoy: <span style="font-size:1.1rem; color:var(--primary-color); font-weight:bold;">${this.trmActual ? (typeof this.trmActual === 'number' ? '$' + Number(this.trmActual).toLocaleString('es-CO') + ' COP' : this.trmActual) : 'Cargando...'}</span>
                </div>
            </div>
            <style>
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none; }
                    .print-btn { display: none !important; }
                }

                tr:hover { background-color: var(--secondary-color); }
            </style>
        `;

        this.querySelector('.print-btn').addEventListener('click', () => window.print());

        const btnAnt = this.querySelector('#btn-ant-pag');
        const btnSig = this.querySelector('#btn-sig-pag');

        if(btnAnt) btnAnt.addEventListener('click', () => {
            if(this.paginaActiva > 1) {
                this.paginaActiva--;
                this.render();
            }
        });

        if(btnSig) btnSig.addEventListener('click', () => {
             const _todas = window.db.obtenerTransaccionesPorCuenta(this.cuenta.numeroCuenta);
             const _totalPaginas = Math.ceil(_todas.length / this.porPagina);
             if (this.paginaActiva < _totalPaginas) {
                 this.paginaActiva++;
                 this.render();
             }
        });
    }
}

customElements.define('acme-summary', AcmeResumen);
