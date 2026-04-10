class AcmeLogin extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="container text-center mt-4">
                <h2 style="margin-top: 5vh; font-size: 2.5rem;">Banco Acme</h2>
                <div class="card" style="max-width: 400px; margin: 2rem auto; text-align: left;">
                    <h3>Iniciar Sesión</h3>
                    <div id="login-error" class="alert alert-danger hidden"></div>
                    <form id="login-form">
                        <div class="form-group">
                            <label for="idType">Tipo de Identificación</label>
                            <select id="idType" required>
                                <option value="CC">Cédula de Ciudadanía</option>
                                <option value="CE">Cédula de Extranjería</option>
                                <option value="PA">Pasaporte</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="idNumber">Número de Identificación</label>
                            <input type="text" id="idNumber" required inputmode="numeric" maxlength="11" pattern="[0-9]{2,11}" title="Debe contener entre 2 y 11 números">
                        </div>
                        <div class="form-group">
                            <label for="password">Contraseña</label>
                            <input type="password" id="password" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Ingresar</button>
                    </form>
                    <div class="mt-3 text-center" style="font-size: 0.9rem;">
                        <a href="#register">Crear cuenta</a> | 
                        <a href="#recovery">Recordar contraseña</a>
                    </div>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        const form = this.querySelector('#login-form');
        const errorDiv = this.querySelector('#login-error');
        const idNumberInput = this.querySelector('#idNumber');

        idNumberInput.addEventListener('input', () => {
            idNumberInput.value = idNumberInput.value.replace(/\D/g, '').slice(0, 11);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            errorDiv.classList.add('hidden');
            const idType = this.querySelector('#idType').value;
            const idNumber = idNumberInput.value.replace(/\D/g, '').slice(0, 11);
            const password = this.querySelector('#password').value;
            idNumberInput.value = idNumber;

            if (!/^\d{2,11}$/.test(idNumber)) {
                errorDiv.textContent = 'El número de identificación debe tener entre 2 y 11 dígitos.';
                errorDiv.classList.remove('hidden');
                return;
            }

            const res = window.auth.login(idType, idNumber, password);
            if (!res.success) {
                errorDiv.textContent = res.message;
                errorDiv.classList.remove('hidden');
            } else {
                errorDiv.classList.add('hidden');
            }
        });
    }
}
customElements.define('acme-login', AcmeLogin);
