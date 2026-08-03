import * as constantes from "../constants/constantes.js";
import { removeCookie } from "../helpers/cookieHelper.js";
import apiFetch from "./apiClient.js";

const ENDPOINT = constantes.URLAPICONECTA;

export default async function login ({userName,password}) {
    return await apiFetch(`${ENDPOINT}/api/Auth/Login`,{
        method: "POST",
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({userName, password})
    }).then(res => res.json()).then(res=>{
        if(res.errors) throw new Error(res.errors[0])
        return res
    })
}

export async function loginStep2 ({ idUser, idRol, idSocio, tempToken }) {
    return await apiFetch(`${ENDPOINT}/api/Auth/login-step2`,{
        method: "POST",
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({ idUser, idRol, idSocio, tempToken })
    }).then(res => res.json()).then(res=>{
        if(res.errors) throw new Error(res.errors[0])
        return res
    })
}

export const EnviarCorreo = ({ jsonData }) => {
    return apiFetch(`${ENDPOINT}/api/Auth/forgot-password`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json", 
      },
      body: jsonData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.errors) throw new Error(res.errors[0]);
        const { data } = res;
        return data;
      });
};

export const RecuperarContraseña = ({ jsonData }) => {
    return apiFetch(`${ENDPOINT}/api/Auth/reset-password` , {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json", 
      },
      body: jsonData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.errors) throw new Error(res.errors[0]);
        const { data } = res;
        return data;
      });
};