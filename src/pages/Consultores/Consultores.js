
import React, { useEffect, useState ,useRef} from "react";
import DatatableDefaultNew from "../../components/Datatable/DatatableDefaultNew";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Consultores.scss"
import { Navigate, useLocation,useNavigate } from "react-router-dom";
import Boton from "../../components/Boton/Boton";
import { Toast } from 'primereact/toast';
import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method
import useUsuario from "../../hooks/useUsuario";
import { InputText } from "primereact/inputtext";
import {ListarConsultores,ListarConsultoresPorSocio,ListarParametros} from "../../service/ConsultorService";
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import {EliminarConsultor} from "../../service/ConsultorService";

const Consultores = () => {
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
      const [parametros, setParametro] = useState([]);
    
    const {permisos} = useUsuario();
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
         const fetchFunction = codRol === "SUPERADMIN" ? ListarConsultores : ListarConsultoresPorSocio;
         fetchFunction()
        // ListarConsultoresPorSocio()
            .then((data) => {
                console.log("DATA",data)
                                console.log("DATA",data)

                setTotalRecords(data.length);
                const pageNumber = lazyState?.page ?? 0;
                const pageSize = lazyState?.rows ?? 10;
                const start = pageNumber * pageSize;
                const end = start + pageSize;
                let filteredData = data;
               if (globalFilterValue) {
                        const search = globalFilterValue.toLowerCase();
                        filteredData = data.filter(c =>
                            c.persona?.nombres?.toLowerCase().includes(search) ||
                            c.persona?.apellidoPaterno?.toLowerCase().includes(search) ||
                            c.persona?.apellidoMaterno?.toLowerCase().includes(search) ||
                            c.persona?.correo?.toLowerCase().includes(search) ||
                            c.persona?.username?.toLowerCase().includes(search) ||
                           (c.persona?.telefono && c.persona.telefono.toString().toLowerCase().includes(search))                          );
                        }
                 //Agrego
filteredData.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion)).reverse();
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
                        onChange={(e)=>setGlobalFilterValue(e.target.value)} 
                        onKeyDown={handleKeyPress} 
                        placeholder="Buscar..." />
                </span>
                <div style={{marginLeft:"2%"}} className="accion-editar" onClick={()=>{onPage(1);setpaginaReinicio(1);loadLazyData()}}>
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
        console.log("LISTAAA",listaPersonasTotal)
              setListaPersonas(listaPersonasTotal)
    }, [listaPersonasTotal]);
    useEffect(() => {
       const getParametro = async () => {
         await ListarParametros().then(data=>{setParametro(data)})
      };
       getParametro();
     }, []);
     

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
        let idConsultor = id
        await EliminarConsultor({idConsultor}).then(data=>{
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
            message: 'Seguro de eliminar el Consultor?',
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
        setEspecializaciones(persona.especializaciones || []);
        setVisible(true);
    };
      const modalFooter = (
    <Boton label="Cerrar" icon="pi pi-times" onClick={() => setVisible(false)} />
  );
    return ( 
        <div className="zv-usuario" style={{paddingTop:16}}>
            <ConfirmDialog />
            <Toast ref={toast} position="top-center"></Toast>
            <div className="header-titulo">Gestión de Consultores</div>
            <div className="zv-usuario-body" style={{marginTop:16}}>
                   {/* <div className="zv-usuario-body-filtro">
                             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                 <div style={{ marginLeft: "auto" }}>
                                     <Boton
                                     label="Crear Consultor"
                                     style={{ fontSize: 12,borderRadius:15 }}
                                     color="primary"
                                     onClick = {()=>navigate("CrearConsultor/")}
                                     ></Boton>
                                 </div>
                             </div>                        
                     </div> */}
                    <div className="zv-usuario-body-listado" style={{marginTop:24}}>
                        {/* <DatatableDefault value={listaPersonas} 
                             lazy
                             globalFilter={globalFilterValue}   
                               globalFilterFields={[
                                    'persona.nombres',
                                    'persona.apellidoPaterno',
                                    'persona.apellidoMaterno',
                                    'persona.correo',
                                    'persona.telefono',
                                    'persona.username',
                                ]}
                            loading={loading}
                            onPage={onPage}
                            paginator           
                            first={lazyState.first}
                            header = {header}
                            totalRecords ={totalRecords}
                        >
                              <Column field="persona.nombres" header="Nombres" />
                             <Column field="persona.apellidoPaterno" header="Apellido Paterno" />
                             <Column field="persona.apellidoMaterno" header="Apellido Materno" />
                             <Column field="persona.correo" header="Correo" />


                             <Column
                                header="Especializaciones"
                                body={verespecializaciones} 
                            />
                            <Column field="persona.telefono" header="Teléfono" />
                            <Column
                                field="activo"
                                header="Estado"
                                body={(rowData) => (rowData.activo ? "Activo" : "Inactivo")}
                            />
                            <Column
                                header="Acciones"
                                body={accion} 
                            />
                        </DatatableDefault> */}
                           <DatatableDefaultNew 
                            value={listaPersonas}  
                            export={true}
                            rows={lazyState.rows || 50}  
                            showSearch={false} 
                            loading={loading}
                        >
                             <Column field="persona.nombres" header="Nombres" sortable style={{ width: '120px', minWidth: '120px' }}  />
                             <Column field="persona.apellidoPaterno" header="Apellido Paterno" sortable style={{ width: '130px', minWidth: '140px' }}  />
                             <Column field="persona.apellidoMaterno" header="Apellido Materno" sortable  style={{ width: '130px', minWidth: '140px' }}   />
                             <Column field="persona.correo" header="Correo" sortable style={{ width: '130px', minWidth: '180px' }}  />


                             <Column
                                header="Especializaciones"
                                body={verespecializaciones}  sortable style={{ width: '50px', minWidth: '58px' }} 
                            />
                            <Column field="persona.telefono" header="Teléfono"  sortable style={{ width: '130px', minWidth: '180px' }} />
                            <Column
                                field="activo"
                                header="Estado"
                                body={(rowData) => (rowData.activo ? "Activo" : "Inactivo")}  sortable style={{ width: '130px', minWidth: '180px' }} 
                            />
                            <Column body={accion} header="Acciones" style={{ width: '80px', minWidth: '80px' }} />
                           </DatatableDefaultNew>
                         <Dialog
                                header="Especializaciones"
                                visible={visible}
                                style={{ width: '40vw' }}
                                footer={modalFooter}
                                onHide={() => setVisible(false)}
                            >
                                <DataTable value={especializaciones} responsiveLayout="scroll">
                                    <Column field="frente.nombre" header="Frente" />
                                    <Column field="subFrente.nombre" header="SubFrente" />
                                    <Column
                                        header="Nivel de Experiencia"
                                        body={(rowData) => {
                                        const nivel = parametros
                                            ?.filter((item) => item.tipoParametro === "NivelExperiencia")
                                            .find((p) => p.id === rowData.idNivelExperiencia);
                                        return nivel ? nivel.nombre : "-";
                                        }}
                                    />
                                </DataTable>
                            </Dialog>
                    </div>
            </div>
        </div>
     );
}
 
export default Consultores;


