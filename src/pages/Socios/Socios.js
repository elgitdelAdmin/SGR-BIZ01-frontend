
import React, { useEffect, useState ,useRef} from "react";
import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import DatatableDinamic from "../../components/Datatable/DatatableDinamic";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Socios.scss"
import { Navigate, useLocation,useNavigate } from "react-router-dom";
import { Loader, Placeholder } from 'rsuite';
import Boton from "../../components/Boton/Boton";
import { Toast } from 'primereact/toast';
import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method
import useUsuario from "../../hooks/useUsuario";
import { InputText } from "primereact/inputtext";
import {ListarSocios,EliminarSocio} from "../../service/SocioService";


import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';

const Gestores = () => {
    const navigate = useNavigate();
    const [especializaciones, setEspecializaciones] = useState([]);

    const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
    const [listaPersonas, setListaPersonas] = useState(null);
    const [listaPersonasTotal, setListaSociosTotal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socioSeleccionado, setSocioSeleccionado] = useState(null);
    const [visible, setVisible] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [totalRecords, setTotalRecords] = useState(0);
    const [paginaReinicio, setpaginaReinicio] = useState(null);
    const [hoveredLogo, setHoveredLogo] = useState(null);
    
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
    }, []);

    const loadLazyData = () => {
        setLoading(true);
        ListarSocios()
            .then((data) => {
                // 🔹 ordenar
                data.sort((a, b) => new Date(a.fechaRegistro) - new Date(b.fechaRegistro)).reverse();
                setListaPersonas(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error al cargar socios:", error);
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

    const handleMouseEnter = (e, logo) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoveredLogo({
            logo: logo,
            x: rect.right + 15,
            y: rect.top - 70
        });
    };

    const handleMouseLeave = () => {
        setHoveredLogo(null);
    };

    const logoTemplate = (rowData) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40px', width: '40px' }}>
                {rowData.logo ? (
                    <img
                        src={rowData.logo}
                        alt="Logo"
                        onMouseEnter={(e) => handleMouseEnter(e, rowData.logo)}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            borderRadius: '4px',
                            border: '1px solid #d0e5f0',
                            cursor: 'pointer'
                        }}
                    />
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '4px',
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px dashed #9198a7'
                    }}>
                        <i className="pi pi-image" style={{ fontSize: '1rem', color: '#9198a7' }}></i>
                    </div>
                )}
            </div>
        );
    };



     const Eliminar =async ({id})=>{
            let idSocio = id
            await EliminarSocio({idSocio}).then(data=>{
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
            <div className="header-titulo">Gestión de Socios</div>
            <div className="zv-usuario-body" style={{marginTop:16}}>
                   <div className="zv-usuario-body-filtro">
                             <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                 <div style={{ marginLeft: "auto" }}>
                                     <Boton
                                     label="Crear Socio"
                                     style={{ fontSize: 12,borderRadius:8 }}
                                     color="primary"
                                     onClick = {()=>navigate("CrearSocio/")}
                                     ></Boton>
                                 </div>
                             </div>                        
                     </div>
                    <div className="zv-usuario-body-listado" style={{marginTop:24}}>
                         <DatatableDinamic 
                             value={listaPersonas}  
                             exportable={true}
                             showSearch={true}
                             loading={loading}
                             onEdit={(rowData) => navigate("EditarSocio/" + rowData.id)}
                             onDelete={(rowData) => {
                                 setSocioSeleccionado(rowData.id);
                                 confirm2(rowData.id);
                             }}
                         >   <Column header="Logo" body={logoTemplate} style={{ width: '60px', minWidth: '60px', textAlign: 'center' }} />
                            <Column field="razonSocial" header="Razon Social" sortable style={{ width: '130px', minWidth: '130px' }} />
                            <Column field="codigo" header="Codigo" sortable style={{ width: '90px', minWidth: '90px' }} />
                            <Column field="nombre" header="Nombre" sortable style={{ width: '120px', minWidth: '120px' }} />
                            <Column field="nombreComercial" header="Nombre Comercial" sortable style={{ width: '120px', minWidth: '120px' }} />
                            <Column field="numDocContribuyente" header="N° Documento Contribuyente" sortable style={{ width: '120px', minWidth: '120px' }} />
                            <Column field="direccion" header="Direccion" sortable style={{ width: '150px', minWidth: '150px' }} />
                            <Column field="telefono1" header="Telefono 1" sortable style={{ width: '100px', minWidth: '100px' }} />
                            <Column field="telefono2" header="Telefono 2" sortable style={{ width: '100px', minWidth: '100px' }} />
                            <Column field="email" header="Email" sortable style={{ width: '140px', minWidth: '140px' }} />
                            <Column
                                field="activo"
                                header="Estado"
                                sortable
                                style={{ width: '90px', minWidth: '90px' }}
                                body={(rowData) => (rowData.activo ? "Activo" : "Inactivo")}
                            />
                        </DatatableDinamic>
                       
                    </div>
            </div>
            {hoveredLogo && (
                <div style={{
                    position: 'fixed',
                    left: `${hoveredLogo.x}px`,
                    top: `${hoveredLogo.y}px`,
                    zIndex: 9999,
                    padding: '10px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 25px rgba(0,0,0,0.2)',
                    border: '1px solid #d0e5f0',
                    width: '180px',
                    height: '180px',
                    pointerEvents: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <img src={hoveredLogo.logo} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
            )}
        </div>
     );
}
 
export default Gestores;
