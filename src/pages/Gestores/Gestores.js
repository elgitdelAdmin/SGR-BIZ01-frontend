
import React, { useEffect, useState ,useRef} from "react";
import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Gestores.scss"
import { Navigate, useLocation,useNavigate } from "react-router-dom";
import { Loader, Placeholder } from 'rsuite';
import Boton from "../../components/Boton/Boton";
import { Toast } from 'primereact/toast';
import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method
import useUsuario from "../../hooks/useUsuario";
import { InputText } from "primereact/inputtext";
import {ListarGestores,EliminarGestor,ListarGestoresPorSocio} from "../../service/GestorService";
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
    const codRol = localStorage.getItem("codRol");

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


const loadLazyData = () => {
    if (networkTimeout) clearTimeout(networkTimeout);

    networkTimeout = setTimeout(() => {
        setLoading(true);
         const fetchFunction = codRol === "SUPERADMIN" ? ListarGestores : ListarGestoresPorSocio;
         fetchFunction()
        // ListarGestoresPorSocio()
            .then((data) => {
                setTotalRecords(data.length);
                const pageNumber = lazyState?.page ?? 0;
                const pageSize = lazyState?.rows ?? 10;
                const start = pageNumber * pageSize;
                const end = start + pageSize;
                let filteredData = data;
               if (globalFilterValue) {
    const search = globalFilterValue.toLowerCase();
    filteredData = data.filter(g =>
        g.nombres?.toLowerCase().includes(search) ||
        g.apellidoPaterno?.toLowerCase().includes(search) ||
        g.apellidoMaterno?.toLowerCase().includes(search) ||
        (g.telefono && g.telefono.toString().toLowerCase().includes(search))
    );
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

  
    useEffect(() => {
              setListaPersonas(listaPersonasTotal)
    }, [listaPersonasTotal]);
   

    const accion =(rowData)=>{
        return  <div className="profesor-datatable-accion">
            <div className="accion-editar" onClick={()=>navigate("EditarGestor/"+rowData.id)}>
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
        const idGestor = id
        await EliminarGestor({idGestor}).then(data=>{
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
            message: 'Seguro de eliminar el Gestor?',
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
            <div className="header-titulo">Gestión de Gestores</div>
            <div className="zv-usuario-body" style={{marginTop:16}}>
                   {/* <div className="zv-usuario-body-filtro">
                             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                 <div style={{ marginLeft: "auto" }}>
                                     <Boton
                                     label="Crear Gestor"
                                     style={{ fontSize: 12,borderRadius:15 }}
                                     color="primary"
                                     onClick = {()=>navigate("CrearGestor/")}
                                     ></Boton>
                                 </div>
                             </div>                        
                     </div> */}
                    <div className="zv-usuario-body-listado" style={{marginTop:24}}>
                        <DatatableDefault value={listaPersonas} 
                            lazy
                            globalFilterFields={["nombres", "apellidoPaterno", "apellidoMaterno", "telefono"]}                           
                            loading={loading}
                            onPage={onPage}
                            first={lazyState.first}
                            header = {header}
                            totalRecords ={totalRecords}
                        >
                              <Column field="nombres" header="Nombres" />
                             <Column field="apellidoPaterno" header="Apellido Paterno" />
                             <Column field="apellidoMaterno" header="Apellido Materno" />
                             {/* <Column
                                header="Especializaciones"
                                body={verespecializaciones} 
                            /> */}
                            <Column field="telefono" header="Teléfono" />
                            <Column
                                field="activo"
                                header="Estado"
                                body={(rowData) => (rowData.activo ? "Activo" : "Inactivo")}
                            />
                            <Column
                                header="Acciones"
                                body={accion} 
                            />
                        </DatatableDefault>
                         <Dialog
                                header="Especializaciones"
                                visible={visible}
                                style={{ width: '40vw' }}
                                footer={modalFooter}
                                onHide={() => setVisible(false)}
                            >
                                <DataTable value={especializaciones} responsiveLayout="scroll">
                                    <Column field="idFrente" header="Frente" />
                                    <Column field="idSubFrente" header="SubFrente" />
                                    <Column field="idNivelExperiencia" header="Nivel de Experiencia" />
                                </DataTable>
                            </Dialog>
                    </div>
            </div>
        </div>
     );
}
 
export default Gestores;
