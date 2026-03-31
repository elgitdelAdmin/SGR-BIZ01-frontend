
import React, { useEffect, useState, useRef } from "react";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Frentes.scss";
import { useNavigate } from "react-router-dom";
import Boton from "../../components/Boton/Boton";
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from "primereact/inputtext";
import { ListarFrentes, EliminarFrente, EliminarSubFrente, ObtenerConsultoresAsociadosFrente, ObtenerConsultoresAsociadosSubFrente } from "../../service/FrenteService";
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import EditarFrente from "./EditarFrente";
import EditarSubFrente from "./EditarSubFrente";

const Frentes = () => {
    const navigate = useNavigate();
    const [listaFrentes, setListaFrentes] = useState(null);
    const [listaFrentesTotal, setListaFrentesTotal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [totalRecords, setTotalRecords] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedFrenteModal, setSelectedFrenteModal] = useState(null);
    const [consultoresDialogVisible, setConsultoresDialogVisible] = useState(false);
    const [consultoresAsociados, setConsultoresAsociados] = useState([]);
    const [consultoresDialogTitle, setConsultoresDialogTitle] = useState("");
    const toast = useRef(null);

    const [showFormFrente, setShowFormFrente] = useState(false);
    const [editingFrenteId, setEditingFrenteId] = useState(null);

    const [showFormSubFrente, setShowFormSubFrente] = useState(false);
    const [editingSubFrenteId, setEditingSubFrenteId] = useState(null);
    const [parentFrenteId, setParentFrenteId] = useState(null);

    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 0,
        sortField: null,
        sortOrder: null,
    });

    let networkTimeout = null;

    useEffect(() => {
        loadLazyData();
    }, [lazyState, globalFilterValue]);

    const loadLazyData = () => {
        if (networkTimeout) clearTimeout(networkTimeout);

        networkTimeout = setTimeout(() => {
            setLoading(true);
            ListarFrentes()
                .then((data) => {
                    setTotalRecords(data.length);
                    const pageNumber = lazyState?.page ?? 0;
                    const pageSize = lazyState?.rows ?? 10;
                    const start = pageNumber * pageSize;
                    const end = start + pageSize;
                    let filteredData = data;
                    if (globalFilterValue) {
                        const search = globalFilterValue.toLowerCase();
                        filteredData = data.filter(frente =>
                            frente.codigo?.toLowerCase().includes(search) ||
                            frente.nombre?.toLowerCase().includes(search) ||
                            frente.descripcion?.toLowerCase().includes(search)
                        );
                    }

                    filteredData.sort((a, b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro)).reverse();
                    setTotalRecords(filteredData.length);
                    const paginatedData = filteredData.slice(start, end);
                    setListaFrentesTotal(paginatedData);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error al cargar frentes:", error);
                    setLoading(false);
                });
        }, Math.random() * 1000 + 250);
    };

    const onPage = (event) => {
        setlazyState((prevState) => ({
            ...prevState,
            first: event.first,
            rows: event.rows,
            page: event.page,
        }));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            loadLazyData();
        }
    };

    const renderHeader = () => {
        return (
            <div className='flex justify-content-between flex-wrap'>
                <div className="flex justify-content-end">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText value={globalFilterValue}
                            onChange={(e) => setGlobalFilterValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Buscar..." />
                    </span>
                    <div style={{ marginLeft: "2%" }} className="accion-editar" onClick={() => { loadLazyData() }}>
                        <span><Iconsax.SearchNormal color="#ffffff" /></span>
                    </div>
                </div>
            </div>
        );
    };
    const header = renderHeader();

    useEffect(() => {
        setListaFrentes(listaFrentesTotal);
    }, [listaFrentesTotal]);

    const accionFrente = (rowData) => {
        return <div className="profesor-datatable-accion">
            <div className="accion-editar" onClick={() => {
                setEditingFrenteId(rowData.id);
                setShowFormFrente(true);
            }}>
                <span><Iconsax.Edit color="#ffffff" /></span>
            </div>
            {rowData.activo && (
                <div className="accion-eliminar" onClick={() => {
                    preValidarEliminarFrente(rowData.id);
                }}>
                    <span><Iconsax.Trash color="#ffffff" /></span>
                </div>
            )}
        </div>;
    };

    const accionSubFrente = (rowData) => {
        return <div className="profesor-datatable-accion">
            <div className="accion-editar" onClick={() => {
                setEditingSubFrenteId(rowData.id);
                setParentFrenteId(rowData.idFrente);
                setShowFormSubFrente(true);
            }}>
                <span><Iconsax.Edit color="#ffffff" /></span>
            </div>
            {rowData.activo && (
                <div className="accion-eliminar" onClick={() => {
                    preValidarEliminarSubFrente(rowData.id);
                }}>
                    <span><Iconsax.Trash color="#ffffff" /></span>
                </div>
            )}
        </div>;
    };

    const EliminarFrenteAction = async ({ id }) => {
        await EliminarFrente({ id }).then(data => {
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: "Frente desactivado exitosamente.", life: 7000 });
            loadLazyData();
        })
            .catch(errors => {
                if (errors.consultores && errors.consultores.length > 0) {
                    const listaNombres = errors.consultores.map(c => c.nombreCompleto).join(", ");
                    toast.current.show({ severity: 'error', summary: 'Restricción de Negocio', detail: `${errors.message} (${listaNombres})`, life: 7000 });
                } else {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: errors.message, life: 7000 });
                }
            });
    };

    const EliminarSubFrenteAction = async ({ id }) => {
        await EliminarSubFrente({ id }).then(data => {
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: "Sub-frente desactivado exitosamente.", life: 7000 });
            loadLazyData();
        })
            .catch(errors => {
                if (errors.consultores && errors.consultores.length > 0) {
                    const listaNombres = errors.consultores.map(c => c.nombreCompleto).join(", ");
                    toast.current.show({ severity: 'error', summary: 'Restricción de Negocio', detail: `${errors.message} (${listaNombres})`, life: 7000 });
                } else {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: errors.message, life: 7000 });
                }
            });
    };

    const preValidarEliminarFrente = async (id) => {
        try {
            const consultores = await ObtenerConsultoresAsociadosFrente({ id });
            if (consultores && consultores.length > 0) {
                setConsultoresAsociados(consultores);
                setConsultoresDialogTitle("No se puede desactivar el Frente");
                setConsultoresDialogVisible(true);
                return;
            }
        } catch (error) {
            console.error("Error al verificar consultores:", error);
        }
        confirmDialog({
            message: '¿Seguro de desactivar este Frente?',
            header: 'Desactivar Frente',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel: "Aceptar",
            accept: () => EliminarFrenteAction({ id })
        });
    };

    const preValidarEliminarSubFrente = async (id) => {
        try {
            const consultores = await ObtenerConsultoresAsociadosSubFrente({ id });
            if (consultores && consultores.length > 0) {
                setConsultoresAsociados(consultores);
                setConsultoresDialogTitle("No se puede desactivar el Sub-Frente");
                setConsultoresDialogVisible(true);
                return;
            }
        } catch (error) {
            console.error("Error al verificar consultores:", error);
        }
        confirmDialog({
            message: '¿Seguro de desactivar este Sub-Frente?',
            header: 'Desactivar Sub-Frente',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel: "Aceptar",
            accept: () => EliminarSubFrenteAction({ id })
        });
    };

    const booleanTemplate = (rowData) => {
        return (
            <span>{rowData.activo ? "Activo" : "Inactivo"}</span>
        );
    };

    const botonSubFrentesTemplate = (rowData) => {
        return (
            <div className="profesor-datatable-accion" style={{ justifyContent: 'center' }}>
                <div className="accion-editar" style={{ backgroundColor: "#14a1dd" }} onClick={() => {
                    setSelectedFrenteModal(rowData);
                    setShowModal(true);
                }}>
                    <span><Iconsax.TaskSquare color="#ffffff" variant="Bold" /></span>
                </div>
            </div>
        );
    };

    const hideModal = () => {
        setShowModal(false);
        setSelectedFrenteModal(null);
    };

    return (
        <div className="zv-usuario" style={{ paddingTop: 16 }}>
            <ConfirmDialog />
            <Toast ref={toast} position="top-center"></Toast>

            {/* Dialog de consultores asociados */}
            <Dialog 
                visible={consultoresDialogVisible} 
                onHide={() => setConsultoresDialogVisible(false)} 
                header={consultoresDialogTitle}
                modal
                style={{ width: '550px', maxWidth: '90vw' }}
                footer={
                    <Boton 
                        label="Entendido" 
                        color="primary" 
                        style={{ fontSize: 13 }}
                        onClick={() => setConsultoresDialogVisible(false)} 
                    />
                }
            >
                <div style={{ marginBottom: 12 }}>
                    <p style={{ margin: 0, marginBottom: 10, color: '#e74c3c', fontWeight: 500 }}>
                        <i className="pi pi-exclamation-triangle" style={{ marginRight: 8 }}></i>
                        Los siguientes consultores están asociados. Debe desvincularlos antes de desactivar.
                    </p>
                </div>
                <DataTable value={consultoresAsociados} size="small" stripedRows>
                    <Column field="nombreCompleto" header="Consultor" />
                    <Column field="frenteNombre" header="Frente" />
                    <Column field="subFrenteNombre" header="Sub-Frente" />
                </DataTable>
            </Dialog>
            <div className="header-titulo">Gestión de Frentes</div>
            <div className="zv-usuario-body" style={{ marginTop: 16 }}>
                <div className="zv-usuario-body-filtro">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ marginLeft: "auto" }}>
                            <Boton
                                label="Crear Frente"
                                style={{ fontSize: 12, borderRadius: 15 }}
                                color="primary"
                                onClick={() => {
                                    setEditingFrenteId(null);
                                    setShowFormFrente(true);
                                }}
                            ></Boton>
                        </div>
                    </div>
                </div>
                <div className="zv-usuario-body-listado" style={{ marginTop: 24 }}>
                    <DatatableDefault value={listaFrentes}
                        lazy
                        globalFilterFields={['codigo', 'nombre', 'descripcion']}
                        loading={loading}
                        onPage={onPage}
                        first={lazyState.first}
                        header={header}
                        totalRecords={totalRecords}
                    >
                        <Column field="codigo" header="Código" />
                        <Column field="nombre" header="Nombre" />
                        <Column field="descripcion" header="Descripción" />
                        <Column
                            header="SUBFRENTE"
                            body={botonSubFrentesTemplate}
                            style={{ textAlign: 'center' }}
                        />
                        <Column
                            field="activo"
                            header="Estado"
                            body={(rowData) => (rowData.activo ? "Activo" : "Inactivo")}
                        />
                        <Column
                            header="Acciones"
                            body={accionFrente}
                        />
                    </DatatableDefault>
                </div>
            </div>

            <Dialog 
                visible={showModal} 
                style={{ width: '70vw' }} 
                header={selectedFrenteModal ? `Sub-Frentes de: ${selectedFrenteModal.nombre}` : 'Sub-Frentes'} 
                modal 
                className="p-fluid" 
                onHide={hideModal}
            >
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 15, marginTop: 10 }}>
                    <Boton
                        label="Crear Sub-Frente"
                        style={{ fontSize: 12, borderRadius: 15 }}
                        color="primary"
                        onClick={() => {
                            setParentFrenteId(selectedFrenteModal.id);
                            setEditingSubFrenteId(null);
                            setShowFormSubFrente(true);
                        }}
                    ></Boton>
                </div>
                <DataTable value={selectedFrenteModal?.subFrente} emptyMessage="No hay sub-frentes registrados para este Frente.">
                    <Column field="codigo" header="Código" />
                    <Column field="nombre" header="Nombre" />
                    <Column field="descripcion" header="Descripción" />
                    <Column
                        field="activo"
                        header="Estado"
                        body={(rowData) => (rowData.activo ? "Activo" : "Inactivo")}
                    />
                    <Column
                        header="Acciones"
                        body={accionSubFrente}
                    />
                </DataTable>
            </Dialog>

            <EditarFrente 
                visible={showFormFrente} 
                onHide={() => setShowFormFrente(false)} 
                onSave={() => {
                    setShowFormFrente(false);
                    loadLazyData();
                }} 
                id={editingFrenteId} 
            />

            <EditarSubFrente 
                visible={showFormSubFrente} 
                onHide={() => setShowFormSubFrente(false)} 
                onSave={() => {
                    setShowFormSubFrente(false);
                    loadLazyData();
                    setShowModal(false); // Cerramos el listado de sub-frentes para forzar recarga visual
                }} 
                id={editingSubFrenteId} 
                frenteId={parentFrenteId}
            />
        </div>
    );
};

export default Frentes;
