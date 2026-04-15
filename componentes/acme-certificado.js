class AcmeCertificado extends HTMLElement {
    connectedCallback() {
        this.usuario = window.auth.obtenerUsuarioActual();
        this.cuenta = window.db.obtenerCuentaPorUsuario(this.usuario.numeroId);
        this.render();
        this.addEventListeners();
    }

    render() {
        const fechaActual = new Date().toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        this.innerHTML = `
            <div class="card" style="max-width: 700px; margin: 0 auto; position: relative;">
                <div style="text-align: right; margin-bottom: 2rem;">
                    <button class="btn btn-outline print-btn" style="width: auto;">
                        Imprimir certificado
                    </button>
                </div>

                <div id="print-area" style="padding: 2rem; border: 2px solid var(--border-color); background: var(--white);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; border-bottom: 2px solid var(--primary-color); padding-bottom: 1rem; gap: 1rem; flex-wrap: wrap;">
                        <div>
                            <h2 style="margin: 0; color: var(--primary-color);">Banco Acme</h2>
                            <p style="margin: 0; color: var(--text-light);">Portal transaccional</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 0;"><strong>Fecha de expedición:</strong></p>
                            <p style="margin: 0;">${fechaActual}</p>
                        </div>
                    </div>

                    <div style="margin-bottom: 3rem; text-align: center;">
                        <h3 style="text-decoration: underline;">CERTIFICADO BANCARIO</h3>
                    </div>

                    <div style="margin-bottom: 2rem; line-height: 1.8;">
                        <p>El <strong>Banco Acme</strong> certifica que:</p>
                        <br>
                        <p>
                            El/La señor(a) <strong>${this.usuario.nombres} ${this.usuario.apellidos}</strong>,
                            identificado(a) con <strong>${this.usuario.tipoId}</strong> número <strong>${this.usuario.numeroId}</strong>,
                            es cliente activo de nuestra entidad.
                        </p>
                        <br>
                        <p>
                            Actualmente, posee el siguiente producto financiero:
                        </p>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; border: 1px solid var(--border-color);">
                            <thead>
                                <tr style="background: var(--secondary-color);">
                                    <th style="padding: 0.75rem; border: 1px solid var(--border-color); text-align: left;">Tipo de producto</th>
                                    <th style="padding: 0.75rem; border: 1px solid var(--border-color); text-align: left;">Número de cuenta</th>
                                    <th style="padding: 0.75rem; border: 1px solid var(--border-color); text-align: right;">Saldo actual</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td data-label="Tipo" style="padding: 0.75rem; border: 1px solid var(--border-color);">Cuenta de ahorros</td>
                                    <td data-label="Número" style="padding: 0.75rem; border: 1px solid var(--border-color);">${this.cuenta.numeroCuenta}</td>
                                    <td data-label="Saldo" style="padding: 0.75rem; border: 1px solid var(--border-color); text-align: right;">$ ${this.cuenta.saldo.toLocaleString('es-CO')}</td>
                                </tr>
                            </tbody>
                        </table>
                        <br>
                        <p>
                            Este certificado se expide a solicitud de la parte interesada, siendo las ${new Date().toLocaleTimeString('es-CO')}
                        </p>
                    </div>

                    <div style="margin-top: 4rem; text-align: center;">
                        <div style="width: 200px; border-bottom: 1px solid var(--text-dark); margin: 0 auto; margin-bottom: 0.5rem;"></div>
                        <p style="margin: 0; font-weight: bold;">Firma autorizada</p>
                        <p style="margin: 0; font-size: 0.9rem; color: var(--text-light);">Banco Acme</p>
                    </div>
                </div>
            </div>
            <style>
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 2rem; box-shadow: none; border: none !important; }
                    .print-btn { display: none !important; }
                }
            </style>
        `;
    }

    addEventListeners() {
        const botonImprimir = this.querySelector('.print-btn');
        botonImprimir.addEventListener('click', () => {
            window.print();
        });
    }
}

customElements.define('acme-certificate', AcmeCertificado);
