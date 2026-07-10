import React, { useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";

/**
 * Normaliza "HH.MM" con 2 decimales (misma lógica de Horas.js)
 */
const normalizeHHMM = (raw) => {
    let s = String(raw ?? "").trim();
    if (!s) return "";

    s = s.replace(".", ":");

    const cleaned = s.replace(/[^0-9:]/g, "");
    if (!cleaned) return "";

    const parts = cleaned.split(":");
    const hh = String(Number(parts[0] ?? "0"));
    let mm = parts[1] ?? "";
    if (mm === "") mm = "00";
    if (mm.length === 1) mm = `${mm}0`;
    if (mm.length > 2) mm = mm.slice(0, 2);
    return `${hh}:${mm}`;
};

const hhmmToMinutes = (hhmm) => {
    if (!hhmm) return 0;
    const norm = normalizeHHMM(hhmm);
    const [hhStr, mmStr = "00"] = norm.split(":");
    const hh = Number(hhStr);
    const mm = Number(mmStr);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 0;
    return hh * 60 + mm;
};

/**
 * Modal de solo lectura que muestra el detalle de horas (tareas)
 * de las asignaciones de un consultor para un ticket específico.
 */
const ModalCargabilidad = ({
    visible,
    onHide,
    ticketData,
    consultorNombre,
    loading = false,
    parametros = [],
}) => {
    // Filtrar asignaciones del consultor por nombre
    const asignacionesConsultor = useMemo(() => {
        if (!ticketData?.consultorAsignaciones) return [];
        if (!consultorNombre) return ticketData.consultorAsignaciones;

        const nombreNorm = consultorNombre.toLowerCase().trim();

        // Intentar matchear por nombre completo del consultor
        const filtradas = ticketData.consultorAsignaciones.filter((a) => {
            const consultor = a.consultor || a.Consultor;
            if (!consultor) return false;
            const nombre = `${consultor.persona?.nombres || ""} ${consultor.persona?.apellidoPaterno || ""} ${consultor.persona?.apellidoMaterno || ""}`.toLowerCase().trim();
            return nombre.includes(nombreNorm) || nombreNorm.includes(nombre);
        });

        return filtradas.length > 0 ? filtradas : ticketData.consultorAsignaciones;
    }, [ticketData, consultorNombre]);

    // Aplanar todas las tareas de las asignaciones filtradas
    const detalleTareas = useMemo(() => {
        const tareas = [];
        asignacionesConsultor.forEach((asig) => {
            const items = asig.detalleTareasConsultor || [];
            items.filter((t) => t.activo !== false && t.Activo !== false).forEach((t) => tareas.push(t));
        });
        return tareas;
    }, [asignacionesConsultor]);

    // Total de horas
    const totalHorasHHMM = useMemo(() => {
        const totalMin = detalleTareas.reduce((acc, t) => {
            const h = t.horas ?? t.Horas;
            return acc + hhmmToMinutes(h);
        }, 0);
        const hh = Math.floor(totalMin / 60);
        const mm = totalMin % 60;
        return `${hh}:${String(mm).padStart(2, "0")}`;
    }, [detalleTareas]);

    // Resolver nombre de tipo de actividad
    const getNombreTipoActividad = (idTipoActividad) => {
        const tipo = parametros.find(
            (p) => p.tipoParametro === "TipoActividad" && p.id === idTipoActividad
        );
        return tipo?.nombre || "—";
    };

    const dialogTitle = `Ver Horas — ${ticketData?.codTicket || ""}`;

    const footer = (
        <div className="w-full flex justify-between items-center border-t pt-3 px-3">
            <div className="text-left font-semibold text-blue-700">
                Total de horas:&nbsp;{totalHorasHHMM}
            </div>
        </div>
    );

    return (
        <Dialog
            header={dialogTitle}
            visible={visible}
            style={{ width: "65vw" }}
            modal
            onHide={onHide}
            footer={footer}
        >
            {loading ? (
                <div className="flex justify-content-center p-5">
                    <ProgressSpinner style={{ width: "50px", height: "50px" }} />
                </div>
            ) : (
                <DataTable
                    value={detalleTareas}
                    responsiveLayout="scroll"
                    className="w-full"
                    emptyMessage="No hay horas registradas para este consultor."
                >
                    <Column
                        field="fechaInicio"
                        header="Fecha Inicio"
                        body={(row) => {
                            const val = row.fechaInicio ?? row.FechaInicio;
                            return val ? new Date(val).toLocaleDateString() : "";
                        }}
                    />
                    <Column
                        field="fechaFin"
                        header="Fecha Fin"
                        body={(row) => {
                            const val = row.fechaFin ?? row.FechaFin;
                            return val ? new Date(val).toLocaleDateString() : "";
                        }}
                    />
                    <Column
                        field="horas"
                        header="Horas"
                        body={(row) => {
                            const val = row.horas ?? row.Horas;
                            const hStr = val ? String(val).replace(".", ":") : "";
                            return hStr || "0:00";
                        }}
                    />
                    <Column
                        field="idTipoActividad"
                        header="Tipo de Actividad"
                        body={(row) => {
                            const id = row.idTipoActividad ?? row.IdTipoActividad;
                            return getNombreTipoActividad(id);
                        }}
                    />
                    <Column
                        field="descripcion"
                        header="Descripción"
                        body={(row) => row.descripcion ?? row.Descripcion ?? ""}
                    />
                </DataTable>
            )}
        </Dialog>
    );
};

export default ModalCargabilidad;
