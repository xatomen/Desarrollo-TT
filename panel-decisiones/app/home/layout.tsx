import Navbar from "../components/Navbar";
import HomeHeader from "../components/HomeHeader";
import Footer from "../components/Footer";
import ProtectedRoute from '../components/ProtectedRoute';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
    <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <HomeHeader />
        <main className="flex-grow-1">
          <div className="container py-3">{children}</div>
        </main>
      <Footer />
    </div>
    </ProtectedRoute>
  );
}
