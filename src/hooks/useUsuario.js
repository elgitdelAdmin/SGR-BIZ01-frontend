import { useCallback, useContext, useState } from 'react';
import Context from "../context/usuarioContext"
import loginService from "../service/LoginService";
export default function useUsuario(){
    // const {jwt,setJwt,permisos,configuraciones,estadoCursoGeneral, setEstadoCursoGeneral} = useContext(Context)
    const {jwt,setJwt} = useContext(Context)

    const [state,setState] = useState({loading:false,error:false})
    const [stateCreate,setStateCreate] = useState({loading:false,error:false,success:false})
    const [stateUpdate,setStateUpdate] = useState({loading:false,error:false,success:false})
    const [stateDelete,setStateDelete] = useState({loading:false,error:false,success:false})
    const [usuariosTotal, setUsuariosTotal] = useState([]);
    const [usersGerencias,setUsersGerencias] = useState([]);
    // const login = useCallback(async({userName,password},onSuccess) => {
    //     await loginService({userName,password})
    //     .then(res=> {
    //         const {token,change} = res
    //         console.log("success: "+token);
    //         window.localStorage.setItem('jwt',token)
    //         window.localStorage.setItem('reset',change)
    //         setState({loading:false,error:false})
    //         setJwt(token)
    //     })
    //     .catch(err=>{
    //         window.localStorage.removeItem('jwt')
    //         window.localStorage.removeItem('reset')
    //         setState({loading:false,error:true})
    //         logout();
    //         console.error("error: "+err);
    //         onSuccess()
    //     })
    // },[setJwt])
const login = useCallback(async({userName,password},onSuccess) => {
    await loginService({userName,password})
    .then(res => {
        const { accessToken, refreshToken, expiresAt, user } = res;

        console.log("success: ", accessToken);

        window.localStorage.setItem('jwt', accessToken);
        window.localStorage.setItem('refreshToken', refreshToken);
        window.localStorage.setItem('expiresAt', expiresAt);
        window.localStorage.setItem('username', user.username);
        window.localStorage.setItem('nombreSocio', user.socio.nombreComercial);
        window.localStorage.setItem('idsocio', user.socio.id);


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


        setState({ loading: false, error: true });
        logout();
        console.error("error: ", err);
        onSuccess();
    });
}, [setJwt]);


    const logout = useCallback(()=>{
        window.localStorage.removeItem('jwt')
        window.localStorage.removeItem('reset')
        setJwt(null)
    },[setJwt])

    
    return{
        isLogged: Boolean(jwt),
        isloginLoading : state.loading,
        hasLoginError : state.error,
        // permisos,
        // configuraciones,
        login,
        logout,
        // estadoCursoGeneral, setEstadoCursoGeneral
    }
}