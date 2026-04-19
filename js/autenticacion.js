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

        if (usuario.rol === 'ADMIN') {
            sessionStorage.setItem('acmeSession', JSON.stringify({ tipoId: usuario.tipoId, numeroId: usuario.numeroId }));
            document.dispatchEvent(new CustomEvent('autenticacion-cambiada'));
            return { exito: true, isAdmin: true };
        }

        // Return success but don't log in yet. Save pending user in sessionStorage
        sessionStorage.setItem('acmePendingAuth', JSON.stringify({ tipoId: usuario.tipoId, numeroId: usuario.numeroId }));
        return { exito: true, isAdmin: false };
    }

    validarMFA(codigo) {
        const pending = JSON.parse(sessionStorage.getItem('acmePendingAuth'));
        if (!pending) return { exito: false, mensaje: 'No hay sesión pendiente.' };
        
        // En un caso real se validaría un código SMS/Email. Aquí simulamos '123456' como comodín para desarrollo
        // o generamos uno asociado a los primeros 6 digitos de su cedula
        const codigoValido = pending.numeroId.substring(0, 6).padStart(6, '1');
        
        if (codigo === codigoValido || codigo === '123456') {
            sessionStorage.removeItem('acmePendingAuth');
            sessionStorage.setItem(
                'acmeSession',
                JSON.stringify({
                    tipoId: pending.tipoId,
                    numeroId: pending.numeroId,
                    fechaHora: new Date().toISOString()
                })
            );
            document.dispatchEvent(new CustomEvent('autenticacion-cambiada'));
            return { exito: true };
        }
        return { exito: false, mensaje: 'Código de verificación incorrecto.' };
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

    obtenerClaveDinamicaActual() {
        const user = this.obtenerUsuarioActual();
        if(!user) return '000000';
        const timePart = Math.floor(Date.now() / 60000); 
        let hash = 0;
        const str = user.numeroId + timePart.toString();
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0; 
        }
        hash = Math.abs(hash);
        return (hash % 1000000).toString().padStart(6, '0');
    }

    validarClaveDinamica(clave) {
        return clave === this.obtenerClaveDinamicaActual() || clave === '123456'; // 123456 es de rescate
    }
}

window.auth = new ServicioAutenticacion();
