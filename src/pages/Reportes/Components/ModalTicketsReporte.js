import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ObtenerTicketPorCodigo } from "../../../service/TiketService";

const ModalTicketsReporte = ({ visible, onHide, ticketsString }) => {
    const [loadingCode, setLoadingCode] = useState(null);

    // Convertir el string de tickets separados por coma en un arreglo estructurado
    const ticketsData = React.useMemo(() => {
        if (!ticketsString) return [];
        if (typeof ticketsString === 'string' && ticketsString.toLowerCase().includes('sin tickets')) return [];

        return String(ticketsString).split(',').map(t => t.trim()).filter(t => t.length > 0).map(t => {
            let codTicket = t;
            let codInterno = null;

            // Soporta formato con paréntesis: COD (INTERNO)
            const matchParentesis = t.match(/^([^\s(]+)\s*\((.*?)\)$/);
            // Soporta formato con barra: COD / INTERNO
            const matchBarra = t.match(/^([^\s/]+)\s*\/\s*(.+)$/);

            if (matchParentesis) {
                codTicket = matchParentesis[1].trim();
                codInterno = matchParentesis[2].trim();
            } else if (matchBarra) {
                codTicket = matchBarra[1].trim();
                codInterno = matchBarra[2].trim();
            } else {
                const matchToken = t.match(/^([^\s]+)/);
                codTicket = matchToken ? matchToken[1].trim() : t;
            }

            return {
                codigoOriginal: t,
                codigo: codTicket,
                codigoInterno: codInterno
            };
        });
    }, [ticketsString]);

    const handleGoToTicket = async (codigo) => {
        // Extraer únicamente el código de ticket principal limpio para la búsqueda en la API
        const codigoLimpio = (codigo || '').trim();
        setLoadingCode(codigo);
        try {
            const idUser = localStorage.getItem("idUser");
            const codRol = localStorage.getItem("codRol");
            
            // Buscar el ticket directamente por su código (endpoint más rápido)
            const res = await ObtenerTicketPorCodigo({ codigo: codigoLimpio });

            if (res && (res.id || res.Id)) {
                const ticketId = res.id || res.Id;
                const basePath = window.location.pathname.replace(/\/reportes.*/i, '');
                window.open(`${basePath}/Tickets/user/${idUser}/rol/${codRol}/Editar/${ticketId}`, '_blank');
            } else {
                console.error("No se encontró el ID para el ticket:", codigoLimpio);
            }
        } catch (error) {
            console.error("Error al buscar el ticket:", error);
        } finally {
            setLoadingCode(null);
        }
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                <Button 
                    type="button"
                    icon="pi pi-pencil" 
                    className="accion-editar" 
                    tooltip="Ir al Ticket"
                    loading={loadingCode === rowData.codigo}
                    onClick={() => handleGoToTicket(rowData.codigo)}
                    style={{ width: "32px", height: "32px", padding: 0 }}
                />
            </div>
        );
    };

    const codigoBodyTemplate = (rowData) => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="font-bold" style={{ color: '#2e4878' }}>{rowData.codigo}</span>
                {rowData.codigoInterno && (
                    <small style={{ color: '#6c757d' }}>Interno: {rowData.codigoInterno}</small>
                )}
            </div>
        );
    };

    return (
        <Dialog
            header="Tickets Asociados"
            visible={visible}
            style={{ width: "520px" }}
            modal
            onHide={onHide}
        >
            <DataTable
                value={ticketsData}
                responsiveLayout="scroll"
                className="w-full"
                emptyMessage="No hay tickets asociados."
            >
                <Column field="codigo" body={codigoBodyTemplate} header="Código de Ticket" />
                <Column body={actionBodyTemplate} style={{ width: '100px', textAlign: 'center' }} header="Acciones" />
            </DataTable>
        </Dialog>
    );
};

export default ModalTicketsReporte;
