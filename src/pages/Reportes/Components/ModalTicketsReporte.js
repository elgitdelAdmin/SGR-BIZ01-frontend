import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ObtenerTicketPorCodigo } from "../../../service/TiketService";

const ModalTicketsReporte = ({ visible, onHide, ticketsString }) => {
    const [loadingCode, setLoadingCode] = useState(null);

    // Convertir el string de tickets separados por coma en un arreglo
    const ticketsData = React.useMemo(() => {
        if (!ticketsString) return [];
        return ticketsString.split(',').map(t => t.trim()).filter(t => t.length > 0).map(t => ({
            codigo: t
        }));
    }, [ticketsString]);

    const handleGoToTicket = async (codigo) => {
        setLoadingCode(codigo);
        try {
            const idUser = localStorage.getItem("idUser");
            const codRol = localStorage.getItem("codRol");
            
            // Buscar el ticket directamente por su código (endpoint más rápido)
            const res = await ObtenerTicketPorCodigo({ codigo });

            if (res && (res.id || res.Id)) {
                const ticketId = res.id || res.Id;
                const basePath = window.location.pathname.replace(/\/reportes.*/i, '');
                window.open(`${basePath}/Tickets/user/${idUser}/rol/${codRol}/Editar/${ticketId}`, '_blank');
            } else {
                console.error("No se encontró el ID para el ticket:", codigo);
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

    return (
        <Dialog
            header="Tickets Asociados"
            visible={visible}
            style={{ width: "450px" }}
            modal
            onHide={onHide}
        >
            <DataTable
                value={ticketsData}
                responsiveLayout="scroll"
                className="w-full"
                emptyMessage="No hay tickets asociados."
            >
                <Column field="codigo" header="Código de Ticket" />
                <Column body={actionBodyTemplate} style={{ width: '100px', textAlign: 'center' }} header="Acciones" />
            </DataTable>
        </Dialog>
    );
};

export default ModalTicketsReporte;
