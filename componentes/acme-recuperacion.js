class AcmeRecovery extends HTMLElement {
    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="container text-center mt-4">
                <h2>Recuperar contraseña</h2>
                <div class="card" style="max-width: 450px; margin: 2rem auto; text-align: left;">
                    
                    <!-- PASO 1: Validación Extendida -->
                    <div id="paso-recuperacion-1">
                        <p class="mb-2 text-light" style="font-size: 0.9rem;">Ingrese sus datos personales básicos para validar de manera segura su identidad.</p>
                        <div id="error-recuperacion-1" class="alert alert-danger hidden"></div>
                        <form id="formulario-paso-1">
                            <div class="grid-2-col">
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
                                    <input type="text" id="numero-identificacion-recuperacion" required inputmode="numeric" maxlength="11">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Correo electrónico registrado</label>
                                <input type="email" id="correo-recuperacion" required>
                            </div>
                            <div class="form-group">
                                <label>Teléfono celular registrado</label>
                                <input type="tel" id="telefono-recuperacion" required maxlength="10">
                            </div>
                            <button type="submit" class="btn btn-primary mt-1">Validar identidad</button>
                            <a href="#login" class="btn btn-secondary mt-1 text-center" style="display: block;">Cancelar</a>
                        </form>
                    </div>

                    <!-- PASO 2: Nueva Contraseña -->
                    <div id="paso-recuperacion-2" class="hidden">
                        <p class="mb-2" style="color: var(--success-color); font-weight: bold;">Identidad validada exitosamente</p>
                        <p class="mb-2" style="font-size: 0.9rem;">Ingrese su nueva contraseña y confírmela.</p>
                        <div id="error-recuperacion-2" class="alert alert-danger hidden"></div>
                        <form id="formulario-paso-2">
                            <div class="form-group">
                                <label>Nueva contraseña</label>
                                <input type="password" id="nueva-contrasena" required minlength="6">
                            </div>
                            <div class="form-group">
                                <label>Confirmar nueva contraseña</label>
                                <input type="password" id="confirmar-contrasena" required minlength="6">
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
        const errorPaso2 = this.querySelector('#error-recuperacion-2');
        const campoNumId = this.querySelector('#numero-identificacion-recuperacion');
        let usuarioValidado = null;

        campoNumId.addEventListener('input', () => {
            campoNumId.value = campoNumId.value.replace(/\D/g, '').slice(0, 11);
        });

        formularioPaso1.addEventListener('submit', (evento) => {
            evento.preventDefault();
            errorPaso1.classList.add('hidden');

            const tipoId = this.querySelector('#tipo-identificacion-recuperacion').value;
            const numeroId = campoNumId.value;
            const correo = this.querySelector('#correo-recuperacion').value.trim();
            const telefono = this.querySelector('#telefono-recuperacion').value.trim();

            if (!/^\d{2,11}$/.test(numeroId)) {
                errorPaso1.textContent = 'El número de identificación debe tener entre 2 y 11 dígitos.';
                errorPaso1.classList.remove('hidden');
                return;
            }

            const usuario = window.db.obtenerUsuario(tipoId, numeroId);
            
            // Validar que todos los datos coincidan
            if (usuario && usuario.correo === correo && usuario.telefono === telefono) {
                usuarioValidado = usuario;
                this.querySelector('#paso-recuperacion-1').classList.add('hidden');
                this.querySelector('#paso-recuperacion-2').classList.remove('hidden');
                return;
            }

            errorPaso1.textContent = 'Los datos proporcionados no coinciden con nuestros registros, por favor verifique.';
            errorPaso1.classList.remove('hidden');
        });

        formularioPaso2.addEventListener('submit', (evento) => {
            evento.preventDefault();
            errorPaso2.classList.add('hidden');

            const nuevaContrasena = this.querySelector('#nueva-contrasena').value;
            const confirmacion = this.querySelector('#confirmar-contrasena').value;

            if (nuevaContrasena !== confirmacion) {
                errorPaso2.textContent = 'Las contraseñas no coinciden.';
                errorPaso2.classList.remove('hidden');
                return;
            }

            usuarioValidado.contrasena = nuevaContrasena;
            window.db.actualizarUsuario(usuarioValidado);

            formularioPaso2.classList.add('hidden');
            this.querySelector('#exito-recuperacion').classList.remove('hidden');
        });
    }
}

customElements.define('acme-recovery', AcmeRecovery);
