import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPICONECTA;

export const ObtenerMenu = async () => {
   const idRol = localStorage.getItem("idRol");
  return await fetch(`${ENDPOINT}/api/Modulos/por-rol/${idRol}`, {
                method: "GET",
                headers: {
                "Accept": "application/json"
                },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener Menu");
    return res.json();
  });
};