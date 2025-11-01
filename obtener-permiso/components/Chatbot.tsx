'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { BiBot, BiX, BiSend } from 'react-icons/bi';
import styles from './Chatbot.module.css';
import API_CONFIG from '@/config/api';

interface Mensaje {
  id: string;
  tipo: 'usuario' | 'asistente';
  contenido: string;
  timestamp: Date;
}

// Mapeo de rutas a nombres descriptivos
const RUTAS_DESCRIPTIVAS: Record<string, string> = {
  '/home': 'Página de inicio - Dashboard principal',
  '/home/ver-vehiculos': 'Mis Vehículos - Consulta y gestión de tus vehículos registrados',
  '/home/ver-documentos': 'Documentos Vehiculares - Visualización de SOAP, Revisión Técnica y Permiso de Circulación',
  '/home/validaciones-pago': 'Validaciones de Pago - Verificación de requisitos antes de pagar',
  '/home/historial-permisos': 'Historial de Permisos - Registro de permisos de circulación pagados anteriormente',
  '/home/formulario-pago': 'Formulario de Pago de Permiso - Ingreso de datos y procesamiento del pago del permiso',
  '/home/pago-soap': 'Pago de SOAP - Gestión de pagos del Seguro Obligatorio de Accidentes de Pasajeros',
  '/home/confirmacion-pago-multas-transito': 'Pago de Multas de Tránsito - Confirmación de pago de infracciones de tránsito',
  '/home/confirmacion-pago-soap': 'Pago de SOAP - Confirmación de pago del Seguro Obligatorio de Accidentes de Pasajeros',
  '/home/confirmacion-pago-multas-rpi': 'Pago de Multas RPI - Confirmación de pago de multas del Registro de Pasajeros Infractores',
  '/home/confirmacion-pago': 'Confirmación de Pago - Resumen y confirmación de la transacción',
  '/': 'Página de inicio - Bienvenido a TU PERMISO',
};

export default function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>(
    [
      {
        id: '1',
        tipo: 'asistente',
        contenido: '¡Hola! Bienvenido a TU PERMISO. ¿En qué puedo ayudarte hoy?',
        timestamp: new Date(),
      },
    ]
  );
  const [inputValue, setInputValue] = useState('');
  const [cargando, setCargando] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Obtener la descripción de la ruta actual
  const obtenerDescripcionRuta = (): string => {
    const descripcion = RUTAS_DESCRIPTIVAS[pathname];
    return descripcion || `Página: ${pathname}`;
  };

  // Limpiar bloques de código markdown
  const limpiarMarkdown = (texto: string): string => {
    // Eliminar bloques de código con lenguaje (```html, ```python, etc.)
    let limpio = texto.replace(/```[\w]*\n/g, '');
    // Eliminar bloques de código sin lenguaje
    limpio = limpio.replace(/```\n/g, '');
    // Eliminar cierre de bloques de código
    limpio = limpio.replace(/\n```/g, '');
    limpio = limpio.replace(/```/g, '');
    return limpio.trim();
  };

  const enviarMensaje = async () => {
    if (!inputValue.trim()) return;

    // Agregar mensaje del usuario
    const nuevoMensajeUsuario: Mensaje = {
      id: Date.now().toString(),
      tipo: 'usuario',
      contenido: inputValue,
      timestamp: new Date(),
    };

    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    const mensajeEnviado = inputValue;
    setInputValue('');
    setCargando(true);

    try {
      // Usar solo la ruta específica como contexto adicional
      const contextoAdicional = `Ruta actual: ${pathname}`;

      // Llamar al backend
      const response = await fetch(`${API_CONFIG.BACKEND}chatbot/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensaje: mensajeEnviado,
          contexto_adicional: contextoAdicional,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al obtener respuesta del chatbot');
      }

      const data = await response.json();
      let respuesta = data.respuesta;

      // Limpiar markdown de la respuesta
      respuesta = limpiarMarkdown(respuesta);

      // Agregar mensaje del asistente
      const nuevoMensajeAsistente: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'asistente',
        contenido: respuesta,
        timestamp: new Date(),
      };

      setMensajes((prev) => [...prev, nuevoMensajeAsistente]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const mensajeError: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'asistente',
        contenido: 'Disculpa, ocurrió un error al procesar tu consulta. Por favor, intenta nuevamente.',
        timestamp: new Date(),
      };
      setMensajes((prev) => [...prev, mensajeError]);
    } finally {
      setCargando(false);
    }
  };

  const manejarKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.bottonFlotante}
        title={isOpen ? 'Cerrar chat' : 'Abrir chat'}
        aria-label="Abrir chatbot"
      >
        {isOpen ? (
          <BiX size={28} color="white" />
        ) : (
          <BiBot size={28} color="white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerContent}>
              <BiBot size={24} color="white" style={{ marginRight: 8 }} />
              <div>
                <h3 className={styles.headerTitle}>TU PERMISO Assistant</h3>
                <p className={styles.headerSubtitle}>● En línea</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.closeButton}
              aria-label="Cerrar chat"
            >
              <BiX size={24} color="white" />
            </button>
          </div>

          {/* Messages Container */}
          <div className={styles.messagesContainer}>
            {mensajes.map((mensaje) => (
              <div
                key={mensaje.id}
                className={`${styles.mensaje} ${styles[mensaje.tipo]}`}
              >
                <div className={styles.mensajeBurbujaWrapper}>
                  {mensaje.tipo === 'asistente' && (
                    <div className={styles.avatarAsistente}>
                      <BiBot size={16} />
                    </div>
                  )}
                  <div className={styles.mensajeBurbuja}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: mensaje.contenido,
                      }}
                      className={styles.htmlContent}
                    />
                  </div>
                </div>
                <span className={styles.timestamp}>
                  {mensaje.timestamp.toLocaleTimeString('es-CL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}

            {cargando && (
              <div className={`${styles.mensaje} ${styles.asistente}`}>
                <div className={styles.mensajeBurbujaWrapper}>
                  <div className={styles.avatarAsistente}>
                    <BiBot size={16} />
                  </div>
                  <div className={styles.mensajeBurbuja}>
                    <div className={styles.typing}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={styles.inputArea}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={manejarKeyPress}
              placeholder="Escribe tu pregunta aquí..."
              className={styles.input}
              disabled={cargando}
            />
            <button
              onClick={enviarMensaje}
              disabled={cargando || !inputValue.trim()}
              className={styles.sendButton}
              aria-label="Enviar mensaje"
            >
              <BiSend size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
