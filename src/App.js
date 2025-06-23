import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { Route, Routes, BrowserRouter, useLocation } from "react-router-dom";

import { CSSTransition } from "react-transition-group";
import "primereact/resources/primereact.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "prismjs/themes/prism-coy.css";
import "./assets/demo/flags/flags.css";
import "./assets/demo/Demos.scss";
// import "./assets/layout/layout.scss";
import logo from './logo.svg';
import './App.scss';
import TopBar from './pages/Dashboard/Topbar';
import { AppMenu } from './pages/Dashboard/AppMenu';
import useUsuario from "./hooks/useUsuario";
import PrimeReact from "primereact/api";

import  Dashboard  from "./pages/Dashboard/Dashboard"
import  Consultores  from "./pages/Consultores/Consultores"
import  EditarConsultor from "./pages/Consultores/EditarConsultor";
import  Gestores  from "./pages/Gestores/Gestores"
import  EditarGestor from "./pages/Gestores/EditarGestor";
import  Empresas  from "./pages/Empresas/Empresas"
import  EditarEmpresa from "./pages/Empresas/EditarEmpresa";
import  Gestiontikets  from "./pages/Gestiontikets/Gestiontikets"
import  Editar from "./pages/Gestiontikets/Editar";
import  Cargabilidad from "./pages/Cargabilidad/Cargabilidad"
import  Usuarios  from "./pages/Usuarios/Usuarios"
import  EditarUsuario from "./pages/Usuarios/EditarUsuario";

function App() {
  const [layoutMode, setLayoutMode] = useState("static");
    const [layoutColorMode, setLayoutColorMode] = useState("light");
    const [inputStyle, setInputStyle] = useState("outlined");
  const { isloginLoading, hasLoginError, login, isLogged,permisosMenu} = useUsuario();
  const [ripple, setRipple] = useState(true);
  const [staticMenuInactive, setStaticMenuInactive] = useState(false);
  const [overlayMenuActive, setOverlayMenuActive] = useState(false);
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const [mobileTopbarMenuActive, setMobileTopbarMenuActive] = useState(false);
  PrimeReact.ripple = true;

  let menuClick = false;
  let mobileTopbarMenuClick = false;
  useEffect(() => {
    if (mobileMenuActive) {
        addClass(document.body, "body-overflow-hidden");
    } else {
        removeClass(document.body, "body-overflow-hidden");
    }
}, [mobileMenuActive]);


const isDesktop = () => {
    return window.innerWidth >= 992;
};

  const onWrapperClick = (event) => {
    if (!menuClick) {
        setOverlayMenuActive(false);
        setMobileMenuActive(false);
    }

    if (!mobileTopbarMenuClick) {
        setMobileTopbarMenuActive(false);
    }

    mobileTopbarMenuClick = false;
    menuClick = false;
};

const onMobileTopbarMenuClick = (event) => {
  mobileTopbarMenuClick = true;

  setMobileTopbarMenuActive((prevState) => !prevState);
  event.preventDefault();
};

const onMobileSubTopbarMenuClick = (event) => {
  mobileTopbarMenuClick = true;

  event.preventDefault();
};
const onToggleMenuClick = (event) => {
  menuClick = true;

  if (isDesktop()) {
      if (layoutMode === "overlay") {
          if (mobileMenuActive === true) {
              setOverlayMenuActive(true);
          }

          setOverlayMenuActive((prevState) => !prevState);
          setMobileMenuActive(false);
      } else if (layoutMode === "static") {
          setStaticMenuInactive((prevState) => !prevState);
      }
  } else {
      setMobileMenuActive((prevState) => !prevState);
  }

  event.preventDefault();
};

const addClass = (element, className) => {
  if (element.classList) element.classList.add(className);
  else element.className += " " + className;
};

const removeClass = (element, className) => {
  if (element.classList) element.classList.remove(className);
  else element.className = element.className.replace(new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
};
  const wrapperClass = classNames("layout-wrapper", {
    "layout-overlay": layoutMode === "overlay",
        "layout-static": layoutMode === "static",
        "layout-static-sidebar-inactive": staticMenuInactive && layoutMode === "static",
        "layout-overlay-sidebar-active ": overlayMenuActive && layoutMode === "overlay",
        "layout-mobile-sidebar-active peva-menu-overlay-active": mobileMenuActive,
        "p-input-filled": inputStyle === "filled",
        "p-ripple-disabled": ripple === false,
        "layout-theme-light": layoutColorMode === "light",
  });

  const onMenuItemClick = (event) => {
    if (!event.item.items) {
        setOverlayMenuActive(false);
        setMobileMenuActive(false);
    }
};

const onSidebarClick = () => {
  menuClick = true;
};
 return (
     <>
       <div className={wrapperClass} onClick={onWrapperClick}>
         <TopBar
           onToggleMenuClick={onToggleMenuClick}
           layoutColorMode={layoutColorMode}
           mobileTopbarMenuActive={mobileTopbarMenuActive}
           onMobileTopbarMenuClick={onMobileTopbarMenuClick}
           onMobileSubTopbarMenuClick={onMobileSubTopbarMenuClick}
         ></TopBar>
         <div className="layout-sidebar zv-slider-left" onClick={onSidebarClick}>
           <AppMenu
             model={[]}
             onMenuItemClick={onMenuItemClick}
             layoutColorMode={layoutColorMode}
           />
         </div>
         <div className="layout-main-container">
           <div className="layout-main">
             <Routes>
               <Route path="Dashboard" element={<Dashboard />}></Route>
 
               <Route path="Consultores" element={<Consultores />}></Route>
               <Route path="Consultores/CrearConsultor" element={<EditarConsultor/>}></Route>
               <Route path="Consultores/Editar/:id" element={<EditarConsultor />}></Route>
 
               <Route path="Gestiontikets" element={<Gestiontikets />}></Route>
               <Route path="Gestiontikets/Crear" element={<Editar/>}></Route>
               <Route path="Gestiontikets/Editar/:id" element={<Editar />}></Route>
 
               <Route path="Gestores" element={<Gestores/>}></Route>
               <Route path="Gestores/CrearGestor" element={<EditarGestor/>}></Route>
               <Route path="Gestores/EditarGestor/:id" element={<EditarGestor />}></Route>
 
               <Route path="Empresas" element={<Empresas/>}></Route>
               <Route path="Empresas/CrearEmpresa" element={<EditarEmpresa/>}></Route>
               <Route path="Empresas/EditarEmpresa/:id" element={<EditarEmpresa />}></Route>
 
               <Route path="Usuarios" element={<Usuarios/>}></Route>
               <Route path="Usuarios/CrearUsuario" element={<EditarUsuario/>}></Route>
               <Route path="Usuarios/EditarUsuario/:id" element={<EditarUsuario />}></Route>
 
 
               <Route path="Cargabilidad" element={<Cargabilidad />}></Route>
 
 
               <Route path="Usuario" element={<Usuario />}></Route>
               <Route
                 path="Usuario/EditarUsuario/:id"
                 element={<EditarUsuario />}
               ></Route>
               <Route
                 path="Usuario/CrearUsuario/:IdEmpresa"
                 element={<EditarUsuario />}
               ></Route>
               
           
               <Route path="Curso" element={<Curso />}></Route>
               <Route path="Curso/Crear" element={<EditarCurso />}></Route>
               <Route path="Curso/Editar/:id" element={<EditarCurso />}></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Unidad/Crear"
                 element={<EditarUnidad />}
               ></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad"
                 element={<EditarUnidad />}
               ></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad/Leccion/:IDLeccion"
                 element={<EditarLeccion />}
               ></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad/Leccion/Crear"
                 element={<EditarLeccion />}
               ></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad/Pregunta/Crear"
                 element={<EditarPreguntas />}
               ></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad/Pregunta/Editar/:IDPregunta"
                 element={<EditarPreguntas />}
               ></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad/Pregunta/Editar/:IDPregunta/CrearRespuesta"
                 element={<CrearRespuesta />}
               ></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad/Pregunta/Editar/:IDPregunta/EditarRespuesta/:IdRespuesta"
                 element={<CrearRespuesta />}
               ></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad/Leccion/:IDLeccion/Material/Crear"
                 element={<EditarMaterial />}
               ></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad/Leccion/:IDLeccion/Material/Editar/:IDMaterial"
                 element={<EditarMaterial />}
               ></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Biblioteca/Crear"
                 element={<EditarBiblioteca />}
               ></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Biblioteca/Editar/:IDBiblioteca"
                 element={<EditarBiblioteca />}
               ></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Requisito/Crear"
                 element={<Requisito />}
               ></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Beneficio/Crear"
                 element={<EditarBeneficio />}
               ></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Disenador/Crear"
                 element={<EditarDisenador />}
               ></Route>
               <Route
                 path="Curso/Editar/:IDCurso/Disenador/Editar/:IDDisenador"
                 element={<EditarDisenador />}
               ></Route>
               <Route path="Programa" element={<Programa />}></Route>
               <Route path="Programa/Crear" element={<EditarPrograma />}></Route>
               <Route
                 path="Programa/Editar/:id"
                 element={<EditarPrograma />}
               ></Route>
               <Route
                 path="Usuario/EditarUsuario/:IDUsuario/AsignarCurso/Crear"
                 element={<AsignarCurso />}
               ></Route>
               <Route
                 path="Usuario/EditarUsuario/:IDUsuario/AsignarCurso/:IdPersonaCurso"
                 element={<AsignarCurso />}
               ></Route>
               <Route
                 path="Usuario/EditarUsuario/:IDUsuario/AsignarCurso/:IdPersonaCurso/VerIntentos/:IdPersonaCurso"
                 element={<UsuarioIntentos />}
               ></Route>
               <Route
                 path="Usuario/EditarUsuario/:IDUsuario/AsignarPrograma/Crear"
                 element={<AsignarPrograma />}
               ></Route>
               <Route
                 path="Usuario/EditarUsuario/:IDUsuario/AsignarPrograma/:IdPersonaPrograma"
                 element={<AsignarPrograma />}
               ></Route>
               <Route
                 path="ImportarUsuario"
                 element={<ImportarUsuarios />}
               ></Route>
               <Route path="ImportarCurso" element={<ImportarCurso />}></Route>
               {/* <Route
                 path="CargarArchivos/:nombreCarpeta"
                 element={<CargaArchivos />}
               ></Route> */}
               <Route
                 path="CargarArchivos"
                 element={<DirectorioArchivos />}
               ></Route>
             </Routes>
           </div>
         </div>
         <CSSTransition
           classNames="layout-mask"
           timeout={{ enter: 200, exit: 200 }}
           in={mobileMenuActive}
           unmountOnExit
         >
           <div className="layout-mask p-component-overlay"></div>
         </CSSTransition>
       </div>
     </>
   );
}
