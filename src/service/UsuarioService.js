import { Navigate } from "react-router-dom";
import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPICONECTA;
const idSocio = window.localStorage.getItem("idsocio")

export const ListarUsuarios = async () => {
  return await fetch(`${ENDPOINT}/api/Auth/usuario`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener los usuarios");
    return res.json();
  });
};

export const ListarUsuariosPorSocio = async () => {
  return await fetch(`${ENDPOINT}/api/Auth/usuarioByIdSocio/${window.localStorage.getItem("idsocio")}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener los usuarios");
    return res.json();
  });
};


export const RegistrarUsuario = ({ jsonData }) => {
    return fetch(`${ENDPOINT}/api/Auth/register`, {
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

export const ListaRoles = async () => {
  return await fetch(`${ENDPOINT}/api/Auth/roles`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener los roles");
    return res.json();
  });
};

export const ListaSocio = async () => {
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
export const ObtenerUsuario = async ({idUsuario}) =>{
    return await fetch(`${ENDPOINT}/api/Auth/usuario/${idUsuario}`,{
        method: "GET",
        headers:{
            "accept": "text/plain"
        },
        
    })
    .then(res => {
    if (!res.ok) throw new Error("Error al obtener los usarios");
    return res.json();
  });
    
}

  export const ActualizarUsuario= ({jsonData,idUsuario}) =>{
      return fetch(`${ENDPOINT}/api/Auth/UpdateUser/${idUsuario}`,{
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


export const EliminarUsuario = async ({ idUsuario}) => {
    return await fetch(`${ENDPOINT}/api/Auth/DeleteUser/${idUsuario}`, {
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


export const ActualizarContraseña = ({ jsonData }) => {
    return fetch(`${ENDPOINT}/api/Auth/change-password`, {
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


export const EnviarCodigoVerificacion = ({ jsonData }) => {
  return fetch(`${ENDPOINT}/api/Auth/send-verification-code`, {
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
          throw new Error("No se pudo enviar el código de verificación");
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

export const ConfirmarEmail = ({ jsonData }) => {
  return fetch(`${ENDPOINT}/api/Auth/confirm-email`, {
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
        } else if (res.status === 400) {
          throw new Error("Código inválido o expirado");
        } else {
          throw new Error("No se pudo confirmar el código");
        }
      }
      return res.json();
    })
    .then((res) => {
      if (res.errors) throw new Error(res.errors[0]);
      const { data } = res;
      
      if (data && data.email) {
        window.localStorage.setItem('userEmail', data.email);
      }
      
      return data;
    });
};




