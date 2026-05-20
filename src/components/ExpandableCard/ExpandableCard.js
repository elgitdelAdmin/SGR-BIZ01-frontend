import React, { useState } from "react";
import "./ExpandableCard.scss";

const ExpandableCard = ({ ticket }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const porcentaje = ticket.PorcentajeAvance;
    const isOver = porcentaje !== null && porcentaje > 100;
    const displayPercent = porcentaje !== null ? `${porcentaje}%` : "N/A";
    const barWidth = porcentaje !== null ? Math.min(porcentaje, 100) : 0;

    const headerLabel = `${ticket.NombreCompleto} — ${ticket.CodConecta}`;

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        if (isNaN(date)) return "—";
        return date.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

    const getSemaforoColor = (colorStr) => {
        switch ((colorStr || "").toUpperCase()) {
            case "ROJO": return "#e53935";
            case "VERDE": return "#4caf50";
            case "AMARILLO": return "#ffb300";
            default: return "#aaaaaa";
        }
    };

    const parseJsonArray = (jsonStr) => {
        try {
            return JSON.parse(jsonStr) || [];
        } catch {
            return [];
        }
    };

    const detallesPlanificacion = parseJsonArray(ticket.DetallesPlanificacion);
    const detallesTareas = parseJsonArray(ticket.DetallesTareas);

    const renderDetallesList = (detalles, titulo) => {
        if (!detalles || detalles.length === 0) return null;
        return (
            <>
                <div className="expandable-card__divider"></div>
                <div className="expandable-card__detail-item" style={{ gridColumn: "1 / -1" }}>
                    <span className="expandable-card__detail-label">{titulo} ({detalles.length})</span>
                    <div style={{ maxHeight: "100px", overflowY: "auto", border: "1px solid #f0f0f0", borderRadius: "4px", padding: "4px 8px", marginTop: "4px", background: "#fafafa" }}>
                        <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11px", color: "#555" }}>
                            {detalles.map((d, index) => (
                                <li key={d.Id || index} style={{ marginBottom: "2px" }}>
                                    <strong>{formatDate(d.FechaInicio)}</strong> ({d.Horas}h) - {d.Descripcion}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="expandable-card">
            <div className="expandable-card__header" onClick={toggleExpand}>
                <span className="expandable-card__title">{headerLabel}</span>
                <div
                    title={detallesPlanificacion.length > 0 ? "Con planificación" : "Sin planificación"}
                    style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        backgroundColor: detallesPlanificacion.length > 0 ? '#4caf50' : '#e53935',
                        border: '3px solid rgba(255,255,255,0.7)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        flexShrink: 0,
                        marginRight: 8
                    }}
                ></div>
                <span className="expandable-card__toggle-icon">
                    {expanded ? "−" : "+"}
                </span>
            </div>
            <div className={`expandable-card__body ${expanded ? "expandable-card__body--expanded" : ""}`}>
                <div className="expandable-card__detail-grid">
                    <div className="expandable-card__detail-item">
                        <span className="expandable-card__detail-label">Cód. Conecta</span>
                        <span className="expandable-card__detail-value">{ticket.CodConecta}</span>
                    </div>
                    <div className="expandable-card__detail-item">
                        <span className="expandable-card__detail-label">Cód. Migración</span>
                        <span className="expandable-card__detail-value">{ticket.CodMigracion || "—"}</span>
                    </div>
                    <div className="expandable-card__detail-item">
                        <span className="expandable-card__detail-label">Título</span>
                        <span className="expandable-card__detail-value">{ticket.Titulo}</span>
                    </div>
                    <div className="expandable-card__detail-item">
                        <span className="expandable-card__detail-label">Empresa</span>
                        <span className="expandable-card__detail-value">{ticket.EmpresaNombre || "—"}</span>
                    </div>
                    <div className="expandable-card__detail-item">
                        <span className="expandable-card__detail-label">Socio</span>
                        <span className="expandable-card__detail-value">{ticket.SocioNombre || "—"}</span>
                    </div>
                    <div className="expandable-card__detail-item">
                        <span className="expandable-card__detail-label">Estado</span>
                        <span className="expandable-card__detail-value">{ticket.EstadoTicket || "—"}</span>
                    </div>
                    <div className="expandable-card__detail-item">
                        <span className="expandable-card__detail-label">Tipo</span>
                        <span className="expandable-card__detail-value">{ticket.TipoTicket || "—"}</span>
                    </div>
                    <div className="expandable-card__detail-item">
                        <span className="expandable-card__detail-label">Subtipo</span>
                        <span className="expandable-card__detail-value">{ticket.SubtipoTicket || "—"}</span>
                    </div>
                    <div className="expandable-card__detail-item">
                        <span className="expandable-card__detail-label">Gestor</span>
                        <span className="expandable-card__detail-value">{ticket.NombreCompletoGestor || "—"}</span>
                    </div>

                    <div className="expandable-card__divider"></div>

                    <div className="expandable-card__detail-item">
                        <span className="expandable-card__detail-label">F. Inicio Plan</span>
                        <span className="expandable-card__detail-value">{formatDate(ticket.FechaInicioPlanificada)}</span>
                    </div>
                    <div className="expandable-card__detail-item">
                        <span className="expandable-card__detail-label">F. Fin Plan</span>
                        <span className="expandable-card__detail-value">{formatDate(ticket.FechaFinPlanificada)}</span>
                    </div>
                    <div className="expandable-card__detail-item">
                        <span className="expandable-card__detail-label">F. Inicio Real</span>
                        <span className="expandable-card__detail-value">{formatDate(ticket.FechaInicioReal)}</span>
                    </div>
                    <div className="expandable-card__detail-item">
                        <span className="expandable-card__detail-label">F. Fin Real</span>
                        <span className="expandable-card__detail-value">{formatDate(ticket.FechaFinReal)}</span>
                    </div>
                    <div className="expandable-card__detail-item">
                        <span className="expandable-card__detail-label">Semáforo</span>
                        <span className="expandable-card__detail-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                                width: 12, height: 12, borderRadius: '50%',
                                backgroundColor: getSemaforoColor(ticket.SemaforoFecha)
                            }}></div>
                            {ticket.SemaforoFecha || "—"}
                        </span>
                    </div>
                    <div className="expandable-card__detail-item">
                        <span className="expandable-card__detail-label">Días Trans. (Real)</span>
                        <span className="expandable-card__detail-value">
                            {ticket.DiasTranscurridosReal !== null && ticket.DiasTranscurridosReal !== undefined ? ticket.DiasTranscurridosReal : "—"}
                        </span>
                    </div>

                    <div className="expandable-card__divider"></div>

                    <div className="expandable-card__progress-section">
                        <div className="expandable-card__progress-header">
                            <span className="expandable-card__progress-label">Avance</span>
                            <span className={`expandable-card__progress-percent ${
                                porcentaje === null
                                    ? "expandable-card__progress-percent--na"
                                    : isOver
                                        ? "expandable-card__progress-percent--over"
                                        : "expandable-card__progress-percent--normal"
                            }`}>
                                {displayPercent}
                            </span>
                        </div>
                        <div className="expandable-card__progress-bar">
                            <div
                                className={`expandable-card__progress-fill ${
                                    isOver
                                        ? "expandable-card__progress-fill--over"
                                        : "expandable-card__progress-fill--normal"
                                }`}
                                style={{ width: `${barWidth}%` }}
                            ></div>
                        </div>
                        <div className="expandable-card__hours-row">
                            <span className="expandable-card__hours-item">
                                Planificadas: <span>{ticket.HorasPlanificadas}</span>
                            </span>
                            <span className="expandable-card__hours-item">
                                Realizadas: <span>{ticket.HorasRealizadas}</span>
                            </span>
                        </div>
                    </div>

                    {renderDetallesList(detallesPlanificacion, "Detalles de Planificación")}
                    {renderDetallesList(detallesTareas, "Detalles de Tareas")}
                </div>
            </div>
        </div>
    );
};

export default ExpandableCard;
