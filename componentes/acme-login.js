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
        const formulario = this.querySelector('#formulario-inicio-sesion');
        const contenedorError = this.querySelector('#error-inicio-sesion');
        const campoNumeroIdentificacion = this.querySelector('#numero-identificacion');

        campoNumeroIdentificacion.addEventListener('input', () => {
            campoNumeroIdentificacion.value = campoNumeroIdentificacion.value.replace(/\D/g, '').slice(0, 11);
        });

        formulario.addEventListener('submit', (evento) => {
            evento.preventDefault();
            contenedorError.classList.add('hidden');

            const tipoId = this.querySelector('#tipo-identificacion').value;
            const numeroId = campoNumeroIdentificacion.value.replace(/\D/g, '').slice(0, 11);
            const contrasena = this.querySelector('#contrasena').value;

            campoNumeroIdentificacion.value = numeroId;

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

            contenedorError.classList.add('hidden');
        });
    }
}

customElements.define('acme-login', AcmeLogin);
