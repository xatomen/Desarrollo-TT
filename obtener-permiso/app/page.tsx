'use client';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LuMousePointerClick } from 'react-icons/lu';
import Chatbot from '@/components/Chatbot';
import { getAssetPath } from '@/lib/getAssetPath';
import { Img } from '@/components/Img';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-vh-100" style={{ background: '#f8fafc' }}>
      <Navbar />
      <div className="container mx-auto py-5">
        {/* Hero */}
        <div
          className="text-center mb-5"
          style={{
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 24px #0001',
            padding: '0',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div style={{ position: 'relative', width: '100%', height: '320px', background: '#e0e7ff' }}>
            {/* <img
              src="https://media.discordapp.net/attachments/1115361530251325569/1419803946955833465/pcirculacionmuni.jpg?ex=68d316f7&is=68d1c577&hm=2b5e8538e21d5b3666a14467bef439e718660eb43d6b137390a9d370ce73b40e&=&format=webp&width=791&height=791"
              alt="Hero"
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                opacity: 0.85,
                filter: 'brightness(0.97) blur(0.5px)',
              }}
            /> */}
            <div
              style={{
                position: 'absolute',
                top: '30%',
                left: '50%',
                transform: 'translate(-50%, -30%)',
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '16px',
                padding: '2.5rem 2rem 1.5rem 2rem',
                minWidth: 320,
                maxWidth: 600,
                boxShadow: '0 2px 16px #0002',
              }}
            >
              <h1
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: '#1a2a41',
                  textShadow: '1px 1px 6px #e0e7ff',
                  fontFamily: 'Dosis, Dosis, sans-serif',
                  marginBottom: '0.5rem',
                }}
              >
                Bienvenido a Tu Permiso
              </h1>
              <p style={{ color: '#3b3b3b', fontSize: '1.15rem', fontWeight: 500 }}>
                Tu plataforma para gestionar permisos de circulación
              </p>
              <div className="d-flex justify-content-center mt-3">
                <button
                  className="btn row"
                  style={{
                    background: '#6D2077',
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: '20px',
                    fontSize: '1.1rem',
                    padding: '12px 32px',
                    boxShadow: '0 2px 8px #0002'
                  }}
                  onClick={() => router.push('/home')}
                >
                  <span className="d-flex align-items-center gap-2">
                    <span>Paga tu permiso aquí</span>
                    <LuMousePointerClick />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Características */}
        <div className="row g-4 mb-5">
          <div className="col-12 col-md-4">
            <div
              className="h-100 p-4"
              style={{
                background: '#f8fafc',
                border: '1px solid #e0e7ff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px #0001',
                transition: 'box-shadow 0.2s',
              }}
            >
              <h2 style={{
                color: '#1a2a41',
                fontWeight: 700,
                fontSize: '1.35rem',
                fontFamily: 'Dosis, Roboto, Arial, sans-serif',
                letterSpacing: '0.5px'
              }}>
                Gestión de Permisos
              </h2>
              <p style={{
                color: '#3b3b3b',
                fontFamily: 'Roboto, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '1.05rem'
              }}>
                Solicita, renueva y administra tus permisos de circulación de manera fácil y rápida.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div
              className="h-100 p-4"
              style={{
                background: '#f8fafc',
                border: '1px solid #e0e7ff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px #0001',
                transition: 'box-shadow 0.2s',
              }}
            >
              <h2 style={{
                color: '#6D2077',
                fontWeight: 700,
                fontSize: '1.35rem',
                fontFamily: 'Dosis, Roboto, Arial, sans-serif',
                letterSpacing: '0.5px'
              }}>
                Pago rápido
              </h2>
              <p style={{
                color: '#3b3b3b',
                fontFamily: 'Roboto, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '1.05rem'
              }}>
                Realiza tus pagos de manera rápida y segura a través de nuestra plataforma.
              </p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div
              className="h-100 p-4"
              style={{
                background: '#f8fafc',
                border: '1px solid #e0e7ff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px #0001',
                transition: 'box-shadow 0.2s',
              }}
            >
              <h2 style={{
                color: '#00C7B1',
                fontWeight: 700,
                fontSize: '1.35rem',
                fontFamily: 'Dosis, Roboto, Arial, sans-serif',
                letterSpacing: '0.5px'
              }}>
                Todos tus documentos en un solo lugar
              </h2>
              <p style={{
                color: '#3b3b3b',
                fontFamily: 'Roboto, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '1.05rem'
              }}>
                Accede a todos tus documentos relacionados con permisos de circulación en un solo lugar.
              </p>
            </div>
          </div>
        </div>

        {/* Beneficios */}
        <div
          className="text-center p-5"
          style={{
            background: 'linear-gradient(90deg, #e0e7ff 60%, #fbeaf6 100%)',
            borderRadius: '18px',
            boxShadow: '0 4px 16px #0002',
            color: '#1a2a41',
            fontWeight: 500,
            fontSize: '1.1rem',
            marginTop: '2rem',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <h2 className="mb-4" style={{ fontWeight: 700, color: '#6D2077', fontSize: '2rem', fontFamily: 'Dosis, Roboto, sans-serif' }}>
            ¿Por qué elegir <span style={{ color: '#D00070' }}>Tu Permiso</span>?
          </h2>
          <div className="row justify-content-center g-4">
            <div className="col-12 col-md-4">
              <div
                style={{
                  background: '#fff',
                  borderRadius: '14px',
                  boxShadow: '0 2px 8px #0001',
                  padding: '1.5rem 1.2rem',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <i
                  className="bi bi-lightning-charge-fill"
                  style={{ fontSize: '2.2rem', color: '#6D2077', marginBottom: 10 }}
                ></i>
                <h4 style={{ color: '#6D2077', fontWeight: 700, fontSize: '1.15rem' }}>Trámites en minutos</h4>
                <p style={{ color: '#222', fontSize: '1rem' }}>
                  Realiza tus trámites de permisos de circulación y documentos de manera 100% digital, sin filas ni papeleos.
                </p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div
                style={{
                  background: '#fff',
                  borderRadius: '14px',
                  boxShadow: '0 2px 8px #0001',
                  padding: '1.5rem 1.2rem',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <i
                  className="bi bi-shield-lock-fill"
                  style={{ fontSize: '2.2rem', color: '#00C7B1', marginBottom: 10 }}
                ></i>
                <h4 style={{ color: '#00C7B1', fontWeight: 700, fontSize: '1.15rem' }}>Seguridad y respaldo</h4>
                <p style={{ color: '#222', fontSize: '1rem' }}>
                  Tus datos y documentos están protegidos y respaldados, cumpliendo con los más altos estándares de seguridad.
                </p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div
                style={{
                  background: '#fff',
                  borderRadius: '14px',
                  boxShadow: '0 2px 8px #0001',
                  padding: '1.5rem 1.2rem',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <i
                  className="bi bi-people-fill"
                  style={{ fontSize: '2.2rem', color: '#D00070', marginBottom: 10 }}
                ></i>
                <h4 style={{ color: '#D00070', fontWeight: 700, fontSize: '1.15rem' }}>Información siempre disponible</h4>
                <p style={{ color: '#222', fontSize: '1rem' }}>
                  Consulta y descarga tus documentos y permisos en cualquier momento, desde cualquier dispositivo, sin esperas ni trámites presenciales.
                </p>
              </div>
            </div>
          </div>
          {/* Medios de pago WebPay en dos columnas */}
          <div
            className="row align-items-center my-5"
            style={{
              background: '#fff',
              borderRadius: '16px',
              boxShadow: '0 2px 8px #0001',
              padding: '2.2rem 1.5rem',
              // maxWidth: 900,
              margin: '0 auto 2.5rem auto',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {/* Columna WebPay */}
            <div className="col-12 col-md-6 d-flex flex-column align-items-center justify-content-center mb-4 mb-md-0">
              <div className="mb-3">
                <Img
                  src="/img/webpay-logo-nofondo.png"
                  alt="WebPay"
                  style={{ height: 48, marginBottom: 8 }}
                />
              </div>
              <h3 style={{
                color: '#6D2077',
                fontWeight: 700,
                fontSize: '1.25rem',
                fontFamily: 'Dosis, Roboto, Arial, sans-serif',
                marginBottom: '0.5rem'
              }}>
                ¡Paga tu permiso con cualquier medio de pago!
              </h3>
              <p style={{
                color: '#333',
                fontSize: '1.08rem',
                fontFamily: 'Roboto, Arial, sans-serif',
                marginBottom: 0
              }}>
                Puedes pagar con tarjetas de <b>crédito</b>, <b>débito</b> y <b>prepago</b> de todos los bancos a través de WebPay.
                <br />
                <span style={{ color: '#6D2077', fontWeight: 500 }}>Rápido, seguro y sin complicaciones.</span>
              </p>
              <div className="justify-content-center d-flex">
                <Img src="/img/medios-pago.png" className="" style={{ maxWidth: '100%', height: '30px', marginTop: '1rem' }} />
              </div>
            </div>
            {/* Columna imagen cuotas */}
            <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
              <Img
                src="/img/pago_cuotas.png"
                alt="Pago en cuotas"
                style={{
                  maxWidth: '200px',
                  width: '100%',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px #0001',
                  background: '#fff'
                }}
              />
            </div>
          </div>
        </div>

        {/* Sección App Móvil */}
        <div
          className="row align-items-center my-5"
          style={{
            background: 'linear-gradient(90deg, #fbeaf6 60%, #e0e7ff 100%)',
            borderRadius: '18px',
            boxShadow: '0 4px 16px #0002',
            padding: '2.5rem 1.5rem',
            margin: '0 auto',
            maxWidth: 1100,
          }}
        >
          <div className="col-12 col-md-6 mb-4 mb-md-0 text-center align-items-center d-flex justify-content-center">
            <Img
              src="/img/tupermiso/logo-tupermisomovil.png"
              alt="App móvil Tu Permiso"
              style={{
                maxWidth: '260px',
                width: '100%',
                alignContent: 'center',
                justifyContent: 'center',
                // borderRadius: '16px',
                // boxShadow: '0 2px 12px #0001',
                // background: '#fff'
              }}
            />
          </div>
          <div className="col-12 col-md-6 text-md-start text-center">
            <h2 style={{ color: '#6D2077', fontWeight: 700, fontSize: '2rem', fontFamily: 'Dosis, Roboto, sans-serif' }}>
              ¡Lleva tus documentos siempre contigo!
            </h2>
            <p style={{ color: '#222', fontSize: '1.15rem', fontWeight: 500, margin: '1.2rem 0' }}>
              Descarga nuestra aplicación móvil y accede a todos los documentos de tus vehículos desde cualquier lugar y en cualquier momento. Consulta permisos de circulación, revisiones técnicas, SOAP y más, todo en un solo lugar y de forma segura.
            </p>
            <div className="d-flex justify-content-center justify-content-center gap-3 mt-3">
              <a href="#" style={{ display: 'inline-block' }}>
                <Img src="/img/badge-googleplay.png" alt="Disponible en Google Play" style={{ height: 48 }} />
              </a>
              <a href="#" style={{ display: 'inline-block' }}>
                <Img src="/img/badge-appstore.png" alt="Disponible en App Store" style={{ height: 48 }} />
              </a>
            </div>
          </div>
        </div>

        {/* Sección Acceso con ClaveÚnica */}
        <div
          className="row align-items-center my-5"
          style={{
            background: 'linear-gradient(90deg, #e0e7ff 60%, #fbeaf6 100%)',
            borderRadius: '18px',
            boxShadow: '0 4px 16px #0002',
            padding: '2.5rem 1.5rem',
            margin: '0 auto',
            maxWidth: 1100,
          }}
        >
          <div className="col-12 col-md-6 text-center mb-4 mb-md-0">
            <Img
              src="/img/logo-claveunica.svg"
              alt="ClaveÚnica"
              style={{
                // maxWidth: '180px',
                width: '100%',
                borderRadius: '12px',
                background: '#fff',
                boxShadow: '0 2px 8px #0001',
                padding: '12px'
              }}
            />
          </div>
          <div className="col-12 col-md-6 text-md-start text-center">
            <h2 style={{ color: '#6D2077', fontWeight: 700, fontSize: '2rem', fontFamily: 'Dosis, Roboto, sans-serif' }}>
              Accede fácilmente con ClaveÚnica
            </h2>
            <p style={{ color: '#222', fontSize: '1.15rem', fontWeight: 500, margin: '1.2rem 0' }}>
              Ingresa a nuestra plataforma utilizando tu ClaveÚnica, el sistema oficial de identificación digital del Estado de Chile. Así, puedes autenticarte de forma segura y acceder a todos tus documentos y servicios sin complicaciones.
            </p>
            <div className="d-flex justify-content-center gap-3 mt-3">
              <a href="#" className="btn" style={{
                background: '#D00070',
                color: '#fff',
                fontWeight: 700,
                borderRadius: '20px',
                fontSize: '1.1rem',
                padding: '12px 32px',
                boxShadow: '0 2px 8px #0002'
              }}>
                Ingresar con ClaveÚnica
              </a>
            </div>
          </div>
        </div>
        
      </div>
      <Footer />
      <Chatbot />
    </div>
  );
}
