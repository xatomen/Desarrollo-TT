import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import "@gobdigital-cl/gob.cl/dist/css/gob.cl.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Obtener Permiso de Circulación - Gobierno de Chile",
  description: "Sistema de análisis y métricas para la toma de decisiones",
};

export default function LoginPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <html lang="en">
      <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav className="navbar navbar-light navbar-expand-lg">
          <div className="container">
            <a className="navbar-brand" href="/">
              <i className="fa fa-spinner fa-spin page-loading-icon"></i>
              <img src="img/gob-header.svg" alt="Gobierno de Chile" />
            </a>
            <button 
              className="navbar-toggler collapsed" 
              type="button" 
              data-toggle="collapse" 
              data-target="#navbarLightExampleCollapse" 
              aria-controls="navbarCollapse" 
              aria-expanded="false" 
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="navbar-collapse collapse" id="navbarLightExampleCollapse">
              <ul className="navbar-nav ml-auto">
                <form className="simple-search search">
                  <input 
                    className="form-control" 
                    type="text" 
                    name="search" 
                    placeholder="Buscar" 
                    aria-label="search" 
                    aria-describedby="searchLineAction"
                  />
                  <div className="search-action">
                    <button 
                      className="btn btn-outline-search dom-search-behavior-cancel d-none" 
                      type="button"
                    >
                      <i className="icon cl cl-close"></i>
                    </button>
                    <button 
                      className="btn btn-outline-search" 
                      id="searchLineAction" 
                      type="submit"
                    >
                      <i className="icon cl cl-search"></i>
                    </button>
                  </div>
                </form>
                <li className="nav-item">
                  <a className="nav-link" href="#">Enlace</a>
                </li>
                <li className="nav-item">
                  <a className="btn btn-block btn-primary" href="#">Iniciar sesión</a>
                </li>
                <li className="nav-behavior">
                  <a className="nav-link text-uppercase text-underline" href="#">en</a>
                </li>
                <li className="nav-separator"></li>
                <li className="nav-behavior">
                  <a className="nav-link" href="#">
                    <i className="cl cl-login"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        {children}
        {/* Scripts*/}
      </div>
    // </html>
  );
}