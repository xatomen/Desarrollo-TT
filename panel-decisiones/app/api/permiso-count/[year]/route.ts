import { NextRequest, NextResponse } from 'next/server';
import API_CONFIG from '@/config/apis';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  let year: string | undefined;
  try {
    ({ year } = await params);
    
    // Validar que el año sea un número válido
    if (!year || isNaN(Number(year))) {
      return NextResponse.json(
        { error: 'Año inválido' },
        { status: 400 }
      );
    }

    // Hacer la petición al servicio interno
    const response = await fetch(`https://api.jorgegallardo.studio/tgr/permiso_count/${year}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Devolver la respuesta con headers CORS apropiados
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error(`Error en proxy permiso-count para año ${year}:`, error);
    
    // Devolver error real sin fallback
    return NextResponse.json(
      { error: 'Error al conectar con el servicio de permisos' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

// Manejar requests OPTIONS para preflight CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}