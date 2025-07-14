import React, { useEffect, useState } from "react";
import { Link ,useNavigate} from "react-router-dom";

import"./Topbar.scss"
import useUsuario from "../../hooks/useUsuario";
import * as Iconsax from "iconsax-react";


const TopBar = (props) => {
    const navigate = useNavigate()

    const { logout, isLogged, perfil } = useUsuario();

    const cerrarSesion=(e)=>{
        e.preventDefault();
        logout();
    }

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
        </>) : (
          <div
          style={{
              color: "#2D5B97",
              marginLeft: '20px',
              // fontWeight: 'bold',
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
        Hola,{window.localStorage.getItem("username")}

      </div>

      <div
        className="topbar-salir lg:flex origin-top"
        style={{ color: "#2D5B97", display: "flex", alignItems: "center", cursor: "pointer", gap: '5px' }}
        onClick={cerrarSesion}
      >
        <span>Cerrar sesión</span>
        <Iconsax.LogoutCurve />
      </div>
    </div>
     );
}
 
export default TopBar;