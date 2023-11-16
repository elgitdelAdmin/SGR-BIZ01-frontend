import React, { useEffect, useState ,useRef} from "react";
import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Usuario.scss"
import { Navigate, useLocation,useNavigate } from "react-router-dom";
import ObtenerListaEmpresas from "../../service/EmpresaService";
import {ObtenerListaPersonas,ObtenerPersonaPorEmpresa,EliminarPersona, ObtenerListaPersonasV2} from "../../service/UsuarioService";
import { Loader, Placeholder } from 'rsuite';
import Boton from "../../components/Boton/Boton";
import { Toast } from 'primereact/toast';
import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method
import useUsuario from "../../hooks/useUsuario";
import { InputText } from "primereact/inputtext";
const Usuario = () => {
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
        if(empresaSeleccionada)loadLazyData(empresaSeleccionada);
        
    }, [lazyState,empresaSeleccionada]);

    

    const loadLazyData = (idEmpresa) => {
       
        console.log("lazy state = >", lazyState)
        if (networkTimeout) {
            clearTimeout(networkTimeout);
        }
        networkTimeout = setTimeout(() => {
            setLoading(true);
            let jwt = window.localStorage.getItem("jwt");
            let pageNumber = (lazyState?.page?? 0 ) +1;
            let pageSize  = lazyState?.rows??10;
            let search = globalFilterValue ? globalFilterValue : "%20"

            console.log(pageSize);

            if(paginaReinicio == 1/* search.trim() != "%20" */)
            {
                setpaginaReinicio(null)
                pageNumber = 1
            } 

            console.log(pageSize);

            ObtenerListaPersonasV2({jwt,idEmpresa,pageNumber,pageSize,search}).then(data=>{
                if(data.length >0)
                {
                    setTotalRecords(data[0].countReg)
                }
                setListaPersonasTotal(data)
                setLoading(false)
            })
            // CustomerService.getCustomers({ lazyEvent: JSON.stringify(lazyState) }).then((data) => {
            //     setTotalRecords(data.totalRecords);
            //     setCustomers(data.customers);
            //     setLoading(false);
            // });
            //setLoading(false);
        }, Math.random() * 1000 + 250);
    } 

    const onPage = (event) => {
        setlazyState(event);
    };
    
    /* useEffect(() => {
        if(globalFilterValue.length > 0)loadLazyData(empresaSeleccionada)
    }, [globalFilterValue]); */

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
                        placeholder="Buscarss..." />
                </span>
                <div style={{marginLeft:"2%"}} className="accion-editar" onClick={()=>{onPage(1);setpaginaReinicio(1);loadLazyData(empresaSeleccionada)}}>
                <span><Iconsax.SearchNormal color="#ffffff"/></span>
            </div>
            </div>
        </div>
           
        
            
        );
    };
    const header = renderHeader();



    useEffect(()=>{
       
        if(permisos.length >0)
        {
            permisos.indexOf("editarUsuarioAdmin") > -1 && setIsAdmin(true)
        }

    },[permisos])

    useEffect(()=>{
        const GetEmpresa = async ()=>
        {
            let jwt = window.localStorage.getItem("jwt");

            await ObtenerListaEmpresas({jwt}).then(data=>{
                setListaEmpresa(data);
            })
        }
        if(!listaEmpresa)GetEmpresa();
        
    },[])
    useEffect(() => {
             if(listaPersonasTotal)
        {
            let personaTemp = listaPersonasTotal.filter(x=>x.idEmpresa == empresaSeleccionada)
            if(!isAdmin && personaTemp.length > 0)
            {
                personaTemp = personaTemp.filter(x=>x.tipoPersona.descripcionTipo == "Alumno")
            }
            
            setListaPersonas(personaTemp)
        }
    }, [listaPersonasTotal]);
    // const GetPersonaPorEmpresa = async (id)=>
    // {
    //     // let jwt = window.localStorage.getItem("jwt");
    //     // let idEmpresa = id
    //     // await ObtenerPersonaPorEmpresa({jwt,idEmpresa}).then(data=>{
    //     //     setListaPersonas(data);
    //     // })
    //     if(listaPersonasTotal)
    //     {
    //         let personaTemp = listaPersonasTotal.filter(x=>x.idEmpresa == id)
    //         if(!isAdmin && personaTemp.length > 0)
    //         {
    //             personaTemp = personaTemp.filter(x=>x.tipoPersona.descripcionTipo == "Alumno")
    //         }
            
    //         setListaPersonas(personaTemp)
    //     }
        
    // }


    // useEffect(()=>{
    //     const GetPersonas= async()=>{
    //         let jwt = window.localStorage.getItem("jwt");
    //         await ObtenerListaPersonas({jwt}).then(data=>
    //             {
    //                 setListaPersonasTotal(data)
    //                 setLoading(false)
    //             })
    //     }
    //     if(!listaPersonasTotal) GetPersonas()
    // },[])

    const tempDatatable = 
    [{id:1,nombre:"ADMIN",email: "admin@prueba.com",dni:"11111111",estado : true},
    {id:2,nombre:"Usuario 1",email: "usuario1@prueba.com",dni:"22222222",estado : true},
    {id:3,nombre:"Usuario 2",email: "usuario2@prueba.com",dni:"33333333",estado : true}]

    const accion =(rowData)=>{
        return  <div className="profesor-datatable-accion">
            <div className="accion-editar" onClick={()=>navigate("EditarUsuario/"+rowData.idUsuario)}>
                <span><Iconsax.Edit color="#ffffff"/></span>
            </div>
             <div className="accion-eliminar" onClick={()=>{
                setUsuarioSeleccionado(rowData.idUsuario)
                confirm2(rowData.idUsuario)
                
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
        let jwt = window.localStorage.getItem("jwt");
        let idPersona = id
        await EliminarPersona({jwt,idPersona}).then(data=>{
            //formik.setSubmitting(false)
            console.log(data);
            toast.current.show({severity:'success', summary: 'Éxito', detail:"Registro eliminado.", life: 7000})
  
  
            setTimeout(() => {
                window.location.reload();
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            //formik.setSubmitting(false)
        })
    }

    const confirm2 = (id) => {
        confirmDialog({
            message: 'Seguro de eliminar usuario?',
            header: 'Eliminar',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel:"Aceptar",
            accept:()=>Eliminar({id})
        });
    };
    const convertirAMayusculas = (rowData) => {
    return rowData.nombres.toUpperCase();
    };
    return ( 
        <div className="zv-usuario" style={{paddingTop:16}}>
            <ConfirmDialog />
            <Toast ref={toast} position="top-center"></Toast>
            <div className="header-titulo">Módulo de Usuario</div>
            <div className="zv-usuario-body" style={{marginTop:16}}>
                <div className="zv-usuario-body-filtro">
                    {
                        listaEmpresa ?
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div className="label-form"><label>Sitio o Empresa</label></div>
                            <DropdownDefault value={empresaSeleccionada}
                                onChange={(e)=>
                                    {
                                        setEmpresaSeleccionada(e.value)
                                        //GetPersonaPorEmpresa(e.value)
                                        //loadLazyData(e.value)
                                    }
                                }
                                options={listaEmpresa} optionLabel="razonSocial" optionValue ="idEmpresa"
                                placeholder="Seleccione empresa"
                                style={{width:"50%"}}
                                ></DropdownDefault>
                            <Boton
                                label="Agregar Usuario"
                                style={{ fontSize: 12 }}
                                color="primary"
                                onClick = {()=>navigate("CrearUsuario/"+empresaSeleccionada)}
                                disabled ={!empresaSeleccionada}
                                ></Boton>
                        </div>
                        :<Loader center size="lg" content="Cargando" />
                    }
                    
                </div>
                {
                    listaPersonas &&
                    <div className="zv-usuario-body-listado" style={{marginTop:24}}>
                        <DatatableDefault value={listaPersonas} 
                            lazy
                            globalFilterFields={['nombres', 'correo','documento']}
                            loading={loading}
                            onPage={onPage}
                            first={lazyState.first}
                            header = {header}
                            totalRecords ={totalRecords}
                        >
                            <Column field="idPersona" header="ID" ></Column>
                            <Column field="nombres" header="Nombre"  body={convertirAMayusculas}></Column>
                            <Column field="correo" header="Email"> </Column>
                            <Column field="tipoPersona.descripcionTipo" header="Tipo"> </Column>
                            <Column field="documento" header="Documento" ></Column>
                            <Column field="activo" header="Estado"dataType="boolean"  body={booleanTemplate}></Column>
                            <Column body={accion} style={{display:"flex",justifyContent:"center"}} header="Acciones"></Column>
                        </DatatableDefault>
                    </div>
                    
                }
                
            </div>
        </div>
     );
}
 
export default Usuario;