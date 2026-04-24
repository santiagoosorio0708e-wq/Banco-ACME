/**
 * componentes/acme-reporte.js
 * Componente de Reporte de Saldos de Cuentas Activas.
 * Muestra fecha de corte, total de cuentas activas y tabla detallada
 * con: Número de cuenta, fecha de apertura, tipo y número de identificación,
 * nombre completo del cliente y saldo actual.
 */
class AcmeReporte extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    /**
     * Obtiene los datos combinados de cuentas + usuarios para el reporte.
     */
    obtenerDatosReporte() {
        const cuentas = window.db.obtenerCuentas();
        const usuarios = window.db.obtenerUsuarios();

        // Combinar información de cada cuenta con la de su usuario dueño
        return cuentas
            .map(cuenta => {
                const usuario = usuarios.find(u => u.numeroId === cuenta.usuarioId);
                // Si no hay usuario asociado, se omite del reporte
                if (!usuario) return null;
                // Excluir la cuenta del administrador del sistema
                if (usuario.rol === 'ADMIN') return null;

                return {
                    numeroCuenta: cuenta.numeroCuenta,
                    fechaApertura: cuenta.fechaCreacion,
                    tipoId: usuario.tipoId,
                    numeroId: usuario.numeroId,
                    nombreCompleto: `${usuario.nombres} ${usuario.apellidos}`,
                    saldo: Number(cuenta.saldo)
                };
            })
            .filter(item => item !== null);
    }

    render() {
        const datosReporte = this.obtenerDatosReporte();
        const fechaCorte = new Date();
        const totalCuentas = datosReporte.length;
        const totalSaldos = datosReporte.reduce((acc, d) => acc + d.saldo, 0);

        // Construir filas de la tabla
        let filasTabla = '';
        if (datosReporte.length === 0) {
            filasTabla = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-light);">
                        No hay cuentas activas registradas.
                    </td>
                </tr>`;
        } else {
            datosReporte.forEach((dato, idx) => {
                const fechaFormateada = new Date(dato.fechaApertura).toLocaleDateString('es-CO', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
                filasTabla += `
                    <tr class="reporte-fila">
                        <td data-label="N° Cuenta" class="reporte-td">
                            <span class="cuenta-numero">${dato.numeroCuenta}</span>
                        </td>
                        <td data-label="Fecha Apertura" class="reporte-td">${fechaFormateada}</td>
                        <td data-label="Tipo ID" class="reporte-td">
                            <span class="tipo-id-badge">${dato.tipoId}</span>
                        </td>
                        <td data-label="N° Identificación" class="reporte-td">${dato.numeroId}</td>
                        <td data-label="Nombre Completo" class="reporte-td">${dato.nombreCompleto}</td>
                        <td data-label="Saldo Actual" class="reporte-td reporte-saldo">
                            $${dato.saldo.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                    </tr>`;
            });

            // Fila de totales
            filasTabla += `
                <tr class="reporte-fila-total">
                    <td colspan="5" class="reporte-td" style="text-align: right; font-weight: 700; font-size: 1rem;">
                        Total General:
                    </td>
                    <td class="reporte-td reporte-saldo" style="font-weight: 800; font-size: 1.05rem; color: var(--primary-color);">
                        $${totalSaldos.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                </tr>`;
        }

        this.innerHTML = `
            <style>
                /* ── Contenedor principal del reporte ── */
                .reporte-container {
                    max-width: 1100px;
                    margin: 0 auto;
                    animation: fadeInReporte 0.4s ease;
                }

                @keyframes fadeInReporte {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* ── Encabezado del reporte ── */
                .reporte-header {
                    background: linear-gradient(135deg, #0a3480 0%, #1a5fc9 100%);
                    color: white;
                    border-radius: 16px;
                    padding: 2rem 2.5rem;
                    margin-bottom: 1.5rem;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 8px 24px rgba(10, 52, 128, 0.25);
                }
                .reporte-header::after {
                    content: '';
                    position: absolute;
                    top: -40%;
                    right: -10%;
                    width: 300px;
                    height: 300px;
                    background: rgba(255,255,255,0.06);
                    border-radius: 50%;
                    pointer-events: none;
                }
                .reporte-header::before {
                    content: '';
                    position: absolute;
                    bottom: -25%;
                    left: -5%;
                    width: 180px;
                    height: 180px;
                    background: rgba(255,255,255,0.04);
                    border-radius: 50%;
                    pointer-events: none;
                }

                .reporte-titulo {
                    font-size: 1.6rem;
                    font-weight: 800;
                    margin-bottom: 0.25rem;
                    color: white;
                    position: relative;
                    z-index: 1;
                }
                .reporte-subtitulo {
                    font-size: 0.95rem;
                    opacity: 0.85;
                    position: relative;
                    z-index: 1;
                }

                /* ── Tarjetas de resumen ── */
                .reporte-resumen-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 1.25rem;
                    margin-bottom: 1.5rem;
                }
                .resumen-card-reporte {
                    background: white;
                    border-radius: 14px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                    border: 1px solid rgba(0,0,0,0.05);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .resumen-card-reporte:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
                }
                .resumen-icono {
                    width: 52px;
                    height: 52px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.6rem;
                    flex-shrink: 0;
                }
                .resumen-icono.fecha   { background: #e8f0fe; color: #1a73e8; }
                .resumen-icono.cuentas { background: #e6f4ea; color: #1e8e3e; }
                .resumen-icono.total   { background: #fef7e0; color: #e37400; }

                .resumen-info p { margin: 0; }
                .resumen-info .resumen-label {
                    font-size: 0.78rem;
                    color: var(--text-light);
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    font-weight: 600;
                }
                .resumen-info .resumen-valor {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: var(--text-dark);
                    margin-top: 0.15rem;
                }

                /* ── Barra de acciones ── */
                .reporte-acciones {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                }
                .btn-reporte {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.6rem 1.25rem;
                    border-radius: 10px;
                    font-size: 0.88rem;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    transition: all 0.25s ease;
                    font-family: var(--font-family);
                }
                .btn-reporte:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .btn-imprimir {
                    background: var(--primary-color);
                    color: white;
                }
                .btn-imprimir:hover { background: var(--primary-hover); }

                /* ── Tabla del reporte ── */
                .reporte-tabla-wrapper {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .reporte-tabla {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                }
                .reporte-tabla thead {
                    background: linear-gradient(135deg, #0b3d91 0%, #1357b0 100%);
                }
                .reporte-tabla thead th {
                    padding: 1rem 1.25rem;
                    color: white;
                    font-size: 0.82rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-weight: 700;
                    white-space: nowrap;
                }
                .reporte-tabla thead th:first-child { border-radius: 0; }
                .reporte-tabla thead th:last-child  { border-radius: 0; text-align: right; }

                .reporte-fila {
                    transition: background 0.2s;
                }
                .reporte-fila:hover {
                    background: #f0f5ff !important;
                }
                .reporte-fila:nth-child(even) {
                    background: #fafbfc;
                }

                .reporte-td {
                    padding: 0.9rem 1.25rem;
                    border-bottom: 1px solid #f0f0f0;
                    font-size: 0.9rem;
                    color: var(--text-dark);
                }

                .reporte-saldo {
                    text-align: right;
                    font-weight: 600;
                    font-family: 'Inter', monospace;
                    color: #1e8e3e;
                }

                .cuenta-numero {
                    font-family: monospace;
                    background: #eef2ff;
                    padding: 0.2rem 0.55rem;
                    border-radius: 6px;
                    font-weight: 600;
                    color: var(--primary-color);
                    font-size: 0.85rem;
                }

                .tipo-id-badge {
                    display: inline-block;
                    background: #e8f0fe;
                    color: #1a73e8;
                    padding: 0.15rem 0.55rem;
                    border-radius: 5px;
                    font-size: 0.8rem;
                    font-weight: 700;
                }

                .reporte-fila-total {
                    background: #f0f5ff !important;
                    border-top: 2px solid var(--primary-color);
                }
                .reporte-fila-total:hover {
                    background: #e5edff !important;
                }

                /* ── Área de impresión ── */
                @media print {
                    body * { visibility: hidden; }
                    #reporte-print-area, #reporte-print-area * {
                        visibility: visible;
                    }
                    #reporte-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 2rem;
                    }
                    .reporte-acciones,
                    .sidebar,
                    .tablero-topbar,
                    .btn-reporte { display: none !important; }

                    .reporte-header {
                        background: #0b3d91 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .reporte-tabla thead {
                        background: #0b3d91 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .reporte-tabla thead th {
                        color: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }

                /* ── Responsive ── */
                @media (max-width: 768px) {
                    .reporte-header { padding: 1.5rem 1.25rem; }
                    .reporte-titulo { font-size: 1.25rem; }
                    .reporte-resumen-grid { grid-template-columns: 1fr; }
                    .reporte-acciones { justify-content: center; }
                    
                    .reporte-tabla, .reporte-tabla thead,
                    .reporte-tabla tbody, .reporte-tabla th,
                    .reporte-tabla td, .reporte-tabla tr {
                        display: block;
                        width: 100% !important;
                    }
                    .reporte-tabla thead tr {
                        position: absolute;
                        top: -9999px;
                        left: -9999px;
                    }
                    .reporte-tabla tr {
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        margin-bottom: 1.25rem;
                        padding: 0.5rem;
                        background: white;
                        box-shadow: 0 3px 8px rgba(0,0,0,0.05);
                    }
                    .reporte-td {
                        border: none !important;
                        border-bottom: 1px solid #f0f0f0 !important;
                        position: relative;
                        padding-left: 50% !important;
                        text-align: right !important;
                        min-height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: flex-end;
                    }
                    .reporte-td:last-child {
                        border-bottom: none !important;
                    }
                    .reporte-td::before {
                        content: attr(data-label);
                        position: absolute;
                        left: 1rem;
                        width: 45%;
                        padding-right: 10px;
                        white-space: nowrap;
                        text-align: left;
                        font-weight: bold;
                        color: var(--primary-color);
                        font-size: 0.82rem;
                    }

                    .reporte-fila-total td {
                        padding-left: 1rem !important;
                        justify-content: flex-end;
                    }
                    .reporte-fila-total td::before {
                        display: none;
                    }
                }
            </style>

            <div class="reporte-container" id="reporte-print-area">
                <!-- Encabezado del reporte -->
                <div class="reporte-header">
                    <div class="reporte-titulo">📊 Reporte de Saldos — Cuentas Activas</div>
                    <div class="reporte-subtitulo">Banco Acme • Portal Transaccional</div>
                </div>

                <!-- Tarjetas de resumen -->
                <div class="reporte-resumen-grid">
                    <div class="resumen-card-reporte">
                        <div class="resumen-icono fecha">📅</div>
                        <div class="resumen-info">
                            <p class="resumen-label">Fecha de Corte</p>
                            <p class="resumen-valor">${fechaCorte.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <div class="resumen-card-reporte">
                        <div class="resumen-icono cuentas">🏦</div>
                        <div class="resumen-info">
                            <p class="resumen-label">Cuentas Activas</p>
                            <p class="resumen-valor">${totalCuentas}</p>
                        </div>
                    </div>
                    <div class="resumen-card-reporte">
                        <div class="resumen-icono total">💰</div>
                        <div class="resumen-info">
                            <p class="resumen-label">Total en Saldos</p>
                            <p class="resumen-valor">$${totalSaldos.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>

                <!-- Botón de imprimir -->
                <div class="reporte-acciones">
                    <button class="btn-reporte btn-imprimir" id="btn-imprimir-reporte">
                        🖨️ Imprimir Reporte
                    </button>
                </div>

                <!-- Tabla detallada -->
                <div class="reporte-tabla-wrapper">
                    <table class="reporte-tabla">
                        <thead>
                            <tr>
                                <th>N° Cuenta</th>
                                <th>Fecha de Apertura</th>
                                <th>Tipo ID</th>
                                <th>N° Identificación</th>
                                <th>Nombre Completo</th>
                                <th style="text-align: right;">Saldo Actual</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filasTabla}
                        </tbody>
                    </table>
                </div>

                <!-- Pie del reporte -->
                <div style="text-align: center; margin-top: 1.5rem; padding: 1rem; font-size: 0.8rem; color: var(--text-light);">
                    Reporte generado el ${fechaCorte.toLocaleString('es-CO')} • Banco Acme — Portal Transaccional
                </div>
            </div>
        `;

        this.addEventListeners();
    }

    addEventListeners() {
        this.querySelector('#btn-imprimir-reporte')?.addEventListener('click', () => {
            window.print();
        });
    }
}

customElements.define('acme-reporte', AcmeReporte);
