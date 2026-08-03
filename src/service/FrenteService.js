import * as constantes from "../constants/constantes.js";
import { apiFetch } from "./apiClient.js";

const ENDPOINT = constantes.URLAPICONECTA;

// ==================== FRENTE ====================

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

export const ObtenerFrente = async ({id}) => {
  return await apiFetch(`${ENDPOINT}/api/Frente/${id}`, {
    method: "GET",
    headers: {
      "accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener el frente");
    return res.json();
  });
};

export const RegistrarFrente = ({ jsonData }) => {
  return apiFetch(`${ENDPOINT}/api/Frente`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: jsonData,
  })
  .then((res) => {
    if (!res.ok) {
      return res.json().then(data => {
        throw new Error(data.message || "No se recibió respuesta del servidor");
      });
    }
    return res.json();
  });
};

export const ActualizarFrente = ({ jsonData, id }) => {
  return apiFetch(`${ENDPOINT}/api/Frente/${id}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
      "accept": "application/json"
    },
    body: jsonData
  }).then(async res => {
    if (!res.ok) {
      if (res.status === 409) {
        const data = await res.json();
        const error = new Error(data.message || "No se puede desactivar");
        error.consultores = data.consultores;
        throw error;
      } else {
        return res.json().then(data => {
          throw new Error(data.message || "No se recibió respuesta del servidor");
        });
      }
    }
    return res.json();
  });
};

export const EliminarFrente = async ({ id }) => {
  return await apiFetch(`${ENDPOINT}/api/Frente/${id}`, {
    method: "DELETE",
    headers: {
      "accept": "application/json"
    },
  }).then(async res => {
    if (!res.ok) {
      if (res.status === 409) {
        const data = await res.json();
        const error = new Error(data.message || "No se puede desactivar");
        error.consultores = data.consultores;
        throw error;
      } else {
        throw new Error("No se recibió respuesta del servidor");
      }
    }
    return await res.json();
  });
};

// ==================== SUBFRENTE ====================

export const ListarSubFrentesPorFrente = async ({ frenteId }) => {
  return await apiFetch(`${ENDPOINT}/api/SubFrente/by-frente/${frenteId}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener los sub-frentes");
    return res.json();
  });
};

export const ObtenerSubFrente = async ({id}) => {
  return await apiFetch(`${ENDPOINT}/api/SubFrente/${id}`, {
    method: "GET",
    headers: {
      "accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener el sub-frente");
    return res.json();
  });
};

export const RegistrarSubFrente = ({ jsonData }) => {
  return apiFetch(`${ENDPOINT}/api/SubFrente`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: jsonData,
  })
  .then((res) => {
    if (!res.ok) {
      return res.json().then(data => {
        throw new Error(data.message || "No se recibió respuesta del servidor");
      });
    }
    return res.json();
  });
};

export const ActualizarSubFrente = ({ jsonData, id }) => {
  return apiFetch(`${ENDPOINT}/api/SubFrente/${id}`, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json',
      "accept": "application/json"
    },
    body: jsonData
  }).then(async res => {
    if (!res.ok) {
      if (res.status === 409) {
        const data = await res.json();
        const error = new Error(data.message || "No se puede desactivar");
        error.consultores = data.consultores;
        throw error;
      } else {
        return res.json().then(data => {
          throw new Error(data.message || "No se recibió respuesta del servidor");
        });
      }
    }
    return res.json();
  });
};

export const EliminarSubFrente = async ({ id }) => {
  return await apiFetch(`${ENDPOINT}/api/SubFrente/${id}`, {
    method: "DELETE",
    headers: {
      "accept": "application/json"
    },
  }).then(async res => {
    if (!res.ok) {
      if (res.status === 409) {
        const data = await res.json();
        const error = new Error(data.message || "No se puede desactivar");
        error.consultores = data.consultores;
        throw error;
      } else {
        throw new Error("No se recibió respuesta del servidor");
      }
    }
    return await res.json();
  });
};

// ==================== CONSULTORES ASOCIADOS ====================

export const ObtenerConsultoresAsociadosFrente = async ({ id }) => {
  return await apiFetch(`${ENDPOINT}/api/Frente/${id}/consultores-asociados`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener consultores asociados");
    return res.json();
  });
};

export const ObtenerConsultoresAsociadosSubFrente = async ({ id }) => {
  return await apiFetch(`${ENDPOINT}/api/SubFrente/${id}/consultores-asociados`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
  .then(res => {
    if (!res.ok) throw new Error("Error al obtener consultores asociados");
    return res.json();
  });
};
