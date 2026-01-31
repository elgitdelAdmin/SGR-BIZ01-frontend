import React, { useDebugValue, useState, useEffect } from 'react';
const Context = React.createContext({});

export function UsuarioContextProvider({ children }) {
    const [perfil, setPerfil] = useState(null);
    const [jwt, setJwt] = useState(() => window.localStorage.getItem('jwt'))
    const [permisos, setPermisos] = useState([]);
    const [configuraciones, setConfiguraciones] = useState([]);
    const [parametros, setParametros] = useState([]);
    const [estadoCursoGeneral, setEstadoCursoGeneral] = useState(0);
    return <Context.Provider value={{
        perfil,
        permisos,
        jwt,
        configuraciones,
        parametros,
        setPerfil,
        setPermisos,
        setJwt,
        setConfiguraciones,
        setParametros,
        estadoCursoGeneral, setEstadoCursoGeneral
    }}>
        {children}
    </Context.Provider>
}

export default Context;