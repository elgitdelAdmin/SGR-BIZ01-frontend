import { useCallback, useContext, useState } from 'react';
import Context from "../context/usuarioContext"
import loginService, { loginStep2 } from "../service/LoginService";

export default function useUsuario(){
    const {jwt,setJwt,permisos} = useContext(Context)

    const [state,setState] = useState({loading:false,error:false})
    const [stateCreate,setStateCreate] = useState({loading:false,error:false,success:false})
    const [stateUpdate,setStateUpdate] = useState({loading:false,error:false,success:false})
    const [stateDelete,setStateDelete] = useState({loading:false,error:false,success:false})
    const [usuariosTotal, setUsuariosTotal] = useState([]);
    const [usersGerencias,setUsersGerencias] = useState([]);
  
    const logout = useCallback(()=>{
        window.localStorage.removeItem('jwt')
        window.localStorage.removeItem('reset')
        window.localStorage.removeItem('refreshToken');
        window.localStorage.removeItem('expiresAt');
        window.localStorage.removeItem('username')
        window.localStorage.removeItem('nombreCompleto')
        window.localStorage.removeItem('nombreSocio');
        window.localStorage.removeItem('nombreRol');
        window.localStorage.removeItem('logoSocio');
        window.localStorage.removeItem('idsocio');
        window.localStorage.removeItem('idRol');
        window.localStorage.removeItem('idUser');
        window.localStorage.removeItem('codRol');
        window.localStorage.removeItem('idConsultor');
        window.localStorage.removeItem("notificacionTicket");

        setJwt(null)
    },[setJwt])

    const saveSessionData = useCallback((res) => {
        const { accessToken, refreshToken, expiresAt, user, notificacionTicket, idConsultor, idRolSeleccionado, idSocioSeleccionado, codRolSeleccionado, nombreSocioSeleccionado, nombreRolSeleccionado, logoSocioSeleccionado } = res;
        window.localStorage.setItem('jwt', accessToken);
        window.localStorage.setItem('refreshToken', refreshToken);
        window.localStorage.setItem('expiresAt', expiresAt);
        window.localStorage.setItem('username', user.username);
        const nombreCompleto = user.persona ? `${user.persona.nombres} ${user.persona.apellidoPaterno}`.trim() : user.username;
        window.localStorage.setItem('nombreCompleto', nombreCompleto);
        window.localStorage.setItem('logoSocio', logoSocioSeleccionado || (user.socio ? user.socio.logo : ''));
        window.localStorage.setItem('nombreSocio', nombreSocioSeleccionado || (user.socio ? user.socio.nombreComercial : ''));
        window.localStorage.setItem('nombreRol', nombreRolSeleccionado || (user.rol ? user.rol.nombre : ''));
        window.localStorage.setItem('idsocio', idSocioSeleccionado || (user.socio ? user.socio.id : ''));
        window.localStorage.setItem('idRol', idRolSeleccionado || user.idRol);
        window.localStorage.setItem('idUser', user.id);
        window.localStorage.setItem('codRol', codRolSeleccionado || (user.rol ? user.rol.codigo : ''));
        window.localStorage.setItem("notificacionTicket", JSON.stringify(notificacionTicket));
        window.localStorage.setItem('idConsultor', idConsultor || '');
        setJwt(accessToken);
    }, [setJwt]);

    const login = useCallback(async({userName,password}) => {
        setState({ loading: true, error: false });
        try {
            const res = await loginService({userName, password});
            if (res.requiereSeleccionRol) {
                setState({ loading: false, error: false });
                return res;
            } else {
                saveSessionData(res);
                setState({ loading: false, error: false });
                return res;
            }
        } catch (err) {
            logout();
            setState({ loading: false, error: true });
            console.error("error: ", err);
            throw err;
        }
    }, [saveSessionData, logout]);

    const completarLogin = useCallback(async ({ idUser, idRol, idSocio, tempToken }) => {
        setState({ loading: true, error: false });
        try {
            const res = await loginStep2({ idUser, idRol, idSocio, tempToken });
            saveSessionData(res);
            setState({ loading: false, error: false });
            return res;
        } catch (err) {
            logout();
            setState({ loading: false, error: true });
            console.error("error step 2: ", err);
            throw err;
        }
    }, [saveSessionData, logout]);

    return{
        isLogged: Boolean(jwt),
        isloginLoading : state.loading,
        hasLoginError : state.error,
        permisos,
        login,
        completarLogin,
        logout,
    }
}