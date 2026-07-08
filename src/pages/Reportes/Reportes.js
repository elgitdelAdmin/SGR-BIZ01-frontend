import React, { useState, useEffect, useContext, useMemo } from "react";
import Context from "../../context/usuarioContext";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import DatatableDinamic from "../../components/Datatable/DatatableDinamic";
import "./Reportes.scss";
import { TIPO_PARAMETRO, CODIGOS } from "../../constants/codigosBD";
import { ListarConsultores, ListarConsultoresPorSocio } from "../../service/ConsultorService";
import { ListarEmpresas, ListarEmpresasPorSocio } from "../../service/EmpresaService";
import { ListarTicket, ObtenerTicket } from "../../service/TiketService";
import { GenerarReporteExcel, ConsultarDetalleReporte } from "../../service/ReporteService";

// Componentes
import ModalSeleccionTickets from "./Components/ModalSeleccionTickets";
import ModalCargabilidad from "./Components/ModalCargabilidad";

const Reportes = () => {
    const { parametros } = useContext(Context);
    const codRol = localStorage.getItem("codRol");
    const idUser = localStorage.getItem("idUser");
    const idSocio = localStorage.getItem("idSocio");

    // Estados para los filtros
    const [tipoReporteSeleccionado, setTipoReporteSeleccionado] = useState(null);
    const [empresasSeleccionadas, setEmpresasSeleccionadas] = useState([]);
    const [ticketsExcluidos, setTicketsExcluidos] = useState(new Set());
    const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
    const [subtiposSeleccionados, setSubtiposSeleccionados] = useState([]);
    const [estadosSeleccionados, setEstadosSeleccionados] = useState([]);
    const [consultoresSeleccionados, setConsultoresSeleccionados] = useState([]);
    const [rangoFechas, setRangoFechas] = useState(null);

    // Estados de carga y resultados
    const [loadingExcel, setLoadingExcel] = useState(false);
    const [loadingBusqueda, setLoadingBusqueda] = useState(false);
    const [dataResultados, setDataResultados] = useState([]);
    const [columnasDinamicas, setColumnasDinamicas] = useState([]);

    // Estados para los datos maestros
    const [consultores, setConsultores] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [tickets, setTickets] = useState([]);

    // Estado para el modal de tickets
    const [mostrarModalTickets, setMostrarModalTickets] = useState(false);

    // Estado para el modal de cargabilidad
    const [modalCargaVisible, setModalCargaVisible] = useState(false);
    const [ticketDetalle, setTicketDetalle] = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [consultorNombreModal, setConsultorNombreModal] = useState("");

    // CARGA ÚNICA AL INGRESAR AL MÓDULO
    useEffect(() => {
        const loadAllData = async () => {
            try {
                const [resConsultores, resEmpresas, resTickets] = await Promise.all([
                    (codRol === "SUPERADMIN" ? ListarConsultores() : ListarConsultoresPorSocio()),
                    (codRol === "SUPERADMIN" ? ListarEmpresas() : ListarEmpresasPorSocio()),
                    ListarTicket({ idUser, codRol })
                ]);

                setConsultores(resConsultores.map(c => ({
                    ...c,
                    nombreCompleto: `${c.persona?.nombres || ''} ${c.persona?.apellidoPaterno || ''} ${c.persona?.apellidoMaterno || ''}`.trim() || c.persona?.username || 'Sin nombre'
                })));

                const empresasUnicas = [];
                const idsMap = new Set();
                resEmpresas.forEach(e => {
                    if (!idsMap.has(e.id)) {
                        idsMap.add(e.id);
                        empresasUnicas.push(e);
                    }
                });
                setEmpresas(empresasUnicas);

                setTickets(resTickets.map(t => ({
                    ...t,
                    label: `${t.codTicket} - ${t.titulo}`
                })));
            } catch (error) {
                console.error("Error cargando datos maestros:", error);
            }
        };

        loadAllData();
    }, []);

    // Opciones de parámetros (se mantienen igual)
    const opcionesTipoReporte = useMemo(() =>
        parametros.filter(p => p.tipoParametro === TIPO_PARAMETRO.TipoReporte),
        [parametros]);

    const opcionesTipo = useMemo(() =>
        parametros.filter(p => p.tipoParametro === TIPO_PARAMETRO.TipoTicket),
        [parametros]);

    const opcionesSubtipo = useMemo(() => {
        if (!tiposSeleccionados || tiposSeleccionados.length === 0) return [];
        const tiposSeleccionadosData = opcionesTipo.filter(t => tiposSeleccionados.includes(t.id));
        const codigosTiposMap = {};
        tiposSeleccionadosData.forEach(t => {
            const code = t.codigo?.trim();
            if (code) codigosTiposMap[code] = t.nombre;
        });
        const codigosSeleccionados = Object.keys(codigosTiposMap);
        return parametros
            .filter(p => p.tipoParametro === TIPO_PARAMETRO.Subtipos && codigosSeleccionados.includes(String(p.valor1).trim()))
            .map(p => ({
                ...p,
                nombreConPadre: `${p.nombre} (${codigosTiposMap[String(p.valor1).trim()] || ''})`
            }));
    }, [parametros, tiposSeleccionados, opcionesTipo]);

    const opcionesEstado = useMemo(() =>
        parametros.filter(p => p.tipoParametro === TIPO_PARAMETRO.EstadoTicket),
        [parametros]);

    const reporteActual = useMemo(() =>
        opcionesTipoReporte.find(r => r.id === tipoReporteSeleccionado)
        , [tipoReporteSeleccionado, opcionesTipoReporte]);

    // Validación: ambas fechas obligatorias
    const fechasValidas = useMemo(() =>
        rangoFechas && rangoFechas[0] && rangoFechas[1], [rangoFechas]);

    const mostrarFiltroConsultores = useMemo(() =>
        reporteActual?.codigo?.trim() === CODIGOS.TipoReporte.CargabilidadPorConsultor ||
        reporteActual?.codigo?.trim() === CODIGOS.TipoReporte.PlanificacionConsultor
        , [reporteActual]);

    const mostrarFiltroEmpresas = useMemo(() =>
        reporteActual?.codigo?.trim() === CODIGOS.TipoReporte.CargabilidadPorCliente
        , [reporteActual]);

    const mostrarFiltroTickets = useMemo(() =>
        reporteActual?.codigo?.trim() === CODIGOS.TipoReporte.CargabilidadPorTicket
        , [reporteActual]);

    // Visibilidad condicional y Auto-selección
    useEffect(() => {
        if (mostrarFiltroConsultores) {
            setConsultoresSeleccionados(consultores.map(c => c.id));
        } else {
            setConsultoresSeleccionados([]);
        }
    }, [mostrarFiltroConsultores]);

    useEffect(() => {
        if (mostrarFiltroEmpresas) {
            setEmpresasSeleccionadas(empresas.map(e => e.id));
        } else {
            setEmpresasSeleccionadas([]);
        }
    }, [mostrarFiltroEmpresas]);

    useEffect(() => {
        if (mostrarFiltroTickets) {
            setTicketsExcluidos(new Set());
        } else {
            setTicketsExcluidos(new Set());
        }
    }, [mostrarFiltroTickets]);

    // Preparar Payload común
    const getPayload = () => {
        const ticketsSeleccionadosFinal = tickets
            .filter(t => !ticketsExcluidos.has(t.id))
            .map(t => t.id);

        return {
            idTipoReporte: tipoReporteSeleccionado,
            codigoReporte: reporteActual?.codigo,
            idEmpresas: empresasSeleccionadas,
            idTickets: ticketsSeleccionadosFinal,
            idTiposTicket: tiposSeleccionados,
            idSubtiposTicket: subtiposSeleccionados,
            idEstadosTicket: estadosSeleccionados,
            idConsultores: consultoresSeleccionados,
            fechaInicio: rangoFechas?.[0] || null,
            fechaFin: rangoFechas?.[1] || null,
            idSocio: (idSocio && codRol !== "SUPERADMIN") ? parseInt(idSocio) : null
        };
    };

    const handleBuscarReporte = async () => {
        if (!tipoReporteSeleccionado) return;
        setLoadingBusqueda(true);
        try {
            const data = await ConsultarDetalleReporte(getPayload());
            setDataResultados(data);

            // Generar columnas dinámicamente basadas en las llaves del primer objeto
            if (data && data.length > 0) {
                const llaves = Object.keys(data[0]);
                const isCargaConsultor = reporteActual?.codigo?.trim() === CODIGOS.TipoReporte.CargabilidadPorConsultor;

                // Definir las llaves que representan el ID del ticket para no mostrarlas en la tabla
                const idKeys = ['IdTicket', 'idTicket', 'Id', 'id', 'Id Ticket', 'id_ticket'];
                const llavesFiltradas = llaves.filter(k => !idKeys.includes(k));

                const cols = llavesFiltradas.map(k => {
                    const col = {
                        field: k,
                        header: k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1')
                    };

                    // Si es CARGA_CONSULTOR, inyectar botón dentro de la celda HorasTicketConsultor
                    if (isCargaConsultor && k === 'HorasTicketConsultor') {
                        col.body = (rowData) => (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{rowData.HorasTicketConsultor ?? 0}</span>
                                <button
                                    type="button"
                                    style={{
                                        width: '28px', height: '28px',
                                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                        border: 'none', cursor: 'pointer', borderRadius: '8px',
                                        background: '#0e71ae', color: '#fff', flexShrink: 0
                                    }}
                                    onClick={() => handleVerCargabilidad(rowData)}
                                    title="Ver Cargabilidad"
                                >
                                    <i className="pi pi-eye" style={{ fontSize: '12px' }} />
                                </button>
                            </div>
                        );
                    }

                    return col;
                });

                // Agregar columna "Ir" al principio si existe alguna llave de ID
                const idKeyPresent = llaves.find(k => idKeys.includes(k));
                if (idKeyPresent) {
                    cols.unshift({
                        field: 'ir',
                        header: 'Acciones',
                        style: { width: '80px', minWidth: '80px', textAlign: 'center' },
                        body: (rowData) => {
                            const ticketId = rowData[idKeyPresent];
                            return (
                                <button
                                    type="button"
                                    className="btn-ir"
                                    onClick={() => {
                                        if (ticketId) {
                                            const idUser = localStorage.getItem("idUser");
                                            const codRol = localStorage.getItem("codRol");
                                            const basePath = window.location.pathname.replace(/\/reportes.*/i, '');
                                            window.open(`${basePath}/Tickets/user/${idUser}/rol/${codRol}/Editar/${ticketId}`, '_blank');
                                        }
                                    }}
                                >
                                    Ir
                                    <i className="pi pi-arrow-right" />
                                </button>
                            );
                        }
                    });
                }

                setColumnasDinamicas(cols);
            } else {
                setColumnasDinamicas([]);
            }
        } catch (error) {
            console.error("Error al buscar reporte:", error);
            setDataResultados([]);
        } finally {
            setLoadingBusqueda(false);
        }
    };

    // Handler para abrir modal de cargabilidad
    const handleVerCargabilidad = async (rowData) => {
        const ticketId = rowData.Id || rowData.id;
        if (!ticketId) {
            console.error("No se encontró el ID del ticket en la fila");
            return;
        }

        setConsultorNombreModal(rowData.Consultor || rowData.consultor || "");
        setLoadingDetalle(true);
        setModalCargaVisible(true);

        try {
            const data = await ObtenerTicket({ id: ticketId });
            setTicketDetalle(data);
        } catch (error) {
            console.error("Error al obtener ticket:", error);
            setTicketDetalle(null);
        } finally {
            setLoadingDetalle(false);
        }
    };

    const handleGenerarReporteExcel = async () => {
        if (!tipoReporteSeleccionado) return;
        setLoadingExcel(true);
        try {
            const blob = await GenerarReporteExcel(getPayload());
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Reporte_${reporteActual?.nombre}_${new Date().getTime()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error al generar reporte:", error);
        } finally {
            setLoadingExcel(false);
        }
    };

    return (
        <div className="zv-reportes" style={{ paddingTop: 16 }}>
            <div className="header-titulo">Reportes</div>

            <div className="card" style={{ marginTop: 16 }}>
                <div className="p-fluid grid">
                    <div className="field col-12">
                        <label className="font-bold">Tipo Reporte</label>
                        <Dropdown
                            value={tipoReporteSeleccionado}
                            options={opcionesTipoReporte}
                            onChange={(e) => {
                                const seleccionado = opcionesTipoReporte.find(r => r.id === e.value);
                                if (seleccionado?.codigo?.trim() === CODIGOS.TipoReporte.DashboardCargabilidadPorConsultor) {
                                    // Abrir Dashboard en nueva pestaña (ruta relativa para que funcione en cualquier ambiente)
                                    const basePath = window.location.pathname.replace(/\/reportes.*/i, '');
                                    window.open(`${basePath}/Reportes/DashboardCargabilidadConsultor`, '_blank');
                                    setTipoReporteSeleccionado(null);
                                    setDataResultados([]);
                                    return;
                                }
                                setTipoReporteSeleccionado(e.value);
                                setDataResultados([]); // Limpiar al cambiar tipo
                            }}
                            optionLabel="nombre"
                            optionValue="id"
                            placeholder="Seleccione el Tipo de Reporte a Generar"
                            filter
                            showClear
                        />
                    </div>

                    {mostrarFiltroTickets && (
                        <div className="field col-12">
                            <label className="font-bold">Tickets</label>
                            <div className="flex gap-2">
                                <div className="p-inputgroup flex-1">
                                    <span className="p-inputgroup-addon">
                                        <i className="pi pi-ticket"></i>
                                    </span>
                                    <InputText
                                        readOnly
                                        value={`${tickets.length - ticketsExcluidos.size} tickets seleccionados`}
                                        placeholder="Seleccione Tickets"
                                        onClick={() => setMostrarModalTickets(true)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <Boton
                                        icon="pi pi-list"
                                        color="primary"
                                        onClick={() => setMostrarModalTickets(true)}
                                        tooltip="Gestionar Selección"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <ModalSeleccionTickets
                        visible={mostrarModalTickets}
                        onHide={() => setMostrarModalTickets(false)}
                        tickets={tickets}
                        ticketsExcluidos={ticketsExcluidos}
                        setTicketsExcluidos={setTicketsExcluidos}
                    />

                    {mostrarFiltroEmpresas && (
                        <div className="field col-12">
                            <label className="font-bold">Empresas</label>
                            <MultiSelect
                                value={empresasSeleccionadas}
                                options={empresas}
                                onChange={(e) => setEmpresasSeleccionadas(e.value)}
                                optionLabel="nombreComercial"
                                optionValue="id"
                                placeholder="Seleccione Empresas"
                                display="chip"
                                filter
                            />
                        </div>
                    )}

                    {mostrarFiltroConsultores && (
                        <div className="field col-12">
                            <label className="font-bold">Consultores</label>
                            <MultiSelect
                                value={consultoresSeleccionados}
                                options={consultores}
                                onChange={(e) => setConsultoresSeleccionados(e.value)}
                                optionLabel="nombreCompleto"
                                optionValue="id"
                                placeholder="Seleccione Consultores"
                                display="chip"
                                filter
                            />
                        </div>
                    )}

                    <div className="field col-12 md:col-3">
                        <label className="font-bold">Tipo Ticket</label>
                        <MultiSelect
                            value={tiposSeleccionados}
                            options={opcionesTipo}
                            onChange={(e) => setTiposSeleccionados(e.value)}
                            optionLabel="nombre"
                            optionValue="id"
                            placeholder="Tipo Ticket"
                            display="chip"
                            filter
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label className="font-bold">Subtipo Ticket</label>
                        <MultiSelect
                            value={subtiposSeleccionados}
                            options={opcionesSubtipo}
                            onChange={(e) => setSubtiposSeleccionados(e.value)}
                            optionLabel="nombreConPadre"
                            optionValue="id"
                            placeholder="Subtipos"
                            disabled={!tiposSeleccionados || tiposSeleccionados.length === 0}
                            display="chip"
                            filter
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label className="font-bold">Estados</label>
                        <MultiSelect
                            value={estadosSeleccionados}
                            options={opcionesEstado}
                            onChange={(e) => setEstadosSeleccionados(e.value)}
                            optionLabel="nombre"
                            optionValue="id"
                            placeholder="Estados"
                            display="chip"
                            filter
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label className="font-bold">
                            {reporteActual?.codigo?.trim() === CODIGOS.TipoReporte.PlanificacionConsultor
                                ? "Rango Fecha Planificación"
                                : [
                                    CODIGOS.TipoReporte.CapacidadConsultores,
                                    CODIGOS.TipoReporte.AsignacionConsultores,
                                    CODIGOS.TipoReporte.DisponibilidadConsultores,
                                    CODIGOS.TipoReporte.SobrecargaConsultores,
                                    CODIGOS.TipoReporte.BajaUtilizacionConsultores
                                  ].includes(reporteActual?.codigo?.trim())
                                    ? "Rango Fecha Detalle Planificación"
                                    : "Rango Fecha Solicitud"
                            } <span style={{ color: 'red' }}>*</span>
                        </label>
                        <Calendar
                            value={rangoFechas}
                            onChange={(e) => setRangoFechas(e.value)}
                            selectionMode="range"
                            readOnlyInput
                            placeholder="Seleccione fechas"
                            showIcon
                            className={!fechasValidas && tipoReporteSeleccionado ? 'p-invalid' : ''}
                        />
                        {!fechasValidas && tipoReporteSeleccionado && (
                            <small className="p-error">Debe seleccionar fecha inicio y fin.</small>
                        )}
                    </div>
                </div>

                <div className="flex justify-content-end" style={{ marginTop: 16, display: 'flex', gap: '12px' }}>
                    <Boton
                        label="Buscar"
                        icon="pi pi-search"
                        color="secondary"
                        loading={loadingBusqueda}
                        disabled={!tipoReporteSeleccionado || !fechasValidas || loadingBusqueda || loadingExcel}
                        onClick={handleBuscarReporte}
                    />
                    <Boton
                        label="Descargar Excel"
                        icon="pi pi-file-excel"
                        color="primary"
                        loading={loadingExcel}
                        disabled={!tipoReporteSeleccionado || !fechasValidas || loadingExcel || loadingBusqueda}
                        onClick={handleGenerarReporteExcel}
                    />
                </div>
            </div>

            <div className="zv-reportes-results" style={{ marginTop: 16 }}>
                <div className="card">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <h5 className="m-0">Vista Previa de Resultados</h5>
                        {dataResultados.length > 0 && (
                            <span className="text-sm font-bold border-round px-2 py-1" style={{ backgroundColor: '#d0e5f0', color: '#0e71ae' }}>
                                {dataResultados.length} registros encontrados
                            </span>
                        )}
                    </div>

                    {dataResultados.length > 0 ? (
                        <DatatableDinamic
                            value={dataResultados}
                            columns={columnasDinamicas}
                            loading={loadingBusqueda}
                            rows={10}
                            exportable={false}
                            serverSide={false}
                            emptyMessage="No se encontraron registros."
                        />
                    ) : (
                        <div className="reportes-empty-state">
                            <i className="pi pi-info-circle empty-icon"></i>
                            <p className="empty-text">
                                {loadingBusqueda
                                    ? "Cargando datos..."
                                    : "Seleccione los filtros y haga clic en 'Buscar' para previsualizar los resultados."}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <ModalCargabilidad
                visible={modalCargaVisible}
                onHide={() => { setModalCargaVisible(false); setTicketDetalle(null); }}
                ticketData={ticketDetalle}
                consultorNombre={consultorNombreModal}
                loading={loadingDetalle}
                parametros={parametros}
            />
        </div>
    );
};

export default Reportes;
