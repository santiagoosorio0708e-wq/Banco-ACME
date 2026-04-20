/**
 * js/base-datos.js
 * Capa de persistencia del portal — utiliza localStorage como base de datos.
 * Incluye usuarios, cuentas, transacciones, préstamos, PQRs, presupuesto y notificaciones.
 */
class BaseDatos {
    constructor() {
        this.inicializar();
    }

    /* ─────────────────────────────────────────
       INICIALIZACIÓN
    ───────────────────────────────────────── */
    inicializar() {
        const colecciones = [
            'acmeUsers', 'acmeAccounts', 'acmeTransactions',
            'acmePrestamos', 'acmePQRs', 'acmePresupuestos', 'acmeNotificaciones'
        ];
        colecciones.forEach(col => {
            if (!localStorage.getItem(col)) {
                localStorage.setItem(col, JSON.stringify([]));
            }
        });
        
        const usuarios = JSON.parse(localStorage.getItem('acmeUsers'));
        if (!usuarios.find(u => u.numeroId === '000000')) {
            usuarios.push({
                tipoId: 'CC', numeroId: '000000', nombres: 'Administrador', apellidos: 'Sistema',
                genero: 'O', telefono: '0000000', correo: 'admin@acme.com', ciudad: 'Sede Central',
                direccion: 'N/A', contrasena: 'admin123', rol: 'ADMIN'
            });
            localStorage.setItem('acmeUsers', JSON.stringify(usuarios));
        }

        this.migrarTarjetasVirtuales();
    }

    /* ─────────────────────────────────────────
       USUARIOS
    ───────────────────────────────────────── */
    obtenerUsuarios() {
        return JSON.parse(localStorage.getItem('acmeUsers')) || [];
    }

    obtenerUsuario(tipoId, numeroId) {
        return this.obtenerUsuarios().find(u => u.tipoId === tipoId && u.numeroId === numeroId) || null;
    }

    crearUsuario(usuario) {
        const usuarios = this.obtenerUsuarios();
        const numeroIdLimpio = String(usuario.numeroId ?? '').trim();

        if (!/^\d{2,11}$/.test(numeroIdLimpio)) {
            throw new Error('El número de identificación debe tener entre 2 y 11 dígitos.');
        }

        const yaExiste = usuarios.find(u => u.tipoId === usuario.tipoId && u.numeroId === numeroIdLimpio);
        if (yaExiste) throw new Error('El usuario ya se encuentra registrado con este documento.');

        usuario.numeroId = numeroIdLimpio;
        usuarios.push(usuario);
        localStorage.setItem('acmeUsers', JSON.stringify(usuarios));
        this.crearCuenta(numeroIdLimpio);
        return true;
    }

    actualizarUsuario(usuarioActualizado) {
        const usuarios = this.obtenerUsuarios();
        const idx = usuarios.findIndex(u =>
            u.tipoId === usuarioActualizado.tipoId && u.numeroId === usuarioActualizado.numeroId
        );
        if (idx !== -1) {
            usuarios[idx] = usuarioActualizado;
            localStorage.setItem('acmeUsers', JSON.stringify(usuarios));
            return true;
        }
        return false;
    }

    /* ─────────────────────────────────────────
       CUENTAS
    ───────────────────────────────────────── */
    obtenerCuentas() {
        return JSON.parse(localStorage.getItem('acmeAccounts')) || [];
    }

    obtenerCuentaPorUsuario(numeroIdUsuario) {
        return this.obtenerCuentas().find(c => c.usuarioId === numeroIdUsuario) || null;
    }

    obtenerCuentaPorNumero(numeroCuenta) {
        return this.obtenerCuentas().find(c => c.numeroCuenta === numeroCuenta) || null;
    }

    generarNumeroTarjetaUnico() {
        const cuentas = this.obtenerCuentas();
        const existentes = new Set(
            cuentas
                .map(c => String(c.numeroTarjetaVirtual ?? '').replace(/\D/g, ''))
                .filter(numero => /^\d{16}$/.test(numero))
        );

        let numeroTarjeta;
        do {
            numeroTarjeta = `4${Math.floor(Math.random() * 1e15).toString().padStart(15, '0')}`;
        } while (existentes.has(numeroTarjeta));

        return numeroTarjeta;
    }

    migrarTarjetasVirtuales() {
        const cuentas = this.obtenerCuentas();
        const existentes = new Set(
            cuentas
                .map(c => String(c.numeroTarjetaVirtual ?? '').replace(/\D/g, ''))
                .filter(numero => /^\d{16}$/.test(numero))
        );
        let huboCambios = false;

        cuentas.forEach(cuenta => {
            const numeroActual = String(cuenta.numeroTarjetaVirtual ?? '').replace(/\D/g, '');
            if (!/^\d{16}$/.test(numeroActual)) {
                let nuevoNumero;
                do {
                    nuevoNumero = `4${Math.floor(Math.random() * 1e15).toString().padStart(15, '0')}`;
                } while (existentes.has(nuevoNumero));

                cuenta.numeroTarjetaVirtual = nuevoNumero;
                existentes.add(nuevoNumero);
                huboCambios = true;
            }
        });

        if (huboCambios) {
            localStorage.setItem('acmeAccounts', JSON.stringify(cuentas));
        }
    }

    crearCuenta(numeroIdUsuario) {
        const cuentas = this.obtenerCuentas();
        const numeroCuenta = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        const nuevaCuenta = {
            numeroCuenta,
            usuarioId: numeroIdUsuario,
            saldo: 0.0,
            fechaCreacion: new Date().toISOString(),
            tarjetaBloqueada: false,
            numeroTarjetaVirtual: this.generarNumeroTarjetaUnico()
        };
        cuentas.push(nuevaCuenta);
        localStorage.setItem('acmeAccounts', JSON.stringify(cuentas));
        return nuevaCuenta;
    }

    actualizarSaldo(numeroCuenta, monto, esConsignacion) {
        const cuentas = this.obtenerCuentas();
        const idx = cuentas.findIndex(c => c.numeroCuenta === numeroCuenta);
        if (idx === -1) throw new Error('Cuenta no encontrada.');

        if (esConsignacion) {
            cuentas[idx].saldo += Number(monto);
        } else {
            if (cuentas[idx].saldo < monto) throw new Error('Fondos insuficientes.');
            cuentas[idx].saldo -= Number(monto);
        }
        localStorage.setItem('acmeAccounts', JSON.stringify(cuentas));
        return cuentas[idx].saldo;
    }

    actualizarEstadoTarjeta(numeroCuenta, tarjetaBloqueada) {
        const cuentas = this.obtenerCuentas();
        const idx = cuentas.findIndex(c => c.numeroCuenta === numeroCuenta);
        if (idx === -1) throw new Error('Cuenta no encontrada.');

        cuentas[idx].tarjetaBloqueada = Boolean(tarjetaBloqueada);
        localStorage.setItem('acmeAccounts', JSON.stringify(cuentas));
        return cuentas[idx];
    }

    /* ─────────────────────────────────────────
       TRANSACCIONES
    ───────────────────────────────────────── */
    obtenerTransaccionesPorCuenta(numeroCuenta) {
        const txs = JSON.parse(localStorage.getItem('acmeTransactions')) || [];
        return txs
            .filter(t => t.numeroCuenta === numeroCuenta)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    crearTransaccion(transaccion) {
        const txs = JSON.parse(localStorage.getItem('acmeTransactions')) || [];
        const nueva = {
            ...transaccion,
            referencia: `REF${Math.floor(100000 + Math.random() * 900000)}`,
            fecha: new Date().toISOString()
        };
        txs.push(nueva);
        localStorage.setItem('acmeTransactions', JSON.stringify(txs));
        return nueva;
    }

    /* ─────────────────────────────────────────
       PRÉSTAMOS / CRÉDITOS
    ───────────────────────────────────────── */
    obtenerPrestamos() {
        return JSON.parse(localStorage.getItem('acmePrestamos')) || [];
    }

    obtenerTodosLosPrestamos() {
        return this.obtenerPrestamos().sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    obtenerPrestamosPorUsuario(numeroIdUsuario) {
        return this.obtenerPrestamos()
            .filter(p => p.usuarioId === numeroIdUsuario)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    crearPrestamo(prestamo) {
        const prestamos = this.obtenerPrestamos();
        const nuevo = {
            ...prestamo,
            radicado: `CRED-${Math.floor(100000 + Math.random() * 900000)}`,
            fecha: new Date().toISOString(),
            estado: prestamo.estado || 'Pendiente'
        };
        prestamos.push(nuevo);
        localStorage.setItem('acmePrestamos', JSON.stringify(prestamos));

        // Notificar al usuario
        this._agregarNotificacionSistema(prestamo.usuarioId, {
            id: `prestamo-${nuevo.radicado}`,
            tipo: 'sistema',
            titulo: 'Solicitud de crédito recibida',
            mensaje: `Tu solicitud de ${nuevo.tipoPrestamo} por $${Number(nuevo.monto).toLocaleString('es-CO')} fue radicada con el # ${nuevo.radicado}.`,
            icono: '',
            color: '#d1ecf1'
        });

        return nuevo;
    }

    actualizarEstadoPrestamo(radicado, nuevoEstado) {
        const prestamos = this.obtenerPrestamos();
        const idx = prestamos.findIndex(p => p.radicado === radicado);
        if (idx !== -1) {
            prestamos[idx].estado = nuevoEstado;
            localStorage.setItem('acmePrestamos', JSON.stringify(prestamos));
            return true;
        }
        return false;
    }

    /* ─────────────────────────────────────────
       PQR — Peticiones, Quejas y Reclamos
    ───────────────────────────────────────── */
    obtenerPQRs() {
        return JSON.parse(localStorage.getItem('acmePQRs')) || [];
    }

    obtenerTodosLosPQRs() {
        return this.obtenerPQRs().sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    obtenerPQRsPorUsuario(numeroIdUsuario) {
        return this.obtenerPQRs()
            .filter(p => p.usuarioId === numeroIdUsuario)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    crearPQR(pqr) {
        const pqrs = this.obtenerPQRs();
        const nuevo = {
            ...pqr,
            radicado: `PQR-${Math.floor(100000 + Math.random() * 900000)}`,
            fecha: new Date().toISOString(),
            estado: pqr.estado || 'Abierto',
            respuesta: pqr.respuesta || null
        };
        pqrs.push(nuevo);
        localStorage.setItem('acmePQRs', JSON.stringify(pqrs));

        this._agregarNotificacionSistema(pqr.usuarioId, {
            id: `pqr-${nuevo.radicado}`,
            tipo: 'sistema',
            titulo: 'Solicitud PQR radicada',
            mensaje: `Tu ${nuevo.tipo.toLowerCase()} sobre "${nuevo.asunto}" fue radicada con el # ${nuevo.radicado}.`,
            icono: '',
            color: '#cce5ff'
        });

        return nuevo;
    }

    responderPQR(radicado, respuestaTxt) {
        const pqrs = this.obtenerPQRs();
        const idx = pqrs.findIndex(p => p.radicado === radicado);
        if (idx !== -1) {
            pqrs[idx].estado = 'Cerrado';
            pqrs[idx].respuesta = respuestaTxt;
            localStorage.setItem('acmePQRs', JSON.stringify(pqrs));
            
            this._agregarNotificacionSistema(pqrs[idx].usuarioId, {
                id: `pqr-resp-${radicado}`,
                tipo: 'sistema',
                titulo: 'PQR Respondida',
                mensaje: `Tu solicitud # ${radicado} ha sido respondida por el banco.`,
                icono: '',
                color: '#d4edda'
            });
            return true;
        }
        return false;
    }

    /* ─────────────────────────────────────────
       PRESUPUESTO PERSONAL
    ───────────────────────────────────────── */
    _clavePres(usuarioId) { return `acmePres_${usuarioId}`; }

    obtenerPresupuesto(usuarioId) {
        const raw = localStorage.getItem(this._clavePres(usuarioId));
        if (raw) return JSON.parse(raw);
        const inicial = { categorias: [], metas: [] };
        localStorage.setItem(this._clavePres(usuarioId), JSON.stringify(inicial));
        return inicial;
    }

    _guardarPresupuesto(usuarioId, datos) {
        localStorage.setItem(this._clavePres(usuarioId), JSON.stringify(datos));
    }

    agregarCategoriaPres(usuarioId, categoria) {
        const datos = this.obtenerPresupuesto(usuarioId);
        const idx = datos.categorias.findIndex(c => c.nombre === categoria.nombre);
        if (idx !== -1) {
            datos.categorias[idx].monto = categoria.monto;
        } else {
            datos.categorias.push(categoria);
        }
        this._guardarPresupuesto(usuarioId, datos);
    }

    eliminarCategoriaPres(usuarioId, nombre) {
        const datos = this.obtenerPresupuesto(usuarioId);
        datos.categorias = datos.categorias.filter(c => c.nombre !== nombre);
        this._guardarPresupuesto(usuarioId, datos);
    }

    agregarMeta(usuarioId, meta) {
        const datos = this.obtenerPresupuesto(usuarioId);
        const idx = datos.metas.findIndex(m => m.nombre === meta.nombre);
        if (idx !== -1) {
            datos.metas[idx] = { ...datos.metas[idx], ...meta };
        } else {
            datos.metas.push(meta);
        }
        this._guardarPresupuesto(usuarioId, datos);
    }

    abonarMeta(usuarioId, nombre, valor) {
        const datos = this.obtenerPresupuesto(usuarioId);
        const idx = datos.metas.findIndex(m => m.nombre === nombre);
        if (idx !== -1) {
            datos.metas[idx].acumulado = Math.min(
                datos.metas[idx].objetivo,
                (datos.metas[idx].acumulado || 0) + Number(valor)
            );
            this._guardarPresupuesto(usuarioId, datos);
        }
    }

    eliminarMeta(usuarioId, nombre) {
        const datos = this.obtenerPresupuesto(usuarioId);
        datos.metas = datos.metas.filter(m => m.nombre !== nombre);
        this._guardarPresupuesto(usuarioId, datos);
    }

    /* ─────────────────────────────────────────
       NOTIFICACIONES
    ───────────────────────────────────────── */
    _claveNoti(usuarioId) { return `acmeNotis_${usuarioId}`; }

    obtenerNotificaciones(usuarioId) {
        const raw = localStorage.getItem(this._claveNoti(usuarioId));
        return raw ? JSON.parse(raw) : [];
    }

    guardarNotificaciones(usuarioId, notis) {
        localStorage.setItem(this._claveNoti(usuarioId), JSON.stringify(notis));
    }

    marcarNotificacionLeida(usuarioId, id) {
        const notis = this.obtenerNotificaciones(usuarioId);
        const idx = notis.findIndex(n => n.id === id);
        if (idx !== -1) {
            notis[idx].leida = true;
            this.guardarNotificaciones(usuarioId, notis);
        }
    }

    marcarTodasLeidas(usuarioId) {
        const notis = this.obtenerNotificaciones(usuarioId).map(n => ({ ...n, leida: true }));
        this.guardarNotificaciones(usuarioId, notis);
    }

    contarNoLeidas(usuarioId) {
        return this.obtenerNotificaciones(usuarioId).filter(n => !n.leida).length;
    }

    _agregarNotificacionSistema(usuarioId, noti) {
        const notis = this.obtenerNotificaciones(usuarioId);
        if (!notis.find(n => n.id === noti.id)) {
            notis.unshift({ ...noti, fecha: new Date().toISOString(), leida: false });
            this.guardarNotificaciones(usuarioId, notis);
        }
    }

    /* ─────────────────────────────────────────
       MIGRACIÓN DE DATOS LEGACY
    ───────────────────────────────────────── */
    migrarDatos() {
        const usuarios = this.obtenerUsuarios().map(u => ({
            ...u,
            tipoId:    u.tipoId    ?? u.idType,
            numeroId:  u.numeroId  ?? u.idNumber,
            nombres:   u.nombres   ?? u.firstName,
            apellidos: u.apellidos ?? u.lastName,
            genero:    u.genero    ?? u.gender,
            telefono:  u.telefono  ?? u.phone,
            correo:    u.correo    ?? u.email,
            ciudad:    u.ciudad    ?? u.city,
            direccion: u.direccion ?? u.address,
            contrasena:u.contrasena?? u.password
        }));

        const cuentas = this.obtenerCuentas().map(c => ({
            ...c,
            numeroCuenta: c.numeroCuenta ?? c.accountNumber,
            usuarioId:    c.usuarioId    ?? c.userId,
            saldo:        c.saldo        ?? c.balance ?? 0,
            fechaCreacion:c.fechaCreacion?? c.createdAt
        }));

        const txs = (JSON.parse(localStorage.getItem('acmeTransactions')) || []).map(t => ({
            ...t,
            numeroCuenta:     t.numeroCuenta     ?? t.accountNumber,
            referencia:       t.referencia       ?? t.reference,
            fecha:            t.fecha            ?? t.date,
            concepto:         t.concepto         ?? t.concept,
            referenciaServicio: t.referenciaServicio ?? t.serviceReference
        }));

        localStorage.setItem('acmeUsers', JSON.stringify(usuarios));
        localStorage.setItem('acmeAccounts', JSON.stringify(cuentas));
        localStorage.setItem('acmeTransactions', JSON.stringify(txs));
    }
}

window.db = new BaseDatos();
window.db.migrarDatos();
