import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@gobdigital-cl/gob.cl/dist/css/gob.cl.css";
// import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import AuthProvider from '../contexts/AuthContext';

const inter = Inter({ subsets: ["latin"] });

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
      <head>        
        {/* Scripts cargados al final del body */}
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
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
