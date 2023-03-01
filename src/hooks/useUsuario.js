import { useCallback, useContext, useState } from 'react';
import Context from "../context/usuarioContext"
import loginService from "../service/LoginService";
// import {CreateUser, UpdateUser,DeleteUser,UsersGerencia,ListUsers}from "../service/UsuariosService";
export default function useUsuario(){
    const {jwt,setJwt,permisos,configuraciones} = useContext(Context)
    const [state,setState] = useState({loading:false,error:false})
    const [stateCreate,setStateCreate] = useState({loading:false,error:false,success:false})
    const [stateUpdate,setStateUpdate] = useState({loading:false,error:false,success:false})
    const [stateDelete,setStateDelete] = useState({loading:false,error:false,success:false})
    const [usuariosTotal, setUsuariosTotal] = useState([]);
    const [usersGerencias,setUsersGerencias] = useState([]);
    const login = useCallback(async({userName,password},onSuccess) => {
        //setJwt("test")
        await loginService({userName,password})
        .then(res=> {
            const {token,change} = res
            console.log("success: "+token);
            window.localStorage.setItem('jwt',token)
            window.localStorage.setItem('reset',change)
            setState({loading:false,error:false})
            setJwt(token)
        })
        .catch(err=>{
            window.localStorage.removeItem('jwt')
            window.localStorage.removeItem('reset')
            setState({loading:false,error:true})
            logout();
            console.error("error: "+err);
            onSuccess()
        })
    },[setJwt])
    const logout = useCallback(()=>{
        window.localStorage.removeItem('jwt')
        window.localStorage.removeItem('reset')
        setJwt(null)
    },[setJwt])

    
    return{
        isLogged: Boolean(jwt),
        isloginLoading : state.loading,
        hasLoginError : state.error,
        permisos,
        configuraciones,
        login,
        logout,
    }
}