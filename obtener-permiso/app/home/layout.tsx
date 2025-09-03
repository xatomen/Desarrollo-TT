import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div 
      className="d-flex flex-column" 
      style={{ 
        height: '100vh',
        maxHeight: '100vh'
      }}
    >
      <Navbar />
      <main 
        className="flex-grow-1" 
      >
        {children}
      </main>
      <div className="footer-container" style={{ position: 'relative', bottom: 0 }}>
        <Footer />
      </div>
    </div>
  );
}
