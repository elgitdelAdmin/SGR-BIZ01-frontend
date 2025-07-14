import { Navigate } from "react-router-dom";
import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPICONECTA;
const idSocio = window.localStorage.getItem("idsocio")


export const ListarConsultores = async () => {

  return await fetch(`${ENDPOINT}/api/Consultor`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener los consultores");
    return res.json();
  });
};


export const ListarConsultoresPorSocio = async () => {
  return await fetch(`${ENDPOINT}/api/Consultor/byIdSocio/${window.localStorage.getItem("idsocio")}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener los consultores");
    return res.json();
  });
};

export const RegistrarConsultor = ({ jsonData }) => {
    return fetch(`${ENDPOINT}/api/Consultor`, {
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
  export const ActualizarConsultor= ({jsonData,idConsultor}) =>{
      return fetch(`${ENDPOINT}/api/Consultor/${idConsultor}`,{
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

export const ListarFrentes = async () => {
  return await fetch(`${ENDPOINT}/api/Frente`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener los frentes");
    return res.json();
  });
};
export const ListarParametros = async () => {
  return await fetch(`${ENDPOINT}/api/Parametros`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener los parametros");
    return res.json();
  });
};

export const EliminarConsultor = async ({ idConsultor }) => {
    return await fetch(`${ENDPOINT}/api/Consultor/${idConsultor}`, {
        method: "DELETE",
        headers: {
            "accept": "text/plain"
        },
    }).then(async res => {
                  console.log("res",res);

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

export const ObtenerConsultor = async ({idConsultor}) =>{
    return await fetch(`${ENDPOINT}/api/Consultor/${idConsultor}`,{
        method: "GET",
        headers:{
            // "Authorization":"Bearer "+jwt,
            "accept": "text/plain"
        },
        
    })
    .then(res => {
    if (!res.ok) throw new Error("Error al obtener los consultores");
    return res.json();
  });
    
}




