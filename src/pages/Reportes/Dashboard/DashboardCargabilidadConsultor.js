
import React, { useState, useEffect, useMemo, useContext, useDeferredValue } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { MultiSelect } from "primereact/multiselect";
import { ProgressSpinner } from "primereact/progressspinner";
import ExpandableCard from "../../../components/ExpandableCard/ExpandableCard";
import { DashboardTicketsConsultor } from "../../../service/ReporteService";
import Context from "../../../context/usuarioContext";
import { TIPO_PARAMETRO, CODIGOS } from "../../../constants/codigosBD";
import { ListarConsultores } from "../../../service/ConsultorService";
import { ListarEmpresas, ListarEmpresasPorSocio } from "../../../service/EmpresaService";
import { ListarTicket } from "../../../service/TiketService";
import "./DashboardCargabilidadConsultor.scss";

const arraysEqual = (a, b) => {
    if (a === b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};

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
            const paramsEstados = parametros.filter(p => p.tipoParametro === TIPO_PARAMETRO.EstadoTicket);
            return paramsEstados.length > 0;
        }
        return false;
    });

    const [estadosSeleccionados, setEstadosSeleccionados] = useState(() => {
        const paramsEstados = (parametros || []).filter(p => p.tipoParametro === TIPO_PARAMETRO.EstadoTicket);
        return paramsEstados.map(p => p.id);
    });
    const [ticketsSeleccionados, setTicketsSeleccionados] = useState([]);

    const deferredConsultores = useDeferredValue(consultoresSeleccionados);
    const deferredEmpresas = useDeferredValue(empresasSeleccionadas);
    const deferredTickets = useDeferredValue(ticketsSeleccionados);

    const isFiltering = !arraysEqual(consultoresSeleccionados, deferredConsultores) ||
                        !arraysEqual(empresasSeleccionadas, deferredEmpresas) ||
                        !arraysEqual(ticketsSeleccionados, deferredTickets);

    // Establecer estado inicial con TODOS los estados cuando los parámetros estén disponibles
    useEffect(() => {
        if (parametros && parametros.length > 0 && !isInitialized) {
            const paramsEstados = parametros.filter(p => p.tipoParametro === TIPO_PARAMETRO.EstadoTicket);
            if (paramsEstados.length > 0) {
                setEstadosSeleccionados(paramsEstados.map(p => p.id));
                setIsInitialized(true);
            }
        }
    }, [parametros, isInitialized]);

    // Limpiar selección de filtros locales cuando cambian los resultados principales
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (consultoresSeleccionados.length > 0) setConsultoresSeleccionados([]);
        if (empresasSeleccionadas.length > 0) setEmpresasSeleccionadas([]);
        if (ticketsSeleccionados.length > 0) setTicketsSeleccionados([]);
    }, [tickets]);

    // EFECTO PARA RECARGAR EL DASHBOARD CUANDO SE CAMBIEN LOS FILTROS
    useEffect(() => {
        if (!parametros || parametros.length === 0 || !isInitialized) return;

        let active = true;
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await DashboardTicketsConsultor({
                    tipos: tiposSeleccionados,
                    estados: estadosSeleccionados
                });
                if (active) {
                    setTickets(data);
                }
            } catch (err) {
                if (active) {
                    console.error("Error al cargar dashboard:", err);
                    setError("No se pudieron cargar los tickets del dashboard.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };
        fetchData();

        return () => {
            active = false;
        };
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
        const consultoresSel = new Set(deferredConsultores || []);
        const empresasSel = new Set(deferredEmpresas || []);
        const ticketsSel = new Set(deferredTickets || []);

        return tickets.filter(t => {
            if (consultoresSel.size > 0) {
                const nombre = t.NombreCompleto ? t.NombreCompleto.trim() : "";
                if (!consultoresSel.has(nombre)) {
                    return false;
                }
            }
            if (empresasSel.size > 0) {
                const empresa = t.EmpresaNombre ? t.EmpresaNombre.trim() : "";
                if (!empresasSel.has(empresa)) {
                    return false;
                }
            }
            if (ticketsSel.size > 0) {
                const codigo = t.CodConecta ? t.CodConecta.trim() : "";
                if (!ticketsSel.has(codigo)) {
                    return false;
                }
            }
            return true;
        });
    }, [tickets, deferredConsultores, deferredEmpresas, deferredTickets]);

    return (
        <div className="zv-dashboard-cargabilidad" style={{ paddingTop: 16 }}>
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
                            placeholder={loading || !isInitialized ? "Cargando consultores..." : (tickets.length === 0 ? "Sin consultores disponibles" : "Todos los Consultores")}
                            filter
                            showClear
                            disabled={loading || !isInitialized || !tickets || tickets.length === 0}
                            maxSelectedLabels={3}
                            selectedItemsLabel="{0} consultores seleccionados"
                            virtualScrollerOptions={{ itemSize: 43 }}
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
                            placeholder={loading || !isInitialized ? "Cargando empresas..." : (tickets.length === 0 ? "Sin empresas disponibles" : "Todas las Empresas")}
                            filter
                            showClear
                            disabled={loading || !isInitialized || !tickets || tickets.length === 0}
                            maxSelectedLabels={3}
                            selectedItemsLabel="{0} empresas seleccionadas"
                            virtualScrollerOptions={{ itemSize: 43 }}
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
                            placeholder={loading || !isInitialized ? "Cargando tickets..." : (tickets.length === 0 ? "Sin tickets disponibles" : "Todos los Tickets")}
                            filter
                            showClear
                            disabled={loading || !isInitialized || !tickets || tickets.length === 0}
                            maxSelectedLabels={3}
                            selectedItemsLabel="{0} tickets seleccionados"
                            virtualScrollerOptions={{ itemSize: 43 }}
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

                {parametros && parametros.length > 0 && (loading || isFiltering) && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "16px" }}>
                        <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="4" />
                        <span style={{ color: "#666", fontWeight: "500" }}>Cargando tickets del dashboard...</span>
                    </div>
                )}

                {error && !loading && (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#e53935" }}>
                        {error}
                    </div>
                )}

                {parametros && parametros.length > 0 && !loading && !isFiltering && !error && ticketsFiltrados.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
                        No hay tickets para mostrar con los filtros actuales.
                    </div>
                )}

                {parametros && parametros.length > 0 && !loading && !isFiltering && !error && ticketsFiltrados.length > 0 && (
                    <>
                        <div className="ticket-count-label">
                            <span className="indicator-dot"></span>
                            Mostrando {ticketsFiltrados.length} {ticketsFiltrados.length === 1 ? "ticket" : "tickets"} de {tickets.length} en total
                        </div>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                            gap: "16px"
                        }}>
                            {ticketsFiltrados.map((ticket, index) => (
                                <ExpandableCard key={`${ticket.CodConecta}-${ticket.NombreCompleto || ""}-${index}`} ticket={ticket} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default DashboardCargabilidadConsultor;