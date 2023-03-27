import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPI;
const ENDPOINTTEST = constantes.URL_TESTBENEFICIO;

export const ListarBeneficios = async({jwt,idCurso})=> {
    //return await fetch(`${ENDPOINT}/ZADBeneficio/ListarBeneficios/${idCurso}`,{
    return await fetch(`${ENDPOINTTEST}/ListarBeneficios/${idCurso}`,{
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

export const BuscarBeneficioID = async ({jwt,id}) =>{
    //return await fetch(`${ENDPOINT}/ZADBeneficio/BuscarBeneficioID/${id}`,{
    return await fetch(`${ENDPOINTTEST}/BuscarBeneficioID/${id}`,{
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


export const ActualizarBeneficio= ({jsonBeneficio,jwt}) =>{
    return fetch(`${ENDPOINTTEST}/ActualizarBeneficio`,{
    //return fetch(`${ENDPOINT}/ZADBeneficio/ActualizarBeneficio`,{
        method: "POST",
        headers:{
            "Authorization":"Bearer "+jwt,
            'Content-Type': 'application/json',
            "accept": "application/json"
        },
        
        body: jsonBeneficio
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

export const RegistrarBeneficio= ({jsonBeneficio,jwt}) =>{
    //return fetch(`${ENDPOINTTEST}/RegistrarBeneficio`,{
    return fetch(`${ENDPOINT}/ZADBeneficio/RegistrarBeneficio`,{
        method: "POST",
        headers:{
            "Authorization":"Bearer "+jwt,
            'Content-Type': 'application/json',
            "accept": "application/json"
        },
        
        body: jsonBeneficio
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

