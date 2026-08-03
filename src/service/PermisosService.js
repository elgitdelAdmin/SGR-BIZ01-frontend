import * as constantes from "../constants/constantes.js";
import { apiFetch } from "./apiClient.js";

const ENDPOINT = constantes.URLAPI;

export const getPermisoUsuario = async ({ jwt }) => {
    return await apiFetch(`${ENDPOINT}/ZADPermisos/ObtenerPermisosPorUsuario`, {
        method: "GET",
        headers: {
            "accept": "text/plain"
        }
    }).then(res => {
         if (!res.ok) {
             throw new Error("No se recibió respuesta del servidor");
         }
         return res.json();
    }).then(res => {
        const { data } = res;
        return data;
    });
};
