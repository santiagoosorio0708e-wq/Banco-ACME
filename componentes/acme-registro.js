class AcmeRegister extends HTMLElement {
    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="container mt-4">
                <div class="text-center">
                    <h2>Crear Cuenta Bancaria</h2>
                    <p class="mb-2">Únete a Banco Acme y gestiona tus finanzas.</p>
                </div>
                <div class="card max-w-lg" id="register-card" style="max-width: 800px; margin: 0 auto;">
                    <div id="register-error" class="alert alert-danger hidden"></div>
                    <form id="register-form">
                        <div class="grid-2-col">
                            <div class="form-group">
                                <label>Tipo de Identificación</label>
                                <select id="regIdType" required>
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                    <option value="PA">Pasaporte</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Número de Identificación</label>
                                <input type="text" id="regIdNumber" required inputmode="numeric" maxlength="11" pattern="[0-9]{2,11}" title="Debe contener entre 2 y 11 números">
                            </div>
                            <div class="form-group">
                                <label>Nombres</label>
                                <input type="text" id="regFirstName" required>
                            </div>
                            <div class="form-group">
                                <label>Apellidos</label>
                                <input type="text" id="regLastName" required>
                            </div>
                            <div class="form-group">
                                <label>Género</label>
                                <select id="regGender" required>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="O">Otro</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Teléfono</label>
                                <input type="tel" id="regPhone" required pattern="[0-9]{7,10}" title="Un teléfono de 7 a 10 dígitos">
                            </div>
                            <div class="form-group">
                                <label>Correo Electrónico</label>
                                <input type="email" id="regEmail" required>
                            </div>
                            <div class="form-group">
                                <label>Ciudad de Residencia</label>
                                <input type="text" id="regCity" required>
                            </div>
                            <div class="form-group">
                                <label>Dirección</label>
                                <input type="text" id="regAddress" required>
                            </div>
                            <div class="form-group">
                                <label>Contraseña</label>
                                <input type="password" id="regPassword" required minlength="6" title="La contraseña debe tener al menos 6 caracteres">
                            </div>
                        </div>
                        <div class="grid-2-col mt-4">
                            <button type="submit" class="btn btn-primary">Registrarse</button>
                            <a href="#login" class="btn btn-secondary text-center" style="display:flex; justify-content:center; align-items:center;">Cancelar</a>
                        </div>
                    </form>
                </div>
                
                <div class="card hidden text-center" id="register-success" style="max-width: 600px; margin: 0 auto;">
                    <h3 style="color: var(--success-color);">¡Registro Exitoso!</h3>
                    <p>Bienvenido a Banco Acme. Se ha creado su cuenta bancaria oportunamente.</p>
                    <div class="mt-3 mb-3 p-3" style="background:var(--secondary-color); border-radius:8px; border: 1px solid var(--border-color);">
                        <strong style="font-size:1.1rem;">Número de Cuenta:</strong> <span id="success-account" style="font-size:1.2rem;font-weight:bold;color:var(--primary-color);"></span><br>
                        <strong>Fecha de Creación:</strong> <span id="success-date"></span>
                    </div>
                    <a href="#login" class="btn btn-primary">Ir al Inicio de Sesión</a>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        const form = this.querySelector('#register-form');
        const errorDiv = this.querySelector('#register-error');
        const idNumberInput = this.querySelector('#regIdNumber');

        idNumberInput.addEventListener('input', () => {
            idNumberInput.value = idNumberInput.value.replace(/\D/g, '').slice(0, 11);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            errorDiv.classList.add('hidden');

            const cleanedIdNumber = idNumberInput.value.replace(/\D/g, '').slice(0, 11);
            idNumberInput.value = cleanedIdNumber;

            if (!/^\d{2,11}$/.test(cleanedIdNumber)) {
                errorDiv.textContent = 'El número de identificación debe tener entre 2 y 11 dígitos.';
                errorDiv.classList.remove('hidden');
                return;
            }
            
            const userObj = {
                idType: this.querySelector('#regIdType').value,
                idNumber: cleanedIdNumber,
                firstName: this.querySelector('#regFirstName').value,
                lastName: this.querySelector('#regLastName').value,
                gender: this.querySelector('#regGender').value,
                phone: this.querySelector('#regPhone').value,
                email: this.querySelector('#regEmail').value,
                city: this.querySelector('#regCity').value,
                address: this.querySelector('#regAddress').value,
                password: this.querySelector('#regPassword').value,
            };

            try {
                window.db.createUser(userObj);
                const newAccount = window.db.getAccountByUserId(userObj.idNumber);
                
                this.querySelector('#register-card').classList.add('hidden');
                this.querySelector('#success-account').textContent = newAccount.accountNumber;
                this.querySelector('#success-date').textContent = new Date(newAccount.createdAt).toLocaleDateString();
                this.querySelector('#register-success').classList.remove('hidden');

            } catch(error) {
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('hidden');
            }
        });
    }
}
customElements.define('acme-register', AcmeRegister);
