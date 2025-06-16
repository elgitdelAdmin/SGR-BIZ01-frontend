
import React, { useEffect, useState ,useRef} from "react";
import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Gestiontikets.scss"
import { Navigate, useLocation,useNavigate } from "react-router-dom";
import ObtenerListaEmpresas from "../../service/ExEmpresaService";
import {ObtenerListaPersonas,ObtenerPersonaPorEmpresa,EliminarPersona, ObtenerListaPersonasV2} from "../../service/UsuarioService";
import { Loader, Placeholder } from 'rsuite';
import Boton from "../../components/Boton/Boton";
import { Toast } from 'primereact/toast';
import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method
import useUsuario from "../../hooks/useUsuario";
import { InputText } from "primereact/inputtext";
import {ListarTicket,EliminarTicket} from "../../service/TiketService";

const Gestiontikets = () => {
    const navigate = useNavigate();

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
    
    const {permisos} = useUsuario();
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
    //    const idEmpresa= 1
    //     console.log("lazy state = >", lazyState)
    //     if (networkTimeout) {
    //         clearTimeout(networkTimeout);
    //     }
    //     networkTimeout = setTimeout(() => {
    //         setLoading(true);
    //         let jwt = window.localStorage.getItem("jwt");
    //         let pageNumber = (lazyState?.page?? 0 ) +1;
    //         let pageSize  = lazyState?.rows??10;
    //         let search = globalFilterValue ? globalFilterValue : "%20"

    //         console.log(pageSize);

    //         if(paginaReinicio == 1/* search.trim() != "%20" */)
    //         {
    //             setpaginaReinicio(null)
    //             pageNumber = 1
    //         } 

    //         console.log(pageSize);

    //         ObtenerListaPersonasV2({jwt,idEmpresa,pageNumber,pageSize,search}).then(data=>{
    //             if(data.length >0)
    //             {
    //                 setTotalRecords(data[0].countReg)
    //             }
    //             setListaPersonasTotal(data)
    //             setLoading(false)
    //         })
    //     }, Math.random() * 1000 + 250);
    // } 
const loadLazyData = () => {
    if (networkTimeout) clearTimeout(networkTimeout);

    networkTimeout = setTimeout(() => {
        setLoading(true);

        ListarTicket()
            .then((data) => {
                // Total de registros
                setTotalRecords(data.length);

                // Parámetros de paginación del estado
                const pageNumber = lazyState?.page ?? 0;
                const pageSize = lazyState?.rows ?? 10;

                // Calcula el índice de inicio y fin
                const start = pageNumber * pageSize;
                const end = start + pageSize;

                // Filtrado (opcional, si usas globalFilterValue)
                let filteredData = data;
                if (globalFilterValue) {
                    const search = globalFilterValue.toLowerCase();
                    filteredData = data.filter(ticket =>
                        ticket.titulo?.toLowerCase().includes(search) ||
                        ticket.descripcion?.toLowerCase().includes(search)
                    );
                }
                //Agrego
filteredData.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion)).reverse();

                // Pagina localmente los datos
                const paginatedData = filteredData.slice(start, end);

                setListaPersonasTotal(paginatedData);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error al cargar tickets:", error);
                setLoading(false);
            });
    }, Math.random() * 1000 + 250);
};

    // const onPage = (event) => {
    //     setlazyState(event);
    // };
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

    // useEffect(()=>{
    //     const GetEmpresa = async ()=>
    //     {
    //         let jwt = window.localStorage.getItem("jwt");

    //         await ObtenerListaEmpresas({jwt}).then(data=>{
    //             setListaEmpresa(data);
    //         })
    //     }
    //     if(!listaEmpresa)GetEmpresa();
        
    // },[])
    useEffect(() => {
              setListaPersonas(listaPersonasTotal)
    }, [listaPersonasTotal]);
   

    const accion =(rowData)=>{
        return  <div className="profesor-datatable-accion">
            <div className="accion-editar" onClick={()=>navigate("Editar/"+rowData.id)}>
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
    return ( 
        <div className="zv-usuario" style={{paddingTop:16}}>
            <ConfirmDialog />
            <Toast ref={toast} position="top-center"></Toast>
            <div className="header-titulo">Gestión de Tickets</div>
            <div className="zv-usuario-body" style={{marginTop:16}}>
                 <div className="zv-usuario-body-filtro">
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ marginLeft: "auto" }}>
                                     <Boton
                                     icon="pi pi-plus" 
                                     style={{ fontSize: 15, borderRadius: 15 }}
                                     color="primary"
                                     onClick={() => navigate("Crear/")}
                                     />

                                 </div>
                             </div>                        
                     </div>
                    <div className="zv-usuario-body-listado" style={{marginTop:24}}>
                        <DatatableDefault value={listaPersonas} 
                            lazy
                            onGlobalFilterChange={['titulo', 'codTicket']}
                            loading={loading}
                            onPage={onPage}
                            first={lazyState.first}
                            header = {header}
                            totalRecords ={totalRecords}
                            
                        >
                            <Column field="codTicket" header="Codigo Ticket" ></Column>
                            <Column field="titulo" header="Titulo" ></Column>
                            <Column field="fechaSolicitud" header="Fecha de Solicitud" ></Column>
                            <Column field="descripcion" header="Descripcion" ></Column>
                            <Column field="activo" header="Estado"dataType="boolean"  body={booleanTemplate}></Column>
                            <Column body={accion} style={{display:"flex",justifyContent:"center"}} header="Acciones"></Column>
                        </DatatableDefault>
                    </div>
            </div>
        </div>
     );
}
 
export default Gestiontikets;



