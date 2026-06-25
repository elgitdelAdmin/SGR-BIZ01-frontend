import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import "./Topbar.scss"
import useUsuario from "../../hooks/useUsuario";
import * as Iconsax from "iconsax-react";
import NotificationDropdown from "../../components/Notification/NotificationDropdown"
import { MarcarNotificacionComoLeida } from "../../service/NotificationService";


const TopBar = (props) => {
    const idUser = localStorage.getItem("idUser");
    const navigate = useNavigate()
    const { logout, isLogged, perfil } = useUsuario();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [updateNotifications, setupdateNotifications] = useState(false);
    const [lengthNotifications, setlengthNotifications] = useState(true);
    const userMenuRef = useRef(null);

    const [notificacionTicket, setNotificacionTicket] = useState(() => {
      try {
        const stored = localStorage.getItem("notificacionTicket");
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error("Error al leer notificacionTicket:", e);
        return [];
      }
    });

    const cerrarSesion = (e) => {
        e.preventDefault();
        logout();
    };

    const toggleNotifications = async () => {
        try {
          setupdateNotifications(!updateNotifications)
          const ids = notificacionTicket.filter(n => !n.leido).map(n => n.id);
          if (ids.length > 0 && updateNotifications) {
            await MarcarNotificacionComoLeida(idUser, ids);
            setupdateNotifications(!updateNotifications)
            setlengthNotifications(false)
          }
          setShowNotifications(!showNotifications);
        } catch (error) {
          console.error("Error al marcar notificaciones:", error);
        }
    };

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    const handleChangePassword = () => {
        setShowUserMenu(false);
        navigate("/Configuracion/CambiarContraseña");
    };

    const handleChangeEmail = () => {
        setShowUserMenu(false);
        navigate("/Configuracion/CambiarEmail");
    };

    // Cerrar el menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);

    useEffect(() => {
        if (!isLogged) navigate("/Login")
    }, [isLogged]);

    // Helpers
    const nombreCompleto = window.localStorage.getItem("nombreCompleto") || window.localStorage.getItem("username") || "U";
    const nombreRol     = window.localStorage.getItem("nombreRol") || window.localStorage.getItem("codRol") || "";

    const getInitials = (name) => {
        const parts = name.trim().split(" ").filter(Boolean);
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const unreadCount = notificacionTicket.filter(n => !n.leido).length;

    return (
        <div className="layout-topbar">

            {/* ── Left: Brand + Hamburger ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {localStorage.getItem("codRol") === "SUPERADMIN" ? (
                    <>
                        <img
                            src="/images/bizlogo.jpg"
                            style={{ height: "40px", objectFit: "contain", cursor: "pointer" }}
                            alt="Logo"
                            onClick={() => navigate("/Dashboard/Dashboard")}
                        />
                        <img
                            src="/images/bizletra.png"
                            style={{ height: "40px", objectFit: "contain" }}
                            alt="Letra"
                        />
                    </>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", marginLeft: "8px" }}>
                        {window.localStorage.getItem("logoSocio") ? (
                            <img
                                src={window.localStorage.getItem("logoSocio")}
                                alt={window.localStorage.getItem("nombreSocio")}
                                style={{ height: "40px", maxWidth: "130px", objectFit: "contain" }}
                            />
                        ) : (
                            <span style={{
                                color: "#2e4878",
                                fontSize: "22px",
                                fontWeight: "700",
                                fontFamily: "Poppins, sans-serif",
                                letterSpacing: "-0.3px"
                            }}>
                                {window.localStorage.getItem("nombreSocio")}
                            </span>
                        )}
                    </div>
                )}

                {/* Hamburger */}
                <button
                    type="button"
                    className="p-link layout-menu-button layout-topbar-button"
                    onClick={props.onToggleMenuClick}
                    style={{
                        color: "#0e71ae",
                        backgroundColor: "#d0e5f0",
                        borderRadius: "8px",
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "none",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        flexShrink: 0
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#b2d6ea"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#d0e5f0"}
                >
                    <Iconsax.HambergerMenu size="22" color="#0e71ae" />
                </button>
            </div>

            {/* ── Center: Greeting ── */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                    color: "#2e4878",
                    fontWeight: "700",
                    fontSize: "20px",
                    fontFamily: "Poppins, sans-serif",
                    lineHeight: 1.2
                }}>
                    Hola, {nombreCompleto}
                </div>
                <div style={{
                    color: "#9198a7",
                    fontSize: "12px",
                    fontWeight: "600",
                    marginTop: "2px",
                    letterSpacing: "0.3px",
                    textTransform: "uppercase"
                }}>
                    {nombreRol}
                </div>
            </div>

            {/* ── Right: Notifications + User Menu ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

                {/* Notification bell */}
                <div style={{ position: "relative" }}>
                    <div
                        onClick={toggleNotifications}
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            backgroundColor: showNotifications ? "#b2d6ea" : "#d0e5f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background-color 0.2s",
                            cursor: "pointer"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#b2d6ea"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showNotifications ? "#b2d6ea" : "#d0e5f0"}
                    >
                        <div className={unreadCount > 0 && lengthNotifications ? "bell-active-animation" : ""} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Iconsax.Notification size="20" color="#0e71ae" variant={showNotifications || unreadCount > 0 ? "Bold" : "Linear"} />
                        </div>
                    </div>
                    {unreadCount > 0 && lengthNotifications && (
                        <span 
                            className="badge-active-pulse"
                            style={{
                                position: "absolute",
                                top: "-4px",
                                right: "-4px",
                                background: "linear-gradient(135deg, #ff6b6b, #dd4b39)",
                                color: "white",
                                borderRadius: "50%",
                                width: "18px",
                                height: "18px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "10px",
                                fontWeight: "700",
                                border: "2px solid #fff",
                                lineHeight: 1,
                                pointerEvents: "none"
                            }}
                        >
                            {unreadCount}
                        </span>
                    )}

                    {/* Dropdown anchored inside the relative wrapper */}
                    {showNotifications && (
                        <NotificationDropdown
                            notifications={notificacionTicket}
                            onClose={toggleNotifications}
                        />
                    )}
                </div>

                {/* ── User Avatar + Dropdown ── */}
                <div style={{ position: "relative" }} ref={userMenuRef}>
                    <button
                        onClick={toggleUserMenu}
                        title={nombreCompleto}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: showUserMenu ? "#d0e5f0" : "transparent",
                            border: "1.5px solid #d0e5f0",
                            borderRadius: "8px",
                            padding: "4px 10px 4px 6px",
                            cursor: "pointer",
                            transition: "background 0.2s, border-color 0.2s",
                            height: "40px"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#d0e5f0"; e.currentTarget.style.borderColor = "#0e71ae"; }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = showUserMenu ? "#d0e5f0" : "transparent";
                            e.currentTarget.style.borderColor = "#d0e5f0";
                        }}
                    >
                        {/* Avatar circle with initials */}
                        <div style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            backgroundColor: "#2e4878",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: "700",
                            fontFamily: "Poppins, sans-serif",
                            flexShrink: 0,
                            letterSpacing: "0.5px"
                        }}>
                            {getInitials(nombreCompleto)}
                        </div>
                        <Iconsax.ArrowDown2
                            size="14"
                            color="#2e4878"
                            style={{
                                transition: "transform 0.2s",
                                transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)"
                            }}
                        />
                    </button>

                    {/* Dropdown panel */}
                    {showUserMenu && (
                        <div style={{
                            position: "absolute",
                            top: "calc(100% + 8px)",
                            right: "0",
                            backgroundColor: "#fff",
                            border: "1px solid #e8edf4",
                            borderRadius: "12px",
                            boxShadow: "0 8px 24px rgba(46,72,120,0.13)",
                            minWidth: "220px",
                            zIndex: 1000,
                            overflow: "hidden",
                            animation: "fadeSlideDown 0.15s ease"
                        }}>

                            {/* Header info */}
                            <div style={{
                                padding: "14px 16px 12px",
                                borderBottom: "1px solid #f0f4f8",
                                background: "#f8f9fa"
                            }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px"
                                }}>
                                    <div style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "50%",
                                        backgroundColor: "#2e4878",
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "13px",
                                        fontWeight: "700",
                                        fontFamily: "Poppins, sans-serif",
                                        flexShrink: 0
                                    }}>
                                        {getInitials(nombreCompleto)}
                                    </div>
                                    <div>
                                        <div style={{
                                            color: "#2e4878",
                                            fontWeight: "700",
                                            fontSize: "13px",
                                            fontFamily: "Poppins, sans-serif",
                                            lineHeight: 1.3
                                        }}>
                                            {nombreCompleto}
                                        </div>
                                        <div style={{
                                            color: "#9198a7",
                                            fontSize: "11px",
                                            fontWeight: "600",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.4px",
                                            marginTop: "2px"
                                        }}>
                                            {nombreRol}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu items */}
                            <div style={{ padding: "6px 0" }}>
                                <UserMenuItem
                                    icon={<Iconsax.Lock size="16" color="#0e71ae" />}
                                    label="Cambiar contraseña"
                                    onClick={handleChangePassword}
                                />
                                <UserMenuItem
                                    icon={<Iconsax.Sms size="16" color="#0e71ae" />}
                                    label="Validar correo"
                                    onClick={handleChangeEmail}
                                />
                            </div>

                            {/* Footer: Cerrar sesión */}
                            <div style={{ borderTop: "1px solid #f0f4f8", padding: "6px 0" }}>
                                <UserMenuItem
                                    icon={<Iconsax.LogoutCurve size="16" color="#dd4b39" />}
                                    label="Cerrar sesión"
                                    labelColor="#dd4b39"
                                    hoverBg="#fff5f5"
                                    onClick={cerrarSesion}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


/** Reusable menu item row */
const UserMenuItem = ({ icon, label, onClick, labelColor = "#2e4878", hoverBg = "#f0f7ff" }) => {
    const [hover, setHover] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                padding: "9px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: hover ? hoverBg : "transparent",
                transition: "background-color 0.15s",
                borderRadius: "0"
            }}
        >
            {icon}
            <span style={{
                color: labelColor,
                fontSize: "13px",
                fontWeight: "600",
                fontFamily: "Inter, sans-serif"
            }}>
                {label}
            </span>
        </div>
    );
};

export default TopBar;