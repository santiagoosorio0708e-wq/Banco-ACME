class ServicioAutenticacion {
    iniciarSesion(tipoId, numeroId, contrasena) {
        const numeroIdLimpio = String(numeroId ?? '').trim();

        if (!/^\d{2,11}$/.test(numeroIdLimpio)) {
            return { exito: false, mensaje: 'El número de identificación debe tener entre 2 y 11 dígitos.' };
        }

        const usuario = window.db.obtenerUsuario(tipoId, numeroIdLimpio);
        if (!usuario || usuario.contrasena !== contrasena) {
            return { exito: false, mensaje: 'No se pudo validar su identidad. Credenciales incorrectas.' };
        }

        sessionStorage.setItem(
            'acmeSession',
            JSON.stringify({
                tipoId: usuario.tipoId,
                numeroId: usuario.numeroId,
                fechaHora: new Date().toISOString()
            })
        );

        document.dispatchEvent(new CustomEvent('autenticacion-cambiada'));
        return { exito: true };
    }

    cerrarSesion() {
        sessionStorage.removeItem('acmeSession');
        window.location.hash = '';
        document.dispatchEvent(new CustomEvent('autenticacion-cambiada'));
    }

    obtenerUsuarioActual() {
        const sesion = sessionStorage.getItem('acmeSession');
        if (!sesion) {
            return null;
        }

        const sesionParseada = JSON.parse(sesion);
        return window.db.obtenerUsuario(sesionParseada.tipoId, sesionParseada.numeroId);
    }
}

window.auth = new ServicioAutenticacion();
