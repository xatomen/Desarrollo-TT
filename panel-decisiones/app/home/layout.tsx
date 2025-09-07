import Navbar from "../components/Navbar";
import HomeHeader from "../components/HomeHeader";
import Footer from "../components/Footer";
import ProtectedRoute from '../components/ProtectedRoute';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#eeededff" }}>
        <Navbar />
        {/* <HomeHeader /> */}
        <div className="m-2" style={{ alignContent: "center", alignSelf: "center" }}>
          <div className="container p-4 m-4 shadow bg-white" style={{ borderRadius: "8px", width: "100%" }}>
            {children}
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
