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
  title: "Panel de Decisiones - Gobierno de Chile",
  description: "Sistema de análisis y métricas para la toma de decisiones",
};

export default function LoginPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Login mantiene su propio navbar simple */}
      <nav className="navbar navbar-light navbar-expand-lg">
        <div className="container">
          <a className="navbar-brand" href="/">
            <img src="/img/gob-header.svg" alt="Gobierno de Chile" />
          </a>
          <div className="navbar-collapse">
            <ul className="navbar-nav ml-auto">
            </ul>
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}
