import { Navigate } from "react-router-dom";
import * as constantes from "../constants/constantes.js";
import { apiFetch } from "./apiClient.js";

const ENDPOINT = constantes.URLAPICONECTA;

export const RegistrarCargaMasiva = ({ formData }) => {
  return apiFetch(`${ENDPOINT}/api/CargaMasivaTickets/CargaMasiva`, {
    method: "POST",
    body: formData, 
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("No se recibió respuesta del servidor");
      }
      return res.json();
    })
    .then((ticket) => {
      if (ticket.errors) throw new Error(ticket.errors[0]);
      return ticket;
    });
};
