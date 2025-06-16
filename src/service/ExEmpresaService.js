import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPI;
const ENDPOINTTEST = constantes.URL_GENERAL;
export default async function ObtenerListaEmpresas ({jwt}) {
    return await fetch(`${ENDPOINT}/ZADGeneral/ObtenerListaEmpresas`,{
    //return await fetch(`${ENDPOINTTEST}/ObtenerListaEmpresas`,{
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

export async function ObtenerListaCategorias ({jwt}) {
    return await fetch(`${ENDPOINT}/ZADGeneral/ObtenerListaCategorias`,{
    //return await fetch(`${ENDPOINTTEST}/ObtenerListaCategorias`,{
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

export async function ObtenerListaLibroTipo ({jwt}) {
    return await fetch(`${ENDPOINT}/ZADGeneral/ObtenerListaLibroTipo`,{
    //return await fetch(`${ENDPOINTTEST}/ObtenerListaLibroTipo`,{
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

export function ObtenerEstadoCurso ({jwt}) {
    return  fetch(`${ENDPOINT}/ZADGeneral/ObtenerEstadoCurso`,{
    //return await fetch(`${ENDPOINTTEST}/ObtenerEstadoCurso`,{
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