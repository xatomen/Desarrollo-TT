import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import "@gobdigital-cl/gob.cl/dist/css/gob.cl.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Permiso de Circulación",
  description: "Sistema de obtención de permiso de circulación",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Dosis:wght@400;500;600&display=swap" rel="stylesheet"></link>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
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
    </html>
  );
}
