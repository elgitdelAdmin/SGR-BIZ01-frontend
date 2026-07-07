
import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Gestiontikets.scss";
import { useNavigate, useParams } from "react-router-dom";
import Boton from "../../components/Boton/Boton";
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import useUsuario from "../../hooks/useUsuario";
import { ListarTicketPaginado, EliminarTicket, ListarParametros, MigrarTicketSgr } from "../../service/TiketService";
import DatatableDinamic from "../../components/Datatable/DatatableDinamic";
import AlertaTicketsSinHoras from "../../components/AlertaTicketsSinHoras/AlertaTicketsSinHoras";
import Context from "../../context/usuarioContext";
import { ROLES } from "../../constants/codigosBD";
import MultiSelectDefault from "../../components/MultiSelectDefault/MultiSelectDefault";
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';

const Gestiontikets = () => {
    const navigate = useNavigate();
    let { idUser } = useParams();
    let { codRol } = useParams();

    // ── Clave de sessionStorage ───────────────────────────────────────
    const STORAGE_KEY = `ticketFilters_${idUser}_${codRol}`;

    // ── Leer estado guardado ─────────────────────────────────────────
    const savedFilters = (() => {
        try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; }
        catch { return {}; }
    })();

    // ── Estado principal ──────────────────────────────────────────────
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);

    // ── Estado Modal Sincronización ───────────────────────────────────
    const [displayDialogSync, setDisplayDialogSync] = useState(false);
    const [codTicketInterno, setCodTicketInterno] = useState("");
    const [loadingSync, setLoadingSync] = useState(false);

    // ── Estado Alerta Tickets Sin Horas / Planificación ───────────────
    const [ticketsSinHoras, setTicketsSinHoras] = useState([]);
    const [displayAlertaZero, setDisplayAlertaZero] = useState(false);

    const [ticketsSinPlanificar, setTicketsSinPlanificar] = useState([]);
    const [displayAlertaPlanificado, setDisplayAlertaPlanificado] = useState(false);

    const { setAlertas } = useContext(Context) || {};

    // ── Paginación y Filtros y Ordenamiento ───────────────────────────
    const [page, setPage] = useState(savedFilters.page ?? 0);
    const [pageSize, setPageSize] = useState(savedFilters.pageSize ?? 10);
    const [globalFilter, setGlobalFilter] = useState(savedFilters.globalFilter ?? "");
    const [columnFilters, setColumnFilters] = useState(savedFilters.columnFilters ?? {});
    const initSortOrder = () => {
        const val = savedFilters.sortOrder;
        if (val === "asc") return 1;
        if (val === "desc") return -1;
        if (typeof val === "number") return val;
        return null;
    };
    const [sortField, setSortField] = useState(savedFilters.sortField ?? null);
    const [sortOrder, setSortOrder] = useState(initSortOrder());

    // ── Parámetros / filtros ──────────────────────────────────────────
    const [parametros, setParametro] = useState([]);
    const [parametrosPrioridad, setParametroPrioridad] = useState([]);
    const [estadosSeleccionados, setEstadosSeleccionados] = useState(savedFilters.estadosSeleccionados ?? []);

    const { permisos } = useUsuario();
    const permisosActual = permisos["/tickets"] || {
        divsOcultos: [],
        controlesBloqueados: [],
        controlesOcultos: []
    };
    const toast = useRef(null);

    // ── Tooltip personalizado diseñado por nosotros ─────────────────

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

    // ── Persistir filtros en sessionStorage ───────────────────────────
    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
            page, pageSize, globalFilter, columnFilters,
            sortField, sortOrder, estadosSeleccionados
        }));
    }, [page, pageSize, globalFilter, columnFilters, sortField, sortOrder, estadosSeleccionados]);

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

    // ── Validar si hay tickets sin horas para el Consultor / Gestor ──
    useEffect(() => {
        if (tickets.length > 0) {
            const showWorkedHoursAlert = codRol === ROLES.Consultor || codRol === ROLES.GestorConsultoria || codRol === ROLES.Administrador;
            const showPlannedHoursAlert = codRol === ROLES.GestorCuenta || codRol === ROLES.GestorConsultoria || codRol === ROLES.Administrador;
            const alerts = [];

            // 1. Horas Trabajadas (sin registrar)
            if (showWorkedHoursAlert) {
                const sinHoras = tickets.filter(t => {
                    const hrs = t.horasTrabajadas;
                    return hrs === 0 || hrs === "0" || parseFloat(hrs) === 0;
                });
                if (sinHoras.length > 0) {
                    setTicketsSinHoras(sinHoras);
                    setDisplayAlertaZero(true);
                    alerts.push({
                        id: "tickets-sin-horas",
                        title: "Tickets sin Horas Registradas",
                        description: "Tienes tickets asignados en los que aún no has registrado horas de trabajo",
                        icon: "pi pi-exclamation-triangle",
                        message: "Tienes tickets asignados en los que aún no has registrado horas de trabajo:",
                        items: sinHoras
                    });
                } else {
                    setTicketsSinHoras([]);
                    setDisplayAlertaZero(false);
                }
            } else {
                setTicketsSinHoras([]);
                setDisplayAlertaZero(false);
            }

            // 2. Horas Planificadas (sin planificar)
            if (showPlannedHoursAlert) {
                const sinPlanificar = tickets.filter(t => {
                    const hrs = t.horasPlanificadas;
                    return hrs === 0 || hrs === "0" || parseFloat(hrs) === 0 || hrs === null || hrs === undefined;
                });
                if (sinPlanificar.length > 0) {
                    setTicketsSinPlanificar(sinPlanificar);
                    setDisplayAlertaPlanificado(true);
                    alerts.push({
                        id: "tickets-sin-planificar",
                        title: "Tickets sin Horas Planificadas",
                        description: "Tienes tickets asignados en los que aún no has planificado horas de trabajo",
                        icon: "pi pi-calendar-times",
                        message: "Tienes tickets asignados en los que aún no has planificado horas de trabajo:",
                        items: sinPlanificar
                    });
                } else {
                    setTicketsSinPlanificar([]);
                    setDisplayAlertaPlanificado(false);
                }
            } else {
                setTicketsSinPlanificar([]);
                setDisplayAlertaPlanificado(false);
            }

            if (setAlertas) {
                setAlertas(alerts);
            }
        } else {
            setTicketsSinHoras([]);
            setDisplayAlertaZero(false);
            setTicketsSinPlanificar([]);
            setDisplayAlertaPlanificado(false);
            if (setAlertas) setAlertas([]);
        }
    }, [tickets, codRol, setAlertas]);

    // Limpiar alertas al desmontar la pantalla de tickets
    useEffect(() => {
        return () => {
            if (setAlertas) setAlertas([]);
        };
    }, [setAlertas]);

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
            sortOrder: sortOrder === 1 ? "asc" : sortOrder === -1 ? "desc" : null,
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
        setSortOrder(e.sortOrder);
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
            message: '¿Está seguro de eliminar este ticket?',
            header: 'Confirmación',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'custom-confirm-accept',
            acceptLabel: 'ELIMINAR',
            rejectClassName: 'custom-confirm-reject',
            rejectLabel: 'Cancelar',
            accept: () => Eliminar({ id })
        });
    };

    const handleSyncTicket = async () => {
        if (!codTicketInterno || codTicketInterno.trim() === '') {
            toast.current.show({ severity: 'warn', summary: 'Atención', detail: 'Por favor, ingrese un Código Interno', life: 3000 });
            return;
        }

        setLoadingSync(true);
        try {
            const data = await MigrarTicketSgr({ codTicketInterno: codTicketInterno.trim() });
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: data.mensaje || "Se migró el ticket exitosamente.", life: 5000 });
            setDisplayDialogSync(false);
            setCodTicketInterno("");
            loadTickets(); // recargar la tabla para mostrar el nuevo ticket
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.message || 'Error al sincronizar ticket', life: 7000 });
        } finally {
            setLoadingSync(false);
        }
    };



    return (
        <div className="zv-usuario" style={{ paddingTop: 16 }}>
            <ConfirmDialog />
            <Toast ref={toast} position="top-center"></Toast>
            <div className="header-titulo">Gestión de Tickets</div>
            <div className="zv-usuario-body" style={{ marginTop: 16 }}>

                {/* ── Toolbar de filtros (responsivo) ── */}
                <div className="gt-toolbar">
                    <div className="gt-toolbar__filters">
                        <label htmlFor="estados" className="gt-toolbar__label">Estados</label>
                        <MultiSelectDefault
                            id="estados"
                            value={parametros.length > 0 ? estadosSeleccionados : []}
                            options={parametros}
                            optionLabel="nombre"
                            optionValue="id"
                            onChange={(e) => { setEstadosSeleccionados(e.value); setPage(0); }}
                            placeholder="Selecciona Estados"
                            display="chip"
                            filter
                            maxSelectedLabels={20}
                            className="gt-toolbar__multiselect"
                        />
                    </div>
                    {!permisosActual.controlesOcultos.includes("btnCrear") && (
                        <div className="gt-toolbar__actions">
                            <Boton
                                icon="pi pi-plus"
                                style={{ fontSize: 15, borderRadius: 8 }}
                                color="primary"
                                onClick={() => navigate("Crear/")}
                            />
                            {!permisosActual.controlesOcultos.includes("BtnMdlMigracionSgr") && (
                                <Boton
                                    id="BtnMdlMigracionSgr"
                                    icon="pi pi-sync"
                                    style={{ fontSize: 15, borderRadius: 8 }}
                                    color="primary"
                                    onClick={() => setDisplayDialogSync(true)}
                                    tooltip="Sincronizar Ticket desde SGR"
                                />
                            )}
                        </div>
                    )}
                </div>
                <div className="zv-usuario-body-listado" style={{ marginTop: 24 }}>

                    <DatatableDinamic
                        value={tickets}
                        exportable
                        rows={pageSize}
                        loading={loading}
                        dataKey="id"
                        actionBody={accion}
                        actionHeader="Acciones"
                        actionWidth="75px"
                        serverSide={true}
                        totalRecords={totalRecords}
                        onPageChange={handlePageChange}
                        onFilterChange={handleFilterChange}
                        onSortChange={handleSortChange}
                        initialGlobalFilter={globalFilter}
                        initialColumnFilters={columnFilters}
                        sortField={sortField}
                        sortOrder={sortOrder}
                        mobileConfig={{
                            titleField: 'titulo',
                            badgeField: 'estadoNombre',
                        }}
                    >
                        <Column field="codTicket" header={<div>Cód. Conecta</div>} sortable style={{ width: '120px', minWidth: '120px' }} />
                        <Column field="codTicketInterno" header="Cód. Interno" sortable style={{ width: '100px', minWidth: '100px' }} />
                        <Column
                            field="fechaSolicitud"
                            header="F. Solicitud"
                            sortable
                            style={{ width: '90px', minWidth: '90px' }}
                            body={(rowData) => {
                                const fecha = rowData?.fechaSolicitud;
                                if (!fecha) return '';
                                return fecha.split('T')[0];
                            }}
                        />
                        <Column field="estadoNombre" header="Estado" sortable style={{ width: '120px', minWidth: '120px' }} />
                        <Column field="empresaRazonSocial" header="Empresa" sortable style={{ width: '120px', minWidth: '120px' }} />
                        <Column field="nombreGestor" header="Gestor" sortable style={{ width: '120px', minWidth: '120px' }} />
                        <Column field="nombreConsultores" header="Consultores" sortable style={{ width: '140px', minWidth: '140px' }} />
                        <Column
                            field="horasTrabajadas"
                            header="Hrs. T"
                            sortable
                            style={{ width: '55px', minWidth: '55px' }}
                            bodyStyle={{ textAlign: 'center' }}
                            headerClassName="centered-column-header"
                            className="centered-column-body"
                            body={(rowData) => {
                                const hrsT = rowData?.horasTrabajadas;
                                const isZero = hrsT === 0 || hrsT === "0" || parseFloat(hrsT) === 0;
                                const showWorkedHoursAlert = codRol === ROLES.Consultor || codRol === ROLES.GestorConsultoria || codRol === ROLES.Administrador;
                                if (showWorkedHoursAlert && isZero) {
                                    return (
                                        <span className="hrs-t-cero-badge">
                                            {hrsT}
                                        </span>
                                    );
                                }
                                return hrsT;
                            }}
                        />
                        <Column
                            field="horasPlanificadas"
                            header="Hrs. P"
                            sortable
                            style={{ width: '55px', minWidth: '55px' }}
                            bodyStyle={{ textAlign: 'center' }}
                            headerClassName="centered-column-header"
                            className="centered-column-body"
                            body={(rowData) => {
                                const hrsP = rowData?.horasPlanificadas;
                                const isZero = hrsP === 0 || hrsP === "0" || parseFloat(hrsP) === 0 || hrsP === null || hrsP === undefined;
                                const showPlannedHoursAlert = codRol === ROLES.GestorCuenta || codRol === ROLES.GestorConsultoria || codRol === ROLES.Administrador;
                                if (showPlannedHoursAlert && isZero) {
                                    return (
                                        <span className="hrs-t-cero-badge">
                                            {hrsP ?? 0}
                                        </span>
                                    );
                                }
                                return hrsP ?? '-';
                            }}
                        />
                        <Column field="titulo" header="Titulo" sortable style={{ minWidth: '250px' }} />
                    </DatatableDinamic>

                </div>
            </div>

            <Dialog header="Sincronizar Ticket" visible={displayDialogSync} style={{ width: '10vw', minWidth: '350px' }}
                onHide={() => { setDisplayDialogSync(false); setCodTicketInterno(""); }}>
                <div>
                    <div className="field p-fluid">
                        <label htmlFor="codigoInterno">Código de Ticket (Ej. CAD-2020-0073)</label>
                        <InputText
                            id="codigoInterno"
                            value={codTicketInterno}
                            onChange={(e) => setCodTicketInterno(e.target.value)}
                            disabled={loadingSync}
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-content-end mt-3" style={{ gap: "10px" }}>
                        <Boton
                            label="Cancelar"
                            color="secondary"
                            onClick={() => { setDisplayDialogSync(false); setCodTicketInterno(""); }}
                            disabled={loadingSync}
                        />
                        <Boton
                            label={loadingSync ? "Sincronizando..." : "Sincronizar"}
                            color="primary"
                            icon={loadingSync ? "pi pi-spin pi-spinner" : "pi pi-sync"}
                            onClick={handleSyncTicket}
                            disabled={loadingSync}
                        />
                    </div>
                </div>
            </Dialog>

            {/* 🔴 Alerta 1: Tickets sin Horas Registradas */}
            <AlertaTicketsSinHoras 
                visible={displayAlertaZero}
                onHide={() => setDisplayAlertaZero(false)}
                title="Tickets sin Horas Registradas"
                icon="pi pi-exclamation-triangle"
                message="Tienes tickets asignados en los que aún no has registrado horas de trabajo:"
                items={ticketsSinHoras}
            />

            {/* 🔴 Alerta 2: Tickets sin Horas Planificadas */}
            <AlertaTicketsSinHoras 
                visible={displayAlertaPlanificado}
                onHide={() => setDisplayAlertaPlanificado(false)}
                title="Tickets sin Horas Planificadas"
                icon="pi pi-calendar-times"
                message="Tienes tickets asignados en los que aún no has planificado horas de trabajo:"
                items={ticketsSinPlanificar}
            />



        </div>
    );
}

export default Gestiontikets;
