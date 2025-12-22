// import * as constantes from "../constants/constantes.js";
// const ENDPOINT = constantes.URLAPI;
// const ENDPOINTTEST = constantes.URL_TESTLOGIN;

// export default async function login ({userName,password}) {
//     return await fetch(`${ENDPOINT}/ZADUsuario/Login`,{
//         method: "POST",
//         headers:{
//             'Content-Type': 'application/json'
//         },
        
//         body:JSON.stringify({userName, password})
//     }).then(res=>{
//         if(!res.ok) throw new Error("Response is Not Ok")
//         return res.json()
//     }).then(res=>{
//         if(res.errors) throw new Error(res.errors[0])
//         return res
//     })
    
// }
import * as constantes from "../constants/constantes.js";
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

export const EnviarCorreo = ({ jsonData }) => {
    console.log(jsonData)
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
          if (res.status === 401) {
            window.localStorage.removeItem("jwt");
            window.location.reload();
          } else {
            throw new Error("No se recibió respuesta del servidor");
          }
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
    console.log(jsonData)

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
          if (res.status === 401) {
            window.localStorage.removeItem("jwt");
            window.location.reload();
          } else {
            throw new Error("No se recibió respuesta del servidor");
          }
        }
        return res.json();
      })
      .then((res) => {
        if (res.errors) throw new Error(res.errors[0]);
        const { data } = res;
        return data;
      });
  };