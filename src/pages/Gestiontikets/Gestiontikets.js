
import React, { useEffect, useState ,useRef} from "react";
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
    useEffect(() => {
    loadLazyData();
}, [lazyState, globalFilterValue]);


// const loadLazyData = () => {
//     if (networkTimeout) clearTimeout(networkTimeout);

//     networkTimeout = setTimeout(() => {
//         setLoading(true);
//         ListarTicket({idUser,codRol})
//             .then((data) => {
//                 setTotalRecords(data.length);
//                 const pageNumber = lazyState?.page ?? 0;
//                 const pageSize = lazyState?.rows ?? 10;
//                 const start = pageNumber * pageSize;
//                 const end = start + pageSize;

//                 let filteredData = data;
//                 if (globalFilterValue) {
//                     const search = globalFilterValue.toLowerCase();
//                     filteredData = data.filter(ticket => {
//                     const search = globalFilterValue.toLowerCase();
//                     const estadoNombre = parametros.find(p => p.id === ticket.idEstadoTicket)?.nombre?.toLowerCase() || "";
//                     let estadoHorasTexto = "";
//                             if (ticket.horasTrabajadas === 0) {
//                                 estadoHorasTexto = "pendiente";
//                             } else if (ticket.horasTrabajadas > 0 && ticket.horasTrabajadas < ticket.horasTotales) {
//                                 estadoHorasTexto = "en proceso";
//                             } else if (ticket.horasTrabajadas >= ticket.horasTotales) {
//                                 estadoHorasTexto = "finalizado";
//                             }
//                     return (
//                         ticket.codTicket?.toLowerCase().includes(search) ||
//                         ticket.codTicketInterno?.toLowerCase().includes(search) ||
//                         ticket.titulo?.toLowerCase().includes(search) ||
//                         ticket.descripcion?.toLowerCase().includes(search) ||
//                         ticket.empresa?.razonSocial?.toLowerCase().includes(search) ||
//                         ticket.fechaSolicitud?.toLowerCase().includes(search) ||
//                         estadoNombre.includes(search)||
//                         estadoHorasTexto.includes(search)

//                     );
//                     });

//                 }
//                 filteredData.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion)).reverse();

//                 const paginatedData = filteredData.slice(start, end);

//                 setListaPersonasTotal(paginatedData);
//                 setLoading(false);
//             })
//             .catch((error) => {
//                 console.error("Error al cargar tickets:", error);
//                 setLoading(false);
//             });
//     }, Math.random() * 1000 + 250);
// };
const loadLazyData = () => {
    if (networkTimeout) clearTimeout(networkTimeout);

    networkTimeout = setTimeout(() => {
        setLoading(true);
        ListarTicket({idUser, codRol})
            .then((data) => {
                // Aplicar filtro global si existe
                let filteredData = data;
                if (globalFilterValue) {
                    const search = globalFilterValue.toLowerCase();
                    filteredData = data.filter(ticket => {
                        const estadoNombre = parametros.find(p => p.id === ticket.idEstadoTicket)?.nombre?.toLowerCase() || "";
                        let estadoHorasTexto = "";
                        if (ticket.horasTrabajadas === 0) {
                            estadoHorasTexto = "pendiente";
                        } else if (ticket.horasTrabajadas > 0 && ticket.horasTrabajadas < ticket.horasTotales) {
                            estadoHorasTexto = "en proceso";
                        } else if (ticket.horasTrabajadas >= ticket.horasTotales) {
                            estadoHorasTexto = "finalizado";
                        }
                        return (
                            ticket.codTicket?.toLowerCase().includes(search) ||
                            ticket.codTicketInterno?.toLowerCase().includes(search) ||
                            ticket.titulo?.toLowerCase().includes(search) ||
                            ticket.descripcion?.toLowerCase().includes(search) ||
                            ticket.empresa?.razonSocial?.toLowerCase().includes(search) ||
                            ticket.fechaSolicitud?.toLowerCase().includes(search) ||
                            estadoNombre.includes(search) ||
                            estadoHorasTexto.includes(search)
                        );
                    });
                }

                // Ordenar
                filteredData.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

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

    const accion =(rowData)=>{
  const eliminarOculto = permisosActual.controlesOcultos.includes("btnEliminar");

        return  <div className="profesor-datatable-accion">
            <div className="accion-editar" onClick={()=>navigate("Editar/"+rowData.id)}>
                <span><Iconsax.Edit color="#ffffff"/></span>
            </div>

           
               {/* {!eliminarOculto && (
        <div
          className="accion-eliminar"
          onClick={() => {
            setUsuarioSeleccionado(rowData.id);
            confirm2(rowData.id);
          }}
        >
          <span><Iconsax.Trash color="#ffffff" /></span>
        </div>
      )} */}
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
        console.log("ID",id)
            await EliminarTicket({id}).then(data=>{
                console.log(data);
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


    return ( 
        <div className="zv-usuario" style={{paddingTop:16}}>
            <ConfirmDialog />
            <Toast ref={toast} position="top-center"></Toast>
            <div className="header-titulo">Gestión de Tickets</div>
            <div className="zv-usuario-body" style={{marginTop:16}}>
                 <div className="zv-usuario-body-filtro">
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ marginLeft: "auto" }}>
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
                        {/* <DatatableDefault value={listaPersonas} 
                            lazy
                            onGlobalFilterChange={['titulo', 'codTicket','codTicketInterno','fechaSolicitud','descripcion','estado','empresa.razonSocial']}
                            loading={loading}
                            onPage={onPage}
                            first={lazyState.first}
                            header = {header}
                            totalRecords ={totalRecords}
                            
                        >
                            <Column field="codTicket" header="Codigo Ticket Conecta" ></Column>
                            <Column field="codTicketInterno" header="Codigo Interno" ></Column>
                            <Column field="titulo" header="Titulo" ></Column>
                            <Column field="fechaSolicitud" header="Fecha de Solicitud" ></Column>
                            <Column
                            field="descripcion"
                            header="Descripción"
                            style={{ width: '350px', whiteSpace: 'normal', wordWrap: 'break-word' }}
                            body={(rowData) => (
                                <div style={{
                                maxWidth: '350px',
                                overflowWrap: 'break-word',
                                whiteSpace: 'normal',
                                textOverflow: 'ellipsis',
                                }}>
                                {limpiarDescripcion(rowData.descripcion)}
                                </div>
                            )}
                            />
                            <Column header="Estado" body={estadoTicketTemplate} />
                            <Column header="Prioridad" body={prioridadTicketTemplate} />
                            <Column field="empresa.razonSocial" header="Empresa" ></Column>
                            <Column field="horasTrabajadas" header="Horas Trabajadas" ></Column>
                            <Column field="horasPlanificadas" header="Horas Planificadas" body={(rowData) => rowData.horasPlanificadas ?? '-'}/>
                            <Column body={accion}  header="Acciones"></Column>

                        </DatatableDefault> */}
<DatatableDefaultNew 
    value={listaPersonasTotal}  
    export={true}
    rows={lazyState.rows || 50}  
    showSearch={false} 
    loading={loading}
    
>
    <Column field="codTicket" header="Codigo Ticket Conecta" sortable />
    <Column field="codTicketInterno" header="Codigo Interno"sortable ></Column>
    <Column field="titulo" header="Titulo"sortable ></Column>
    <Column field="fechaSolicitud" header="Fecha de Solicitud" sortable></Column>
    <Column header="Estado" body={estadoTicketTemplate} sortable/>
    <Column header="Prioridad" body={prioridadTicketTemplate} sortable/>
    <Column field="empresa.razonSocial" header="Empresa" sortable></Column>
    <Column field="horasTrabajadas" header="Horas Trabajadas" sortable></Column>
    <Column field="horasPlanificadas" header="Horas Planificadas" body={(rowData) => rowData.horasPlanificadas ?? '-'} sortable/>
    <Column body={accion}  header="Acciones"></Column>
</DatatableDefaultNew>



                      {/* {loading ? (
  <div className="text-center p-8">Cargando...</div>
) : (
  <DatatableDefaultNew 
    data={listaPersonas || []} 
    columns={columns}
  />
  
)} */}
{/* <DataTable 
    value={listaPersonas} 
    lazy
    loading={loading}
    onPage={onPage}
    first={lazyState.first}
    paginator
    rows={10}
    totalRecords={totalRecords}
    header={header}
    filterDisplay="row"
>
    <Column field="codTicket" header="Codigo Ticket Conecta" filter filterPlaceholder="Buscar..." />
    <Column field="codTicketInterno" header="Codigo Interno" filter filterPlaceholder="Buscar..." />
    <Column field="titulo" header="Titulo" filter filterPlaceholder="Buscar..." />
    <Column field="fechaSolicitud" header="Fecha de Solicitud" filter filterPlaceholder="Buscar..." />
    <Column
        field="descripcion"
        header="Descripción"
        filter 
        filterPlaceholder="Buscar..."
        style={{ width: '350px', whiteSpace: 'normal', wordWrap: 'break-word' }}
        body={(rowData) => (
            <div style={{
                maxWidth: '350px',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
            }}>
                {limpiarDescripcion(rowData.descripcion)}
            </div>
        )}
    />
    <Column header="Estado" body={estadoTicketTemplate} filter filterPlaceholder="Buscar..." />
    <Column header="Prioridad" body={prioridadTicketTemplate} filter filterPlaceholder="Buscar..." />
    <Column field="empresa.razonSocial" header="Empresa" filter filterPlaceholder="Buscar..." />
    <Column field="horasTrabajadas" header="Horas Trabajadas" filter filterPlaceholder="Buscar..." />
    <Column field="horasPlanificadas" header="Horas Planificadas" filter filterPlaceholder="Buscar..." body={(rowData) => rowData.horasPlanificadas ?? '-'} />
    <Column body={accion} header="Acciones" />
</DataTable> */}

{/* <DatatableDefault
    globalFilterFields={['titulo', 'codTicket','codTicketInterno','fechaSolicitud','descripcion','estado','empresa.razonSocial']}

    value={listaPersonasTotal}
    lazy
    paginator
    totalRecords={totalRecords}
    onPage={onPage}
    first={lazyState.first}
    rows={lazyState.rows}
    loading={loading}
>
    <Column field="codTicket" header="Codigo Ticket Conecta" filter filterPlaceholder="Buscar..." ></Column>
    <Column field="codTicketInterno" header="Codigo Interno" filter filterPlaceholder="Buscar..."></Column>
    <Column field="titulo" header="Titulo"  filter filterPlaceholder="Buscar..."></Column>
    <Column field="fechaSolicitud" header="Fecha de Solicitud" filter filterPlaceholder="Buscar..."></Column>
    <Column header="Estado" body={estadoTicketTemplate} filter filterPlaceholder="Buscar..."/>
    <Column header="Prioridad" body={prioridadTicketTemplate} filter filterPlaceholder="Buscar..." />
    <Column field="empresa.razonSocial" header="Empresa" filter filterPlaceholder="Buscar..."></Column>
    <Column field="horasTrabajadas" header="Horas Trabajadas" filter filterPlaceholder="Buscar..."></Column>
    <Column field="horasPlanificadas" header="Horas Planificadas" body={(rowData) => rowData.horasPlanificadas ?? '-'}filter filterPlaceholder="Buscar..." />
    <Column body={accion}  header="Acciones"></Column>

</DatatableDefault> */}
                    </div>
            </div>
        </div>
     );
}
 
export default Gestiontikets;



