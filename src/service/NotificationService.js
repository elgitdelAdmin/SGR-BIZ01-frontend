import * as constantes from "../constants/constantes.js";
import { apiFetch } from "./apiClient.js";

const ENDPOINT = constantes.URLAPICONECTA;

export const MarcarNotificacionComoLeida = async (idUser, notificationIds) => {
  return await apiFetch(
    `${ENDPOINT}/api/Auth/MarcarNotificacionComoLeida`,
    {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idUser, idsNotificaciones: notificationIds }),
    }
  )
    .then((res) => {
      if (!res.ok) throw new Error("Error al marcar notificaciones como leídas");
      return res.json();
    });
};
