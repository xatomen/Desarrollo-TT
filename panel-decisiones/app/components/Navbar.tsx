// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/Home", label: "Dashboard" },
    {
      href: "/Home/Registro_de_consultas_propietarios",
      label: "Consultas Propietarios",
    },
    {
      href: "/Home/Registro_de_fiscalizacion",
      label: "Fiscalización",
    },
    {
      href: "/Home/Registro_de_obtencion_de_permisos",
      label: "Obtención de Permisos",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/Home") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="navbar navbar-light navbar-expand-lg"
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
            href="/Home"
            className="navbar-brand"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#0d47a1",
              textDecoration: "none",
              fontWeight: "700",
              fontSize: "1.1rem",
            }}
          >
            <img
              src="/img/gob-header.svg"
              alt="Gobierno de Chile"
              style={{ height: 32 }}
            />
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

            {/* Cerrar Sesión */}
            <Link
              href="/Login"
              className="btn btn-outline-secondary btn-sm"
              style={{
                textDecoration: "none",
                fontSize: "0.85rem",
              }}
            >
              <i className="fas fa-sign-out-alt me-1"></i>
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
