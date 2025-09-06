import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { relative } from 'path';

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div 
      style={{ 
        minHeight: '100vh',
        display: 'flex',        // ✅ Agregar display flex
        flexDirection: 'column', // ✅ Dirección vertical
      }}
    >
      <Navbar />
      <div style={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        // alignItems: 'center',
        padding: '2rem', // Espaciado para el contenido
        backgroundColor: '#f3f3f3ff'  // Color de fondo claro
       }}>
        {children}
      </div>
      <Footer />
    </div>
  );
}
