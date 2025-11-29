import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, templateType } = await request.json();

    // Validar datos requeridos
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: to, subject, html' },
        { status: 400 }
      );
    }

    // Configurar el mensaje
    const msg = {
      to: to, // Email del destinatario
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: 'TU PERMISO'
      },
      subject: subject,
      html: html,
      // Opcional: agregar tracking
      trackingSettings: {
        clickTracking: {
          enable: true,
        },
        openTracking: {
          enable: true,
        },
      },
    };

    // Enviar el email
    await sgMail.send(msg);

    console.log(`Email enviado exitosamente a: ${to}`);
    console.log(`Plantilla utilizada: ${templateType}`);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Email enviado exitosamente',
        sentTo: to,
        template: templateType 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error enviando email:', error);
    
    return NextResponse.json(
      { 
        error: 'Error enviando email', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}