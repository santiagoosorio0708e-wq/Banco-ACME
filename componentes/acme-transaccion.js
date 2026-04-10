class AcmeTransaction extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.user = window.auth.getCurrentUser();
        this.account = window.db.getAccountByUserId(this.user.idNumber);
        this.type = this.getAttribute('type') || 'deposit';
        this.lastTransaction = null;
        this.render();
        this.addEventListeners();
    }

    getConfig() {
        if (this.type === 'deposit') {
            return {
                title: 'Consignación electrónica',
                typeLabel: 'Consignación',
                concept: 'Consignación por canal electrónico',
                submitText: 'Realizar consignación',
                isDeposit: true
            };
        }

        if (this.type === 'withdraw') {
            return {
                title: 'Retiro de dinero',
                typeLabel: 'Retiro',
                concept: 'Retiro de dinero',
                submitText: 'Realizar retiro',
                isDeposit: false
            };
        }

        return {
            title: 'Pago de servicios públicos',
            typeLabel: 'Retiro',
            concept: null,
            submitText: 'Pagar servicio',
            isDeposit: false
        };
    }

    render() {
        const config = this.getConfig();
        const paymentFields = this.type === 'payment'
            ? `
                <div class="form-group">
                    <label>Servicio público</label>
                    <select id="tx-service" required>
                        <option value="Energía">Energía</option>
                        <option value="Agua">Agua</option>
                        <option value="Gas natural">Gas natural</option>
                        <option value="Internet">Internet</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Referencia del servicio</label>
                    <input type="text" id="tx-service-reference" inputmode="numeric" maxlength="11" pattern="[0-9]{11}" title="Debe contener exactamente 11 números" required>
                </div>
            `
            : '';

        const receipt = this.lastTransaction
            ? `
                <div class="card" id="tx-print-area" style="border:1px solid var(--border-color); background:#fcfcfd;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap; margin-bottom:1.5rem;">
                        <div>
                            <h4 style="margin:0;">Resumen de la transacción</h4>
                            <p style="margin:0.35rem 0 0; color:var(--text-light);">Operación registrada exitosamente.</p>
                        </div>
                        <button type="button" class="btn btn-outline tx-print-btn" style="width:auto; padding:0.5rem 1rem;">Imprimir resumen</button>
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem;">
                        <div><strong>Fecha:</strong><br>${new Date(this.lastTransaction.date).toLocaleString('es-CO')}</div>
                        <div><strong>Referencia:</strong><br>${this.lastTransaction.reference}</div>
                        <div><strong>Tipo:</strong><br>${this.lastTransaction.type}</div>
                        <div><strong>Concepto:</strong><br>${this.lastTransaction.concept}</div>
                        <div><strong>Valor:</strong><br>$ ${Number(this.lastTransaction.amount).toLocaleString('es-CO')}</div>
                        ${this.lastTransaction.serviceReference ? `<div><strong>Referencia del servicio:</strong><br>${this.lastTransaction.serviceReference}</div>` : ''}
                    </div>
                </div>
            `
            : '';

        this.innerHTML = `
            <div class="card" style="max-width: 720px; margin: 0 auto;">
                <h3 style="margin-bottom: 1.5rem; text-align: center;">${config.title}</h3>

                <div id="tx-alert" class="alert hidden"></div>

                <div style="background: var(--secondary-color); padding: 1rem; border-radius: var(--border-radius); margin-bottom: 1.5rem;">
                    <div class="grid-2-col">
                        <div>
                            <p style="margin-bottom:0.35rem; color:var(--text-light);">Número de cuenta</p>
                            <strong>${this.account.accountNumber}</strong>
                        </div>
                        <div>
                            <p style="margin-bottom:0.35rem; color:var(--text-light);">Titular</p>
                            <strong>${this.user.firstName} ${this.user.lastName}</strong>
                        </div>
                    </div>
                    <div class="mt-2">
                        <p style="margin-bottom:0.35rem; color:var(--text-light);">Saldo actual</p>
                        <strong style="font-size:1.35rem; color:var(--primary-color);">$ ${Number(this.account.balance).toLocaleString('es-CO')}</strong>
                    </div>
                </div>

                <form id="tx-form">
                    ${paymentFields}
                    <div class="form-group">
                        <label>Valor a ${this.type === 'deposit' ? 'consignar' : this.type === 'withdraw' ? 'retirar' : 'pagar'}</label>
                        <input type="number" id="tx-amount" min="1" step="0.01" required>
                    </div>
                    <button type="submit" class="btn btn-primary">${config.submitText}</button>
                </form>
            </div>
            ${receipt}
            <style>
                @media print {
                    body * { visibility: hidden; }
                    #tx-print-area, #tx-print-area * { visibility: visible; }
                    #tx-print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; box-shadow: none; }
                    .tx-print-btn { display: none !important; }
                }
            </style>
        `;

        const printBtn = this.querySelector('.tx-print-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => window.print());
        }
    }

    addEventListeners() {
        const form = this.querySelector('#tx-form');
        const alertBox = this.querySelector('#tx-alert');
        const serviceReferenceInput = this.querySelector('#tx-service-reference');

        if (serviceReferenceInput) {
            serviceReferenceInput.addEventListener('input', () => {
                serviceReferenceInput.value = serviceReferenceInput.value.replace(/\D/g, '').slice(0, 11);
            });
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const config = this.getConfig();
            const amount = parseFloat(this.querySelector('#tx-amount').value);

            if (isNaN(amount) || amount <= 0) {
                this.showAlert(alertBox, 'Por favor ingrese un valor válido.', 'danger');
                return;
            }

            let concept = config.concept;
            let serviceReference = null;

            if (this.type === 'payment') {
                const service = this.querySelector('#tx-service').value;
                serviceReference = this.querySelector('#tx-service-reference').value.replace(/\D/g, '').slice(0, 11).trim();
                this.querySelector('#tx-service-reference').value = serviceReference;
                if (!/^\d{11}$/.test(serviceReference)) {
                    this.showAlert(alertBox, 'La referencia del servicio debe tener exactamente 11 dígitos.', 'danger');
                    return;
                }
                concept = `Pago de servicio público ${service}`;
            }

            try {
                this.account.balance = window.db.updateBalance(this.account.accountNumber, amount, config.isDeposit);

                this.lastTransaction = window.db.createTransaction({
                    accountNumber: this.account.accountNumber,
                    type: config.typeLabel,
                    amount,
                    concept,
                    serviceReference
                });

                this.render();
                this.addEventListeners();
                this.showAlert(this.querySelector('#tx-alert'), 'Transacción realizada con éxito.', 'success');
            } catch (error) {
                this.showAlert(alertBox, error.message, 'danger');
            }
        });
    }

    showAlert(element, message, type) {
        element.textContent = message;
        element.className = `alert alert-${type}`;
        element.classList.remove('hidden');
    }
}

customElements.define('acme-transaction', AcmeTransaction);
