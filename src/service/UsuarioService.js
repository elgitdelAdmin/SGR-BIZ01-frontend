import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPI;
const ENDPOINTTEST = constantes.URL_TESTLOGIN;

export const ObtenerListaPersonas = async({jwt})=> {
    return await fetch(`${ENDPOINT}/ZADUsuario/ObtenerListaPersonas`,{
    //return await fetch(`${ENDPOINTTEST}/ObtenerListaPersonas`,{
        method: "GET",
        headers:{
            "Authorization":"Bearer "+jwt,
            //'Content-Type': 'application/json'
            "accept": "text/plain"
        },
        
    }).then(res=>{
        if(!res.ok) throw new Error("Response is Not Ok")
        return res.json()
    }).then(res=>{
        if(res.errors) throw new Error(res.errors[0])
        const {data} = res
        return data
    })
    
}

export const ObtenerPersonaPorId = async ({jwt,idPersona}) =>{
    return await fetch(`${ENDPOINT}/ZADUsuario/ObtenerPersonaPorId/${idPersona}`,{
    //return await fetch(`${ENDPOINTTEST}/ObtenerPersonaPorId/${idPersona}`,{
        method: "GET",
        headers:{
            "Authorization":"Bearer "+jwt,
            //'Content-Type': 'application/json'
            "accept": "text/plain"
        },
        
    }).then(res=>{
        if(!res.ok) throw new Error("Response is Not Ok")
        return res.json()
    }).then(res=>{
        if(res.errors) throw new Error(res.errors[0])
        const {data} = res
        return data
    })
    
}


export const RegistrarPersona= ({jsonPersona,jwt}) =>{
    //return fetch(`${ENDPOINTTEST}/RegistrarPersona`,{
    return fetch(`${ENDPOINT}/ZADUsuario/RegistrarPersona`,{
        method: "POST",
        //mode: "no-cors",
        headers:{
            "Authorization":"Bearer "+jwt,
            'Content-Type': 'application/json',
            "accept": "application/json"
        },
        
        body: jsonPersona
    }).then(res=>{
        if(!res.ok) throw new Error("Response is Not Ok")
        return res.json()
    }).then(res=>{
        if(res.errors) throw new Error(res.errors[0])
        const {data} = res
        return data
    })
}

export const ActualizarPersona= ({jsonPersona,jwt}) =>{
    //return fetch(`${ENDPOINTTEST}/ActualizarPersona`,{
    return fetch(`${ENDPOINT}/ZADUsuario/ActualizarPersona`,{
        method: "POST",
        headers:{
            "Authorization":"Bearer "+jwt,
            'Content-Type': 'application/json',
            "accept": "application/json"
        },
        
        body: jsonPersona
    }).then(res=>{
        if(!res.ok) throw new Error("Response is Not Ok")
        return res.json()
    }).then(res=>{
        if(res.errors) throw new Error(res.errors[0])
        const {data} = res
        return data
    })
}

export const ObtenerPersonaPorEmpresa = async ({jwt,idEmpresa}) =>{
    return await fetch(`${ENDPOINT}/ZADUsuario/ObtenerPersonaPorEmpresa/${idEmpresa}`,{
    //return await fetch(`${ENDPOINTTEST}/ObtenerPersonaPorEmpresa/${idEmpresa}`,{
        method: "GET",
        headers:{
            "Authorization":"Bearer "+jwt,
            //'Content-Type': 'application/json'
            "accept": "text/plain"
        },
        
    }).then(res=>{
        if(!res.ok) throw new Error("Response is Not Ok")
        return res.json()
    }).then(res=>{
        if(res.errors) throw new Error(res.errors[0])
        const {data} = res
        return data
    })
    
}
export const EliminarPersona = async ({jwt,idPersona}) =>{
    return await fetch(`${ENDPOINT}/ZADUsuario/EliminarPersona/${idPersona}`,{
    //return await fetch(`${ENDPOINTTEST}/EliminarPersona/${idPersona}`,{
        method: "GET",
        headers:{
            "Authorization":"Bearer "+jwt,
            //'Content-Type': 'application/json'
            "accept": "text/plain"
        },
        
    }).then(res=>{
        if(!res.ok) throw new Error("Response is Not Ok")
        return res.json()
    }).then(res=>{
        if(res.errors) throw new Error(res.errors[0])
        const {data} = res
        return data
    })
    
}