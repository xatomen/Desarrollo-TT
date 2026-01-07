'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_CONFIG from "@/config/api";

export default function ConfirmacionPagoMultasRPIPage() {
  const router = useRouter();

  // Estados para los datos
  const [formatoPago, setFormatoPago] = useState<any>(null);
  const [pagoInfo, setPagoInfo] = useState<any>(null);

  useEffect(() => {
    const formatoPagoStr = sessionStorage.getItem('formato_pago');
    setFormatoPago(formatoPagoStr ? JSON.parse(formatoPagoStr) : null);

    const pagoInfoStr = sessionStorage.getItem('pago_info');
    setPagoInfo(pagoInfoStr ? JSON.parse(pagoInfoStr) : null);
  }, []);

  const ppu = formatoPago?.ppu;
  const rut_propietario = formatoPago?.rut;
  const monto_pago = formatoPago?.monto_pago;

  const resultadoPago = pagoInfo?.resultadoPago;
  const titular = pagoInfo?.titular;
  const numeroTarjeta = pagoInfo?.numeroTarjeta;
  const transactionId = pagoInfo?.transactionId;

  // Llamada a endpoint para eliminar multas RPI pagadas
  useEffect(() => {
    if (resultadoPago === "exitoso" && rut_propietario && ppu) {
      const eliminarMultas = async () => {
        try {
          const url = `${API_CONFIG.MTT}delete_multas_rpi/?rut=${encodeURIComponent(rut_propietario)}`;
          const response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Error al eliminar multas RPI');
          }

          const data = await response.json();
          console.log('Multas RPI eliminadas:', data);
        } catch (error) {
          console.error('Error:', error);
        }
      };

      eliminarMultas();
    }
  }, [resultadoPago, rut_propietario, ppu, monto_pago, transactionId]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-3" style={{ background: "#f8fafc", fontFamily: '"Roboto", sans-serif' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 col-sm-10">
            <div className="card-like border-0 shadow">
              <div className="card-body text-center p-5">
                {/* Ícono de éxito o error */}
                <div className="mb-4">
                  <div
                    className="mx-auto d-flex align-items-center justify-content-center"
                    style={{
                      width: "120px",
                      height: "120px",
                      backgroundColor: resultadoPago === "exitoso" ? "#28a745" : "#dc3545",
                      borderRadius: "50%",
                    }}
                  >
                    {resultadoPago === "exitoso" ? (
                      <svg width="60" height="60" fill="white" viewBox="0 0 16 16">
                        <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                      </svg>
                    ) : (
                      <svg width="60" height="60" fill="white" viewBox="0 0 16 16">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a .5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Título principal */}
                <h1
                  className="fw-bold mb-3"
                  style={{
                    fontFamily: '"Roboto", sans-serif',
                    fontSize: "2.5rem",
                    fontWeight: "700",
                    color: "#212529",
                  }}
                >
                  {resultadoPago === "exitoso" ? "Pago Exitoso" : "Pago Fallido"}
                </h1>

                {/* Texto descriptivo */}
                <p
                  className="text-muted mb-4"
                  style={{
                    fontFamily: '"Roboto", sans-serif',
                    fontSize: "1.1rem",
                    fontWeight: "400",
                  }}
                >
                  {resultadoPago === "exitoso"
                    ? "El pago de tus multas RPI ha sido procesado correctamente."
                    : "Hubo un problema al procesar el pago de tus multas. Por favor, intenta nuevamente."}
                  <br />
                  {resultadoPago === "exitoso"
                    ? "Puedes continuar con el pago del permiso de circulación."
                    : "Si el problema persiste, contacta al soporte."}
                </p>

                {/* Información del vehículo */}
                <div className="mb-4 p-3 bg-light rounded">
                  <h6 className="text-muted mb-2" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "0.875rem", fontWeight: "400" }}>
                    Vehículo
                  </h6>
                  <h4 className="fw-bold mb-1" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: "600", color: "#212529" }}>
                    {ppu}
                  </h4>
                  <small className="text-muted" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "0.875rem" }}>
                    RUT propietario: {rut_propietario}
                  </small>
                </div>

                {/* Número de comprobante */}
                {resultadoPago === "exitoso" && transactionId && (
                  <div className="mb-4">
                    <h6 className="text-muted mb-2" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "0.875rem", fontWeight: "400" }}>
                      N° de comprobante
                    </h6>
                    <h2 className="fw-bold mb-0" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "2rem", fontWeight: "700", color: "#212529", letterSpacing: "2px" }}>
                      {transactionId}
                    </h2>
                  </div>
                )}

                {/* Monto pagado */}
                {resultadoPago === "exitoso" && (
                  <div className="mb-5">
                    <h6 className="text-muted mb-2" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "0.875rem", fontWeight: "400" }}>
                      Monto pagado
                    </h6>
                    <h1 className="fw-bold mb-0" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "3rem", fontWeight: "700", color: "#212529" }}>
                      ${monto_pago ? Number(monto_pago).toLocaleString() : "-"}
                    </h1>
                  </div>
                )}

                {/* Información adicional */}
                {resultadoPago === "exitoso" && (
                  <div className="mb-4 p-3 bg-light rounded">
                    <div className="row text-start">
                      <div className="col-6">
                        <small className="text-muted d-block" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "0.75rem" }}>
                          Tarjeta:
                        </small>
                        <small className="fw-medium" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "0.875rem" }}>
                          **** **** **** {numeroTarjeta ? numeroTarjeta.slice(-4) : ""}
                        </small>
                      </div>
                      <div className="col-6">
                        <small className="text-muted d-block" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "0.75rem" }}>
                          Titular:
                        </small>
                        <small className="fw-medium" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "0.875rem" }}>
                          {titular}
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botón de acción */}
                <div className="row g-3">
                  <div className="col">
                    <button
                      className="btn btn-lg w-100 py-3 text-white fw-bold text-center"
                      style={{
                        backgroundColor: "#0d6efd",
                        border: "none",
                        fontFamily: '"Roboto", sans-serif',
                        fontWeight: "600",
                      }}
                      onClick={() => {
                        // Redirigir a /home/validaciones-pago
                        router.push("/home/validaciones-pago");
                      }}
                    >
                      Continuar con el pago del permiso
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Información adicional en la parte inferior */}
            {resultadoPago === "exitoso" && (
              <div className="text-center mt-4">
                <p className="text-muted mb-2" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "0.875rem" }}>
                  Se ha enviado un comprobante de pago a tu correo electrónico.
                </p>
                <small className="text-muted" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "0.75rem" }}>
                  Guarda este número de comprobante para futuras consultas.
                </small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
