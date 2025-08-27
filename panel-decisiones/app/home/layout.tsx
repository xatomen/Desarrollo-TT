import Navbar from "../components/Navbar";
import HomeHeader from "../components/HomeHeader";
import Footer from "../components/Footer";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    // Este wrapper hace que el footer quede pegado abajo y no se “corte”.
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <HomeHeader />

      {/* Agregamos container al contenido del Home */}
      <main className="flex-grow-1">
        <div className="container py-3">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
