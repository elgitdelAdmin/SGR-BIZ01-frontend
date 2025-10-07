import { Navigate } from "react-router-dom";
import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPICONECTA;



// export const RegistrarCargaMasiva = ({ formData }) => {
//   return fetch(`${ENDPOINT}/api/Ticket`, {
//     method: "POST",
//     headers: {
//       "Accept": "application/json",
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
//       return res.json()
//     })
//     .then((ticket) => {
//       if (ticket.errors) throw new Error(ticket.errors[0]);
//       return ticket;

//     });
// };

export const RegistrarCargaMasiva = ({ formData }) => {
  return fetch(`${ENDPOINT}/api/CargaMasivaTickets/CargaMasiva`, {
    method: "POST",
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
      return res.json();
    })
    .then((ticket) => {
      if (ticket.errors) throw new Error(ticket.errors[0]);
      return ticket;
    });
};
