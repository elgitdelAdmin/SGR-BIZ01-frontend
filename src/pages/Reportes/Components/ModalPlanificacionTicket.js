import React, { useState, useEffect, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { ObtenerTicket, ObtenerTicketPorCodigo, ListarFrentes } from "../../../service/TiketService";
import { ListarConsultores } from "../../../service/ConsultorService";

// Helper para normalizar a HH:MM
const normalizeHHMM = (raw) => {
    let s = String(raw ?? "").trim();
    if (!s) return "0:00";
    s = s.replace(".", ":");
    const cleaned = s.replace(/[^0-9:]/g, "");
    if (!cleaned) return "0:00";
    const parts = cleaned.split(":");
    const hh = String(Number(parts[0] ?? "0"));
    let mm = parts[1] ?? "";
    if (mm === "") mm = "00";
    if (mm.length === 1) mm = `${mm}0`;
    if (mm.length > 2) mm = mm.slice(0, 2);
    return `${hh}:${mm}`;
};

const hhmmToMinutes = (raw) => {
    if (!raw) return 0;
    const norm = normalizeHHMM(raw);
    const [hhStr, mmStr = "00"] = norm.split(":");
    const hh = Number(hhStr);
    const mm = Number(mmStr);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 0;
    if (mm < 0 || mm > 59) return 0;
    return hh * 60 + mm;
};

const calcularTotalHorasFsf = (fsf) => {
    const detalles = fsf?.detallePlanificacionConsultor || fsf?.DetallePlanificacionConsultor || [];
    const totalMin = detalles
        .filter(d => d.activo !== false && d.Activo !== false)
        .reduce((acc, it) => {
            const h = it.horas ?? it.Horas;
            return acc + hhmmToMinutes(h);
        }, 0);
    const hh = Math.floor(totalMin / 60);
    const mm = totalMin % 60;
    return `${hh}:${String(mm).padStart(2, "0")}`;
};

const ModalPlanificacionTicket = ({
    visible,
    onHide,
    codTicket,
    ticketId,
    parametros = []
}) => {
    const [loading, setLoading] = useState(false);
    const [ticketData, setTicketData] = useState(null);
    const [frentes, setFrentes] = useState([]);
    const [consultores, setConsultores] = useState([]);
    const [selectedFsf, setSelectedFsf] = useState(null);
    const [modalDetalleVisible, setModalDetalleVisible] = useState(false);

    // Cargar catálogos de frentes y consultores una sola vez
    useEffect(() => {
        let isMounted = true;
        const fetchCatalogos = async () => {
            try {
                const [frentesRes, consultoresRes] = await Promise.all([
                    ListarFrentes(),
                    ListarConsultores()
                ]);
                if (isMounted) {
                    if (Array.isArray(frentesRes)) setFrentes(frentesRes);
                    if (Array.isArray(consultoresRes)) setConsultores(consultoresRes);
                }
            } catch (err) {
                console.error("Error al cargar catálogos para ModalPlanificacionTicket:", err);
            }
        };

        if (visible && frentes.length === 0) {
            fetchCatalogos();
        }

        return () => { isMounted = false; };
    }, [visible, frentes.length]);

    // Cargar datos del ticket cuando el modal se hace visible
    useEffect(() => {
        let isMounted = true;
        const fetchTicket = async () => {
            if (!visible || (!codTicket && !ticketId)) {
                setTicketData(null);
                return;
            }

            setLoading(true);
            try {
                let data = null;
                if (ticketId) {
                    data = await ObtenerTicket({ id: ticketId });
                } else if (codTicket) {
                    const limpio = String(codTicket).trim();
                    data = await ObtenerTicketPorCodigo({ codigo: limpio });
                }

                if (isMounted) {
                    setTicketData(data);
                }
            } catch (error) {
                console.error("Error al cargar ticket para planificación:", error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchTicket();

        return () => { isMounted = false; };
    }, [visible, codTicket, ticketId]);

    // Filtrar especializaciones activas
    const especializaciones = useMemo(() => {
        const list = ticketData?.frenteSubFrentes || ticketData?.FrenteSubFrentes || [];
        return list.filter(item => item.activo !== false && item.Activo !== false);
    }, [ticketData]);

    // Resolver nombres de Frente y Subfrente
    const getFrenteSubFrenteNames = (fsf) => {
        const fId = fsf.idFrente || fsf.IdFrente;
        const sfId = fsf.idSubFrente || fsf.IdSubFrente;

        const frente = frentes.find(f => f.id === fId);
        const frenteNombre = frente?.nombre || "—";
        const subfrente = (frente?.subFrente || []).find(sf => sf.id === sfId);
        const subfrenteNombre = subfrente?.nombre || "—";

        return { frenteNombre, subfrenteNombre };
    };

    // Resolver nombre del consultor asignado a la especialización
    const getConsultorNombre = (fsf) => {
        const asigs = ticketData?.consultorAsignaciones || ticketData?.ConsultorAsignaciones || [];
        const fsfId = fsf.id || fsf.Id;
        const subFrenteId = fsf.idSubFrente || fsf.IdSubFrente;

        let asig = asigs.find(a => 
            (a.activo !== false && a.Activo !== false) && 
            Number(a.idTicketFrenteSubFrente || a.IdTicketFrenteSubFrente) === Number(fsfId)
        );

        if (!asig && subFrenteId) {
            asig = asigs.find(a => 
                (a.activo !== false && a.Activo !== false) && 
                Number(a.idSubFrente || a.IdSubFrente) === Number(subFrenteId)
            );
        }

        if (!asig) return "—";

        const c = asig.consultor || asig.Consultor;
        if (c?.persona || c?.Persona) {
            const p = c.persona || c.Persona;
            const full = `${p.nombres || p.Nombres || ""} ${p.apellidoPaterno || p.ApellidoPaterno || ""}`.trim();
            if (full) return full;
        }

        const idCons = asig.idConsultor || asig.IdConsultor;
        if (idCons && consultores.length > 0) {
            const found = consultores.find(item => Number(item.id) === Number(idCons));
            if (found) {
                if (found.nombre) return found.nombre;
                if (found.persona) return `${found.persona.nombres || ""} ${found.persona.apellidoPaterno || ""}`.trim();
            }
        }

        return "—";
    };

    const getInitials = (name) => {
        if (!name || name === "—") return "";
        return name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase();
    };

    // Resolver nombre del tipo de actividad
    const getNombreTipoActividad = (idTipo) => {
        if (!idTipo) return "—";
        const tipo = (parametros || []).find(
            p => (p.tipoParametro === "TipoActividad" || p.TipoParametro === "TipoActividad") && 
                 (p.id === idTipo || p.Id === idTipo)
        );
        return tipo?.nombre || tipo?.Nombre || "—";
    };

    // Renderizado de columnas de la tabla de especializaciones
    const frenteSubFrenteTemplate = (rowData) => {
        const { frenteNombre, subfrenteNombre } = getFrenteSubFrenteNames(rowData);
        return (
            <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600, color: "#2e4878" }}>{frenteNombre}</span>
                <span style={{ fontSize: "12px", color: "#9198a7", marginTop: "2px" }}>{subfrenteNombre}</span>
            </div>
        );
    };

    const consultorTemplate = (rowData) => {
        const name = getConsultorNombre(rowData);
        const initials = getInitials(name);
        return (
            <div style={{ display: "flex", alignItems: "center" }}>
                {initials && (
                    <span 
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "28px",
                            height: "28px",
                            borderRadius: "4px",
                            whiteSpace: "nowrap",
                            backgroundColor: "#e8f1f5",
                            color: "#1e3a58",
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginRight: "8px",
                            flexShrink: 0
                        }}
                    >
                        {initials}
                    </span>
                )}
                <span style={{ color: "#646e8c", fontSize: "13px" }}>{name}</span>
            </div>
        );
    };

    const vigenciaTemplate = (rowData) => {
        const start = rowData.fechaInicio ? new Date(rowData.fechaInicio).toLocaleDateString("es-ES") : "";
        const end = rowData.fechaFin ? new Date(rowData.fechaFin).toLocaleDateString("es-ES") : "";
        if (!start && !end) return "—";
        return (
            <span style={{ color: "#646e8c", fontSize: "13px", whiteSpace: "nowrap" }}>
                {start} &rarr; {end}
            </span>
        );
    };

    const descripcionTemplate = (rowData) => (
        <span style={{ color: "#646e8c", fontSize: "13px" }}>
            {rowData.descripcion || "—"}
        </span>
    );

    const horasPlanificadasTemplate = (rowData) => {
        const hrs = calcularTotalHorasFsf(rowData);
        return (
            <span 
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    backgroundColor: "#e8f1f5",
                    color: "#1e3a58"
                }}
            >
                {hrs} h
            </span>
        );
    };

    const planificacionActionTemplate = (rowData) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
                type="button"
                icon="pi pi-plus"
                title="Ver Planificación"
                style={{
                    width: "32px",
                    height: "32px",
                    padding: 0,
                    borderRadius: "8px",
                    backgroundColor: "#e8f1f5",
                    borderColor: "#e8f1f5",
                    color: "#0e71ae"
                }}
                onClick={() => {
                    setSelectedFsf(rowData);
                    setModalDetalleVisible(true);
                }}
            />
        </div>
    );

    // Detalle de la planificación seleccionada
    const detallesActivos = useMemo(() => {
        if (!selectedFsf) return [];
        const raw = selectedFsf.detallePlanificacionConsultor || selectedFsf.DetallePlanificacionConsultor || [];
        return raw.filter(d => d.activo !== false && d.Activo !== false);
    }, [selectedFsf]);

    const headerTitle = (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="pi pi-calendar" style={{ color: "#0e71ae", fontSize: "18px" }} />
            <span style={{ fontWeight: 700, fontSize: "16px", color: "#1e3a58", fontFamily: "Poppins, sans-serif" }}>
                Especializaciones y Planificación — {ticketData?.codTicket || codTicket || ""}
                {ticketData?.codTicketInterno && (
                    <span style={{ fontWeight: 400, fontSize: "13px", color: "#6c757d", marginLeft: "6px" }}>
                        ({ticketData.codTicketInterno})
                    </span>
                )}
            </span>
        </div>
    );

    return (
        <>
            <Dialog
                header={headerTitle}
                visible={visible}
                style={{ width: "900px", maxWidth: "95vw" }}
                modal
                onHide={onHide}
            >
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px" }}>
                        <ProgressSpinner style={{ width: "40px", height: "40px" }} />
                        <span style={{ marginTop: "12px", color: "#6c757d", fontSize: "14px" }}>Cargando planificación...</span>
                    </div>
                ) : (
                    <DataTable
                        value={especializaciones}
                        responsiveLayout="scroll"
                        className="w-full"
                        emptyMessage="No se encontraron especializaciones registradas para este ticket."
                    >
                        <Column field="frente" header="Frente / Subfrente" body={frenteSubFrenteTemplate} style={{ width: "22%" }} />
                        <Column field="consultor" header="Consultor" body={consultorTemplate} style={{ width: "25%" }} />
                        <Column field="vigencia" header="Vigencia" body={vigenciaTemplate} style={{ width: "20%" }} />
                        <Column field="descripcion" header="Descripción" body={descripcionTemplate} style={{ width: "15%" }} />
                        <Column field="horasPlanificadas" header="H. Planificadas" body={horasPlanificadasTemplate} style={{ width: "10%", textAlign: "center" }} headerStyle={{ textAlign: "center", justifyContent: "center" }} />
                        <Column header="Planificación" body={planificacionActionTemplate} style={{ width: "8%", textAlign: "center" }} headerStyle={{ textAlign: "center", justifyContent: "center" }} />
                    </DataTable>
                )}
            </Dialog>

            {/* Sub-Modal para ver el detalle de horas de una línea de especialización */}
            <Dialog
                header={
                    selectedFsf ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <i className="pi pi-clock" style={{ color: "#0e71ae", fontSize: "18px" }} />
                            <span style={{ fontWeight: 700, fontSize: "15px", color: "#1e3a58" }}>
                                Planificación: {getFrenteSubFrenteNames(selectedFsf).frenteNombre} {getFrenteSubFrenteNames(selectedFsf).subfrenteNombre}
                            </span>
                        </div>
                    ) : "Planificación"
                }
                visible={modalDetalleVisible}
                style={{ width: "750px", maxWidth: "95vw" }}
                modal
                onHide={() => {
                    setModalDetalleVisible(false);
                    setSelectedFsf(null);
                }}
                footer={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "4px 8px" }}>
                        <div style={{ fontWeight: 600, color: "#1e3a58", fontSize: "13px" }}>
                            Total Horas: <span style={{ marginLeft: "6px", color: "#0e71ae", fontWeight: 700 }}>{selectedFsf ? calcularTotalHorasFsf(selectedFsf) : "0:00"} h</span>
                        </div>
                        <Button
                            type="button"
                            label="Cerrar"
                            icon="pi pi-times"
                            className="p-button-secondary p-button-sm"
                            onClick={() => {
                                setModalDetalleVisible(false);
                                setSelectedFsf(null);
                            }}
                        />
                    </div>
                }
            >
                <DataTable
                    value={detallesActivos}
                    responsiveLayout="scroll"
                    className="w-full"
                    emptyMessage="No hay horas planificadas para esta especialización."
                >
                    <Column
                        field="FechaInicio"
                        header="Fecha Inicio"
                        body={(row) => {
                            const d = row.fechaInicio || row.FechaInicio;
                            return d ? new Date(d).toLocaleDateString("es-ES") : "—";
                        }}
                        style={{ width: "18%" }}
                    />
                    <Column
                        field="FechaFin"
                        header="Fecha Fin"
                        body={(row) => {
                            const d = row.fechaFin || row.FechaFin;
                            return d ? new Date(d).toLocaleDateString("es-ES") : "—";
                        }}
                        style={{ width: "18%" }}
                    />
                    <Column
                        field="Horas"
                        header="Horas"
                        body={(row) => {
                            const h = row.horas ?? row.Horas;
                            return <span className="font-bold">{normalizeHHMM(h)} h</span>;
                        }}
                        style={{ width: "14%", textAlign: "center" }}
                        headerStyle={{ textAlign: "center", justifyContent: "center" }}
                    />
                    <Column
                        field="IdTipoActividad"
                        header="Tipo de Actividad"
                        body={(row) => {
                            const idTipo = row.idTipoActividad ?? row.IdTipoActividad;
                            return getNombreTipoActividad(idTipo);
                        }}
                        style={{ width: "25%" }}
                    />
                    <Column
                        field="Descripcion"
                        header="Descripción"
                        body={(row) => (row.descripcion || row.Descripcion || "—")}
                        style={{ width: "25%" }}
                    />
                </DataTable>
            </Dialog>
        </>
    );
};

export default ModalPlanificacionTicket;
