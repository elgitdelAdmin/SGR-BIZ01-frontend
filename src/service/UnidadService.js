import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPI;
const ENDPOINTTEST = constantes.URL_TESTUNIDAD;

export const ListarUnidadesPorCurso = async({jwt,idCurso})=> {
    return await fetch(`${ENDPOINT}/ZADUnidad/ListarUnidadesPorCurso/${idCurso}`,{
    //return await fetch(`${ENDPOINTTEST}/ListarUnidadesPorCurso/${idCurso}`,{
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

export const BuscarUnidadID = async ({jwt,idUnidad}) =>{
    return await fetch(`${ENDPOINT}/ZADUnidad/BuscarUnidadID/${idUnidad}`,{
    //return await fetch(`${ENDPOINTTEST}/BuscarUnidadID/${idUnidad}`,{
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


export const ActualizarUnidad= ({jsonUnidad,jwt}) =>{
    //return fetch(`${ENDPOINTTEST}/ActualizarUnidad`,{
    return fetch(`${ENDPOINT}/ZADUnidad/ActualizarUnidad`,{
        method: "POST",
        headers:{
            "Authorization":"Bearer "+jwt,
            'Content-Type': 'application/json',
            "accept": "application/json"
        },
        
        body: jsonUnidad
    }).then(res=>{
        if(!res.ok) throw new Error("Response is Not Ok")
        return res.json()
    }).then(res=>{
        if(res.errors) throw new Error(res.errors[0])
        const {data} = res
        return data
    })
}

export const RegistrarUnidad= ({jsonUnidad,jwt}) =>{
    //return fetch(`${ENDPOINTTEST}/RegistrarUnidad`,{
    return fetch(`${ENDPOINT}/ZADUnidad/RegistrarUnidad`,{
        method: "POST",
        headers:{
            "Authorization":"Bearer "+jwt,
            'Content-Type': 'application/json',
            "accept": "application/json"
        },
        
        body: jsonUnidad
    }).then(res=>{
        if(!res.ok) throw new Error("Response is Not Ok")
        return res.json()
    }).then(res=>{
        if(res.errors) throw new Error(res.errors[0])
        const {data} = res
        return data
    })
}