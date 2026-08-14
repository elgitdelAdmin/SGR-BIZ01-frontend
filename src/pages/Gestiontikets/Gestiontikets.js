
import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Gestiontikets.scss";
import { useNavigate, useParams } from "react-router-dom";
import Boton from "../../components/Boton/Boton";
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import useUsuario from "../../hooks/useUsuario";
import { ListarTicketPaginado, EliminarTicket, ListarParametros, MigrarTicketSgr, ListarGestorCuenta } from "../../service/TiketService";
import { ListarEmpresasporRol } from "../../service/EmpresaService";
import DatatableDinamic from "../../components/Datatable/DatatableDinamic";
import AlertaTicketsSinHoras from "../../components/AlertaTicketsSinHoras/AlertaTicketsSinHoras";
import Context from "../../context/usuarioContext";
import { ROLES } from "../../constants/codigosBD";
import MultiSelectDefault from "../../components/MultiSelectDefault/MultiSelectDefault";
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { playNotificationSound } from '../../helpers/audioHelpers';
import ModalCreacionRapida from "./Components/ModalCreacionRapida";


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
    const [visibleModalCreacionRapida, setVisibleModalCreacionRapida] = useState(false);

    // ── Estado Alerta Tickets Sin Horas / Planificación ───────────────
    const [activeAlerts, setActiveAlerts] = useState([]);
    const prevAlertCount = useRef(0);
    const alertShownRef = useRef(false);

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

    // ── Verificar permiso para Creación Rápida de Mesa de Ayuda ──────
    const PERMISO_KEY = `permiso_mda_${idUser}_${codRol}`;
    const [tienePermisoMesaAyuda, setTienePermisoMesaAyuda] = useState(() => {
        return sessionStorage.getItem(PERMISO_KEY) === 'true';
    });
    
    useEffect(() => {
        // Si ya validamos el permiso en esta sesión, no volver a consultar al servidor
        if (sessionStorage.getItem(PERMISO_KEY) !== null) {
            return;
        }

        const verifyPermiso = async () => {
            if (codRol === "SUPERADMIN" || codRol === "ADMIN") {
                setTienePermisoMesaAyuda(true);
                sessionStorage.setItem(PERMISO_KEY, 'true');
                return;
            }
            try {
                const [dataParam, dataGestores, dataEmpresas] = await Promise.all([
                    ListarParametros(),
                    ListarGestorCuenta(),
                    ListarEmpresasporRol({ idUser, codRol })
                ]);

                const mdaParam = dataParam.find(p => p.tipoParametro === "TipoTicket" && p.codigo === "MDA");
                if (!mdaParam) {
                    setTienePermisoMesaAyuda(false);
                    sessionStorage.setItem(PERMISO_KEY, 'false');
                    return;
                }
                const idMesa = Number(mdaParam.id);

                const miGestor = dataGestores.find(g => Number(g.idUser) === Number(idUser));
                if (!miGestor) {
                    setTienePermisoMesaAyuda(false);
                    sessionStorage.setItem(PERMISO_KEY, 'false');
                    return;
                }
                const miIdGestor = Number(miGestor.id);

                const hasPermiso = dataEmpresas.some(emp => {
                    const g = (emp.gestores || []).find(x => Number(x.idGestor) === miIdGestor && x.activo !== false);
                    return g && g.idsTiposTicketPermitidos && g.idsTiposTicketPermitidos.includes(idMesa);
                });

                setTienePermisoMesaAyuda(hasPermiso);
                sessionStorage.setItem(PERMISO_KEY, hasPermiso.toString());
            } catch (error) {
                console.error("Error verificando permiso MDA", error);
                setTienePermisoMesaAyuda(false);
            }
        };
        verifyPermiso();
    }, [idUser, codRol]);

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

    useEffect(() => {
        if (tickets.length > 0 && !alertShownRef.current) {
            const shouldShowAlerts = codRol === ROLES.Consultor || codRol === ROLES.GestorConsultoria || codRol === ROLES.GestorCuenta;
            const showWorkedHoursAlert = shouldShowAlerts;
            const showPlannedHoursAlert = shouldShowAlerts;
            const alerts = [];

            // 1. Horas Trabajadas (sin registrar)
            if (showWorkedHoursAlert) {
                const sinHoras = tickets.filter(t => {
                    const hrs = t.horasTrabajadas;
                    return hrs === 0 || hrs === "0" || parseFloat(hrs) === 0;
                });
                if (sinHoras.length > 0) {
                    alerts.push({
                        id: "tickets-sin-horas",
                        title: "Tickets sin Horas Registradas",
                        description: "Tienes tickets asignados en los que aún no has registrado horas de trabajo",
                        icon: "pi pi-exclamation-triangle",
                        message: "Tienes tickets asignados en los que aún no has registrado horas de trabajo:",
                        items: sinHoras
                    });
                }
            }

            // 2. Horas Planificadas (sin planificar)
            if (showPlannedHoursAlert) {
                const sinPlanificar = tickets.filter(t => {
                    const hrs = t.horasPlanificadas;
                    return hrs === 0 || hrs === "0" || parseFloat(hrs) === 0 || hrs === null || hrs === undefined;
                });
                if (sinPlanificar.length > 0) {
                    alerts.push({
                        id: "tickets-sin-planificar",
                        title: "Tickets sin Horas Planificadas",
                        description: "Tienes tickets asignados en los que aún no has planificado horas de trabajo",
                        icon: "pi pi-calendar-times",
                        message: "Tienes tickets asignados en los que aún no has planificado horas de trabajo:",
                        items: sinPlanificar
                    });
                }
            }

            if (alerts.length > 0) {
                alertShownRef.current = true;
                setActiveAlerts(alerts);
                if (setAlertas) {
                    setAlertas(alerts);
                }
            }
        }
    }, [tickets, codRol, setAlertas]);

    // Limpiar alertas al desmontar la pantalla de tickets
    useEffect(() => {
        return () => {
            if (setAlertas) setAlertas([]);
        };
    }, [setAlertas]);

    // Reproducir sonido cuando aparece cualquiera de las alertas por primera vez
    useEffect(() => {
        if (activeAlerts.length > 0 && activeAlerts.length > prevAlertCount.current) {
            playNotificationSound();
        }
        prevAlertCount.current = activeAlerts.length;
    }, [activeAlerts]);

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



    const confirmCreacionRapida = () => {
        confirmDialog({
            message: 'Esa opción solo se usa para crear tickets de MESA DE AYUDA.',
            header: 'Confirmación',
            icon: 'pi pi-info-circle',
            acceptClassName: 'custom-confirm-accept-primary',
            acceptLabel: 'Aceptar',
            rejectClassName: 'custom-confirm-reject',
            rejectLabel: 'Cancelar',
            accept: () => {
                setVisibleModalCreacionRapida(true);
            }
        });
    };

    return (
        <div className="zv-usuario" style={{ paddingTop: 16 }}>
            <ConfirmDialog />
            <Toast ref={toast} position="top-center"></Toast>
            {visibleModalCreacionRapida && (
                <ModalCreacionRapida
                    visible={visibleModalCreacionRapida}
                    onHide={() => setVisibleModalCreacionRapida(false)}
                    onSaveSuccess={() => {
                        loadTickets();
                    }}
                />
            )}
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
                                tooltip="Crear Ticket"
                                tooltipOptions={{ position: 'top', className: 'gt-action-tooltip' }}
                            />
                            {tienePermisoMesaAyuda && (
                                <Boton
                                    icon="pi pi-bolt"
                                    style={{ fontSize: 15, borderRadius: 8 }}
                                    color="primary"
                                    onClick={confirmCreacionRapida}
                                    tooltip="Creación Rápida de Mesa de Ayuda"
                                    tooltipOptions={{ position: 'top', className: 'gt-action-tooltip' }}
                                />
                            )}
                            {!permisosActual.controlesOcultos.includes("BtnMdlMigracionSgr") && (
                                <Boton
                                    id="BtnMdlMigracionSgr"
                                    icon="pi pi-sync"
                                    style={{ fontSize: 15, borderRadius: 8 }}
                                    color="primary"
                                    onClick={() => setDisplayDialogSync(true)}
                                    tooltip="Sincronizar Ticket desde SGR"
                                    tooltipOptions={{ position: 'top', className: 'gt-action-tooltip' }}
                                />
                            )}
                        </div>
                    )}
                </div>
                <div className="zv-usuario-body-listado" style={{ marginTop: 24 }}>
                    <div className={`table-warning-wrapper ${activeAlerts.length > 0 ? "table-warning-blink" : ""}`}>
                        <DatatableDinamic
                            value={tickets}
                            exportable
                            rows={pageSize}
                            loading={loading}
                            dataKey="id"
                            onEdit={(rowData) => navigate("Editar/" + rowData.id)}
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
                            <Column
                                field="codTicket"
                                header="Cód. Conecta / Cód. Interno"
                                sortable
                                style={{ width: '170px', minWidth: '160px' }}
                                body={(rowData) => {
                                    const conecta = rowData?.codTicket || '';
                                    const interno = rowData?.codTicketInterno || '';
                                    if (conecta && interno) return `${conecta} / ${interno}`;
                                    return conecta || interno || '';
                                }}
                            />
                            <Column
                                field="fechaSolicitud"
                                header="F. Solicitud"
                                sortable
                                style={{ width: '70px', minWidth: '70px' }}
                                body={(rowData) => {
                                    const fecha = rowData?.fechaSolicitud;
                                    if (!fecha) return '';
                                    const str = fecha.split('T')[0];
                                    const parts = str.split('-');
                                    if (parts.length === 3) {
                                        return `${parts[2]}/${parts[1]}/${parts[0].slice(-2)}`;
                                    }
                                    return str;
                                }}
                            />
                            <Column field="estadoNombre" header="Estado" sortable style={{ width: '120px', minWidth: '120px' }} />
                            <Column field="tipoSubtipoNombre" header="Tipo / Subtipo" sortable style={{ width: '140px', minWidth: '140px' }} />
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

                                    const formatDecimalToHHMM = (val) => {
                                        if (val === null || val === undefined || val === "") return "0:00";
                                        const num = Number(val);
                                        if (isNaN(num)) return "0:00";
                                        const totalMins = Math.round(num * 60);
                                        const hh = Math.floor(totalMins / 60);
                                        const mm = totalMins % 60;
                                        return `${hh}:${String(mm).padStart(2, "0")}`;
                                    };

                                    const isZero = hrsT === 0 || hrsT === "0" || parseFloat(hrsT) === 0 || hrsT === null || hrsT === undefined;
                                    const showWorkedHoursAlert = codRol === ROLES.Consultor || codRol === ROLES.GestorConsultoria || codRol === ROLES.Administrador;
                                    if (showWorkedHoursAlert && isZero) {
                                        return (
                                            <span className="hrs-t-cero-badge">
                                                0:00
                                            </span>
                                        );
                                    }
                                    return formatDecimalToHHMM(hrsT);
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

                                    const formatDecimalToHHMM = (val) => {
                                        if (val === null || val === undefined || val === "") return "0:00";
                                        const num = Number(val);
                                        if (isNaN(num)) return "0:00";
                                        const totalMins = Math.round(num * 60);
                                        const hh = Math.floor(totalMins / 60);
                                        const mm = totalMins % 60;
                                        return `${hh}:${String(mm).padStart(2, "0")}`;
                                    };

                                    const isZero = hrsP === 0 || hrsP === "0" || parseFloat(hrsP) === 0 || hrsP === null || hrsP === undefined;
                                    const showPlannedHoursAlert = codRol === ROLES.GestorCuenta || codRol === ROLES.GestorConsultoria || codRol === ROLES.Administrador;
                                    if (showPlannedHoursAlert && isZero) {
                                        return (
                                            <span className="hrs-t-cero-badge">
                                                0:00
                                            </span>
                                        );
                                    }
                                    return formatDecimalToHHMM(hrsP);
                                }}
                            />
                            <Column field="titulo" header="Titulo" sortable style={{ minWidth: '250px' }} />
                        </DatatableDinamic>
                    </div>
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

            {/* 🔴 Alertas Dinámicas en Cascada */}
            {activeAlerts.map((alert, index) => {
                // Posicionar en cascada desde el centro para que no se traslapen totalmente
                const offset = index * 30; // 30px de desfase por alerta

                return (
                    <AlertaTicketsSinHoras
                        key={alert.id}
                        visible={true}
                        onHide={() => setActiveAlerts(prev => prev.filter(a => a.id !== alert.id))}
                        title={alert.title}
                        icon={alert.icon}
                        message={alert.message}
                        items={alert.items}
                        modal={false}
                        draggable={true}
                        position="center"
                        style={{
                            width: '32vw',
                            minWidth: '420px',
                            marginTop: `${offset}px`,
                            marginLeft: `${offset}px`
                        }}
                    />
                );
            })}



        </div>
    );
}

export default Gestiontikets;
