import * as constantes from "../constants/constantes.js";
import { removeCookie } from "../helpers/cookieHelper.js";

const ENDPOINT = constantes.URLAPICONECTA;

export default async function login ({userName,password}) {
    return await fetch(`${ENDPOINT}/api/Auth/Login`,{
        method: "POST",
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({userName, password})
    }).then(res=>{
        if(!res.ok) throw new Error("Response is Not Ok")
        return res.json()
    }).then(res=>{
        if(res.errors) throw new Error(res.errors[0])
        return res
    })
}

export async function loginStep2 ({ idUser, idRol, idSocio, tempToken }) {
    return await fetch(`${ENDPOINT}/api/Auth/login-step2`,{
        method: "POST",
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({ idUser, idRol, idSocio, tempToken })
    }).then(res=>{
        if(!res.ok) throw new Error("Response is Not Ok")
        return res.json()
    }).then(res=>{
        if(res.errors) throw new Error(res.errors[0])
        return res
    })
}

export const EnviarCorreo = ({ jsonData }) => {
    return fetch(`${ENDPOINT}/api/Auth/forgot-password`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json", 
      },
      body: jsonData,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se recibió respuesta del servidor");
        }
        return res.json();
      })
      .then((res) => {
        if (res.errors) throw new Error(res.errors[0]);
        const { data } = res;
        return data;
      });
};

export const RecuperarContraseña = ({ jsonData }) => {
    return fetch(`${ENDPOINT}/api/Auth/reset-password` , {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json", 
      },
      body: jsonData,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se recibió respuesta del servidor");
        }
        return res.json();
      })
      .then((res) => {
        if (res.errors) throw new Error(res.errors[0]);
        const { data } = res;
        return data;
      });
};