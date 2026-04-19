class AcmeLogin extends HTMLElement {
    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="container text-center mt-4">
                <img src="imagenes/logo.png" alt="Logo Banco Acme" class="acme-logo-login">
                <div class="card" style="max-width: 400px; margin: 2rem auto; text-align: left;">
                    
                    <!-- Paso 1: Credenciales -->
                    <div id="login-paso-1">
                        <h3>Iniciar sesión</h3>
                        <div id="error-inicio-sesion" class="alert alert-danger hidden"></div>
                        <form id="formulario-inicio-sesion">
                            <div class="form-group">
                                <label for="tipo-identificacion">Tipo de identificación</label>
                                <select id="tipo-identificacion" required>
                                    <option value="CC">Cédula de ciudadanía</option>
                                    <option value="CE">Cédula de extranjería</option>
                                    <option value="PA">Pasaporte</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="numero-identificacion">Número de identificación</label>
                                <input type="text" id="numero-identificacion" required inputmode="numeric" maxlength="11" pattern="[0-9]{2,11}" title="Debe contener entre 2 y 11 números">
                            </div>
                            <div class="form-group">
                                <label for="contrasena">Contraseña</label>
                                <input type="password" id="contrasena" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Continuar</button>
                        </form>
                        <div class="mt-3 text-center" style="font-size: 0.9rem;">
                            <a href="#register">Crear cuenta</a> |
                            <a href="#recovery">Recordar contraseña</a>
                        </div>
                    </div>

                    <!-- Paso 2: MFA (Doble factor) -->
                    <div id="login-paso-2" class="hidden">
                        <h3>Verificación de seguridad</h3>
                        <p class="text-light" style="font-size: 0.9rem; margin-bottom: 1rem;">Para proteger su cuenta, hemos enviado un código de verificación de 6 dígitos a su teléfono y correo registrado.</p>
                        <div id="error-mfa" class="alert alert-danger hidden"></div>
                        <form id="formulario-mfa">
                            <div class="form-group">
                                <label for="codigo-mfa">Código de verificación</label>
                                <input type="text" id="codigo-mfa" required inputmode="numeric" maxlength="6" pattern="[0-9]{6}" title="Cógido de 6 dígitos" placeholder="Ej: 123456" style="text-align:center; font-size: 1.5rem; letter-spacing: 0.2rem;">
                            </div>
                            <div style="display:flex;gap:0.5rem;">
                                <button type="button" id="btn-volver-login" class="btn btn-secondary">Cancelar</button>
                                <button type="submit" class="btn btn-primary">Verificar e ingresar</button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        `;
    }

    addEventListeners() {
        // ... Variables ...
        const formulario = this.querySelector('#formulario-inicio-sesion');
        const formularioMfa = this.querySelector('#formulario-mfa');
        const contenedorError = this.querySelector('#error-inicio-sesion');
        const errorMfa = this.querySelector('#error-mfa');
        const campoNumeroIdentificacion = this.querySelector('#numero-identificacion');
        const campoMfa = this.querySelector('#codigo-mfa');

        const paso1 = this.querySelector('#login-paso-1');
        const paso2 = this.querySelector('#login-paso-2');

        // ... Formateo ...
        campoNumeroIdentificacion.addEventListener('input', () => {
            campoNumeroIdentificacion.value = campoNumeroIdentificacion.value.replace(/\D/g, '').slice(0, 11);
        });
        campoMfa.addEventListener('input', () => {
            campoMfa.value = campoMfa.value.replace(/\D/g, '').slice(0, 6);
        });

        // ... Módulo 1: Login
        formulario.addEventListener('submit', (evento) => {
            evento.preventDefault();
            contenedorError.classList.add('hidden');

            const tipoId = this.querySelector('#tipo-identificacion').value;
            const numeroId = campoNumeroIdentificacion.value;
            const contrasena = this.querySelector('#contrasena').value;

            if (!/^\d{2,11}$/.test(numeroId)) {
                contenedorError.textContent = 'El número de identificación debe tener entre 2 y 11 dígitos.';
                contenedorError.classList.remove('hidden');
                return;
            }

            const respuesta = window.auth.iniciarSesion(tipoId, numeroId, contrasena);
            if (!respuesta.exito) {
                contenedorError.textContent = respuesta.mensaje;
                contenedorError.classList.remove('hidden');
                return;
            }

            // Exito -> ir a paso 2
            paso1.classList.add('hidden');
            paso2.classList.remove('hidden');
        });

        // ... Volver
        this.querySelector('#btn-volver-login').addEventListener('click', () => {
            paso2.classList.add('hidden');
            paso1.classList.remove('hidden');
            sessionStorage.removeItem('acmePendingAuth');
        });

        // ... Módulo 2: MFA
        formularioMfa.addEventListener('submit', (e) => {
            e.preventDefault();
            errorMfa.classList.add('hidden');
            
            const codigo = campoMfa.value;
            if (codigo.length !== 6) {
                errorMfa.textContent = 'El código debe tener 6 dígitos.';
                errorMfa.classList.remove('hidden');
                return;
            }

            const res = window.auth.validarMFA(codigo);
            if(!res.exito) {
                errorMfa.textContent = res.mensaje;
                errorMfa.classList.remove('hidden');
            }
        });
    }
}

customElements.define('acme-login', AcmeLogin);
