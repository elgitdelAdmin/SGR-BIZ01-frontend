
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { MultiSelect } from "primereact/multiselect";
import ExpandableCard from "../../../components/ExpandableCard/ExpandableCard";
import { DashboardTicketsConsultor } from "../../../service/ReporteService";

const DashboardCargabilidadConsultor = () => {
    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para los filtros
    const [consultoresSeleccionados, setConsultoresSeleccionados] = useState([]);
    const [empresasSeleccionadas, setEmpresasSeleccionadas] = useState([]);
    const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
    const [ticketsSeleccionados, setTicketsSeleccionados] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await DashboardTicketsConsultor();
                setTickets(data);
            } catch (err) {
                console.error("Error al cargar dashboard:", err);
                setError("No se pudieron cargar los tickets del dashboard.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Extraer opciones únicas directamente de los tickets cargados
    const opcionesConsultores = useMemo(() => {
        const nombres = [...new Set(tickets.map(t => t.NombreCompleto).filter(Boolean))];
        return nombres.map(n => ({ label: n, value: n }));
    }, [tickets]);

    const opcionesEmpresas = useMemo(() => {
        const nombres = [...new Set(tickets.map(t => t.EmpresaNombre).filter(Boolean))];
        return nombres.map(n => ({ label: n, value: n }));
    }, [tickets]);

    const opcionesTipos = useMemo(() => {
        const nombres = [...new Set(tickets.map(t => t.TipoTicket).filter(Boolean))];
        return nombres.map(n => ({ label: n, value: n }));
    }, [tickets]);

    const opcionesTickets = useMemo(() => {
        return tickets.map(t => ({
            label: `${t.CodConecta} - ${t.Titulo}`,
            value: t.CodConecta
        }));
    }, [tickets]);

    // Filtrado local basado en los valores seleccionados
    const ticketsFiltrados = useMemo(() => {
        return tickets.filter(t => {
            if (consultoresSeleccionados.length > 0 && !consultoresSeleccionados.includes(t.NombreCompleto)) {
                return false;
            }
            if (empresasSeleccionadas.length > 0 && !empresasSeleccionadas.includes(t.EmpresaNombre)) {
                return false;
            }
            if (tiposSeleccionados.length > 0 && !tiposSeleccionados.includes(t.TipoTicket)) {
                return false;
            }
            if (ticketsSeleccionados.length > 0 && !ticketsSeleccionados.includes(t.CodConecta)) {
                return false;
            }
            return true;
        });
    }, [tickets, consultoresSeleccionados, empresasSeleccionadas, tiposSeleccionados, ticketsSeleccionados]);

    return (
        <div className="zv-usuario" style={{ paddingTop: 16 }}>
            <ConfirmDialog />
            <Toast position="top-center"></Toast>
            <div className="header-titulo">Dashboard</div>

            <div className="card" style={{ marginTop: 16 }}>
                <div className="p-fluid grid">
                    <div className="field col-12 md:col-6">
                        <label className="font-bold">Consultores</label>
                        <MultiSelect
                            value={consultoresSeleccionados}
                            options={opcionesConsultores}
                            onChange={(e) => setConsultoresSeleccionados(e.value)}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Todos los Consultores"
                            display="chip"
                            filter
                            showClear
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-bold">Empresas</label>
                        <MultiSelect
                            value={empresasSeleccionadas}
                            options={opcionesEmpresas}
                            onChange={(e) => setEmpresasSeleccionadas(e.value)}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Todas las Empresas"
                            display="chip"
                            filter
                            showClear
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-bold">Tipo Ticket</label>
                        <MultiSelect
                            value={tiposSeleccionados}
                            options={opcionesTipos}
                            onChange={(e) => setTiposSeleccionados(e.value)}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Todos los Tipos"
                            display="chip"
                            filter
                            showClear
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label className="font-bold">Tickets</label>
                        <MultiSelect
                            value={ticketsSeleccionados}
                            options={opcionesTickets}
                            onChange={(e) => setTicketsSeleccionados(e.value)}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Todos los Tickets"
                            display="chip"
                            filter
                            showClear
                        />
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 24 }}>
                {loading && (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
                        Cargando tickets...
                    </div>
                )}

                {error && !loading && (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#e53935" }}>
                        {error}
                    </div>
                )}

                {!loading && !error && ticketsFiltrados.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
                        No hay tickets para mostrar con los filtros actuales.
                    </div>
                )}

                {!loading && !error && ticketsFiltrados.length > 0 && (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                        gap: "16px"
                    }}>
                        {ticketsFiltrados.map((ticket, index) => (
                            <ExpandableCard key={index} ticket={ticket} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardCargabilidadConsultor;