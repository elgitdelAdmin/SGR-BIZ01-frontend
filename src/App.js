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

import Usuario from "./pages/Usuario/Usuario";
import EditarUsuario from "./pages/Usuario/EditarUsuario";
import Profesor from "./pages/Profesor/Profesor";
import EditarProfesor from "./pages/Profesor/EditarProfesor";
import Curso from "./pages/Curso/Curso";
import EditarCurso from "./pages/Curso/EditarCurso";
import EditarUnidad from "./pages/Unidad/EditarUnidad";
import EditarLeccion from "./pages/Leccion/EditarLeccion";
import EditarPreguntas from "./pages/Preguntas/EditarPreguntas";
import EditarMaterial from "./pages/Material/EditarMaterial";
import EditarBiblioteca from "./pages/Biblioteca/EditarBiblioteca";
import Requisito from "./pages/Requisito/EditarRequisito";
import EditarBeneficio from "./pages/Beneficio/EditarBeneficio";
import EditarDisenador from "./pages/Disenador/EditarDisenador";

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
          <TopBar onToggleMenuClick={onToggleMenuClick} layoutColorMode={layoutColorMode} mobileTopbarMenuActive={mobileTopbarMenuActive} onMobileTopbarMenuClick={onMobileTopbarMenuClick} onMobileSubTopbarMenuClick={onMobileSubTopbarMenuClick} ></TopBar>
          <div className="layout-sidebar zv-slider-left" onClick={onSidebarClick}>
              <AppMenu model={[]}onMenuItemClick={onMenuItemClick}  layoutColorMode={layoutColorMode} />
          </div>
          <div className="layout-main-container">
            <div className="layout-main">
                <Routes>
                    <Route path="Usuario" element={<Usuario/>}></Route>
                    <Route path="Usuario/EditarUsuario/:id" element={<EditarUsuario/>}></Route>
                    <Route path="Usuario/CrearUsuario/:IdEmpresa" element={<EditarUsuario/>}></Route>
                    <Route path="Profesor" element={<Profesor/>}></Route>
                    <Route path="EditarProfesor/:id" element={<EditarProfesor/>}></Route>
                    <Route path="Curso" element={<Curso/>}></Route>
                    <Route path="Curso/Crear" element={<EditarCurso/>}></Route>
                    <Route path="Curso/Editar/:id" element={<EditarCurso/>}></Route>
                    <Route path="Curso/Editar/:IDCurso/Unidad/Crear" element={<EditarUnidad/>}></Route>
                    <Route path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad" element={<EditarUnidad/>}></Route>
                    <Route path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad/Leccion/:IDLeccion" element={<EditarLeccion/>}></Route>
                    <Route path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad/Leccion/Crear" element={<EditarLeccion/>}></Route>
                    <Route path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad/Leccion/:IDLeccion/Pregunta/Crear" element={<EditarPreguntas/>}></Route>
                    <Route path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad/Leccion/:IDLeccion/Pregunta/Editar/:IDPregunta" element={<EditarPreguntas/>}></Route>
                    <Route path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad/Leccion/:IDLeccion/Material/Crear" element={<EditarMaterial/>}></Route>
                    <Route path="Curso/Editar/:IDCurso/Unidad/Editar/:IDUnidad/Leccion/:IDLeccion/Material/Editar/:IDMaterial" element={<EditarMaterial/>}></Route>
                    <Route path="Curso/Editar/:IDCurso/Biblioteca/Crear" element={<EditarBiblioteca/>}></Route>
                    <Route path="Curso/Editar/:IDCurso/Biblioteca/Editar/:IDBiblioteca" element={<EditarBiblioteca/>}></Route>
                    <Route path="Curso/Editar/:IDCurso/Requisito/Crear" element={<Requisito/>}></Route>
                    <Route path="Curso/Editar/:IDCurso/Beneficio/Crear" element={<EditarBeneficio/>}></Route>
                    <Route path="Curso/Editar/:IDCurso/Disenador/Crear" element={<EditarDisenador/>}></Route>
                    <Route path="Curso/Editar/:IDCurso/Disenador/Editar/:IDDisenador" element={<EditarDisenador/>}></Route>




                </Routes>
            </div>
          </div>
          <CSSTransition classNames="layout-mask" timeout={{ enter: 200, exit: 200 }} in={mobileMenuActive} unmountOnExit>
                          <div className="layout-mask p-component-overlay"></div>
                      </CSSTransition>
      </div>
    </>
    
  );
}

export default App;
