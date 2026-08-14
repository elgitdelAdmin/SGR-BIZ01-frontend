
import React, { useEffect, useState ,useRef} from "react";
import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import DatatableDinamic from "../../components/Datatable/DatatableDinamic";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Empresas.scss"
import { Navigate, useLocation,useNavigate } from "react-router-dom";
import { Loader, Placeholder } from 'rsuite';
import Boton from "../../components/Boton/Boton";
import { Toast } from 'primereact/toast';
import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method
import useUsuario from "../../hooks/useUsuario";
import { InputText } from "primereact/inputtext";
import {ListarEmpresasPorSocio,ListarEmpresas,EliminarEmpresa} from "../../service/EmpresaService";
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';

const Empresas = () => {
    const navigate = useNavigate();
    const [especializaciones, setEspecializaciones] = useState([]);

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
    }, []);

    const loadLazyData = () => {
        setLoading(true);
        const fetchFunction = codRol === "SUPERADMIN" ? ListarEmpresas : ListarEmpresasPorSocio;
        fetchFunction()
            .then((data) => {
                const dataConEstado = data.map(consultor => ({
                    ...consultor,
                    estadoNombre: consultor.activo ? "Activo" : "Inactivo",
                    gestoresAsignadosNombres: (!consultor.gestores || consultor.gestores.length === 0)
                        ? 'Ninguno'
                        : consultor.gestores.map(g => g.nombreGestor ? g.nombreGestor.trim() : "").filter(Boolean).join(' / ')
                }));
                // 🔹 ordenar
                dataConEstado.sort((a, b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro)).reverse();
                setListaPersonas(dataConEstado);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error al cargar empresas:", error);
                setLoading(false);
            });
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

    useEffect(() => {
              setListaPersonas(listaPersonasTotal)
    }, [listaPersonasTotal]);
   

    // Acciones ahora gestionadas por DatatableDinamic
            
    const paginatorLeft = <button type="button" icon="pi pi-refresh" className="p-button-text" />;
    const paginatorRight = <button type="button" icon="pi pi-cloud" className="p-button-text" />;

    const booleanTemplate = (rowData)=>{
        return(
            <span>{rowData.activo ? "Activo":"Inactivo"}</span>
        )
    }


    const Eliminar =async ({id})=>{
        let idEmpresa = id
        await EliminarEmpresa({idEmpresa}).then(data=>{
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
            message: 'Seguro de eliminar la Empresa?',
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
            <div className="header-titulo">Gestión de Empresas</div>
            <div className="zv-usuario-body" style={{marginTop:16}}>
                   <div className="zv-usuario-body-filtro">
                             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                 <div style={{ marginLeft: "auto" }}>
                                     <Boton
                                     label="Crear Empresa"
                                     style={{ fontSize: 12,borderRadius:8 }}
                                     color="primary"
                                     onClick = {()=>navigate("CrearEmpresa/")}
                                     ></Boton>
                                 </div>
                             </div>                        
                     </div>
                    <div className="zv-usuario-body-listado" style={{marginTop:24}}>
                        {/* <DatatableDefault value={listaPersonas} 
                            lazy
                            globalFilterFields={['nombreComercial', 'razonSocial', 'numDocContribuyente', 'telefono', 'direccion', 'email']}                           
                             loading={loading}
                            onPage={onPage}
                            first={lazyState.first}
                            header = {header}
                            totalRecords ={totalRecords}
                        >
                             <Column field="nombreComercial" header="Nombre Comercial" />
                             <Column field="razonSocial" header="Razon social" />
                            <Column field="numDocContribuyente" header="RUC" />
                            <Column field="telefono" header="Telefono" />
                            <Column field="direccion" header="Direccion" />
                            <Column field="email" header="Correo" />
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
                           <DatatableDinamic 
                             value={listaPersonas}  
                             exportable={true}
                             showSearch={true} 
                             loading={loading}
                             onEdit={(rowData) => navigate("EditarEmpresa/" + rowData.id)}
                             onDelete={(rowData) => {
                                 setUsuarioSeleccionado(rowData.id);
                                 confirm2(rowData.id);
                             }}
                         >
                                 <Column field="nombreComercial" header="Nombre Comercial"  sortable style={{ width: '120px', minWidth: '120px' }} />
                              <Column field="razonSocial" header="Razon social" sortable style={{ width: '120px', minWidth: '120px' }}  />
                             <Column field="numDocContribuyente" header="RUC" sortable style={{ width: '120px', minWidth: '120px' }}  />
                             <Column field="telefono" header="Telefono"  sortable style={{ width: '120px', minWidth: '120px' }} />
                             <Column field="gestoresAsignadosNombres" header="Gestores Asignados" sortable style={{ width: '200px', minWidth: '200px' }} />
                             <Column field="nombreSocio" header="Socio" sortable style={{ width: '120px', minWidth: '120px' }}  />
                            </DatatableDinamic>
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
                                    <Column field="nivelExperiencia" header="Nivel de Experiencia" />
                                </DataTable>
                            </Dialog>
                    </div>
            </div>
        </div>
     );
}
 
export default Empresas;


