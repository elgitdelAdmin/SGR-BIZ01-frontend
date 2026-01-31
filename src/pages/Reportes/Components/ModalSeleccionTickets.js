import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";

const ModalSeleccionTickets = ({
    visible,
    onHide,
    tickets,
    ticketsExcluidos,
    setTicketsExcluidos
}) => {
    const [globalFilter, setGlobalFilter] = useState("");

    const toggleTicketSelection = (id) => {
        const newExcluidos = new Set(ticketsExcluidos);
        if (newExcluidos.has(id)) {
            newExcluidos.delete(id);
        } else {
            newExcluidos.add(id);
        }
        setTicketsExcluidos(newExcluidos);
    };

    const handleSeleccionarTodos = () => {
        setTicketsExcluidos(new Set());
    };

    const handleDeseleccionarTodos = () => {
        const allIds = new Set(tickets.map(t => t.id));
        setTicketsExcluidos(allIds);
    };

    const checkboxTemplate = (rowData) => {
        const isChecked = !ticketsExcluidos.has(rowData.id);
        return (
            <Checkbox
                checked={isChecked}
                onChange={() => toggleTicketSelection(rowData.id)}
            />
        );
    };

    const headerTickets = (
        <div className="flex flex-column gap-4 p-4">
            <div className="flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="flex align-items-center gap-3">
                    <span className="text-xl font-bold text-900">Listado de Tickets</span>
                    <span className="inline-flex align-items-center justify-content-center bg-primary border-round px-3 py-1 text-sm font-bold">
                        {tickets.length - ticketsExcluidos.size} seleccionados
                    </span>
                </div>
                <div className="flex gap-2">
                    <Button
                        label="Todos"
                        icon="pi pi-check-square"
                        className="p-button-sm"
                        onClick={handleSeleccionarTodos}
                        tooltip="Seleccionar todos los tickets disponibles"
                    />
                    <Button
                        label="Ninguno"
                        icon="pi pi-stop"
                        className="p-button-sm p-button-outlined p-button-secondary"
                        onClick={handleDeseleccionarTodos}
                        tooltip="Deseleccionar todos"
                    />
                </div>
            </div>
            <span className="p-input-icon-left w-full">
                <i className="pi pi-search text-500" />
                <InputText
                    type="search"
                    onInput={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Buscar por código o título..."
                    className="w-full p-inputtext-lg"
                />
            </span>
        </div>
    );

    return (
        <Dialog
            header="Selección de Tickets"
            visible={visible}
            style={{ width: '70vw' }}
            modal
            onHide={onHide}
            contentStyle={{ padding: 0 }}
        >
            <DataTable
                value={tickets}
                dataKey="id"
                paginator
                rows={10}
                rowsPerPageOptions={[10, 25, 50]}
                globalFilter={globalFilter}
                header={headerTickets}
                emptyMessage="No se encontraron tickets."
                responsiveLayout="scroll"
                size="small"
                className="p-datatable-sm"
                stripeRows
            >
                <Column
                    body={checkboxTemplate}
                    headerStyle={{ width: '3em' }}
                    bodyStyle={{ textAlign: 'center' }}
                />
                <Column field="codTicket" header="Código" sortable style={{ width: '20%' }}></Column>
                <Column field="titulo" header="Título" sortable></Column>
            </DataTable>
        </Dialog>
    );
};

export default ModalSeleccionTickets;
