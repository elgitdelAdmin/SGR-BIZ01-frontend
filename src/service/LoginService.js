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
