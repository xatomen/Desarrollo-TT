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
        position: 'relative'
      }}
    >
      <Navbar />
      <div style={{ flex: 1 }}>
        {children}
      </div>
      <Footer />
    </div>
  );
}
