class AcmeRecovery extends HTMLElement {
    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="container text-center mt-4">
                <h2>Recuperar contraseña</h2>
                <div class="card" style="max-width: 400px; margin: 2rem auto; text-align: left;">
                    <div id="paso-recuperacion-1">
                        <p class="mb-2 text-light" style="font-size: 0.9rem;">Ingrese sus datos para validar su identidad.</p>
                        <div id="error-recuperacion-1" class="alert alert-danger hidden"></div>
                        <form id="formulario-paso-1">
                            <div class="form-group">
                                <label>Tipo de identificación</label>
                                <select id="tipo-identificacion-recuperacion" required>
                                    <option value="CC">Cédula de ciudadanía</option>
                                    <option value="CE">Cédula de extranjería</option>
                                    <option value="PA">Pasaporte</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Número de identificación</label>
                                <input type="text" id="numero-identificacion-recuperacion" required inputmode="numeric" maxlength="11" pattern="[0-9]{2,11}" title="Debe contener entre 2 y 11 números">
                            </div>
                            <div class="form-group">
                                <label>Correo electrónico</label>
                                <input type="email" id="correo-recuperacion" required>
                            </div>
                            <button type="submit" class="btn btn-primary mt-1">Validar</button>
                            <a href="#login" class="btn btn-secondary mt-1 text-center" style="display: block;">Cancelar</a>
                        </form>
                    </div>

                    <div id="paso-recuperacion-2" class="hidden">
                        <p class="mb-2" style="color: var(--success-color); font-weight: bold;">Identidad validada</p>
                        <p class="mb-2" style="font-size: 0.9rem;">Ingrese su nueva contraseña.</p>
                        <div id="error-recuperacion-2" class="alert alert-danger hidden"></div>
                        <form id="formulario-paso-2">
                            <div class="form-group">
                                <label>Nueva contraseña</label>
                                <input type="password" id="nueva-contrasena-recuperacion" required minlength="6">
                            </div>
                            <button type="submit" class="btn" style="background: var(--success-color); color: white;">Actualizar contraseña</button>
                        </form>
                        <div id="exito-recuperacion" class="alert alert-success hidden mt-2 text-center">
                            Contraseña actualizada exitosamente.<br><br>
                            <a href="#login" class="btn btn-primary" style="display: inline-block;">Ir a inicio de sesión</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        const formularioPaso1 = this.querySelector('#formulario-paso-1');
        const formularioPaso2 = this.querySelector('#formulario-paso-2');
        const errorPaso1 = this.querySelector('#error-recuperacion-1');
        const campoNumeroIdentificacion = this.querySelector('#numero-identificacion-recuperacion');
        let usuarioValidado = null;

        campoNumeroIdentificacion.addEventListener('input', () => {
            campoNumeroIdentificacion.value = campoNumeroIdentificacion.value.replace(/\D/g, '').slice(0, 11);
        });

        formularioPaso1.addEventListener('submit', (evento) => {
            evento.preventDefault();
            errorPaso1.classList.add('hidden');

            const tipoId = this.querySelector('#tipo-identificacion-recuperacion').value;
            const numeroId = campoNumeroIdentificacion.value.replace(/\D/g, '').slice(0, 11);
            const correo = this.querySelector('#correo-recuperacion').value;

            campoNumeroIdentificacion.value = numeroId;

            if (!/^\d{2,11}$/.test(numeroId)) {
                errorPaso1.textContent = 'El número de identificación debe tener entre 2 y 11 dígitos.';
                errorPaso1.classList.remove('hidden');
                return;
            }

            const usuario = window.db.obtenerUsuario(tipoId, numeroId);
            if (usuario && usuario.correo === correo) {
                usuarioValidado = usuario;
                this.querySelector('#paso-recuperacion-1').classList.add('hidden');
                this.querySelector('#paso-recuperacion-2').classList.remove('hidden');
                return;
            }

            errorPaso1.textContent = 'Datos incorrectos o no se encontró el usuario.';
            errorPaso1.classList.remove('hidden');
        });

        formularioPaso2.addEventListener('submit', (evento) => {
            evento.preventDefault();

            const nuevaContrasena = this.querySelector('#nueva-contrasena-recuperacion').value;
            usuarioValidado.contrasena = nuevaContrasena;
            window.db.actualizarUsuario(usuarioValidado);

            formularioPaso2.classList.add('hidden');
            this.querySelector('#exito-recuperacion').classList.remove('hidden');
        });
    }
}

customElements.define('acme-recovery', AcmeRecovery);
