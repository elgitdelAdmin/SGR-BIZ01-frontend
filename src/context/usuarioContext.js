import React, { useDebugValue, useState,useEffect } from 'react';
// import {getPerfil} from "../service/PerfilService";
import { getPermisoUsuario } from '../service/PermisosService';
// import { Listar } from '../service/ConfiguracionService';
const Context = React.createContext({});

export function UsuarioContextProvider({children}){
    const [perfil,setPerfil] =useState(null);
    const [jwt,setJwt] = useState(()=>window.localStorage.getItem('jwt'))
    const [permisos, setPermisos] = useState([]);
    const [configuraciones, setConfiguraciones] = useState([]);
    // useEffect(()=>{
    //     if(!jwt) return setPerfil({})
    //     getPerfil({jwt}).then(setPerfil)
    //     .catch(err=>{
    //         window.localStorage.removeItem('jwt')
    //     })
    // },[jwt])

    useEffect(()=>{
        if(!jwt) return setPermisos({})
        getPermisoUsuario({jwt}).then(setPermisos)
        .catch(err=>{
            window.localStorage.removeItem('jwt')
        })
    },[jwt])

    // useEffect(()=>{
    //     if(!jwt) return setConfiguraciones({})
    //     Listar({jwt}).then(setConfiguraciones)
    //     .catch(err=>{
    //         window.localStorage.removeItem('jwt')
    //     })
    // },[jwt])
    return <Context.Provider value = {{
        perfil,
        permisos,
        jwt,
        configuraciones,
        setPerfil,
        setPermisos,
        setJwt,
        setConfiguraciones
        }}>
        {children}
    </Context.Provider>
}

export default Context;