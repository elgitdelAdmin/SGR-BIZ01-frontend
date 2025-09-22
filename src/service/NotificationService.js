import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPICONECTA;



export const MarcarNotificacionComoLeida = async (idUser, notificationIds) => {
  return await fetch(
    `${ENDPOINT}/api/Auth/MarcarNotificacionComoLeida?idUser=${idUser}`,
    {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notificationIds),
    }
  )
    .then((res) => {
      if (!res.ok) throw new Error("Error al marcar notificaciones como leídas");
      return res.json();
    });
};
