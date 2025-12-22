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
          console.log("TOGLE")
          setupdateNotifications(!updateNotifications)
          const ids = notificacionTicket.filter(n => !n.leido).map(n => n.id); 
          if (ids.length > 0 && updateNotifications) {
            console.log("TOGLE Leido")
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
        navigate("/Configuracion/CambiarContraseña"); // Cambia esta ruta según tu aplicación
    };

    const handleChangeEmail = () => {
        setShowUserMenu(false);
        navigate("/Configuracion/CambiarEmail"); // Cambia esta ruta según tu aplicación
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

    return ( 
        <div className="layout-topbar" style={{
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            padding: "10px 20px",
            justifyContent: "space-between"
          }}>
      
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {localStorage.getItem("codRol") === "SUPERADMIN" ? (
                    <>
                        <img
                          src="/images/bizlogo.jpg"
                          style={{ height: '40px', objectFit: 'contain' }}
                          alt="Logo"
                          onClick={() => navigate("/Dashboard/Dashboard")}
                        />
                        <img
                          src="/images/bizletra.png"
                          style={{ height: '40px', objectFit: 'contain' }}
                          alt="Letra"
                        />
                    </>
                ) : (
                    <div
                        style={{
                            color: "#2D5B97",
                            marginLeft: '20px',
                            fontSize: '25px' 
                        }}
                    >
                        {window.localStorage.getItem("nombreSocio")}
                    </div>     
                )}
                <button
                    type="button"
                    className="p-link layout-menu-button layout-topbar-button"
                    onClick={props.onToggleMenuClick}
                    style={{ color: "white", backgroundColor: "#007bff" }}
                >
                    <i className="pi pi-bars" />
                </button>
            </div>
    
            <div
                style={{
                    color: "#2D5B97",
                    marginLeft: '20px',
                    fontWeight: 'bold',
                    fontSize: '25px' 
                }}
            >
                Hola, {window.localStorage.getItem("username")}
            </div>

            <div
                className="topbar-notifications"
                style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    gap: "15px",
                }}
            >
                <div onClick={toggleNotifications} style={{ position: "relative" }}>
                    <Iconsax.Notification size="24" />

                    {notificacionTicket.filter(n => !n.leido).length > 0 && lengthNotifications && (
                        <span
                            style={{
                                position: "absolute",
                                top: "-5px",
                                right: "-5px",
                                background: "red",
                                color: "white",
                                borderRadius: "50%",
                                width: "18px",
                                height: "18px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "11px",
                                fontWeight: "bold",
                            }}
                        >
                            {notificacionTicket.filter(n => !n.leido).length}
                        </span>
                    )}
                </div>

                {showNotifications && (
                    <NotificationDropdown
                        notifications={notificacionTicket}
                        onClose={toggleNotifications}
                    />
                )}

                {/* Menú de usuario */}
                <div style={{ position: "relative" }} ref={userMenuRef}>
                    <div onClick={toggleUserMenu} style={{ display: "flex", alignItems: "center" }}>
                        <Iconsax.User size="24" color="#2D5B97" />
                    </div>

                    {showUserMenu && (
                        <div
                            style={{
                                position: "absolute",
                                top: "40px",
                                right: "0",
                                backgroundColor: "#fff",
                                border: "1px solid #ddd",
                                borderRadius: "8px",
                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                minWidth: "200px",
                                zIndex: 1000,
                            }}
                        >
                            <div
                                onClick={handleChangePassword}
                                style={{
                                    padding: "12px 16px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    borderBottom: "1px solid #f0f0f0",
                                    color: "#2D5B97",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                <Iconsax.Lock size="18" />
                                <span>Cambiar contraseña</span>
                            </div>
                              <div
                                onClick={handleChangeEmail}
                                style={{
                                    padding: "12px 16px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    borderBottom: "1px solid #f0f0f0",
                                    color: "#2D5B97",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                <Iconsax.Setting size="18" />
                                <span>Validar Correo</span>
                            </div>
                            <div
                                onClick={cerrarSesion}
                                style={{
                                    padding: "12px 16px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    color: "#2D5B97",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                                <Iconsax.LogoutCurve size="18" />
                                <span>Cerrar sesión</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
 
export default TopBar;

// import React, { useEffect, useState } from "react";
// import { useNavigate,useParams } from "react-router-dom";

// import"./Topbar.scss"
// import useUsuario from "../../hooks/useUsuario";
// import * as Iconsax from "iconsax-react";
// import NotificationDropdown from "../../components/Notification/NotificationDropdown"
// import { MarcarNotificacionComoLeida } from "../../service/NotificationService";


// const TopBar = (props) => {
//     const idUser = localStorage.getItem("idUser");
//     const navigate = useNavigate()
//     const { logout, isLogged, perfil } = useUsuario();
//     const [showNotifications, setShowNotifications] = useState(false);
//     const [updateNotifications, setupdateNotifications] = useState(false);
//     const [lengthNotifications, setlengthNotifications] = useState(true);

// const [notificacionTicket, setNotificacionTicket] = useState(() => {
//   try {
//     const stored = localStorage.getItem("notificacionTicket");
//     return stored ? JSON.parse(stored) : [];
//   } catch (e) {
//     console.error("Error al leer notificacionTicket:", e);
//     return [];
//   }
// });

//     // const [notificacionTicket, setNotificacionTicket] = useState(
//     //   JSON.parse(localStorage.getItem("notificacionTicket")) || []
//     // );
// // const notificacionTicket = JSON.parse(localStorage.getItem("notificacionTicket")) || [];


//     const cerrarSesion=(e)=>{
//         e.preventDefault();
//         logout();
//     }
// ;
//       const toggleNotifications = async () => {
//         try {
//           console.log("TOGLE")
//           setupdateNotifications(!updateNotifications)
//           const ids = notificacionTicket.filter(n => !n.leido).map(n => n.id); 
//           if (ids.length > 0 && updateNotifications) {
//             console.log("TOGLE Leido")
//             await MarcarNotificacionComoLeida(idUser, ids);
//             setupdateNotifications(!updateNotifications)
//             setlengthNotifications(false)
//             // localStorage.setItem("notificacionTicket", JSON.stringify(res.notificacionTicket));
//           }
//           setShowNotifications(!showNotifications);

//         } catch (error) {
//           console.error("Error al marcar notificaciones:", error);
//         }
// };

//     useEffect(() => {
//         if (!isLogged) navigate("/Login")
//     }, [isLogged]);

//     return ( 
       
//          <div className="layout-topbar" style={{
//             backgroundColor: "#fff",
//             display: "flex",
//             alignItems: "center",
//             padding: "10px 20px",
//             justifyContent: "space-between"
//           }}>
      
//       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//         {localStorage.getItem("codRol") === "SUPERADMIN" ? (
//     <>
//         <img
//           src="/images/bizlogo.jpg"
//           style={{ height: '40px', objectFit: 'contain' }}
//           alt="Logo"
//           onClick={() => navigate("/Dashboard/Dashboard")}
//         />
//         <img
//           src="/images/bizletra.png"
//           style={{ height: '40px', objectFit: 'contain' }}
//           alt="Letra"
//         />
//         </>) : (
//           <div
//           style={{
//               color: "#2D5B97",
//               marginLeft: '20px',
//               // fontWeight: 'bold',
//               fontSize: '25px' 
//           }}
//           >
//          {window.localStorage.getItem("nombreSocio")}
//       </div>     
//         )}
//          <button
//         type="button"
//         className="p-link layout-menu-button layout-topbar-button"
//         onClick={props.onToggleMenuClick}
//         style={{ color: "white", backgroundColor: "#007bff" }}
//           >
//             <i className="pi pi-bars" />
//           </button>
         
//     </div>
    
     
//       <div
//         style={{
//             color: "#2D5B97",
//             marginLeft: '20px',
//             fontWeight: 'bold',
//             fontSize: '25px' 
//         }}
//         >
//         Hola,{window.localStorage.getItem("username")}

//       </div>
//       <div
//         className="topbar-notifications"
//         style={{
//           display: "flex",
//           alignItems: "center",
//           cursor: "pointer",
//           gap: "15px",
//         }}
//       >
//         {/* <div onClick={toggleNotifications}>
//           <Iconsax.Notification />
//         </div>

//         {showNotifications && (
//           <NotificationDropdown
//             notifications={notificacionTicket}
//             onClose={toggleNotifications}
//           />
//         )} */}
//   <div onClick={toggleNotifications} style={{ position: "relative" }}>
//     <Iconsax.Notification size="24" />

//     {notificacionTicket.filter(n => !n.leido).length > 0 && lengthNotifications && (
//       <span
//         style={{
//           position: "absolute",
//           top: "-5px",
//           right: "-5px",
//           background: "red",
//           color: "white",
//           borderRadius: "50%",
//           width: "18px",
//           height: "18px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontSize: "11px",
//           fontWeight: "bold",
//         }}
//       >
//         {notificacionTicket.filter(n => !n.leido).length}
//       </span>
//     )}
//   </div>

//   {showNotifications && (
//     <NotificationDropdown
//       notifications={notificacionTicket}
//       onClose={toggleNotifications}
//     />
//   )}


//         <div
//           className="topbar-salir lg:flex origin-top"
//           style={{
//             color: "#2D5B97",
//             display: "flex",
//             alignItems: "center",
//             cursor: "pointer",
//             gap: "5px",
//           }}
//           onClick={cerrarSesion}
//         >
//           <span>Cerrar sesión</span>
//           <Iconsax.LogoutCurve />
//         </div>
//       </div>
//     </div>
//      );
// }
 
// export default TopBar;