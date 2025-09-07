// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const links = [
    { href: "/home", label: "Inicio" },
    {
      href: "/home/Registro_de_consultas_propietarios",
      label: "Consultas Propietarios",
    },
    {
      href: "/home/Registro_de_fiscalizacion",
      label: "Fiscalización",
    },
    {
      href: "/home/Registro_de_obtencion_de_permisos",
      label: "Obtención de Permisos",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/home") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout(); // Esto eliminará las cookies
    router.push("/Login"); // Redirigir al login
  };

  return (
    <nav
      className="navbar navbar-light navbar-expand-lg py-3"
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e9ecef",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Brand */}
          <Link
            href="/home"
            className="navbar-brand"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#0d47a1",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "1.1rem",
              fontFamily: "Roboto",
            }}
          >
            <i className="bi bi-speedometer2 me-2 text-primary"></i>
            {/* <img
              src="/img/gob-header.svg"
              alt="Gobierno de Chile"
              style={{ height: 32 }}
            /> */}
            Panel de Decisiones
          </Link>

          {/* Navigation Links */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`btn ${
                  isActive(link.href) ? "btn-primary" : "btn-outline-primary"
                }`}
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  textDecoration: "none",
                  margin: "0 0.25rem",
                  whiteSpace: "nowrap",
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Separador */}
            <div
              style={{
                width: "1px",
                height: "24px",
                backgroundColor: "#dee2e6",
                margin: "0 0.5rem",
              }}
            ></div>

            {/* Información del usuario (opcional) */}
            {/* {user && (
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#6c757d",
                  marginRight: "0.5rem",
                }}
              >
                {user.nombre || user.email || "Usuario"}
              </span>
            )} */}

            {/* Cerrar Sesión */}
            <button
              onClick={handleLogout}
              className="btn btn-outline-secondary"
              style={{
                // fontSize: "0.85rem",
                // border: "none",
                // backgroundColor: "transparent",
                // color: "#6c757d",
              }}
            >
              <i className="fas fa-sign-out-alt me-1"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
