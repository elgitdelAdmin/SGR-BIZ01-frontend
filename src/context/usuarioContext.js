import React, { useDebugValue, useState,useEffect } from 'react';
// import {getPerfil} from "../service/PerfilService";
import { getPermisoUsuario } from '../service/PermisosService';
import { ObtenerConfiguraciones } from '../service/GeneralServices';
import { getPerfil } from '../service/UsuarioService';
// import { Listar } from '../service/ConfiguracionService';
const Context = React.createContext({});

export function UsuarioContextProvider({children}){
    const [perfil,setPerfil] =useState(null);
    const [jwt,setJwt] = useState(()=>window.localStorage.getItem('jwt'))
    const [permisos, setPermisos] = useState([]);
    const [configuraciones, setConfiguraciones] = useState([]);
    const [estadoCursoGeneral, setEstadoCursoGeneral] = useState(0);
    useEffect(()=>{
        if(!jwt) return setPerfil({})
        getPerfil({jwt}).then(setPerfil)
        .catch(err=>{
            window.localStorage.removeItem('jwt')
        })
    },[jwt])

    useEffect(()=>{
        if(!jwt) return setPermisos({})
        getPermisoUsuario({jwt}).then(setPermisos)
        .catch(err=>{
            window.localStorage.removeItem('jwt')
        })
    },[jwt])

    useEffect(()=>{
        if(!jwt) return setConfiguraciones({})
        ObtenerConfiguraciones({jwt}).then(setConfiguraciones)
        .catch(err=>{
            window.localStorage.removeItem('jwt')
        })
    },[jwt])
    return <Context.Provider value = {{
        perfil,
        permisos,
        jwt,
        configuraciones,
        setPerfil,
        setPermisos,
        setJwt,
        setConfiguraciones,
        estadoCursoGeneral, setEstadoCursoGeneral
        }}>
        {children}
    </Context.Provider>
}

export default Context;