import * as constantes from "../constants/constantes.js";
const ENDPOINT = constantes.URLAPICONECTA;

/**
 * Servicio para generar reportes enviando los filtros seleccionados.
 * @param {Object} filtros - Objeto con los filtros (tipoReporte, empresas, tickets, etc.)
 * @returns {Promise<Blob>} - Retorna un Blob con el archivo Excel generado.
 */
/**
 * Servicio para consultar los datos del reporte (JSON para la tabla).
 * @param {Object} filtros - Objeto con los filtros.
 * @returns {Promise<Array>} - Retorna un array con los datos del reporte.
 */
export const ConsultarDetalleReporte = async (filtros) => {
    return await fetch(`${ENDPOINT}/api/Reportes/ConsultarDetalle`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(filtros),
    })
        .then(async (res) => {
            if (!res.ok) {
                if (res.status === 401) {
                    window.localStorage.removeItem("jwt");
                    window.location.reload();
                }
                throw new Error("Error al consultar los datos del reporte");
            }
            return res.json();
        });
};

export const GenerarReporteExcel = async (filtros) => {
    return await fetch(`${ENDPOINT}/api/Reportes/GenerarExcel`, {
        method: "POST",
        headers: {
            "Accept": "application/octet-stream",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(filtros),
    })
        .then(async (res) => {
            if (!res.ok) {
                if (res.status === 401) {
                    window.localStorage.removeItem("jwt");
                    window.location.reload();
                }
                throw new Error("Error al generar el reporte");
            }
            return res.blob();
        });
};

/**
 * Servicio para obtener el dashboard de tickets por consultor.
 * @returns {Promise<Array>} - Retorna un array con los datos del dashboard.
 */
export const DashboardTicketsConsultor = async (filtros) => {
    const params = new URLSearchParams();
    if (filtros) {
        if (filtros.consultores && filtros.consultores.length > 0) {
            filtros.consultores.forEach(id => params.append('consultores', id));
        }
        if (filtros.tipos && filtros.tipos.length > 0) {
            filtros.tipos.forEach(id => params.append('tipos', id));
        }
        if (filtros.tickets && filtros.tickets.length > 0) {
            filtros.tickets.forEach(cod => params.append('tickets', cod));
        }
        if (filtros.estados && filtros.estados.length > 0) {
            filtros.estados.forEach(id => params.append('estados', id));
        }
    }
    const url = `${ENDPOINT}/api/Reportes/DashboardTicketsConsultor?${params.toString()}`;
    return await fetch(url, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
    })
        .then(async (res) => {
            if (!res.ok) {
                if (res.status === 401) {
                    window.localStorage.removeItem("jwt");
                    window.location.reload();
                }
                throw new Error("Error al consultar el dashboard de tickets");
            }
            return res.json();
        });
};
