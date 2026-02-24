
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Gestiontikets.scss";
import { useNavigate, useParams } from "react-router-dom";
import Boton from "../../components/Boton/Boton";
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import useUsuario from "../../hooks/useUsuario";
import { ListarTicketPaginado, EliminarTicket, ListarParametros } from "../../service/TiketService";
import DatatableDinamic from "../../components/Datatable/DatatableDinamic";
import { MultiSelect } from 'primereact/multiselect';

const Gestiontikets = () => {
    const navigate = useNavigate();
    let { idUser } = useParams();
    let { codRol } = useParams();

    // ── Estado principal ──────────────────────────────────────────────
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);

    // ── Paginación y Filtros y Ordenamiento ───────────────────────────
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [globalFilter, setGlobalFilter] = useState("");
    const [columnFilters, setColumnFilters] = useState({});
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState(null);

    // ── Parámetros / filtros ──────────────────────────────────────────
    const [parametros, setParametro] = useState([]);
    const [parametrosPrioridad, setParametroPrioridad] = useState([]);
    const [estadosSeleccionados, setEstadosSeleccionados] = useState([]);

    const { permisos } = useUsuario();
    const permisosActual = permisos["/tickets"] || {
        divsOcultos: [],
        controlesBloqueados: [],
        controlesOcultos: []
    };
    const toast = useRef(null);

    // ── Cargar parámetros (solo una vez) ──────────────────────────────
    useEffect(() => {
        const getParametro = async () => {
            const data = await ListarParametros();
            const estadoTickets = data.filter(p => p.tipoParametro === "EstadoTicket");
            const prioridadTickets = data.filter(p => p.tipoParametro === "Prioridad");
            setParametro(estadoTickets);
            setParametroPrioridad(prioridadTickets);
        };
        getParametro();
    }, []);

    // ── Seleccionar estados por defecto (excluye Cerrado y Anulado) ──
    useEffect(() => {
        if (parametros.length > 0 && estadosSeleccionados.length === 0) {
            const estadosPorDefecto = parametros
                .filter(p =>
                    p.nombre?.toLowerCase() !== 'cerrado' &&
                    p.nombre?.toLowerCase() !== 'anulado'
                )
                .map(p => p.id);
            setEstadosSeleccionados(estadosPorDefecto);
        }
    }, [parametros]);

    // ── Cargar tickets paginados ──────────────────────────────────────
    const loadTickets = useCallback(() => {
        if (estadosSeleccionados.length === 0 && parametros.length > 0) return; // esperar defaults
        setLoading(true);
        ListarTicketPaginado({
            idUser,
            codRol,
            page,
            pageSize,
            estadoIds: estadosSeleccionados,
            globalFilter,
            sortField,
            sortOrder,
            columnFilters
        })
            .then((result) => {
                setTickets(result.items || []);
                setTotalRecords(result.totalRecords || 0);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error al cargar tickets:", error);
                setLoading(false);
            });
    }, [idUser, codRol, page, pageSize, estadosSeleccionados, parametros, globalFilter, sortField, sortOrder, columnFilters]);

    // ── Disparar carga cuando cambian dependencias ────────────────────
    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    // ── Callbacks de DatatableDinamic ─────────────────────────────────
    const handlePageChange = (newPage, newRows) => {
        setPage(newPage);
        setPageSize(newRows);
    };

    const handleFilterChange = ({ global, columns }) => {
        setGlobalFilter(global);
        setColumnFilters(columns);
        setPage(0); // reset a primera página al filtrar
    };

    const handleSortChange = (e) => {
        setSortField(e.sortField);
        setSortOrder(e.sortOrder === 1 ? "asc" : "desc");
    };

    // ── Acciones ──────────────────────────────────────────────────────
    const accion = (rowData) => {
        return <div className="profesor-datatable-accion">
            <div className="accion-editar" onClick={() => {
                navigate("Editar/" + rowData.id);
            }}>
                <span><Iconsax.Edit color="#ffffff" /></span>
            </div>
        </div>
    }

    const Eliminar = async ({ id }) => {
        await EliminarTicket({ id }).then(data => {
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: "Registro eliminado.", life: 7000 })
            loadTickets();
        })
            .catch(errors => {
                toast.current.show({ severity: 'error', summary: 'Error', detail: errors.message, life: 7000 })
            })
    }

    const confirm2 = (id) => {
        confirmDialog({
            message: 'Seguro de eliminar ticket?',
            header: 'Eliminar',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel: "Aceptar",
            accept: () => Eliminar({ id })
        });
    };

    return (
        <div className="zv-usuario" style={{ paddingTop: 16 }}>
            <ConfirmDialog />
            <Toast ref={toast} position="top-center"></Toast>
            <div className="header-titulo">Gestión de Tickets</div>
            <div className="zv-usuario-body" style={{ marginTop: 16 }}>
                <div className="zv-usuario-body-filtro">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ marginLeft: "auto" }}>
                            <div className="field col-12 md:col-2">
                                <label htmlFor="estados" className="font-bold">
                                    Estados
                                </label>
                                <MultiSelect
                                    id="estados"
                                    value={estadosSeleccionados}
                                    options={parametros}
                                    optionLabel="nombre"
                                    optionValue="id"
                                    onChange={(e) => {
                                        setEstadosSeleccionados(e.value);
                                        setPage(0); // reset a primera página
                                    }}
                                    placeholder="Selecciona Estados"
                                    display="chip"
                                    filter
                                    maxSelectedLabels={2}
                                    className="w-full md:w-20rem"
                                />
                            </div>
                            {!permisosActual.controlesOcultos.includes("btnCrear") && (
                                <>
                                    <Boton
                                        icon="pi pi-plus"
                                        style={{ fontSize: 15, borderRadius: 15 }}
                                        color="primary"
                                        onClick={() => navigate("Crear/")}
                                    />
                                </>)}
                        </div>
                    </div>
                </div>
                <div className="zv-usuario-body-listado" style={{ marginTop: 24 }}>

                    <DatatableDinamic
                        value={tickets}
                        exportable
                        rows={pageSize}
                        loading={loading}
                        dataKey="id"
                        actionBody={accion}
                        serverSide={true}
                        totalRecords={totalRecords}
                        onPageChange={handlePageChange}
                        onFilterChange={handleFilterChange}
                        onSortChange={handleSortChange}
                    >
                        <Column field="codTicket" header={<div>Codigo Ticket <br />Conecta</div>} sortable style={{ width: '130px', minWidth: '180px' }} />
                        <Column field="codTicketInterno" header="Codigo Interno" sortable style={{ width: '110px', minWidth: '130px' }} />
                        <Column field="titulo" header="Titulo" sortable style={{ width: '350px', minWidth: '350px' }} />

                        <Column
                            field="fechaSolicitud"
                            header="Fecha de Solicitud"
                            sortable
                            style={{ width: '170px', minWidth: '170px' }}
                            body={(rowData) => {
                                const fecha = rowData?.fechaSolicitud;
                                if (!fecha) return '';
                                return fecha.replace('T', ' / ').split('.')[0];
                            }}
                        />

                        <Column
                            field="estadoNombre"
                            header="Estado"
                            sortable
                            style={{ width: '140px', minWidth: '140px' }}
                        />
                        <Column
                            field="prioridadNombre"
                            header="Prioridad"
                            sortable
                            style={{ width: '140px', minWidth: '140px' }}
                        />
                        <Column field="empresaRazonSocial" header="Empresa" sortable style={{ width: '150px', minWidth: '150px' }} />
                        <Column field="horasTrabajadas" header={<div>Horas <br />Trabajadas</div>} sortable style={{ width: '100px', minWidth: '100px' }} />
                        <Column field="horasPlanificadas" header={<div>Horas <br />Planificadas</div>} body={(rowData) => rowData.horasPlanificadas ?? '-'} sortable style={{ width: '120px', minWidth: '120px' }} />
                    </DatatableDinamic>

                </div>
            </div>
        </div>
    );
}

export default Gestiontikets;
