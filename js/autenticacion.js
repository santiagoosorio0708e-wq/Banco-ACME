import { db } from './base-datos.js';

class ServicioAutenticacion {
    iniciarSesion(tipoId, numeroId, contrasena) {
        const usuario = this.obtenerUsuarioPrueba();
        sessionStorage.setItem('acmeSession', JSON.stringify({
            tipoId: usuario.tipoId,
            numeroId: usuario.numeroId,
            fechaHora: new Date().toISOString()
        }));
        document.dispatchEvent(new CustomEvent('autenticacion-cambiada'));
        return { exito: true, isAdmin: true };
    }

    cerrarSesion() {
        // En modelo de prueba siempre mantenemos la sesión abierta como usuario de demostración
        this.obtenerUsuarioPrueba();
        document.dispatchEvent(new CustomEvent('autenticacion-cambiada'));
    }

    obtenerUsuarioPrueba() {
        const usuarios = db.obtenerUsuarios();
        let usuario = usuarios.find(u => u.numeroId === '12345678') || usuarios[0];
        if (!usuario) {
            usuario = {
                tipoId: 'CC',
                numeroId: '12345678',
                nombres: 'Carlos',
                apellidos: 'Pérez (Demo)',
                genero: 'M',
                telefono: '3001234567',
                correo: 'carlos.perez@acme.com',
                ciudad: 'Bogotá',
                direccion: 'Calle 100 # 15-20',
                contrasena: 'demo',
                rol: 'ADMIN'
            };
        }
        sessionStorage.setItem('acmeSession', JSON.stringify({
            tipoId: usuario.tipoId,
            numeroId: usuario.numeroId,
            fechaHora: new Date().toISOString()
        }));
        return usuario;
    }

    obtenerUsuarioActual() {
        try {
            const sesion = sessionStorage.getItem('acmeSession');
            if (sesion) {
                const sesionParseada = JSON.parse(sesion);
                const usuario = db.obtenerUsuario(sesionParseada.tipoId, sesionParseada.numeroId);
                if (usuario) return usuario;
            }
            return this.obtenerUsuarioPrueba();
        } catch (e) {
            return this.obtenerUsuarioPrueba();
        }
    }

    obtenerClaveDinamicaActual() {
        const user = this.obtenerUsuarioActual();
        if (!user) return '123456';
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
        // En modelo de prueba acepta la clave dinámica, clave de rescate o cualquier entrada
        return true;
    }
}

export const auth = new ServicioAutenticacion();
window.auth = auth;
