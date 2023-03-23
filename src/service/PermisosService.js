import * as constantes from "../constants/constantes.js";
//const ENDPOINT = "https://inleraningapi.azurewebsites.net";
const ENDPOINT = constantes.URLAPI;


export  const  getPermisoUsuario=async ({jwt}) =>{
    return await fetch(`${ENDPOINT}/ZADPermisos/ObtenerPermisosPorUsuario`,{
    //return fetch("assets/demo/data/users-gerencia.json",{
        method: "GET",
        headers:{
            "Authorization":"Bearer "+jwt,
            //'Content-Type':'application/json'
            "accept": "accept: text/plain"
        }
    }).then(res=>{
         //if(!res.ok) throw new Error("Response is Not Ok")
         if(!res.ok) 
         {
             if(res.status == 401)
             {
                 window.localStorage.removeItem('jwt')
                 window.location.reload();
             }
             else
             {
                 throw new Error("No se recibió respuesta del servidor")
             }
         }
         return res.json()
    }).then(res=>{
        const {data} = res
        return data
    })
}


