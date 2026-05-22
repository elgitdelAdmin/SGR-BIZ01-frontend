import React, { useDebugValue, useState, useEffect } from 'react';
const Context = React.createContext({});

export function UsuarioContextProvider({ children }) {
    const [perfil, setPerfil] = useState(null);
    const [jwt, setJwt] = useState(() => window.localStorage.getItem('jwt'))
    const [permisos, setPermisos] = useState([]);
    const [configuraciones, setConfiguraciones] = useState([]);
    const [parametros, setParametros] = useState([]);
    const [estadoCursoGeneral, setEstadoCursoGeneral] = useState(0);

    // Datos maestros globales
    const [consultores, setConsultores] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [tickets, setTickets] = useState([]);

    return <Context.Provider value={{
        perfil,
        permisos,
        jwt,
        configuraciones,
        parametros,
        estadoCursoGeneral, setEstadoCursoGeneral,
        setPerfil,
        setPermisos,
        setJwt,
        setConfiguraciones,
        setParametros,
        consultores, setConsultores,
        empresas, setEmpresas,
        tickets, setTickets
    }}>
        {children}
    </Context.Provider>
}

export default Context;