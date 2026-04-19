/**
 * acme-perfil.js
 * Componente Web: Perfil del usuario
 * Permite ver y editar los datos personales del titular de la cuenta.
 */
class AcmePerfil extends HTMLElement {
    connectedCallback() {
        this.usuario = window.auth.obtenerUsuarioActual();
        this.modoEdicion = false;
        this.render();
        this.addEventListeners();
    }

    render() {
        const u = this.usuario;
        const avatarLetras = `${(u.nombres || '?')[0]}${(u.apellidos || '?')[0]}`.toUpperCase();

        this.innerHTML = `
            <div class="perfil-contenedor">
                <style>
                    .perfil-contenedor { max-width: 820px; margin: 0 auto; }
                    .perfil-cabecera {
                        background: linear-gradient(135deg, var(--primary-color) 0%, #1a5fd1 100%);
                        border-radius: 16px;
                        padding: 2.5rem 2rem;
                        display: flex;
                        align-items: center;
                        gap: 1.5rem;
                        margin-bottom: 1.5rem;
                        flex-wrap: wrap;
                    }
                    .perfil-avatar {
                        width: 80px; height: 80px;
                        border-radius: 50%;
                        background: rgba(255,255,255,0.2);
                        border: 3px solid rgba(255,255,255,0.5);
                        display: flex; align-items: center; justify-content: center;
                        font-size: 2rem; font-weight: 700; color: white;
                        flex-shrink: 0;
                    }
                    .perfil-cabecera-info h2 { color: white; margin: 0; font-size: 1.5rem; }
                    .perfil-cabecera-info p { color: rgba(255,255,255,0.8); margin: 0.2rem 0 0; font-size: 0.9rem; }
                    .perfil-badge {
                        margin-left: auto;
                        background: rgba(255,255,255,0.15);
                        color: white;
                        padding: 0.4rem 1rem;
                        border-radius: 20px;
                        font-size: 0.85rem;
                        font-weight: 600;
                    }
                    .perfil-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 1.25rem;
                    }
                    @media (max-width: 600px) {
                        .perfil-grid { grid-template-columns: 1fr; }
                        .perfil-cabecera { flex-direction: column; text-align: center; }
                        .perfil-badge { margin: 0 auto; }
                    }
                    .perfil-campo {
                        background: var(--secondary-color);
                        border-radius: 10px;
                        padding: 1rem 1.25rem;
                    }
                    .perfil-campo label { font-size: 0.78rem; color: var(--text-light); margin-bottom: 0.25rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
                    .perfil-campo p { margin: 0; font-size: 1rem; font-weight: 500; color: var(--text-dark); }
                    .perfil-campo input, .perfil-campo select {
                        margin: 0; background: white;
                    }
                    .perfil-acciones { display: flex; gap: 1rem; margin-top: 1.5rem; }
                    .perfil-acciones .btn { width: auto; padding: 0.7rem 2rem; }
                </style>

                <div class="perfil-cabecera">
                    <div class="perfil-avatar">${avatarLetras}</div>
                    <div class="perfil-cabecera-info">
                        <h2>${u.nombres} ${u.apellidos}</h2>
                        <p>${u.tipoId}: ${u.numeroId} &bull; ${u.correo}</p>
                    </div>
                    <span class="perfil-badge">Cliente activo</span>
                </div>

                <div class="card">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:0.5rem;">
                        <h3 style="margin:0;">Datos personales</h3>
                        <button id="btn-toggle-edicion" class="btn btn-outline" style="width:auto;padding:0.5rem 1.25rem;">
                            ${this.modoEdicion ? 'Cancelar' : 'Editar datos'}
                        </button>
                    </div>

                    <div id="alerta-perfil" class="alert hidden"></div>

                    <form id="formulario-perfil">
                        <div class="perfil-grid">
                            <div class="perfil-campo">
                                <label>Nombres</label>
                                ${this.modoEdicion
                                    ? `<input type="text" id="pf-nombres" value="${u.nombres}" required>`
                                    : `<p>${u.nombres}</p>`}
                            </div>
                            <div class="perfil-campo">
                                <label>Apellidos</label>
                                ${this.modoEdicion
                                    ? `<input type="text" id="pf-apellidos" value="${u.apellidos}" required>`
                                    : `<p>${u.apellidos}</p>`}
                            </div>
                            <div class="perfil-campo">
                                <label>Tipo de identificación</label>
                                <p>${u.tipoId}</p>
                            </div>
                            <div class="perfil-campo">
                                <label>Número de identificación</label>
                                <p>${u.numeroId}</p>
                            </div>
                            <div class="perfil-campo">
                                <label>Correo electrónico</label>
                                ${this.modoEdicion
                                    ? `<input type="email" id="pf-correo" value="${u.correo}" required>`
                                    : `<p>${u.correo}</p>`}
                            </div>
                            <div class="perfil-campo">
                                <label>Teléfono</label>
                                ${this.modoEdicion
                                    ? `<input type="tel" id="pf-telefono" value="${u.telefono}" maxlength="10">`
                                    : `<p>${u.telefono || 'No registrado'}</p>`}
                            </div>
                            <div class="perfil-campo">
                                <label>Ciudad</label>
                                ${this.modoEdicion
                                    ? `<input type="text" id="pf-ciudad" value="${u.ciudad || ''}">`
                                    : `<p>${u.ciudad || 'No registrada'}</p>`}
                            </div>
                            <div class="perfil-campo">
                                <label>Dirección</label>
                                ${this.modoEdicion
                                    ? `<input type="text" id="pf-direccion" value="${u.direccion || ''}">`
                                    : `<p>${u.direccion || 'No registrada'}</p>`}
                            </div>
                            <div class="perfil-campo" style="grid-column: 1 / -1;">
                                <label>Género</label>
                                ${this.modoEdicion
                                    ? `<select id="pf-genero">
                                            <option value="Masculino" ${u.genero === 'Masculino' ? 'selected' : ''}>Masculino</option>
                                            <option value="Femenino" ${u.genero === 'Femenino' ? 'selected' : ''}>Femenino</option>
                                            <option value="Otro" ${u.genero === 'Otro' ? 'selected' : ''}>Otro</option>
                                            <option value="Prefiero no indicar" ${u.genero === 'Prefiero no indicar' ? 'selected' : ''}>Prefiero no indicar</option>
                                       </select>`
                                    : `<p>${u.genero || 'No especificado'}</p>`}
                            </div>
                        </div>

                        ${this.modoEdicion ? `
                            <hr style="margin:1.5rem 0;border:none;border-top:1px solid var(--border-color);">
                            <h4 style="margin-bottom:1rem;">Cambiar contraseña (opcional)</h4>
                            <div class="perfil-grid">
                                <div class="perfil-campo">
                                    <label>Contraseña actual</label>
                                    <input type="password" id="pf-contrasena-actual" placeholder="Dejar en blanco si no desea cambiarla">
                                </div>
                                <div class="perfil-campo">
                                    <label>Nueva contraseña</label>
                                    <input type="password" id="pf-contrasena-nueva" placeholder="Mínimo 6 caracteres">
                                </div>
                            </div>
                            <div class="perfil-acciones">
                                <button type="submit" class="btn btn-primary">Guardar cambios</button>
                                <button type="button" id="btn-cancelar" class="btn btn-secondary">Cancelar</button>
                            </div>
                        ` : ''}
                    </form>
                </div>
            </div>
        `;
        this.addEventListeners();
    }

    addEventListeners() {
        const btnToggle = this.querySelector('#btn-toggle-edicion');
        if (btnToggle) {
            btnToggle.addEventListener('click', () => {
                this.modoEdicion = !this.modoEdicion;
                this.render();
            });
        }

        const btnCancelar = this.querySelector('#btn-cancelar');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => {
                this.modoEdicion = false;
                this.render();
            });
        }

        const formulario = this.querySelector('#formulario-perfil');
        if (formulario && this.modoEdicion) {
            formulario.addEventListener('submit', (e) => {
                e.preventDefault();
                this.guardarCambios();
            });
        }
    }

    guardarCambios() {
        const alerta = this.querySelector('#alerta-perfil');
        const contrasenaActual = this.querySelector('#pf-contrasena-actual').value;
        const contrasenaNueva = this.querySelector('#pf-contrasena-nueva').value;

        if (contrasenaActual && contrasenaActual !== this.usuario.contrasena) {
            this.mostrarAlerta(alerta, 'La contraseña actual no es correcta.', 'danger');
            return;
        }

        if (contrasenaActual && contrasenaNueva.length < 6) {
            this.mostrarAlerta(alerta, 'La nueva contraseña debe tener al menos 6 caracteres.', 'danger');
            return;
        }

        const usuarioActualizado = {
            ...this.usuario,
            nombres: this.querySelector('#pf-nombres').value.trim(),
            apellidos: this.querySelector('#pf-apellidos').value.trim(),
            correo: this.querySelector('#pf-correo').value.trim(),
            telefono: this.querySelector('#pf-telefono').value.trim(),
            ciudad: this.querySelector('#pf-ciudad').value.trim(),
            direccion: this.querySelector('#pf-direccion').value.trim(),
            genero: this.querySelector('#pf-genero').value,
            contrasena: contrasenaActual && contrasenaNueva ? contrasenaNueva : this.usuario.contrasena
        };

        window.db.actualizarUsuario(usuarioActualizado);
        this.usuario = usuarioActualizado;

        // Actualizar sesión
        sessionStorage.setItem('acmeSession', JSON.stringify({
            tipoId: usuarioActualizado.tipoId,
            numeroId: usuarioActualizado.numeroId,
            fechaHora: new Date().toISOString()
        }));

        this.modoEdicion = false;
        this.render();
        const alertaExito = this.querySelector('#alerta-perfil');
        this.mostrarAlerta(alertaExito, 'Datos actualizados correctamente.', 'success');
    }

    mostrarAlerta(elemento, mensaje, tipo) {
        elemento.textContent = mensaje;
        elemento.className = `alert alert-${tipo}`;
        elemento.classList.remove('hidden');
    }
}

customElements.define('acme-perfil', AcmePerfil);
