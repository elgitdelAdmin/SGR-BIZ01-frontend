import { Navigate } from "react-router-dom";
import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPICONECTA;
const idSocio= window.localStorage.getItem("idsocio")

export const ListarEmpresas = async () => {
  return await fetch(`${ENDPOINT}/api/Empresas`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener las Empresas");
    return res.json();
  });
};

export const ListarEmpresasporRol = async ({idUser,codRol}) => {
  return await fetch(`${ENDPOINT}/api/Empresas/user/${idUser}/rol/${codRol}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener las Empresas");
    return res.json();
  });
};
export const ListarEmpresasPorSocio = async () => {
  return await fetch(`${ENDPOINT}/api/Empresas/byIdSocio/${window.localStorage.getItem("idsocio")}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener las Empresas");
    return res.json();
  });
};


export const RegistrarEmpresa = ({ jsonData }) => {
    return fetch(`${ENDPOINT}/api/Empresas`, {
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
  export const ActualizarEmpresa= ({jsonData,idEmpresa}) =>{
      return fetch(`${ENDPOINT}/api/Empresas/${idEmpresa}`,{
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

export const EliminarEmpresa = async ({ idEmpresa }) => {
    return await fetch(`${ENDPOINT}/api/Empresas/${idEmpresa}`, {
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

export const ObtenerEmpresa = async ({idEmpresa}) =>{
    return await fetch(`${ENDPOINT}/api/Empresas/${idEmpresa}`,{
        method: "GET",
        headers:{
            // "Authorization":"Bearer "+jwt,
            "accept": "text/plain"
        },
        
    })
    .then(res => {
    if (!res.ok) throw new Error("Error al obtener los empresas");
    return res.json();
  });
    
}
export const ObtenerPersona = async ({idPersona}) =>{
    return await fetch(`${ENDPOINT}/api/Persona/${idPersona}`,{
        method: "GET",
        headers:{
            // "Authorization":"Bearer "+jwt,
            "accept": "text/plain"
        },
        
    })
    .then(res => {
    if (!res.ok) throw new Error("Error al obtener personas");
    return res.json();
  });
    
}

// export const ObtenerPersonaResponsable = async ({idTipoDocumento,numeroDocumento}) =>{
//   console.log(idTipoDocumento,numeroDocumento)
//     return await fetch(`${ENDPOINT}/api/Empresas/UsuarioResponsable/tipoDocumento/${idTipoDocumento}/numeroDocumento/${numeroDocumento}`,{
//         method: "GET",
//         headers:{
//             "accept": "text/plain"
//         },
//     })
//     .then(res => {
//         console.log(res)
//                 console.log(res.json())


//     if (!res.ok) throw new Error("Error al obtener la persona");
//     return res.json();
//   });
    
// }
export const ObtenerPersonaResponsable = async ({ idTipoDocumento, numeroDocumento }) => {
  const res = await fetch(`${ENDPOINT}/api/Empresas/UsuarioResponsable/tipoDocumento/${idTipoDocumento}/numeroDocumento/${numeroDocumento}`, {
    method: "GET",
    headers: { accept: "text/plain" },
  });

  if (!res.ok) throw new Error("Error al obtener la persona");

  const data = await res.json();
  console.log("Respuesta API:", data);
  return data;
};





