import { db } from '../js/base-datos.js';
import { auth } from '../js/autenticacion.js';

class AcmeCajero extends HTMLElement {
    connectedCallback() {
        this.usuario = auth.obtenerUsuarioActual();
        this.cuenta = db.obtenerCuentaPorUsuario(this.usuario.numeroId);
        this.estado = 'INICIO'; // INICIO, PIN, MONTO, PROCESANDO, EXITO
        this.pinIngresado = '';
        this.montoIngresado = '';
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                .cajero-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 2rem 0;
                }
                .atm-machine {
                    background: #2a2d34;
                    width: 400px;
                    border-radius: 20px 20px 0 0;
                    padding: 2rem 2rem 4rem 2rem;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 0 5px 15px rgba(255,255,255,0.1);
                    position: relative;
                    border: 4px solid #1a1c23;
                }
                .atm-screen {
                    background: #000;
                    border: 8px solid #444;
                    border-radius: 12px;
                    height: 250px;
                    margin-bottom: 2rem;
                    position: relative;
                    overflow: hidden;
                    box-shadow: inset 0 0 20px rgba(0,255,100,0.1);
                    display: flex;
                    flex-direction: column;
                }
                .atm-screen::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
                    background-size: 100% 2px, 3px 100%;
                    pointer-events: none;
                }
                .atm-content {
                    flex: 1;
                    padding: 1.5rem;
                    color: #0f0;
                    font-family: 'Courier New', Courier, monospace;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    text-shadow: 0 0 5px #0f0;
                }
                .atm-content h3 { color: #0f0; margin-bottom: 1rem; text-transform: uppercase; }
                .numpad {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    padding: 0 1rem;
                }
                .numpad button {
                    background: #e0e0e0;
                    border: none;
                    padding: 15px;
                    font-size: 1.2rem;
                    font-weight: bold;
                    border-radius: 8px;
                    box-shadow: 0 4px 0 #999, inset 0 2px 5px rgba(255,255,255,0.5);
                    cursor: pointer;
                    transition: all 0.1s;
                    color: #333;
                }
                .numpad button:active {
                    transform: translateY(4px);
                    box-shadow: 0 0 0 #999, inset 0 2px 5px rgba(255,255,255,0.5);
                }
                .numpad .btn-cancel { background: #ff4444; color: white; box-shadow: 0 4px 0 #cc0000; }
                .numpad .btn-clear { background: #ffbb33; color: white; box-shadow: 0 4px 0 #cc8800; }
                .numpad .btn-enter { background: #00C851; color: white; box-shadow: 0 4px 0 #007E33; }
                
                .cash-slot {
                    position: absolute;
                    bottom: -15px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 200px;
                    height: 10px;
                    background: #000;
                    border-bottom: 2px solid #555;
                    border-radius: 5px;
                }
                .cash-dispense {
                    position: absolute;
                    bottom: -30px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 150px;
                    height: 60px;
                    background: url('https://www.transparenttextures.com/patterns/cubes.png'), #85bb65;
                    border: 2px solid #3d5a2d;
                    border-radius: 2px;
                    z-index: 10;
                    opacity: 0;
                    transition: all 1s ease-out;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #1a3c10;
                    font-weight: bold;
                    font-family: monospace;
                }
                .dispensing .cash-dispense {
                    opacity: 1;
                    bottom: -60px;
                }
                
                .atm-header {
                    text-align: center;
                    color: #888;
                    font-family: sans-serif;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 1rem;
                }
                
                .blinking-cursor {
                    animation: blink 1s step-end infinite;
                }
                @keyframes blink { 50% { opacity: 0; } }
            </style>
            
            <div class="cajero-container">
                <div class="atm-machine">
                    <div class="atm-header">Cajero Automático ACME</div>
                    <div class="atm-screen">
                        <div class="atm-content">
                            ${this.renderPantalla()}
                        </div>
                    </div>
                    
                    <div class="numpad">
                        <button data-key="1">1</button>
                        <button data-key="2">2</button>
                        <button data-key="3">3</button>
                        <button data-key="4">4</button>
                        <button data-key="5">5</button>
                        <button data-key="6">6</button>
                        <button data-key="7">7</button>
                        <button data-key="8">8</button>
                        <button data-key="9">9</button>
                        <button class="btn-cancel" data-key="CANCEL">CANCEL</button>
                        <button data-key="0">0</button>
                        <button class="btn-enter" data-key="ENTER">ENTER</button>
                    </div>
                    
                    <div class="cash-slot"></div>
                    <div class="cash-dispense" id="dinero-billete">$ ACME $</div>
                </div>
            </div>
        `;
        
        this.agregarEventosNumpad();
    }

    renderPantalla() {
        if (this.estado === 'INICIO') {
            return `
                <h3>Bienvenido</h3>
                <p>Inserte su tarjeta (Presione ENTER)</p>
            `;
        }
        if (this.estado === 'PIN') {
            return `
                <h3>Ingrese PIN</h3>
                <p style="font-size: 2rem; letter-spacing: 10px;">${'*'.repeat(this.pinIngresado)}<span class="blinking-cursor">_</span></p>
                <p style="font-size: 0.8rem; color: #aaa; margin-top: 1rem;">(Pin por defecto: 1234)</p>
            `;
        }
        if (this.estado === 'MONTO') {
            return `
                <h3>Retiro Efectivo</h3>
                <p style="font-size: 0.9rem; color: #88ff88;">Saldo: $${this.cuenta.saldo.toLocaleString()}</p>
                <p style="font-size: 1.5rem; margin-top: 1rem;">$ ${this.montoIngresado}<span class="blinking-cursor">_</span></p>
            `;
        }
        if (this.estado === 'PROCESANDO') {
            return `
                <h3 class="blinking-cursor">Procesando...</h3>
                <p>Por favor espere</p>
            `;
        }
        if (this.estado === 'EXITO') {
            return `
                <h3>Transacción Exitosa</h3>
                <p>Retire su dinero</p>
                <p style="font-size: 0.8rem; margin-top: 1rem;">Gracias por usar ACME Bank</p>
            `;
        }
        if (this.estado === 'ERROR') {
            return `
                <h3 style="color: #ff5555;">Transacción Declinada</h3>
                <p>${this.mensajeError}</p>
                <p style="font-size: 0.8rem; margin-top: 1rem;">(Presione CANCEL)</p>
            `;
        }
    }

    agregarEventosNumpad() {
        this.querySelectorAll('.numpad button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.target.getAttribute('data-key');
                this.manejarTecla(key);
            });
        });
    }

    manejarTecla(key) {
        if (key === 'CANCEL') {
            this.estado = 'INICIO';
            this.pinIngresado = '';
            this.montoIngresado = '';
            this.render();
            return;
        }

        if (this.estado === 'INICIO' && key === 'ENTER') {
            this.estado = 'PIN';
            this.render();
        } 
        else if (this.estado === 'PIN') {
            if (key === 'ENTER') {
                if (this.pinIngresado === '1234') {
                    this.estado = 'MONTO';
                } else {
                    this.estado = 'ERROR';
                    this.mensajeError = 'PIN Incorrecto';
                }
                this.render();
            } else if (this.pinIngresado.length < 4 && !isNaN(key)) {
                this.pinIngresado += key;
                this.render();
            }
        }
        else if (this.estado === 'MONTO') {
            if (key === 'ENTER') {
                this.procesarRetiro();
            } else if (!isNaN(key)) {
                this.montoIngresado += key;
                this.render();
            }
        }
    }

    procesarRetiro() {
        const monto = Number(this.montoIngresado);
        if (monto <= 0) {
            this.estado = 'ERROR';
            this.mensajeError = 'Monto inválido';
            this.render();
            return;
        }
        if (monto > this.cuenta.saldo) {
            this.estado = 'ERROR';
            this.mensajeError = 'Fondos insuficientes';
            this.render();
            return;
        }

        this.estado = 'PROCESANDO';
        this.render();

        setTimeout(() => {
            try {
                // Registrar en DB
                db.actualizarSaldo(this.cuenta.numeroCuenta, monto, false);
                db.crearTransaccion({
                    numeroCuenta: this.cuenta.numeroCuenta,
                    tipo: 'Retiro',
                    monto: monto,
                    concepto: 'Retiro en Cajero Automático ACME',
                    fecha: new Date().toISOString()
                });
                
                // Actualizar cuenta local
                this.cuenta = db.obtenerCuentaPorUsuario(this.usuario.numeroId);
                
                this.estado = 'EXITO';
                this.render();
                
                // Animación de billetes
                const maquina = this.querySelector('.atm-machine');
                maquina.classList.add('dispensing');
                
                // Reset a los 4 segundos
                setTimeout(() => {
                    maquina.classList.remove('dispensing');
                    this.estado = 'INICIO';
                    this.pinIngresado = '';
                    this.montoIngresado = '';
                    this.render();
                }, 4000);

            } catch (err) {
                this.estado = 'ERROR';
                this.mensajeError = err.message;
                this.render();
            }
        }, 1500);
    }
}
customElements.define('acme-cajero', AcmeCajero);
