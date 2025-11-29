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
        <div className="" style={{ alignContent: "center", alignSelf: "center" }}>
          <div className="p-4 m-4 shadow bg-white" style={{ borderRadius: "8px", width: "100%", minWidth: "75vw", maxWidth: "90vw" }}>
            {children}
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
