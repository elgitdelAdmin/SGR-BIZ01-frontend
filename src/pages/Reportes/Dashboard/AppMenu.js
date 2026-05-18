import React, { useState,useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import * as Iconsax from "iconsax-react";
import { Badge } from 'primereact/badge';
import {Ripple} from "primereact/ripple";
import "./AppMenu.scss"
import useUsuario from '../../hooks/useUsuario';
import * as constantes from "../../constants/constantes.js";
import {ObtenerMenu} from "../../service/MenuService.js";
import Context from "../../context/usuarioContext.js";
import { useContext } from "react";
const ENDPOINT = constantes.URLAPICONECTA;


const AppSubmenu = (props) => {
    const [activeIndex, setActiveIndex] = useState(null)
    const onMenuItemClick = (event, item, index) => {
        //avoid processing disabled items
        if (item.disabled) {
            event.preventDefault();
            return true;
        }

        //execute command
        if (item.command) {
            item.command({ originalEvent: event, item: item });
        }

        if (index === activeIndex)
            setActiveIndex(null);
        else
            setActiveIndex(index);

        if (props.onMenuItemClick) {
            props.onMenuItemClick({
                originalEvent: event,
                item: item
            });
        }
    }

    const onKeyDown = (event) => {
        if (event.code === 'Enter' || event.code === 'Space'){
            event.preventDefault();
            event.target.click();
        }
    }

    const renderLinkContent = (item) => {
        let submenuIcon = item.items && <i className="pi pi-fw pi-angle-down menuitem-toggle-icon"></i>;
        let badge = item.badge && <Badge value={item.badge} />
        return (
            <React.Fragment>
                {/* <i className={item.icon}></i> */}
                {
                    item.icon?<i>{item.icon}</i>:<i className="pi pi-circle-fill" style={{'fontSize': '8px'}}></i>
                }
                
                <span>{item.label}</span>
                {submenuIcon}
                {badge}
                <Ripple/>
            </React.Fragment>
        );
        
    }

    const renderLink = (item, i) => {
        let content = renderLinkContent(item);

        if (item.to) {
            return (
                // <NavLink aria-label={item.label} onKeyDown={onKeyDown} role="menuitem" className="p-ripple" activeClassName="router-link-active router-link-exact-active" to={item.to} onClick={(e) => onMenuItemClick(e, item, i)} exact target={item.target}>
                <NavLink aria-label={item.label} onKeyDown={onKeyDown} role="menuitem"  className={({isActive})=>(isActive ? 'router-link-active router-link-exact-active' : 'p-ripple')} to={item.to} onClick={(e) => onMenuItemClick(e, item, i)} target={item.target}>
                    {content}
                </NavLink>
            )
        }
        else {
            return (
                <a tabIndex="0" aria-label={item.label} onKeyDown={onKeyDown} role="menuitem" href={item.url} className="p-ripple" onClick={(e) => onMenuItemClick(e, item, i)} target={item.target}>
                    {content}
                </a>
            );
        }
    }

    let items = props.items && props.items.map((item, i) => {
        let active = activeIndex === i;
        let styleClass = classNames(item.badgeStyleClass, {'layout-menuitem-category': props.root, 'active-menuitem': active && !item.to });


        if(props.root) {
            return (
                <li className={styleClass} key={i} role="none">
                    {props.root === true && <React.Fragment>
                        <div className="layout-menuitem-root-text" aria-label={item.label}>{item.label}</div>
                        <AppSubmenu items={item.items} onMenuItemClick={props.onMenuItemClick} />
                    </React.Fragment>}
                </li>
            );
        }
        else {
            if(item.visible)
            {
                return (
                    <li className={styleClass} key={i} role="none">
                        {renderLink(item, i)}
                        <CSSTransition classNames="layout-submenu-wrapper" timeout={{ enter: 1000, exit: 450 }} in={active} unmountOnExit>
                            <AppSubmenu items={item.items} onMenuItemClick={props.onMenuItemClick} />
                        </CSSTransition>
                    </li>
                );
            }
            
        }
    });

    return items?  <ul className={props.className} role="menu">{items}</ul> : null;
}
export const AppMenu = (props) => {
     const { setPermisos } = useContext(Context);
    const [menuZegel, seMenuZegel] = useState([{label: "", items:  []}]);
    const { permisos} = useUsuario();
    const idUser = localStorage.getItem("idUser");
    const codRol = localStorage.getItem("codRol");

    //    useEffect(()=>{
      
    //         const menuitems = [
    //             {
    //                 label: "",
    //                 items: [
    //                      {
    //                         label: "Dashboard",
    //                         icon: <Iconsax.Grid7 set="light" />,
    //                         to: "Dashboard",
    //                         visible:true,
    //                         permiso:"verHome"
    //                     },
    //                     {
    //                         label: "Gestión de Consultores",
    //                         icon: <Iconsax.Grid7 set="light"/>,
    //                         to: "Consultores",
    //                         visible:true,
    //                         permiso:"verHome"
    //                     },
    //                      {
    //                         label: "Gestión de Gestores",
    //                         icon: <Iconsax.Grid7 set="light" />,
    //                         to: "Gestores",
    //                         visible:true,
    //                         permiso:"verHome"
    //                     },
    //                      {
    //                         label: "Gestión de Empresas",
    //                         icon: <Iconsax.Grid7 set="light" />,
    //                         to: "Empresas",
    //                         visible:true,
    //                         permiso:"verHome"
    //                     },
    //                     {
    //                         label: "Gestión de Tickets",
    //                         icon: <Iconsax.Grid7 set="light" />,
    //                         // to: "Gestiontikets",
    //                         to: `Gestiontikets/user/${idUser}/rol/${codRol}`,
    //                         visible:true,
    //                         permiso:"verHome"
    //                     },
    //                     {
    //                         label: "Gestión de Usuarios",
    //                         icon: <Iconsax.Grid7 set="light" />,
    //                         to: "Usuarios",
    //                         visible:true,
    //                         permiso:"verHome"
    //                     },
    //                      {
    //                         label: "Cargabilidad",
    //                         icon: <Iconsax.Grid7 set="light"/>,
    //                         to: "Cargabilidad",
    //                         visible:true,
    //                         permiso:"verHome"
    //                     },
    //                     {
    //                         label: "Oportunidades",
    //                         icon: <Iconsax.Grid7 set="light" />,
    //                         // to: "Dashboard",
    //                         visible:true,
    //                         permiso:"verHome"
    //                     },
    //                      {
    //                         label: "Proyectos",
    //                         icon: <Iconsax.Grid7 set="light" />,
    //                         // to: "Dashboard",
    //                         visible:true,
    //                         permiso:"verHome"
    //                     },
    //                      {
    //                         label: "Planificación",
    //                         icon: <Iconsax.Grid7 set="light" />,
    //                         // to: "Dashboard",
    //                         visible:true,
    //                         permiso:"verHome"
    //                     },
    //                      {
    //                         label: "Horas Extras",
    //                         icon: <Iconsax.Grid7 set="light" />,
    //                         // to: "Dashboard",
    //                         visible:true,
    //                         permiso:"verHome"
    //                     },
    //                     {
    //                         label: "Seguimiento",
    //                         icon: <Iconsax.Grid7 set="light" />,
    //                         // to: "Dashboard",
    //                         visible:true,
    //                         permiso:"verHome"
    //                     },
    //                      {
    //                         label: "Ingreso Horas",
    //                         icon: <Iconsax.Grid7 set="light" />,
    //                         // to: "Dashboard",
    //                         visible:true,
    //                         permiso:"verHome"
    //                     },
    //                       {
    //                         label: "Cargabilidad",
    //                         icon: <Iconsax.Grid7 set="light" />,
    //                         // to: "Dashboard",
    //                         visible:true,
    //                         permiso:"verHome"
    //                     },
                        
    //                 ],
    //             },
    //         ];
    //         seMenuZegel(menuitems)
        
        
    // },[])


//     useEffect(() => {
//     const idRol = localStorage.getItem("idRol");

//     const fetchMenu = async () => {
//         try {
//             const data= await ObtenerMenu();
//             const permisosPorRuta = {};

//             const formattedMenuItems = data.menu.map(item => ({

//                 label: item.nombre,
//                 // icon: <i className={item.icono}></i>, 
//                 icon: <Iconsax.Grid7 set="light" />,
//                 to: item.ruta.includes("tickets") ? `${item.ruta}/user/${idUser}/rol/${codRol}` : item.ruta,
//                 visible: true,
//                 permiso: "verHome" // esto puedes cambiar si tu backend manda permisos
//             }));

//             const menuFormatted = [{
//                 label: "",
//                 items: formattedMenuItems
//             }];
//             seMenuZegel(menuFormatted);
            
//         } catch (error) {
//             console.error("Error al cargar el menú", error);
//         }
//     };

//     fetchMenu();
// }, []);



useEffect(() => {
  const cargarMenu = async () => {
    const data = await ObtenerMenu();
   console.log(data)

    const permisosPorRuta = {};
    const formattedMenuItems = data.menu.map((item) => {
      permisosPorRuta[item.ruta] = {
        divsOcultos: item.divsOcultos || [],
        controlesBloqueados: item.controlesBloqueados || [],
        controlesOcultos: item.controlesOcultos || [],
        divsBloqueados:item.divsBloqueados || [],
      };
      return {
        label: item.nombre,
        icon: <Iconsax.Grid7 set="light" />,
         to: item.ruta.includes("tickets") ? `${item.ruta}/user/${idUser}/rol/${codRol}` : item.ruta,
        visible: true,
        permiso: "verHome"
      };
    });

    seMenuZegel([{ label: "", items: formattedMenuItems }]);
    setPermisos(permisosPorRuta); 
  };

  cargarMenu();
}, []);

    
    return ( 
        <div className="layout-menu-container">
            <AppSubmenu items={menuZegel} className="layout-menu"  onMenuItemClick={props.onMenuItemClick} root={true} role="menu" />
            
        </div>
    );
}
 
