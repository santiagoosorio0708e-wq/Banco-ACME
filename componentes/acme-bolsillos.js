class AcmeBolsillos extends HTMLElement {
    connectedCallback() {
        this.usuario = window.auth.obtenerUsuarioActual();
        this.cuenta = window.db.obtenerCuentaPorUsuario(this.usuario.numeroId);
        this.render();
    }

    obtenerBolsillos() {
        const key = `acmeBolsillos_${this.usuario.numeroId}`;
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
        const inicial = [
            { id: '1', nombre: 'Ahorro general', saldo: 0 },
            { id: '2', nombre: 'Vacaciones', saldo: 0 },
            { id: '3', nombre: 'Impuestos', saldo: 0 }
        ];
        localStorage.setItem(key, JSON.stringify(inicial));
        return inicial;
    }

    guardarBolsillos(bolsillos) {
        localStorage.setItem(`acmeBolsillos_${this.usuario.numeroId}`, JSON.stringify(bolsillos));
    }

    render() {
        const bolsillos = this.obtenerBolsillos();
        const totalBolsillos = bolsillos.reduce((s, b) => s + Number(b.saldo), 0);

        const bolsillosHTML = bolsillos.map(b => `
            <div class="card" style="margin-bottom: 1rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                    <div>
                        <h4 style="margin:0;">${b.nombre}</h4>
                        <p style="margin:0; font-size:0.85rem; color:var(--text-light);">Saldo: <strong style="color:var(--primary-color);">$${Number(b.saldo).toLocaleString('es-CO')}</strong></p>
                    </div>
                </div>
                <div style="display:flex; gap:0.5rem; margin-top:1rem; flex-wrap:wrap;">
                    <div style="flex:1; min-width: 140px;">
                        <input type="number" class="input-bolsillo" data-id="${b.id}" placeholder="Monto $" min="1" step="1000" style="width:100%; padding:0.5rem; border:1px solid var(--border-color); border-radius:6px;">
                    </div>
                    <button class="btn btn-primary btn-meter" data-id="${b.id}" style="width:auto; padding:0.5rem 1rem;">Cargar</button>
                    <button class="btn btn-secondary btn-sacar" data-id="${b.id}" style="width:auto; padding:0.5rem 1rem;">Descargar</button>
                    <button class="btn btn-danger btn-eliminar" data-id="${b.id}" style="width:auto; padding:0.5rem 1rem;">Eliminar</button>
                </div>
            </div>
        `).join('');

        this.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto;">
                <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
                    <div>
                        <h3 style="margin:0;">Mis Bolsillos</h3>
                        <p style="margin:0.25rem 0 0; color:var(--text-light);">Separa tu dinero del saldo disponible y ahorra de forma organizada.</p>
                    </div>
                    <div style="text-align:right;">
                        <p style="margin:0; font-size:0.85rem; color:var(--text-light);">Saldo en todos los bolsillos</p>
                        <strong style="font-size:1.4rem; color:var(--primary-color);">$${Number(totalBolsillos).toLocaleString('es-CO')}</strong>
                    </div>
                </div>

                <div id="alerta-bolsillo" class="alert hidden"></div>

                <div class="card" style="margin-bottom:1.5rem; background: var(--secondary-color);">
                    <form id="form-nuevo-bolsillo" style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:flex-end;">
                        <div style="flex:1; min-width: 200px;">
                            <label style="font-size:0.85rem; font-weight:600; margin-bottom:0.2rem; display:block;">Crear nuevo bolsillo predestinado</label>
                            <input type="text" id="nuevo-bolsillo-nombre" placeholder="Ej: Pago de Semestre" required maxlength="30" style="width:100%; padding:0.6rem; border:1px solid var(--border-color); border-radius:6px;">
                        </div>
                        <button type="submit" class="btn btn-primary" style="width:auto; padding:0.6rem 1.25rem;">Crear</button>
                    </form>
                </div>

                ${bolsillos.length === 0 ? '<p style="text-align:center; color:var(--text-light); padding:2rem;">No tienes bolsillos creados.</p>' : bolsillosHTML}
            </div>
        `;
        this.addEventListeners();
    }

    addEventListeners() {
        const alerta = this.querySelector('#alerta-bolsillo');

        this.querySelector('#form-nuevo-bolsillo').addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = this.querySelector('#nuevo-bolsillo-nombre').value.trim();
            const bolsillos = this.obtenerBolsillos();
            bolsillos.push({ id: Date.now().toString(), nombre, saldo: 0 });
            this.guardarBolsillos(bolsillos);
            this.render();
        });

        this.querySelectorAll('.btn-meter').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const input = this.querySelector(`.input-bolsillo[data-id="${id}"]`);
                const valor = parseFloat(input.value);
                if (isNaN(valor) || valor <= 0) return this.mostrarAlerta(alerta, 'Ingrese un monto válido.', 'danger');
                if (valor > this.cuenta.saldo) return this.mostrarAlerta(alerta, 'Su cuenta principal no tiene fondos suficientes.', 'danger');

                try {
                    this.cuenta.saldo = window.db.actualizarSaldo(this.cuenta.numeroCuenta, valor, false);
                    const bolsillos = this.obtenerBolsillos();
                    const b = bolsillos.find(x => x.id === id);
                    b.saldo += valor;
                    this.guardarBolsillos(bolsillos);
                    window.db.crearTransaccion({ numeroCuenta: this.cuenta.numeroCuenta, tipo: 'Retiro', monto: valor, concepto: `Carga a bolsillo: ${b.nombre}` });
                    this.render();
                } catch(e) { this.mostrarAlerta(alerta, e.message, 'danger'); }
            });
        });

        this.querySelectorAll('.btn-sacar').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const input = this.querySelector(`.input-bolsillo[data-id="${id}"]`);
                const valor = parseFloat(input.value);
                if (isNaN(valor) || valor <= 0) return this.mostrarAlerta(alerta, 'Ingrese un monto válido.', 'danger');
                
                let bolsillos = this.obtenerBolsillos();
                let b = bolsillos.find(x => x.id === id);
                if (valor > b.saldo) return this.mostrarAlerta(alerta, 'El bolsillo no tiene fondos suficientes.', 'danger');

                try {
                    b.saldo -= valor;
                    this.guardarBolsillos(bolsillos);
                    this.cuenta.saldo = window.db.actualizarSaldo(this.cuenta.numeroCuenta, valor, true); // Devuelve
                    window.db.crearTransaccion({ numeroCuenta: this.cuenta.numeroCuenta, tipo: 'Consignación', monto: valor, concepto: `Descarga de bolsillo: ${b.nombre}` });
                    this.render();
                } catch(e) { this.mostrarAlerta(alerta, e.message, 'danger'); }
            });
        });

        this.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                let bolsillos = this.obtenerBolsillos();
                let b = bolsillos.find(x => x.id === id);
                if (b.saldo > 0) {
                    this.mostrarAlerta(alerta, 'No puede eliminar un bolsillo que contenga fondos. Descargue el saldo primero.', 'warning');
                    return;
                }
                bolsillos = bolsillos.filter(x => x.id !== id);
                this.guardarBolsillos(bolsillos);
                this.render();
            });
        });
    }

    mostrarAlerta(el, msg, tipo) {
        el.textContent = msg;
        el.className = `alert alert-${tipo}`;
        el.classList.remove('hidden');
    }
}

customElements.define('acme-bolsillos', AcmeBolsillos);
