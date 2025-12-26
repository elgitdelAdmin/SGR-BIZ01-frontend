
import React, { useEffect, useState ,useRef} from "react";
import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import DatatableDefaultNew from "../../components/Datatable/DatatableDefaultNew";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Usuarios.scss"
import { Navigate, useLocation,useNavigate } from "react-router-dom";
import { Loader, Placeholder } from 'rsuite';
import Boton from "../../components/Boton/Boton";
import { Toast } from 'primereact/toast';
import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method
import useUsuario from "../../hooks/useUsuario";
import { InputText } from "primereact/inputtext";
import {ListarUsuariosPorSocio,ListarUsuarios,EliminarUsuario} from "../../service/UsuarioService";

import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';

const Gestores = () => {
    const navigate = useNavigate();
    const [especializaciones, setEspecializaciones] = useState([]);

    const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
    const [listaPersonas, setListaPersonas] = useState(null);
    const [listaPersonasTotal, setListaPersonasTotal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [visible, setVisible] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [totalRecords, setTotalRecords] = useState(0);
    const [paginaReinicio, setpaginaReinicio] = useState(null);
    
    const {permisos} = useUsuario();
    // const listaEmpresas =
    // [{value:1,name:"Zegel Virtual"}]
    const toast = useRef(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const codRol = localStorage.getItem("codRol");

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

const loadLazyData = () => {
    if (networkTimeout) clearTimeout(networkTimeout);

    networkTimeout = setTimeout(() => {
        setLoading(true);

        const fetchFunction =
            codRol === "SUPERADMIN"
                ? ListarUsuarios
                : ListarUsuariosPorSocio;

        fetchFunction()
            .then((data) => {
                let filteredData = data;

                // 🔹 filtro global
                if (globalFilterValue) {
                    const search = globalFilterValue.toLowerCase();
                    filteredData = filteredData.filter(usuario =>
                        usuario.persona?.nombres?.toLowerCase().includes(search) ||
                        usuario.persona?.apellidoPaterno?.toLowerCase().includes(search) ||
                        usuario.persona?.apellidoMaterno?.toLowerCase().includes(search) ||
                        usuario.persona?.numeroDocumento?.toLowerCase().includes(search) ||
                        usuario.username?.toLowerCase().includes(search) ||
                        usuario.persona?.correo?.toLowerCase().includes(search)
                    );
                }

                // 🔹 ordenar
                filteredData.sort((a, b) => {
                    const fechaA = new Date(a.persona?.fechaCreacion);
                    const fechaB = new Date(b.persona?.fechaCreacion);
                    return fechaB - fechaA;
                });

                // 🔹 guardar TODO
                setListaPersonasTotal(filteredData);
                setTotalRecords(filteredData.length);

                // 🔹 paginar SOLO lo visible
                const pageNumber = lazyState?.page ?? 0;
                const pageSize = lazyState?.rows ?? 10;
                const start = pageNumber * pageSize;
                const end = start + pageSize;

                setListaPersonas(filteredData.slice(start, end));

                setLoading(false);
            })
            .catch((error) => {
                console.error("Error al cargar usuarios:", error);
                setLoading(false);
            });
    }, Math.random() * 1000 + 250);
};

// const loadLazyData = () => {
//     if (networkTimeout) clearTimeout(networkTimeout);

//     networkTimeout = setTimeout(() => {
//         setLoading(true);
//         const fetchFunction = codRol === "SUPERADMIN" ? ListarUsuarios : ListarUsuariosPorSocio;
//          fetchFunction()
//         // ListarUsuariosPorSocio()
//             .then((data) => {
//                 setTotalRecords(data.length);
//                 const pageNumber = lazyState?.page ?? 0;
//                 const pageSize = lazyState?.rows ?? 10;
//                 const start = pageNumber * pageSize;
//                 const end = start + pageSize;
//                 let filteredData = data;

//                 if (globalFilterValue) {
//                     const search = globalFilterValue.toLowerCase();
//                     filteredData = data.filter(usuario =>
//                         usuario.persona?.nombres?.toLowerCase().includes(search) ||
//                         usuario.persona?.apellidoPaterno?.toLowerCase().includes(search) ||
//                         usuario.persona?.apellidoMaterno?.toLowerCase().includes(search) ||
//                         usuario.persona?.numeroDocumento?.toLowerCase().includes(search) ||
//                         usuario.username?.toLowerCase().includes(search) ||
//                         usuario.persona?.correo?.toLowerCase().includes(search)
//                     );
//                 }
//                     filteredData.sort((a, b) => {
//                                 const fechaA = new Date(a.persona?.fechaCreacion);
//                                 const fechaB = new Date(b.persona?.fechaCreacion);
//                                 return fechaB - fechaA; // más reciente primero
//                     });
//                              const paginatedData = filteredData.slice(start, end);

//                 setListaPersonasTotal(paginatedData);
//                 setLoading(false);
//             })
//             .catch((error) => {
//                 console.error("Error al cargar tickets:", error);
//                 setLoading(false);
//             });
//     }, Math.random() * 1000 + 250);
// };

    // const onPage = (event) => {
    //     setlazyState(event);
    // };
//     const onPage = (event) => {
//     setlazyState((prevState) => ({
//         ...prevState,
//         first: event.first,
//         rows: event.rows,
//         page: event.page,
//     }));
// };

const onPage = (event) => {
    console.log("📊 Evento onPage recibido:", event);
    setlazyState((prevState) => ({
        ...prevState,
        first: event.first,
        rows: event.rows,
        page: event.page, // Ya viene calculado desde DatatableDefaultNew
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





  
    useEffect(() => {
    console.log("listaPersonasTotal",listaPersonasTotal)
        setListaPersonas(listaPersonasTotal)
    }, [listaPersonasTotal]);
   

    const accion =(rowData)=>{
        return  <div className="profesor-datatable-accion">
            <div className="accion-editar" onClick={()=>navigate("EditarUsuario/"+rowData.id)}>
                <span><Iconsax.Edit color="#ffffff"/></span>
            </div>
             <div className="accion-eliminar" onClick={()=>{
                setUsuarioSeleccionado(rowData.id)
                confirm2(rowData.id)
                
             }}>
                <span><Iconsax.Trash color="#ffffff"/></span>
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



     const Eliminar =async ({id})=>{
            let idUsuario = id
            await EliminarUsuario({idUsuario}).then(data=>{
                console.log(data);
                toast.current.show({severity:'success', summary: 'Éxito', detail:"Registro eliminado.", life: 7000})
      
      
                // setTimeout(() => {
                //     window.location.reload();
                // }, 3000)
                loadLazyData(); // recarga solo la tabla
    
            })
            .catch(errors => {
                toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            })
        }

    const confirm2 = (id) => {
        confirmDialog({
            message: 'Seguro de eliminar el Usuario?',
            header: 'Eliminar',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel:"Aceptar",
            accept:()=>Eliminar({id})
        });
    };

    const verespecializaciones =(rowData)=>{
        return  <div className="detalle-datatable-accion">
            <div className="accion-editar" onClick={() => handleVerEspecializaciones(rowData)}>
                <span><Iconsax.Eye color="#ffffff"/></span>
            </div>
        </div>
        
    }
        const handleVerEspecializaciones = (persona) => {
        console.log("PERSON",persona)
        setEspecializaciones(persona.frentesSubFrente || []);
        setVisible(true);
    };
      const modalFooter = (
    <Boton label="Cerrar" icon="pi pi-times" onClick={() => setVisible(false)} />
  );
    return ( 
        <div className="zv-usuario" style={{paddingTop:16}}>
            <ConfirmDialog />
            <Toast ref={toast} position="top-center"></Toast>
            <div className="header-titulo">Gestión de Usuarios</div>
            <div className="zv-usuario-body" style={{marginTop:16}}>
                   <div className="zv-usuario-body-filtro">
                             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                 <div style={{ marginLeft: "auto" }}>
                                     <Boton
                                     label="Crear Usuario"
                                     style={{ fontSize: 12,borderRadius:15 }}
                                     color="primary"
                                     onClick = {()=>navigate("CrearUsuario/")}
                                     ></Boton>
                                 </div>
                             </div>                        
                     </div>
                    <div className="zv-usuario-body-listado" style={{marginTop:24}}>
                        {/* <DatatableDefault value={listaPersonas} 
                            lazy
                            // globalFilterFields={['nombres']}
                            globalFilterFields={[
                                'persona.nombres',
                                'persona.apellidoPaterno',
                                'persona.apellidoMaterno',
                                'persona.numeroDocumento',
                                'username',
                                'persona.correo'
                                ]}

                            loading={loading}
                            onPage={onPage}
                            first={lazyState.first}
                            header = {header}
                            totalRecords ={totalRecords}
                        >
                            <Column field="persona.nombres" header="Nombres" />
                            <Column field="persona.apellidoPaterno" header="Apellido Paterno" />
                            <Column field="persona.apellidoMaterno" header="Apellido Materno" />
                            <Column field="persona.numeroDocumento" header="N° Documento" />

                            <Column field="username" header="Username" />
                            <Column field="persona.correo" header="Correo" />
            
                            <Column
                                header="Acciones"
                                body={accion} 
                            />
                        </DatatableDefault> */}
                       


                        <DatatableDefaultNew 
                            value={listaPersonas}  
                            export={true}
                            rows={lazyState.rows || 50}  
                            first={lazyState.first}  
                            onPage={onPage}  
                            showSearch={false} 
                            loading={loading}
                        >
                          <Column field="persona.nombres" header="Nombres"  sortable style={{ width: '120px', minWidth: '120px' }}/>
                            <Column field="persona.apellidoPaterno" header="Apellido Paterno" sortable style={{ width: '120px', minWidth: '120px' }} />
                            <Column field="persona.apellidoMaterno" header="Apellido Materno" sortable style={{ width: '120px', minWidth: '120px' }} />
                            <Column field="persona.numeroDocumento" header="N° Documento" sortable style={{ width: '120px', minWidth: '120px' }} />

                            <Column field="username" header="Username"  sortable style={{ width: '120px', minWidth: '120px' }}/>
                            <Column field="persona.correo" header="Correo"  sortable style={{ width: '120px', minWidth: '120px' }}/>
                            <Column body={accion} header="Acciones" style={{ width: '80px', minWidth: '80px' }} />
                           </DatatableDefaultNew>
                    </div>
            </div>
        </div>
     );
}
 
export default Gestores;
