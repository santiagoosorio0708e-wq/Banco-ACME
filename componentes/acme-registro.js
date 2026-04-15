class AcmeRegister extends HTMLElement {
    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        this.innerHTML = `
            <div class="container mt-4">
                <div class="text-center">
                    <h2>Crear cuenta bancaria</h2>
                    <p class="mb-2">Únete a Banco Acme y gestiona tus finanzas.</p>
                </div>
                <div class="card max-w-lg" id="tarjeta-registro" style="max-width: 800px; margin: 0 auto;">
                    <div id="error-registro" class="alert alert-danger hidden"></div>
                    <form id="formulario-registro">
                        <div class="grid-2-col">
                            <div class="form-group">
                                <label>Tipo de identificación</label>
                                <select id="reg-tipo-identificacion" required>
                                    <option value="CC">Cédula de ciudadanía</option>
                                    <option value="CE">Cédula de extranjería</option>
                                    <option value="PA">Pasaporte</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Número de identificación</label>
                                <input type="text" id="reg-numero-identificacion" required inputmode="numeric" maxlength="11" pattern="[0-9]{2,11}" title="Debe contener entre 2 y 11 números">
                            </div>
                            <div class="form-group">
                                <label>Nombres</label>
                                <input type="text" id="reg-nombres" required>
                            </div>
                            <div class="form-group">
                                <label>Apellidos</label>
                                <input type="text" id="reg-apellidos" required>
                            </div>
                            <div class="form-group">
                                <label>Género</label>
                                <select id="reg-genero" required>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                    <option value="O">Otro</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Teléfono</label>
                                <input type="tel" id="reg-telefono" required pattern="[0-9]{7,10}" title="Un teléfono de 7 a 10 dígitos">
                            </div>
                            <div class="form-group">
                                <label>Correo electrónico</label>
                                <input type="email" id="reg-correo" required>
                            </div>
                            <div class="form-group">
                                <label>Ciudad de residencia</label>
                                <input type="text" id="reg-ciudad" required>
                            </div>
                            <div class="form-group">
                                <label>Dirección</label>
                                <input type="text" id="reg-direccion" required>
                            </div>
                            <div class="form-group">
                                <label>Contraseña</label>
                                <input type="password" id="reg-contrasena" required minlength="6" title="La contraseña debe tener al menos 6 caracteres">
                            </div>
                        </div>
                        <div class="grid-2-col mt-4">
                            <button type="submit" class="btn btn-primary">Registrarse</button>
                            <a href="#login" class="btn btn-secondary text-center" style="display: flex; justify-content: center; align-items: center;">Cancelar</a>
                        </div>
                    </form>
                </div>

                <div class="card hidden text-center" id="registro-exitoso" style="max-width: 600px; margin: 0 auto;">
                    <h3 style="color: var(--success-color);">Registro exitoso</h3>
                    <p>Bienvenido a Banco Acme. Se ha creado su cuenta bancaria oportunamente.</p>
                    <div class="mt-3 mb-3 p-3" style="background: var(--secondary-color); border-radius: 8px; border: 1px solid var(--border-color);">
                        <strong style="font-size: 1.1rem;">Número de cuenta:</strong> <span id="numero-cuenta-exito" style="font-size: 1.2rem; font-weight: bold; color: var(--primary-color);"></span><br>
                        <strong>Fecha de creación:</strong> <span id="fecha-creacion-exito"></span>
                    </div>
                    <a href="#login" class="btn btn-primary">Ir al inicio de sesión</a>
                </div>
            </div>
        `;
    }

    addEventListeners() {
        const formulario = this.querySelector('#formulario-registro');
        const contenedorError = this.querySelector('#error-registro');
        const campoNumeroIdentificacion = this.querySelector('#reg-numero-identificacion');

        campoNumeroIdentificacion.addEventListener('input', () => {
            campoNumeroIdentificacion.value = campoNumeroIdentificacion.value.replace(/\D/g, '').slice(0, 11);
        });

        formulario.addEventListener('submit', (evento) => {
            evento.preventDefault();
            contenedorError.classList.add('hidden');

            const numeroIdLimpio = campoNumeroIdentificacion.value.replace(/\D/g, '').slice(0, 11);
            campoNumeroIdentificacion.value = numeroIdLimpio;

            if (!/^\d{2,11}$/.test(numeroIdLimpio)) {
                contenedorError.textContent = 'El número de identificación debe tener entre 2 y 11 dígitos.';
                contenedorError.classList.remove('hidden');
                return;
            }

            const usuario = {
                tipoId: this.querySelector('#reg-tipo-identificacion').value,
                numeroId: numeroIdLimpio,
                nombres: this.querySelector('#reg-nombres').value,
                apellidos: this.querySelector('#reg-apellidos').value,
                genero: this.querySelector('#reg-genero').value,
                telefono: this.querySelector('#reg-telefono').value,
                correo: this.querySelector('#reg-correo').value,
                ciudad: this.querySelector('#reg-ciudad').value,
                direccion: this.querySelector('#reg-direccion').value,
                contrasena: this.querySelector('#reg-contrasena').value
            };

            try {
                window.db.crearUsuario(usuario);
                const nuevaCuenta = window.db.obtenerCuentaPorUsuario(usuario.numeroId);

                this.querySelector('#tarjeta-registro').classList.add('hidden');
                this.querySelector('#numero-cuenta-exito').textContent = nuevaCuenta.numeroCuenta;
                this.querySelector('#fecha-creacion-exito').textContent = new Date(nuevaCuenta.fechaCreacion).toLocaleDateString();
                this.querySelector('#registro-exitoso').classList.remove('hidden');
            } catch (error) {
                contenedorError.textContent = error.message;
                contenedorError.classList.remove('hidden');
            }
        });
    }
}

customElements.define('acme-register', AcmeRegister);
