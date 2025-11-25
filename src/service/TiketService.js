import { Navigate } from "react-router-dom";
import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPICONECTA;



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
export const ListarPais = async () => {
  return await fetch(`${ENDPOINT}/api/Paises`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener los paises");
    return res.json();
  });
};


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


// export const ListarConsultores = async () => {
//   return await fetch(`${ENDPOINT}/api/Consultor`, {
//     method: "GET",
//     headers: {
//       "Accept": "application/json"
//     },
//   })
//   .then(res => {
//     if (!res.ok) throw new Error("Error al obtener los consultores");
//     return res.json();
//   });
// };


// export const RegistrarTiket = ({ formData }) => {
//   return fetch(`${ENDPOINT}/api/Ticket`, {
//     method: "POST",
//     headers: {
//       "Accept": "application/json",
//       //"Content-Type": "application/json", 
//     },
//     body: formData,
//   })
//     .then((res) => {
//       if (!res.ok) {
//         if (res.status === 401) {
//           window.localStorage.removeItem("jwt");
//           window.location.reload();
//         } else {
//           throw new Error("No se recibió respuesta del servidor");
//         }
//       }
//       return res.json();

//     })
//     .then((res) => {
//       if (res.errors) throw new Error(res.errors[0]);
//       const { data } = res;
//       return data;
//     });
// };

export const RegistrarTiket = ({ formData }) => {
  return fetch(`${ENDPOINT}/api/Ticket`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
    },
    body: formData,
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
      return res.json()
    })
    .then((ticket) => {
      if (ticket.errors) throw new Error(ticket.errors[0]);
      return ticket;

    });
};
export const ActualizarTicket = ({ formData, idTicket }) => {
  return fetch(`${ENDPOINT}/api/Ticket/${idTicket}`, {
    method: "PUT",
    headers: {
      "Accept": "application/json",
    },
    body: formData,
  })
    .then((res) => {
                  console.log("res1",res)

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
                        console.log("res1",res)

      if (res.errors) throw new Error(res.errors[0]);
      const { data } = res;
      return data;
    });
};

  export const ListarTicket= async ({idUser,codRol}) => {
  return await fetch(`${ENDPOINT}/api/Ticket/user/${idUser}/rol/${codRol}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener los ticket");
    return res.json();
  });
};


export const EliminarTicket = async ({ id }) => {
    return await fetch(`${ENDPOINT}/api/Ticket/${id}`, {
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

export const ObtenerTicket = async ({id}) =>{
    return await fetch(`${ENDPOINT}/api/Ticket/${id}`,{
        method: "GET",
        headers:{
            "accept": "text/plain"
        },
        
    })
    .then(res => {
    if (!res.ok) throw new Error("Error al obtener los ticket");
    return res.json();
  });

  
    
}

export const ListarGestorConsultoria = async () => {
    return await fetch(`${ENDPOINT}/api/Gestor/byIdRol/6/byIdSocio/${window.localStorage.getItem("idsocio")}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener los Gestores");
    return res.json();
  });
};

export const ListarGestorCuenta = async () => {
  return await fetch(`${ENDPOINT}/api/Gestor/byIdRol/3/byIdSocio/${window.localStorage.getItem("idsocio")}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener los Gestores");
    return res.json();
  });
};
