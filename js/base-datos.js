class BaseDatos {
    constructor() {
        this.inicializar();
    }

    inicializar() {
        if (!localStorage.getItem('acmeUsers')) {
            localStorage.setItem('acmeUsers', JSON.stringify([]));
        }
        if (!localStorage.getItem('acmeAccounts')) {
            localStorage.setItem('acmeAccounts', JSON.stringify([]));
        }
        if (!localStorage.getItem('acmeTransactions')) {
            localStorage.setItem('acmeTransactions', JSON.stringify([]));
        }
    }

    obtenerUsuarios() {
        return JSON.parse(localStorage.getItem('acmeUsers'));
    }

    obtenerUsuario(tipoId, numeroId) {
        const usuarios = this.obtenerUsuarios();
        return usuarios.find((usuario) => usuario.tipoId === tipoId && usuario.numeroId === numeroId);
    }

    crearUsuario(usuario) {
        const usuarios = this.obtenerUsuarios();
        const numeroIdLimpio = String(usuario.numeroId ?? '').trim();

        if (!/^\d{2,11}$/.test(numeroIdLimpio)) {
            throw new Error('El número de identificación debe tener entre 2 y 11 dígitos.');
        }

        const yaExiste = usuarios.find(
            (usuarioActual) => usuarioActual.tipoId === usuario.tipoId && usuarioActual.numeroId === numeroIdLimpio
        );

        if (yaExiste) {
            throw new Error('El usuario ya se encuentra registrado con este documento.');
        }

        usuario.numeroId = numeroIdLimpio;
        usuarios.push(usuario);
        localStorage.setItem('acmeUsers', JSON.stringify(usuarios));

        this.crearCuenta(numeroIdLimpio);
        return true;
    }

    actualizarUsuario(usuarioActualizado) {
        const usuarios = this.obtenerUsuarios();
        const indice = usuarios.findIndex(
            (usuario) => usuario.tipoId === usuarioActualizado.tipoId && usuario.numeroId === usuarioActualizado.numeroId
        );

        if (indice !== -1) {
            usuarios[indice] = usuarioActualizado;
            localStorage.setItem('acmeUsers', JSON.stringify(usuarios));
            return true;
        }

        return false;
    }

    obtenerCuentas() {
        return JSON.parse(localStorage.getItem('acmeAccounts'));
    }

    obtenerCuentaPorUsuario(numeroIdUsuario) {
        const cuentas = this.obtenerCuentas();
        return cuentas.find((cuenta) => cuenta.usuarioId === numeroIdUsuario);
    }

    obtenerCuentaPorNumero(numeroCuenta) {
        const cuentas = this.obtenerCuentas();
        return cuentas.find((cuenta) => cuenta.numeroCuenta === numeroCuenta);
    }

    crearCuenta(numeroIdUsuario) {
        const cuentas = this.obtenerCuentas();
        const numeroCuenta = Math.floor(1000000000 + Math.random() * 9000000000).toString();

        const nuevaCuenta = {
            numeroCuenta,
            usuarioId: numeroIdUsuario,
            saldo: 0.0,
            fechaCreacion: new Date().toISOString()
        };

        cuentas.push(nuevaCuenta);
        localStorage.setItem('acmeAccounts', JSON.stringify(cuentas));
        return nuevaCuenta;
    }

    actualizarSaldo(numeroCuenta, monto, esConsignacion) {
        const cuentas = this.obtenerCuentas();
        const indiceCuenta = cuentas.findIndex((cuenta) => cuenta.numeroCuenta === numeroCuenta);

        if (indiceCuenta === -1) {
            throw new Error('Cuenta no encontrada');
        }

        if (esConsignacion) {
            cuentas[indiceCuenta].saldo += Number(monto);
        } else {
            if (cuentas[indiceCuenta].saldo < monto) {
                throw new Error('Fondos insuficientes');
            }
            cuentas[indiceCuenta].saldo -= Number(monto);
        }

        localStorage.setItem('acmeAccounts', JSON.stringify(cuentas));
        return cuentas[indiceCuenta].saldo;
    }

    obtenerTransaccionesPorCuenta(numeroCuenta) {
        const transacciones = JSON.parse(localStorage.getItem('acmeTransactions'));
        return transacciones
            .filter((transaccion) => transaccion.numeroCuenta === numeroCuenta)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    crearTransaccion(transaccion) {
        const transacciones = JSON.parse(localStorage.getItem('acmeTransactions'));
        const nuevaTransaccion = {
            ...transaccion,
            referencia: `REF${Math.floor(100000 + Math.random() * 900000).toString()}`,
            fecha: new Date().toISOString()
        };

        transacciones.push(nuevaTransaccion);
        localStorage.setItem('acmeTransactions', JSON.stringify(transacciones));
        return nuevaTransaccion;
    }

    migrarDatos() {
        const usuarios = this.obtenerUsuarios().map((usuario) => ({
            ...usuario,
            tipoId: usuario.tipoId ?? usuario.idType,
            numeroId: usuario.numeroId ?? usuario.idNumber,
            nombres: usuario.nombres ?? usuario.firstName,
            apellidos: usuario.apellidos ?? usuario.lastName,
            genero: usuario.genero ?? usuario.gender,
            telefono: usuario.telefono ?? usuario.phone,
            correo: usuario.correo ?? usuario.email,
            ciudad: usuario.ciudad ?? usuario.city,
            direccion: usuario.direccion ?? usuario.address,
            contrasena: usuario.contrasena ?? usuario.password
        }));

        const cuentas = this.obtenerCuentas().map((cuenta) => ({
            ...cuenta,
            numeroCuenta: cuenta.numeroCuenta ?? cuenta.accountNumber,
            usuarioId: cuenta.usuarioId ?? cuenta.userId,
            saldo: cuenta.saldo ?? cuenta.balance ?? 0,
            fechaCreacion: cuenta.fechaCreacion ?? cuenta.createdAt
        }));

        const transacciones = JSON.parse(localStorage.getItem('acmeTransactions')).map((transaccion) => ({
            ...transaccion,
            numeroCuenta: transaccion.numeroCuenta ?? transaccion.accountNumber,
            referencia: transaccion.referencia ?? transaccion.reference,
            fecha: transaccion.fecha ?? transaccion.date,
            concepto: transaccion.concepto ?? transaccion.concept,
            referenciaServicio: transaccion.referenciaServicio ?? transaccion.serviceReference
        }));

        localStorage.setItem('acmeUsers', JSON.stringify(usuarios));
        localStorage.setItem('acmeAccounts', JSON.stringify(cuentas));
        localStorage.setItem('acmeTransactions', JSON.stringify(transacciones));
    }
}

window.db = new BaseDatos();
window.db.migrarDatos();
