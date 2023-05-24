import { Navigate } from "react-router-dom";
import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPI;
const ENDPOINTTEST = constantes.URL_TESTPROFESOR;

export const ListarProfesores = async({jwt})=> {
    return await fetch(`${ENDPOINT}/ZADProfesor/ListarProfesores`,{
    //return await fetch(`${ENDPOINTTEST}/ListarProfesores`,{
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

export const BuscarProfesorID = async ({jwt,idPersona}) =>{
    return await fetch(`${ENDPOINT}/ZADProfesor/BuscarProfesorID/${idPersona}`,{
    //return await fetch(`${ENDPOINTTEST}/BuscarProfesorID/${idPersona}`,{
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


export const ActualizarProfesor= ({jsonPersona,jwt}) =>{
    //return fetch(`${ENDPOINTTEST}/ActualizarProfesor`,{
    return fetch(`${ENDPOINT}/ZADProfesor/ActualizarProfesor`,{
        method: "POST",
        headers:{
            "Authorization":"Bearer "+jwt,
            'Content-Type': 'application/json',
            "accept": "application/json"
        },
        
        body: jsonPersona
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

export const RegistrarProfesor= ({jsonPersona,jwt}) =>{
    return fetch(`${ENDPOINTTEST}/RegistrarProfesor`,{
    //return fetch(`${ENDPOINT}/ZADProfesor/RegistrarProfesor`,{
        method: "POST",
        headers:{
            "Authorization":"Bearer "+jwt,
            'Content-Type': 'application/json',
            "accept": "application/json"
        },
        
        body: jsonPersona
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