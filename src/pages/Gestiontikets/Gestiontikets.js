
import React, { useEffect, useState ,useRef,useMemo} from "react";
import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Gestiontikets.scss"
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";
import { Loader, Placeholder } from 'rsuite';
import Boton from "../../components/Boton/Boton";
import { Toast } from 'primereact/toast';
import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method
import useUsuario from "../../hooks/useUsuario";
import { InputText } from "primereact/inputtext";
import {ListarTicket,EliminarTicket,ListarParametros} from "../../service/TiketService";
import DatatableDefaultNew from "../../components/Datatable/DatatableDefaultNew";
import { DataTable } from 'primereact/datatable';
import { MultiSelect } from 'primereact/multiselect';

const Gestiontikets = () => {
    const navigate = useNavigate();
  let { idUser } = useParams();
  let { codRol } = useParams();

    const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
    const [listaEmpresa, setListaEmpresa] = useState(null);
    const [listaPersonas, setListaPersonas] = useState(null);
    const [listaPersonasTotal, setListaPersonasTotal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [visible, setVisible] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [totalRecords, setTotalRecords] = useState(0);
    const [paginaReinicio, setpaginaReinicio] = useState(null);
    const [parametros, setParametro] = useState([]);
   const [parametrosPrioridad, setParametroPrioridad] = useState([]);
const [estadosSeleccionados, setEstadosSeleccionados] = useState([]);
const estadosOpciones = [
    { id: 'activo', nombre: 'Activo' },
    { id: 'inactivo', nombre: 'Inactivo' },
    { id: 'pendiente', nombre: 'Pendiente' },
    { id: 'completado', nombre: 'Completado' }
    // Agrega los estados que necesites
];

    
    const {permisos} = useUsuario();
    const permisosActual = permisos["/tickets"] || {
    divsOcultos: [],
    controlesBloqueados: [],
    controlesOcultos: []
    };
    // const listaEmpresas =
    // [{value:1,name:"Zegel Virtual"}]
    const toast = useRef(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 0,
        sortField: null,
        sortOrder: null,
        filters: {
            name: { value: '', matchMode: 'contains' },
            'country.name': { value: '', matchMode: 'contains' },
            company: { value: '', matchMode: 'contains' },
            'representative.name': { value: '', matchMode: 'contains' }
        }
    });

    let networkTimeout = null;
//     useEffect(() => {
//     loadLazyData();
// }, [lazyState, globalFilterValue]);
 useEffect(() => {
    loadLazyData();
}, [globalFilterValue]);

useEffect(() => {
  const getParametro = async () => {
    const data = await ListarParametros();
    const estadoTickets = data.filter(p => p.tipoParametro === "EstadoTicket");
    const prioridadTickets = data.filter(p => p.tipoParametro === "Prioridad");
    setParametro(estadoTickets);
    setParametroPrioridad(prioridadTickets)
  };
  getParametro();
}, []);


// useEffect(() => {
//     loadLazyData();
// }, [lazyState, estadosSeleccionados]);

useEffect(() => {
  if (parametros.length > 0) {
    loadLazyData();
  }
}, [parametros,parametrosPrioridad,estadosSeleccionados]);

useEffect(() => {
  if (parametros.length > 0 && estadosSeleccionados.length === 0) {
    // Filtra todos los estados excepto "Cerrado" y "Anulado"
    const estadosPorDefecto = parametros
      .filter(p => 
        p.nombre?.toLowerCase() !== 'cerrado' && 
        p.nombre?.toLowerCase() !== 'anulado'
      )
      .map(p => p.id); // Obtiene los IDs
    
    // Esto actualiza el estado y el MultiSelect los muestra seleccionados
    setEstadosSeleccionados(estadosPorDefecto);
  }
}, [parametros]);

const loadLazyData = () => {
    if (networkTimeout) clearTimeout(networkTimeout);

    networkTimeout = setTimeout(() => {
        setLoading(true);
        ListarTicket({ idUser, codRol })
            .then((data) => {

                // --- 1) Agregar estadoNombre a cada ticket ---
                const dataConEstado = data.map(ticket => ({
                    ...ticket,
                    estadoNombre:
                        parametros.find(p => p.id === ticket.idEstadoTicket)?.nombre || "Sin estado",
                    prioridadNombre:
                        parametrosPrioridad.find(p => p.id === ticket.idPrioridad)?.nombre || "Sin prioridad",

                    estadoHorasTexto:
                        ticket.horasTrabajadas === 0
                            ? "pendiente"
                            : ticket.horasTrabajadas < ticket.horasTotales
                                ? "en proceso"
                                : "finalizado"
                }));
                // --- 2) Filtro global ---
                let filteredData = dataConEstado;

                
                if (estadosSeleccionados.length > 0) {
                    filteredData = filteredData.filter(ticket => 
                        estadosSeleccionados.includes(ticket.idEstadoTicket)
                    );
                }
                if (globalFilterValue) {
                    const search = globalFilterValue.toLowerCase();

                    filteredData = dataConEstado.filter(ticket => (
                        ticket.codTicket?.toLowerCase().includes(search) ||
                        ticket.codTicketInterno?.toLowerCase().includes(search) ||
                        ticket.titulo?.toLowerCase().includes(search) ||
                        ticket.descripcion?.toLowerCase().includes(search) ||
                        ticket.empresa?.razonSocial?.toLowerCase().includes(search) ||
                        ticket.fechaSolicitud?.toLowerCase().includes(search) ||
                        ticket.estadoNombre?.toLowerCase().includes(search) ||
                        ticket.prioridadNombre?.toLowerCase().includes(search) ||
                        ticket.estadoHorasTexto?.toLowerCase().includes(search)
                    ));
                }

                // --- 3) Ordenar ---
                filteredData.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

                // --- 4) Guardar ---
                setListaPersonasTotal(filteredData);
                setTotalRecords(filteredData.length);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error al cargar tickets:", error);
                setLoading(false);
            });
    }, Math.random() * 1000 + 250);
};
   
// const onPage = (event) => {
//     setlazyState((prevState) => ({
//         ...prevState,
//         first: event.first,
//         rows: event.rows,
//         page: event.page, 
//     }));
// };

const onPage = (event) => {
    // Solo actualiza el estado de paginación, NO recarga datos
    setlazyState((prevState) => ({
        ...prevState,
        first: event.first,
        rows: event.rows,
        page: event.page, 
    }));
    // NO llamar loadLazyData() aquí
};
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onPage(1);
            setpaginaReinicio(1);
            loadLazyData(empresaSeleccionada);
        }
    };

    const renderHeader = () => {
        return (
        <div className='flex justify-content-between flex-wrap'>
            
             
            <div className="flex justify-content-end">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} 
                        onChange={(e)=>setGlobalFilterValue(e.target.value)} 
                        onKeyDown={handleKeyPress} 
                        placeholder="Buscar..." />
                </span>
                <div style={{marginLeft:"2%"}} className="accion-editar" onClick={()=>{onPage(1);setpaginaReinicio(1);loadLazyData(empresaSeleccionada)}}>
                <span><Iconsax.SearchNormal color="#ffffff"/></span>
            </div>
            </div>
        </div>
           
        
            
        );
    };
    const header = renderHeader();



    // useEffect(()=>{
       
    //     if(permisos.length >0)
    //     {
    //         permisos.indexOf("editarUsuarioAdmin") > -1 && setIsAdmin(true)
    //     }

    // },[permisos])

    useEffect(() => {
              setListaPersonas(listaPersonasTotal)
    }, [listaPersonasTotal]);
   


    // const accion =(rowData)=>{
    //     const eliminarOculto = permisosActual.controlesOcultos.includes("btnEliminar");

    //     return  <div className="profesor-datatable-accion">
    //         <div className="accion-editar" onClick={()=>navigate("Editar/"+rowData.id)}>
    //             <span><Iconsax.Edit color="#ffffff"/></span>
    //         </div>
    //     </div>
        
    // }

 //Ajuste para tabla 
   useEffect(() => {
    const savedLazyState = sessionStorage.getItem('tickets_lazyState');
    const savedGlobalFilter = sessionStorage.getItem('tickets_globalFilter');
    
    
    if (savedLazyState) {
        const parsedState = JSON.parse(savedLazyState);
        
        const restoredState = {
            ...parsedState,
            first: parsedState.page * parsedState.rows,
            page: parsedState.page
        };
        
        setlazyState(restoredState);
        sessionStorage.removeItem('tickets_lazyState');
    }
    
    if (savedGlobalFilter) {
        setGlobalFilterValue(savedGlobalFilter);
        sessionStorage.removeItem('tickets_globalFilter');
    }
}, []);
const accion = (rowData) => {
    return <div className="profesor-datatable-accion">
        <div className="accion-editar" onClick={() => {
            
            const stateToSave = {
                ...lazyState,
                page: Math.floor(lazyState.first / lazyState.rows)
            };
            
            sessionStorage.setItem('tickets_lazyState', JSON.stringify(stateToSave));
            sessionStorage.setItem('tickets_globalFilter', globalFilterValue); // ✅ Corregido el typo
            navigate("Editar/" + rowData.id);
        }}>
            <span><Iconsax.Edit color="#ffffff"/></span>
        </div>
    </div>
}
            
    const paginatorLeft = <button type="button" icon="pi pi-refresh" className="p-button-text" />;
    const paginatorRight = <button type="button" icon="pi pi-cloud" className="p-button-text" />;

    const booleanTemplate = (rowData)=>{
        return(
            <span>{rowData.activo ? "Activo":"Inactivo"}</span>
        )
    }
        const estadoTicketTemplate = (rowData) => {
        const estado = parametros.find(p => p.id === rowData.idEstadoTicket);
        return estado ? estado.nombre : "Sin estado";
        };

        const prioridadTicketTemplate = (rowData) => {
        const prioridad = parametrosPrioridad.find(p => p.id === rowData.idPrioridad);
        return prioridad ? prioridad.descripcion : "Sin prioridad";
        };
     const estadoHorasTemplate = (rowData) => {
            const { horasTrabajadas, horasTotales } = rowData;

            let color = "";
            let texto = "";

            if (horasTrabajadas === 0) {
                color = "red";
                texto = "Pendiente";
            } else if (horasTrabajadas > 0 && horasTrabajadas < horasTotales) {
                color = "orange";
                texto = "En proceso";
            } else if (horasTrabajadas >= horasTotales) {
                color = "green";
                texto = "Finalizado";
            }

            return (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span
                        style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: color,
                            display: "inline-block",
                        }}
                    ></span>
                    <span style={{ color: color, fontWeight: 500 }}>{texto}</span>
                </div>
            );
    };



    const Eliminar =async ({id})=>{
            await EliminarTicket({id}).then(data=>{
                toast.current.show({severity:'success', summary: 'Éxito', detail:"Registro eliminado.", life: 7000})
                loadLazyData(); 
    
            })
            .catch(errors => {
                toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            })
        }

    const confirm2 = (id) => {
        confirmDialog({
            message: 'Seguro de eliminar ticket?',
            header: 'Eliminar',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel:"Aceptar",
            accept:()=>Eliminar({id})
        });
    };
    const limpiarDescripcion = (texto) => {
  if (!texto) return '';

  // Quita contenido entre etiquetas <v:...> y <img ...>
  let limpio = texto.replace(/<v:[^>]+>.*?<\/v:[^>]+>/gs, '');
  limpio = limpio.replace(/<img[^>]*>/g, '');

  // Quita todas las etiquetas HTML restantes
  limpio = limpio.replace(/<[^>]*>/g, '');

  // Decodifica entidades HTML (&nbsp; → espacio, etc.)
  const parser = new DOMParser();
  const decoded = parser.parseFromString(limpio, 'text/html').body.textContent;

  return decoded.trim();
};

const datosFiltrados = useMemo(() => {
    if (estadosSeleccionados.length === 0) {
        return parametros; // Cambia 'tickets' por el nombre de tu variable de datos
    }
    return parametros.filter(item => estadosSeleccionados.includes(item.estado));
}, [parametros, estadosSeleccionados]); 
    return ( 
        <div className="zv-usuario" style={{paddingTop:16}}>
            <ConfirmDialog />
            <Toast ref={toast} position="top-center"></Toast>
            <div className="header-titulo">Gestión de Tickets</div>
            <div className="zv-usuario-body" style={{marginTop:16}}>
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
                                    onChange={(e) => setEstadosSeleccionados(e.value)}
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
                    <div className="zv-usuario-body-listado" style={{marginTop:24}}>
                      
                        <DatatableDefaultNew 
                            value={listaPersonasTotal}  
                            export={true}
                            rows={lazyState.rows || 50}  
                            first={lazyState.first}  
                             onPage={onPage} 

                            showSearch={false} 
                            loading={loading}
                        >
                            <Column body={accion} header="Acciones" style={{ width: '80px', minWidth: '80px' }} />
                            <Column field="codTicket"    header={<div>Codigo Ticket <br />Conecta</div>}   sortable style={{ width: '130px', minWidth: '180px' }} />
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
                                    filter
                                    style={{ width: '140px', minWidth: '140px' }}
                                />
                                 <Column
                                    field="prioridadNombre"
                                    header="Prioridad"
                                    sortable
                                    filter
                                    style={{ width: '140px', minWidth: '140px' }}
                                />
                            <Column field="empresa.razonSocial" header="Empresa" sortable style={{ width: '150px', minWidth: '150px' }} />
                            <Column field="horasTrabajadas"    header={<div>Horas <br />Trabajadas</div>} sortable style={{ width: '100px', minWidth: '100px' }} />
                            <Column field="horasPlanificadas"  header={<div>Horas <br />Planificadas</div>} body={(rowData) => rowData.horasPlanificadas ?? '-'} sortable style={{ width: '120px', minWidth: '120px' }} />
                        </DatatableDefaultNew>

                    </div>
            </div>
        </div>
     );
}
 
export default Gestiontikets;



