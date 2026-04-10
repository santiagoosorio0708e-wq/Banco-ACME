class AcmeRecovery extends HTMLElement {
    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="container text-center mt-4">
                <h2>Recuperar Contraseña</h2>
                <div class="card" style="max-width: 400px; margin: 2rem auto; text-align: left;">
                    
                    <div id="recovery-step-1">
                        <p class="mb-2 text-light" style="font-size:0.9rem;">Ingrese sus datos para validar su identidad.</p>
                        <div id="rec-error-1" class="alert alert-danger hidden"></div>
                        <form id="form-step-1">
                            <div class="form-group">
                                <label>Tipo de Identificación</label>
                                <select id="recIdType" required>
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                    <option value="PA">Pasaporte</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Número de Identificación</label>
                                <input type="text" id="recIdNumber" required inputmode="numeric" maxlength="11" pattern="[0-9]{2,11}" title="Debe contener entre 2 y 11 números">
                            </div>
                            <div class="form-group">
                                <label>Correo Electrónico</label>
                                <input type="email" id="recEmail" required>
                            </div>
                            <button type="submit" class="btn btn-primary mt-1">Validar</button>
                            <a href="#login" class="btn btn-secondary mt-1 text-center" style="display:block;">Cancelar</a>
                        </form>
                    </div>

                    <div id="recovery-step-2" class="hidden">
                        <p class="mb-2" style="color:var(--success-color);font-weight:bold;">¡Identidad validada!</p>
                        <p class="mb-2" style="font-size:0.9rem;">Ingrese su nueva contraseña.</p>
                        <div id="rec-error-2" class="alert alert-danger hidden"></div>
                        <form id="form-step-2">
                            <div class="form-group">
                                <label>Nueva Contraseña</label>
                                <input type="password" id="recNewPassword" required minlength="6">
                            </div>
                            <button type="submit" class="btn" style="background:var(--success-color);color:white;">Actualizar Contraseña</button>
                        </form>
                        <div id="rec-success" class="alert alert-success hidden mt-2 text-center">
                            Contraseña actualizada exitosamente.<br><br>
                            <a href="#login" class="btn btn-primary" style="display:inline-block">Ir a inicio de sesión</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        const form1 = this.querySelector('#form-step-1');
        const form2 = this.querySelector('#form-step-2');
        const error1 = this.querySelector('#rec-error-1');
        const error2 = this.querySelector('#rec-error-2');
        const idNumberInput = this.querySelector('#recIdNumber');
        let validatedUser = null;

        idNumberInput.addEventListener('input', () => {
            idNumberInput.value = idNumberInput.value.replace(/\D/g, '').slice(0, 11);
        });

        form1.addEventListener('submit', (e) => {
            e.preventDefault();
            error1.classList.add('hidden');

            const idType = this.querySelector('#recIdType').value;
            const idNumber = idNumberInput.value.replace(/\D/g, '').slice(0, 11);
            const email = this.querySelector('#recEmail').value;
            idNumberInput.value = idNumber;

            if (!/^\d{2,11}$/.test(idNumber)) {
                error1.textContent = 'El número de identificación debe tener entre 2 y 11 dígitos.';
                error1.classList.remove('hidden');
                return;
            }

            const user = window.db.getUser(idType, idNumber);
            if (user && user.email === email) {
                validatedUser = user;
                this.querySelector('#recovery-step-1').classList.add('hidden');
                this.querySelector('#recovery-step-2').classList.remove('hidden');
            } else {
                error1.textContent = 'Datos incorrectos o no se encontró el usuario.';
                error1.classList.remove('hidden');
            }
        });

        form2.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPassword = this.querySelector('#recNewPassword').value;

            validatedUser.password = newPassword;
            window.db.updateUser(validatedUser);

            form2.classList.add('hidden');
            this.querySelector('#rec-success').classList.remove('hidden');
        });
    }
}
customElements.define('acme-recovery', AcmeRecovery);
