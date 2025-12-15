'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API_CONFIG from "@/config/api";

export default function ConfirmacionPagoSoapPage() {
  const router = useRouter();

  // Estados para los datos
  const [formatoPago, setFormatoPago] = useState<any>(null);
  const [pagoInfo, setPagoInfo] = useState<any>(null);
  const [resultadoPago, setResultadoPago] = useState<string | null>(null);
  const [soap, setSoap] = useState<any>(null);

  useEffect(() => {
    const formatoPagoStr = sessionStorage.getItem('formato_pago');
    setFormatoPago(formatoPagoStr ? JSON.parse(formatoPagoStr) : null);

    const pagoInfoStr = sessionStorage.getItem('pago_info');
    setPagoInfo(pagoInfoStr ? JSON.parse(pagoInfoStr) : null);

    const soapStr = sessionStorage.getItem('soap');
    setSoap(soapStr ? JSON.parse(soapStr) : null);

    const resultadoPago = sessionStorage.getItem('resultado_pago');
    setResultadoPago(resultadoPago ? resultadoPago : null);

    console.log("formatoPago:", formatoPagoStr);
    console.log("soap:", soapStr);
    console.log("resultadoPago:", resultadoPago);

  }, []);

  const ppu = formatoPago?.ppu;
  const rut_propietario = formatoPago?.rut;
  const monto_pago = formatoPago?.monto_pago;

  const titular = pagoInfo?.titular;
  const numeroTarjeta = pagoInfo?.numeroTarjeta;
  const transactionId = pagoInfo?.transactionId;

  const compania = soap?.compania;
  const num_poliza = soap?.num_poliza;
  const prima = soap?.prima;
  const rige_desde = soap?.rige_desde;
  const rige_hasta = soap?.rige_hasta;

  // Crear SOAP desde endpoint
  const crearSoap = async () => {
    try {
      const response = await fetch(`${API_CONFIG.AACH}create_soap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          num_poliza,
          ppu,
          compania,
          prima,
          rige_desde,
          rige_hasta,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear SOAP');
      }

      const data = await response.json();
      setSoap(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (resultadoPago === "exitoso") {
      crearSoap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultadoPago]);



  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-3" style={{ fontFamily: '"Roboto", sans-serif' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 col-sm-10">
            <div className="card-like border-0 shadow" style={{ background: "white" }}>
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
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Título principal */}
                <h1
                  className="fw-bold mb-3"
                  style={{
                    fontFamily: 'Roboto, sans-serif',
                    fontSize: "2.5rem",
                    fontWeight: "700",
                    color: "#212529",
                  }}
                >
                  {resultadoPago === "exitoso" ? "SOAP Pagado" : "Pago Fallido"}
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
                    ? "El pago de tu SOAP ha sido procesado correctamente."
                    : "Hubo un problema al procesar el pago de tu SOAP. Por favor, intenta nuevamente."}
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

                {/* Aseguradora */}
                {compania && (
                  <div className="mb-4 p-3 bg-light rounded">
                    <h6 className="text-muted mb-2" style={{ fontFamily: '"Roboto", sans-serif', fontSize: "0.875rem", fontWeight: "400" }}>
                      Compañía Aseguradora
                    </h6>
                    <h4 className="fw-bold mb-0" style={{ fontFamily: '"Roboto", sans-serif', fontWeight: "600", color: "#212529" }}>
                      {compania}
                    </h4>
                  </div>
                )}

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
                  Se ha enviado un comprobante de pago SOAP a tu correo electrónico.
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