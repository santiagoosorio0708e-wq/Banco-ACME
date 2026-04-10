class AuthService {
    login(idType, idNumber, password) {
        const cleanedIdNumber = String(idNumber ?? '').trim();

        if (!/^\d{2,11}$/.test(cleanedIdNumber)) {
            return { success: false, message: "El número de identificación debe tener entre 2 y 11 dígitos." };
        }

        const user = window.db.getUser(idType, cleanedIdNumber);
        if(!user || user.password !== password) {
            return { success: false, message: "No se pudo validar su identidad. Credenciales incorrectas." };
        }
        
        sessionStorage.setItem('acmeSession', JSON.stringify({
            idType: user.idType,
            idNumber: user.idNumber,
            timestamp: new Date().toISOString()
        }));

        document.dispatchEvent(new CustomEvent('auth-changed'));
        return { success: true };
    }

    logout() {
        sessionStorage.removeItem('acmeSession');
        window.location.hash = ''; // Limpiar ruta hash
        document.dispatchEvent(new CustomEvent('auth-changed'));
    }

    getCurrentUser() {
        const session = sessionStorage.getItem('acmeSession');
        if(!session) return null;
        const parsed = JSON.parse(session);
        return window.db.getUser(parsed.idType, parsed.idNumber);
    }
}

window.auth = new AuthService();
