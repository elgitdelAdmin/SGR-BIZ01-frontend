
import React, { useState, useEffect, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { MultiSelect } from "primereact/multiselect";
import ExpandableCard from "../../../components/ExpandableCard/ExpandableCard";
import { DashboardTicketsConsultor } from "../../../service/ReporteService";
import Context from "../../../context/usuarioContext";
import { TIPO_PARAMETRO, CODIGOS } from "../../../constants/codigosBD";
import { ListarConsultores, ListarConsultoresPorSocio } from "../../../service/ConsultorService";
import { ListarEmpresas, ListarEmpresasPorSocio } from "../../../service/EmpresaService";
import { ListarTicket } from "../../../service/TiketService";

const DashboardCargabilidadConsultor = () => {
    const navigate = useNavigate();
    const {
        parametros
    } = useContext(Context);

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estados para los filtros
    const [consultoresSeleccionados, setConsultoresSeleccionados] = useState([]);
    const [empresasSeleccionadas, setEmpresasSeleccionadas] = useState([]);
    const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
    
    const [isInitialized, setIsInitialized] = useState(() => {
        if (parametros && parametros.length > 0) {
            const paramEjecucion = parametros.find(p => 
                p.tipoParametro === TIPO_PARAMETRO.EstadoTicket && 
                p.codigo === CODIGOS.EstadoTicket.EnEjecucion
            );
            return paramEjecucion ? true : false;
        }
        return false;
    });

    const [estadosSeleccionados, setEstadosSeleccionados] = useState(() => {
        const paramEjecucion = (parametros || []).find(p => 
            p.tipoParametro === TIPO_PARAMETRO.EstadoTicket && 
            p.codigo === CODIGOS.EstadoTicket.EnEjecucion
        );
        return paramEjecucion ? [paramEjecucion.id] : [];
    });
    const [ticketsSeleccionados, setTicketsSeleccionados] = useState([]);

    // Establecer estado inicial a "EN EJECUCION" cuando los parámetros estén disponibles
    useEffect(() => {
        if (parametros && parametros.length > 0 && !isInitialized) {
            const paramEjecucion = parametros.find(p => 
                p.tipoParametro === TIPO_PARAMETRO.EstadoTicket && 
                p.codigo === CODIGOS.EstadoTicket.EnEjecucion
            );
            if (paramEjecucion) {
                setEstadosSeleccionados([paramEjecucion.id]);
                setIsInitialized(true);
            }
        }
    }, [parametros, isInitialized]);

    // Limpiar selección de filtros locales cuando cambian los resultados principales
    useEffect(() => {
        setConsultoresSeleccionados([]);
        setEmpresasSeleccionadas([]);
        setTicketsSeleccionados([]);
    }, [tickets]);

    // EFECTO PARA RECARGAR EL DASHBOARD CUANDO SE CAMBIEN LOS FILTROS
    useEffect(() => {
        if (!parametros || parametros.length === 0 || !isInitialized) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await DashboardTicketsConsultor({
                    tipos: tiposSeleccionados,
                    estados: estadosSeleccionados
                });
                setTickets(data);
            } catch (err) {
                console.error("Error al cargar dashboard:", err);
                setError("No se pudieron cargar los tickets del dashboard.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [tiposSeleccionados, estadosSeleccionados, parametros, isInitialized]);

    // Combo de consultores alimentado por los tickets cargados desde el servidor
    const opcionesConsultores = useMemo(() => {
        const nombresUnicos = new Set();
        (tickets || []).forEach(t => {
            if (t.NombreCompleto) {
                nombresUnicos.add(t.NombreCompleto.trim());
            }
        });
        return Array.from(nombresUnicos).sort((a, b) => a.localeCompare(b)).map(nombre => ({
            label: nombre,
            value: nombre
        }));
    }, [tickets]);

    // Combo de empresas alimentado por los tickets cargados desde el servidor
    const opcionesEmpresas = useMemo(() => {
        const nombresUnicos = new Set();
        (tickets || []).forEach(t => {
            if (t.EmpresaNombre) {
                nombresUnicos.add(t.EmpresaNombre.trim());
            }
        });
        return Array.from(nombresUnicos).sort((a, b) => a.localeCompare(b)).map(nombre => ({
            label: nombre,
            value: nombre
        }));
    }, [tickets]);

    // Cargar Tipo Ticket desde el servicio de parámetros
    const opcionesTipos = useMemo(() => {
        return (parametros || [])
            .filter(p => p.tipoParametro === TIPO_PARAMETRO.TipoTicket)
            .map(p => ({ label: p.nombre, value: p.id }));
    }, [parametros]);

    // Cargar Estados desde el servicio de parámetros
    const opcionesEstados = useMemo(() => {
        return (parametros || [])
            .filter(p => p.tipoParametro === TIPO_PARAMETRO.EstadoTicket)
            .map(p => ({ label: p.nombre, value: p.id }));
    }, [parametros]);

    // Combo de tickets alimentado por los tickets cargados desde el servidor
    const opcionesTickets = useMemo(() => {
        const ticketsUnicosMap = new Map();
        
        (tickets || []).forEach(t => {
            if (!ticketsUnicosMap.has(t.CodConecta)) {
                const codigos = t.CodMigracion ? `${t.CodConecta} / ${t.CodMigracion}` : t.CodConecta;
                ticketsUnicosMap.set(t.CodConecta, {
                    label: `${codigos} - ${t.Titulo}`,
                    value: t.CodConecta
                });
            }
        });
        
        return Array.from(ticketsUnicosMap.values()).sort((a, b) => a.label.localeCompare(b.label));
    }, [tickets]);

    // Filtrado local (Consultores, Empresas y Tickets se filtran localmente, lo demás lo filtra el backend)
    const ticketsFiltrados = useMemo(() => {
        const consultoresSel = consultoresSeleccionados || [];
        const empresasSel = empresasSeleccionadas || [];
        const ticketsSel = ticketsSeleccionados || [];

        return tickets.filter(t => {
            if (consultoresSel.length > 0) {
                if (!consultoresSel.includes(t.NombreCompleto)) {
                    return false;
                }
            }
            if (empresasSel.length > 0) {
                if (!empresasSel.includes(t.EmpresaNombre)) {
                    return false;
                }
            }
            if (ticketsSel.length > 0) {
                if (!ticketsSel.includes(t.CodConecta)) {
                    return false;
                }
            }
            return true;
        });
    }, [tickets, consultoresSeleccionados, empresasSeleccionadas, ticketsSeleccionados]);

    return (
        <div className="zv-usuario" style={{ paddingTop: 16 }}>
            <ConfirmDialog />
            <Toast position="top-center"></Toast>
            <div className="header-titulo">Dashboard</div>

            <div className="card" style={{ marginTop: 16 }}>
                <div className="p-fluid grid">
                    <div className="field col-12 md:col-4">
                        <label className="font-bold">Consultores</label>
                        <MultiSelect
                            value={consultoresSeleccionados}
                            options={opcionesConsultores}
                            onChange={(e) => setConsultoresSeleccionados(e.value || [])}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Todos los Consultores"
                            display="chip"
                            filter
                            showClear
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label className="font-bold">Empresas</label>
                        <MultiSelect
                            value={empresasSeleccionadas}
                            options={opcionesEmpresas}
                            onChange={(e) => setEmpresasSeleccionadas(e.value || [])}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Todas las Empresas"
                            display="chip"
                            filter
                            showClear
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label className="font-bold">Tipo Ticket</label>
                        <MultiSelect
                            value={tiposSeleccionados}
                            options={opcionesTipos}
                            onChange={(e) => setTiposSeleccionados(e.value || [])}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Todos los Tipos"
                            display="chip"
                            filter
                            showClear
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label className="font-bold">Estados</label>
                        <MultiSelect
                            value={estadosSeleccionados}
                            options={opcionesEstados}
                            onChange={(e) => setEstadosSeleccionados(e.value || [])}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Todos los Estados"
                            display="chip"
                            filter
                            showClear
                        />
                    </div>
                    <div className="field col-12 md:col-8">
                        <label className="font-bold">Tickets</label>
                        <MultiSelect
                            value={ticketsSeleccionados}
                            options={opcionesTickets}
                            onChange={(e) => setTicketsSeleccionados(e.value || [])}
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
                {(!parametros || parametros.length === 0) && (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
                        Cargando filtros de la aplicación...
                    </div>
                )}

                {parametros && parametros.length > 0 && loading && (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
                        Cargando tickets...
                    </div>
                )}

                {error && !loading && (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#e53935" }}>
                        {error}
                    </div>
                )}

                {parametros && parametros.length > 0 && !loading && !error && ticketsFiltrados.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
                        No hay tickets para mostrar con los filtros actuales.
                    </div>
                )}

                {parametros && parametros.length > 0 && !loading && !error && ticketsFiltrados.length > 0 && (
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