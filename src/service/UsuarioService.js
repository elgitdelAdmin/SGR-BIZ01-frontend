import { Navigate } from "react-router-dom";
import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPICONECTA;

// export const ListarUsuarios = async () => {
//   return await fetch(`${ENDPOINT}/api/Usuario`, {
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

export const ListarUsuarios = async () => {
  return [
    // {
    //   id: 4,
    //   personaId: 38,
    //   idNivelExperiencia: 3,
    //   idModalidadLaboral: 1,
    //   idSocio: 1,
    //   usuarioCreacion: "",
    //   fechaCreacion: "2025-06-10T18:31:50.071123",
    //   usuarioActualizacion: null,
    //   fechaActualizacion: null,
    //   activo: true,
    //   nombres: "Alonso Pablo",
    //   apellidoPaterno: "Castro",
    //   apellidoMaterno: "Tello",
    //   numeroDocumento: "76543221",
    //   tipoDocumento: 1,
    //   telefono: "900887887",
    //   telefono2: "975772456",
    //   correo: "prueba@gmail",
    //   direccion: "Direccion",
    //   fechaNacimiento: "1989-05-04T05:00:00",
    //   frentesSubFrente: [
    //     {
    //       id: 3,
    //       idGestor: 4,
    //       idFrente: 2,
    //       idSubFrente: 6,
    //       idNivelExperiencia: 1,
    //       esCertificado: true,
    //       fechaCreacion: "2025-06-10T18:31:50.54328",
    //       usuarioCreacion: "",
    //       fechaActualizacion: null,
    //       usuarioActualizacion: null,
    //       activo: true,
    //     },
    //   ],
    // },

      {
            username: "luis.garcia25",
            email: "luis.garcia@example.com",
            password: "Luis1234*",
            id: 1,
            nombres: "Luis Alberto",
            apellidoMaterno: "Torres",
            apellidoPaterno: "García",
            numeroDocumento: "45678912",
            tipoDocumento: 1,
            telefono: "987654321",
            telefono2: "912345678",
            correo: "luis.garcia@example.com",
            direccion: "Av. Los Álamos 123, Lima",
            fechaNacimiento: "1998-03-15T00:00:00.000Z",
            fechaCreacion: "2025-06-23T21:22:25.684Z",
            fechaActualizacion: "2025-06-23T21:22:25.684Z",
            activo: true
            }
  ];
};

export const RegistrarGestor = ({ jsonData }) => {
    return fetch(`${ENDPOINT}/api/Gestor`, {
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
  export const ActualizarGestor= ({jsonData,idGestor}) =>{
      return fetch(`${ENDPOINT}/api/Gestor/${idGestor}`,{
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

export const EliminarGestor = async ({ idGestor }) => {
    return await fetch(`${ENDPOINT}/api/Gestor/${idGestor}`, {
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

export const ObtenerGestor = async ({idGestor}) =>{
    return await fetch(`${ENDPOINT}/api/Gestor/${idGestor}`,{
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




