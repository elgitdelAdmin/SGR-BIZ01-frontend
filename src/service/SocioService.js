import { Navigate } from "react-router-dom";
import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPICONECTA;
const idSocio = window.localStorage.getItem("idsocio")

export const ListarSocios = async () => {
  return await fetch(`${ENDPOINT}/api/Socios`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener los socios");
    return res.json();
  });
};


export const RegistrarSocio = ({ jsonData }) => {
    return fetch(`${ENDPOINT}/api/Socios`, {
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


export const ObtenerSocio = async ({idSocio}) =>{
    return await fetch(`${ENDPOINT}/api/Socios/${idSocio}`,{
        method: "GET",
        headers:{
            "accept": "text/plain"
        },
        
    })
    .then(res => {
    if (!res.ok) throw new Error("Error al obtener los Socios");
    return res.json();
  });
    
}

  export const ActualizarSocio= ({jsonData,idSocio}) =>{
      return fetch(`${ENDPOINT}/api/Socios/${idSocio}`,{
          method: "PUT",
          headers:{
              'Content-Type': 'application/json',
              "accept": "application/json"
          },
          
          body: jsonData
      }).then(res=>{
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


export const EliminarSocio = async ({ idSocio}) => {
    return await fetch(`${ENDPOINT}/api/Socios/${idSocio}`, {
        method: "DELETE",
        headers: {
            "accept": "text/plain"
        },
    }).then(async res => {
        if (!res.ok) {
            if (res.status === 401) {
                window.localStorage.removeItem('jwt');
                window.location.reload();
            } else {
                throw new Error("No se recibió respuesta del servidor");
            }
        }

        if (res.status === 204) {
            return true; 
        }
        

        const result = await res.json();

        if (result.errors) throw new Error(result.errors[0]);
        return result.data;
    });
}









