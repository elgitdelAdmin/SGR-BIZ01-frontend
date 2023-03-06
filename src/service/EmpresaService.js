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
        if(!res.ok) throw new Error("Response is Not Ok")
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
        if(!res.ok) throw new Error("Response is Not Ok")
        return res.json()
    }).then(res=>{
        if(res.errors) throw new Error(res.errors[0])
        const {data} = res
        return data
    })
    
}
