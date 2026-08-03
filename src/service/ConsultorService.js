import { Navigate } from "react-router-dom";
import * as constantes from "../constants/constantes.js";
import { apiFetch } from "./apiClient.js";

const ENDPOINT = constantes.URLAPICONECTA;

export const ListarConsultores = async () => {
  return await apiFetch(`${ENDPOINT}/api/Consultor`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener los consultores");
    return res.json();
  });
};

export const ListarConsultoresPorSocio = async () => {
  return await apiFetch(`${ENDPOINT}/api/Consultor/byIdSocio/${window.localStorage.getItem("idsocio")}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener los consultores");
    return res.json();
  });
};

export const RegistrarConsultor = ({ jsonData }) => {
    return apiFetch(`${ENDPOINT}/api/Consultor`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json", 
      },
      body: jsonData,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("No se recibió respuesta del servidor");
        }
        return res.json();
      })
      .then((res) => {
        if (res.errors) throw new Error(res.errors[0]);
        const { data } = res;
        return data;
      });
};

export const ActualizarConsultor = ({jsonData, idConsultor}) => {
    return apiFetch(`${ENDPOINT}/api/Consultor/${idConsultor}`, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            "accept": "application/json"
        },
        body: jsonData
    }).then(res => {
        if (!res.ok) {
            throw new Error("No se recibió respuesta del servidor");
        }
        return res.json();
    }).then(res => {
        if (res.errors) throw new Error(res.errors[0]);
        const { data } = res;
        return data;
    });
};

export const ListarFrentes = async () => {
  return await apiFetch(`${ENDPOINT}/api/Frente`, {
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
  return await apiFetch(`${ENDPOINT}/api/Parametros`, {
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

export const EliminarConsultor = async ({ idConsultor }) => {
    return await apiFetch(`${ENDPOINT}/api/Consultor/${idConsultor}`, {
        method: "DELETE",
        headers: {
            "accept": "text/plain"
        },
    }).then(async res => {
        if (!res.ok) {
            throw new Error("No se recibió respuesta del servidor");
        }

        if (res.status === 204) {
            return true; 
        }

        const result = await res.json();
        if (result.errors) throw new Error(result.errors[0]);
        return result.data;
    });
};

export const ObtenerConsultor = async ({idConsultor}) => {
    return await apiFetch(`${ENDPOINT}/api/Consultor/${idConsultor}`, {
        method: "GET",
        headers: {
            "accept": "text/plain"
        },
    })
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener los consultores");
        return res.json();
    });
};
