import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPI;
const ENDPOINTTEST = constantes.URL_TESTREQUISITO;

export const ListarRequisitosPorCurso = async({jwt,idCurso})=> {
    //return await fetch(`${ENDPOINT}/ZADRequisito/ListarRequisitosPorCurso/${idCurso}`,{
    return await fetch(`${ENDPOINTTEST}/ListarRequisitosPorCurso/${idCurso}`,{
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

export const BuscarRequisitoID = async ({jwt,id}) =>{
    //return await fetch(`${ENDPOINT}/ZADRequisito/BuscarRequisitoID/${id}`,{
    return await fetch(`${ENDPOINTTEST}/BuscarRequisitoID/${id}`,{
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


export const ActualizarRequisito= ({jsonRequisito,jwt}) =>{
    return fetch(`${ENDPOINTTEST}/ActualizarRequisito`,{
    //return fetch(`${ENDPOINT}/ZADRequisito/ActualizarRequisito`,{
        method: "POST",
        headers:{
            "Authorization":"Bearer "+jwt,
            'Content-Type': 'application/json',
            "accept": "application/json"
        },
        
        body: jsonRequisito
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

export const RegistrarRequisito= ({jsonRequisito,jwt}) =>{
    //return fetch(`${ENDPOINTTEST}/RegistrarRequisito`,{
    return fetch(`${ENDPOINT}/ZADRequisito/RegistrarRequisito`,{
        method: "POST",
        headers:{
            "Authorization":"Bearer "+jwt,
            'Content-Type': 'application/json',
            "accept": "application/json"
        },
        
        body: jsonRequisito
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

