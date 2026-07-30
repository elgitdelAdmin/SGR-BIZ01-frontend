import { Navigate } from "react-router-dom";
import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPICONECTA;



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
export const ListarPais = async () => {
  return await fetch(`${ENDPOINT}/api/Paises`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al obtener los paises");
      return res.json();
    });
};


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

export const RegistrarTiket = ({ ticketData }) => {
  return fetch(`${ENDPOINT}/api/Ticket`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketData),
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
      return res.json()
    })
    .then((ticket) => {
      if (ticket.errors) throw new Error(ticket.errors[0]);
      return ticket;

    });
};
export const ActualizarTicket = ({ ticketData, idTicket }) => {
  return fetch(`${ENDPOINT}/api/Ticket/${idTicket}`, {
    method: "PUT",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketData),
  })
    .then((res) => {
      console.log("res1", res)

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
      console.log("res1", res)

      if (res.errors) throw new Error(res.errors[0]);
      const { data } = res;
      return data;
    });
};

export const ListarTicket = async ({ idUser, codRol }) => {
  const idSocio = window.localStorage.getItem("idsocio");
  return await fetch(`${ENDPOINT}/api/Ticket/user/${idUser}/rol/${codRol}?idSocio=${idSocio || ''}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al obtener los ticket");
      return res.json();
    });
};

export const ListarTicketPaginado = async ({ idUser, codRol, page = 0, pageSize = 10, estadoIds, globalFilter, sortField, sortOrder, columnFilters }) => {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('pageSize', pageSize);
  if (estadoIds && estadoIds.length > 0) params.append('estadoIds', estadoIds.join(','));
  if (globalFilter) params.append('globalFilter', globalFilter);
  if (sortField) params.append('sortField', sortField);
  if (sortOrder) params.append('sortOrder', sortOrder);

  const idSocio = window.localStorage.getItem("idsocio");
  if (idSocio) params.append('idSocio', idSocio);

  // Filtros de columna específicos
  if (columnFilters) {
    if (columnFilters.codTicket) params.append('codTicket', columnFilters.codTicket);
    if (columnFilters.codTicketInterno) params.append('codTicketInterno', columnFilters.codTicketInterno);
    if (columnFilters.titulo) params.append('titulo', columnFilters.titulo);
    if (columnFilters.fechaSolicitud) params.append('fechaSolicitud', columnFilters.fechaSolicitud);
    if (columnFilters.estadoNombre) params.append('estado', columnFilters.estadoNombre);
    if (columnFilters.prioridadNombre) params.append('prioridad', columnFilters.prioridadNombre);
    if (columnFilters['empresa.razonSocial'] || columnFilters.empresaRazonSocial) {
      params.append('empresa', columnFilters['empresa.razonSocial'] || columnFilters.empresaRazonSocial);
    }
    if (columnFilters.nombreGestor) params.append('gestor', columnFilters.nombreGestor);
    if (columnFilters.nombreConsultores) params.append('nombreConsultor', columnFilters.nombreConsultores);
    if (columnFilters.tipoSubtipoNombre || columnFilters.tipoSubtipo) {
      params.append('tipoSubtipo', columnFilters.tipoSubtipoNombre || columnFilters.tipoSubtipo);
    }
  }

  return await fetch(`${ENDPOINT}/api/Ticket/user/${idUser}/rol/${codRol}/paged?${params.toString()}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al obtener los tickets paginados");
      return res.json();
    });
};


export const EliminarTicket = async ({ id }) => {
  return await fetch(`${ENDPOINT}/api/Ticket/${id}`, {
    method: "DELETE",
    headers: {
      "accept": "text/plain"
    },
  }).then(async res => {
    console.log("res", res);

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

export const ObtenerTicket = async ({ id }) => {
  return await fetch(`${ENDPOINT}/api/Ticket/${id}`, {
    method: "GET",
    headers: {
      "accept": "text/plain"
    },

  })
    .then(res => {
      if (!res.ok) throw new Error("Error al obtener los ticket");
      return res.json();
    });



}

export const ListarGestorConsultoria = async () => {
  return await fetch(`${ENDPOINT}/api/Gestor/byIdRol/6/byIdSocio/${window.localStorage.getItem("idsocio")}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al obtener los Gestores");
      return res.json();
    });
};

export const ListarGestorCuenta = async () => {
  return await fetch(`${ENDPOINT}/api/Gestor/byIdRol/3/byIdSocio/${window.localStorage.getItem("idsocio")}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al obtener los Gestores");
      return res.json();
    });
};
export const DescargarArchivoTicket = async ({ idTicket, orden }) => {
  return fetch(`${ENDPOINT}/api/Ticket/${idTicket}/desgarcarArchivo/${orden}`, {
    method: "GET",
    headers: {
      "Accept": "*/*",
    },
  })
    .then(async (res) => {
      if (!res.ok) {
        if (res.status === 401) {
          window.localStorage.removeItem("jwt");
          window.location.reload();
        } else {
          throw new Error("Error al descargar el archivo");
        }
      }

      // El endpoint devuelve un archivo, no JSON
      return res.blob();
    })
    .then((blob) => {
      return blob;
    });
};

export const MigrarTicketSgr = async ({ codTicketInterno }) => {
  return await fetch(`${ENDPOINT}/api/Ticket/migrarsgr/${codTicketInterno}`, {
    method: "POST",
    headers: {
      "Accept": "application/json"
    },
  })
    .then(async res => {
      if (!res.ok) {
        if (res.status === 401) {
          window.localStorage.removeItem('jwt');
          window.location.reload();
        } else {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.mensaje || "Error al sincronizar ticket desde SGR");
        }
      }
      return res.json();
    });
};
