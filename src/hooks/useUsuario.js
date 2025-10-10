import { useCallback, useContext, useState } from 'react';
import Context from "../context/usuarioContext"
import loginService from "../service/LoginService";
export default function useUsuario(){
    // const {jwt,setJwt,permisos,configuraciones,estadoCursoGeneral, setEstadoCursoGeneral} = useContext(Context)
    const {jwt,setJwt,permisos} = useContext(Context)

    const [state,setState] = useState({loading:false,error:false})
    const [stateCreate,setStateCreate] = useState({loading:false,error:false,success:false})
    const [stateUpdate,setStateUpdate] = useState({loading:false,error:false,success:false})
    const [stateDelete,setStateDelete] = useState({loading:false,error:false,success:false})
    const [usuariosTotal, setUsuariosTotal] = useState([]);
    const [usersGerencias,setUsersGerencias] = useState([]);
  
const login = useCallback(async({userName,password},onSuccess) => {
    await loginService({userName,password})
    .then(res => {
        const { accessToken, refreshToken, expiresAt, user,notificacionTicket ,idConsultor} = res;

        console.log("success: ", accessToken);

        window.localStorage.setItem('jwt', accessToken);
        window.localStorage.setItem('refreshToken', refreshToken);
        window.localStorage.setItem('expiresAt', expiresAt);
        window.localStorage.setItem('username', user.username);
        window.localStorage.setItem('nombreSocio', user.socio.nombreComercial);
        window.localStorage.setItem('idsocio', user.socio.id);
        window.localStorage.setItem('idRol', user.idRol);
        window.localStorage.setItem('idUser', user.id);
        window.localStorage.setItem('codRol', user.rol.codigo);
        window.localStorage.setItem("notificacionTicket", JSON.stringify(notificacionTicket));
        window.localStorage.setItem('idConsultor', idConsultor);

        


        setState({ loading: false, error: false });
        setJwt(accessToken);
    })
    .catch(err => {
        window.localStorage.removeItem('jwt');
        window.localStorage.removeItem('refreshToken');
        window.localStorage.removeItem('expiresAt');
        window.localStorage.removeItem('username');
        window.localStorage.removeItem('nombreSocio');
        window.localStorage.removeItem('idsocio');
        window.localStorage.removeItem('idRol');
        window.localStorage.removeItem('idUser');
        window.localStorage.removeItem('codRol');
        window.localStorage.removeItem('notificacionTicket');
        window.localStorage.removeItem('idConsultor');




        setState({ loading: false, error: true });
        logout();
        console.error("error: ", err);
        onSuccess();
    });
}, [setJwt]);


    const logout = useCallback(()=>{
        window.localStorage.removeItem('jwt')
        window.localStorage.removeItem('reset')
         window.localStorage.removeItem('refreshToken');
        window.localStorage.removeItem('expiresAt');
        window.localStorage.removeItem('username');
        window.localStorage.removeItem('nombreSocio');
        window.localStorage.removeItem('idsocio');
        window.localStorage.removeItem('idRol');
        window.localStorage.removeItem('idUser');
        window.localStorage.removeItem('codRol');
        window.localStorage.removeItem('idConsultor');

        setJwt(null)
    },[setJwt])

    
    return{
        isLogged: Boolean(jwt),
        isloginLoading : state.loading,
        hasLoginError : state.error,
        permisos,
        // configuraciones,
        login,
        logout,
        // estadoCursoGeneral, setEstadoCursoGeneral
    }
}