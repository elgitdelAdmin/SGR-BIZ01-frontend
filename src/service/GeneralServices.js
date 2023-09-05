import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPI;
export async function ObtenerConfiguraciones ({jwt}) {
    return await fetch(`${ENDPOINT}/ZADGeneral/ObtenerConfiguracion`,{
    //return await fetch(`${ENDPOINTTEST}/ObtenerConfiguracion`,{
        method: "GET",
        headers:{
            "Authorization":"Bearer "+jwt,
            //'Content-Type': 'application/json'
            "accept": "text/plain"
        },
        
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
        if(res.errors) throw new Error(res.errors[0])
        const {data} = res
        return data
    })
    
}