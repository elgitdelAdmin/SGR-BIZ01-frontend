import React, { useEffect, useState } from "react";
import { Link ,useNavigate} from "react-router-dom";

import"./Topbar.scss"
import useUsuario from "../../hooks/useUsuario";

const TopBar = (props) => {
    const navigate = useNavigate()

    const { logout, isLogged, perfil } = useUsuario();

    const cerrarSesion=(e)=>{
        e.preventDefault();
        logout();
    }

    useEffect(() => {
        //if (!isLogged) window.location = "#/";
        if (!isLogged) navigate("/Login")
    }, [isLogged]);

    return ( 
        <div className="layout-topbar" style={{backgroundColor:"#222222"}}>
                <button type="button" className="p-link  layout-menu-button layout-topbar-button" onClick={props.onToggleMenuClick}>
                    <i className="pi pi-bars" />
                </button>
                <div className="topbar-salir lg:flex origin-top" style={{color:"#ffffff"}}>
                    <span style={{cursor:"pointer"}} onClick={cerrarSesion}>Salir</span>
                </div>
        </div>
     );
}
 
export default TopBar;