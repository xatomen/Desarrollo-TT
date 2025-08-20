import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
  title: "Panel de Decisiones - Gobierno de Chile",
  description: "Sistema de análisis y métricas para la toma de decisiones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
        
        {/* Scripts cargados al final del body para evitar problemas de hidratación */}
        <script 
          src="https://code.jquery.com/jquery-3.6.0.min.js"
          integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4="
          crossOrigin="anonymous"
          async
        ></script>
        <script 
          src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"
          integrity="sha384-9/reFTGAW83EW2RDu2S0VKaIzap3H66lZH81PoYlFhbGU+6BZp6G7niu735Sk7lN"
          crossOrigin="anonymous"
          async
        ></script>
        <script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/js/bootstrap.min.js"
          integrity="sha384-+sLIOodYLS7CIrQpBjl+C7nPvqq+FbNUBDunl/OZv93DB7Ln/533i8e/mZXLi/P+"
          crossOrigin="anonymous"
          async
        ></script>
        <script 
          src="https://cdn.jsdelivr.net/npm/@gobdigital-cl/gob.cl@1.6.0/dist/js/gob.cl.min.js"
          async
        ></script>
      </body>
    </html>
  );
}
