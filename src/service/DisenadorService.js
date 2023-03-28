import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPI;
const ENDPOINTTEST = constantes.URL_TESTDISENADOR;

export const ListarDiseñadorPorCurso = async({jwt,idCurso})=> {
    return await fetch(`${ENDPOINT}/ZADDisenador/ListarDiseñadorPorCurso/${idCurso}`,{
    //return await fetch(`${ENDPOINTTEST}/ListarDiseñadorPorCurso/${idCurso}`,{
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

export const BuscarDisenadorID = async ({jwt,id}) =>{
    return await fetch(`${ENDPOINT}/ZADDisenador/BuscarDisenadorID/${id}`,{
    //return await fetch(`${ENDPOINTTEST}/BuscarDisenadorID/${id}`,{
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


export const ActualizarDisenador= ({jsonDisenador,jwt}) =>{
    //return fetch(`${ENDPOINTTEST}/ActualizarDisenador`,{
    return fetch(`${ENDPOINT}/ZADDisenador/ActualizarDisenador`,{
        method: "POST",
        headers:{
            "Authorization":"Bearer "+jwt,
            'Content-Type': 'application/json',
            "accept": "application/json"
        },
        
        body: jsonDisenador
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

export const RegistrarDisenador= ({jsonDisenador,jwt}) =>{
    //return fetch(`${ENDPOINTTEST}/RegistrarDisenador`,{
    return fetch(`${ENDPOINT}/ZADDisenador/RegistrarDisenador`,{
        method: "POST",
        headers:{
            "Authorization":"Bearer "+jwt,
            'Content-Type': 'application/json',
            "accept": "application/json"
        },
        
        body: jsonDisenador
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

export const EliminarDisenador = async ({jwt,id}) =>{
    return await fetch(`${ENDPOINT}/ZADDisenador/EliminarDisenador/${id}`,{
    //return await fetch(`${ENDPOINTTEST}/EliminarDisenador/${id}`,{
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
