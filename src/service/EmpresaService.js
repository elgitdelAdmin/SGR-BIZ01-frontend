import { Navigate } from "react-router-dom";
import * as constantes from "../constants/constantes.js";
import { apiFetch } from "./apiClient.js";

const ENDPOINT = constantes.URLAPICONECTA;

export const ListarEmpresas = async () => {
  return await apiFetch(`${ENDPOINT}/api/Empresas?soloActivos=true`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener las Empresas");
    return res.json();
  });
};

export const ListarEmpresasporRol = async ({idUser,codRol}) => {
  const idSocio = window.localStorage.getItem("idsocio");
  return await apiFetch(`${ENDPOINT}/api/Empresas/user/${idUser}/rol/${codRol}?idSocio=${idSocio || ''}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener las Empresas");
    return res.json();
  });
};

export const ListarEmpresasPorSocio = async () => {
  return await apiFetch(`${ENDPOINT}/api/Empresas/byIdSocio/${window.localStorage.getItem("idsocio")}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener las Empresas");
    return res.json();
  });
};

export const RegistrarEmpresa = ({ jsonData }) => {
    return apiFetch(`${ENDPOINT}/api/Empresas`, {
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
        return res;
      });
};

export const ActualizarEmpresa = ({jsonData, idEmpresa}) => {
    return apiFetch(`${ENDPOINT}/api/Empresas/${idEmpresa}`, {
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

export const EliminarEmpresa = async ({ idEmpresa }) => {
    return await apiFetch(`${ENDPOINT}/api/Empresas/${idEmpresa}`, {
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

export const ObtenerEmpresa = async ({idEmpresa}) => {
    return await apiFetch(`${ENDPOINT}/api/Empresas/${idEmpresa}`, {
        method: "GET",
        headers: {
            "accept": "text/plain"
        },
    })
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener los empresas");
        return res.json();
    });
};

export const ObtenerPersona = async ({idPersona}) => {
    return await apiFetch(`${ENDPOINT}/api/Persona/${idPersona}`, {
        method: "GET",
        headers: {
            "accept": "text/plain"
        },
    })
    .then(res => {
        if (!res.ok) throw new Error("Error al obtener personas");
        return res.json();
    });
};

export const ObtenerPersonaResponsable = async ({ idTipoDocumento, numeroDocumento }) => {
  const res = await apiFetch(`${ENDPOINT}/api/Empresas/UsuarioResponsable/tipoDocumento/${idTipoDocumento}/numeroDocumento/${numeroDocumento}`, {
    method: "GET",
    headers: { accept: "text/plain" },
  });

  if (!res.ok) throw new Error("Error al obtener la persona");

  const data = await res.json();
  return data;
};
