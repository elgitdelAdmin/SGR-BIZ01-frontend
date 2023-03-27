import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPI;
const ENDPOINTTEST = constantes.URL_TESTBLIBLIOTECA;

export const ListarBibliotecasPorCurso = async({jwt,idCurso})=> {
    return await fetch(`${ENDPOINT}/ZADBiblioteca/ListarBibliotecasPorCurso/${idCurso}`,{
    //return await fetch(`${ENDPOINTTEST}/ListarBibliotecasPorCurso/${idCurso}`,{
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

export const BuscarBibliotecaID = async ({jwt,id}) =>{
    return await fetch(`${ENDPOINT}/ZADBiblioteca/BuscarBibliotecaID/${id}`,{
    //return await fetch(`${ENDPOINTTEST}/BuscarBibliotecaID/${id}`,{
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


export const ActualizarBiblioteca= ({jsonBliblioteca,jwt}) =>{
    //return fetch(`${ENDPOINTTEST}/ActualizarBiblioteca`,{
    return fetch(`${ENDPOINT}/ZADBiblioteca/ActualizarBiblioteca`,{
        method: "POST",
        headers:{
            "Authorization":"Bearer "+jwt,
            'Content-Type': 'application/json',
            "accept": "application/json"
        },
        
        body: jsonBliblioteca
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

export const RegistrarBiblioteca= ({jsonBliblioteca,jwt}) =>{
    //return fetch(`${ENDPOINTTEST}/RegistrarBiblioteca`,{
    return fetch(`${ENDPOINT}/ZADBiblioteca/RegistrarBiblioteca`,{
        method: "POST",
        headers:{
            "Authorization":"Bearer "+jwt,
            'Content-Type': 'application/json',
            "accept": "application/json"
        },
        
        body: jsonBliblioteca
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

export const EliminarBiblioteca = async ({jwt,id}) =>{
    return await fetch(`${ENDPOINT}/ZADBiblioteca/EliminarBiblioteca/${id}`,{
    //return await fetch(`${ENDPOINTTEST}/EliminarBiblioteca/${id}`,{
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
