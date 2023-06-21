import React, { useEffect, useState ,useRef} from "react";
import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Usuario.scss"
import { Navigate, useLocation,useNavigate } from "react-router-dom";
import ObtenerListaEmpresas from "../../service/EmpresaService";
import {ObtenerListaPersonas,ObtenerPersonaPorEmpresa,EliminarPersona} from "../../service/UsuarioService";
import { Loader, Placeholder } from 'rsuite';
import Boton from "../../components/Boton/Boton";
import { Toast } from 'primereact/toast';
import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method
import useUsuario from "../../hooks/useUsuario";
const Usuario = () => {
    const navigate = useNavigate();

    const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
    const [listaEmpresa, setListaEmpresa] = useState(null);
    const [listaPersonas, setListaPersonas] = useState(null);
    const [listaPersonasTotal, setListaPersonasTotal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [visible, setVisible] = useState(false);
    const {permisos} = useUsuario();
    // const listaEmpresas =
    // [{value:1,name:"Zegel Virtual"}]
    const toast = useRef(null);
    const [isAdmin, setIsAdmin] = useState(false);

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
    const GetPersonaPorEmpresa = async (id)=>
    {
        // let jwt = window.localStorage.getItem("jwt");
        // let idEmpresa = id
        // await ObtenerPersonaPorEmpresa({jwt,idEmpresa}).then(data=>{
        //     setListaPersonas(data);
        // })
        if(listaPersonasTotal)
        {
            let personaTemp = listaPersonasTotal.filter(x=>x.idEmpresa == id)
            if(!isAdmin && personaTemp.length > 0)
            {
                personaTemp = personaTemp.filter(x=>x.tipoPersona.descripcionTipo == "Alumno")
            }
            
            setListaPersonas(personaTemp)
        }
        
    }


    useEffect(()=>{
        const GetPersonas= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            await ObtenerListaPersonas({jwt}).then(data=>
                {
                    setListaPersonasTotal(data)
                    setLoading(false)
                })
        }
        if(!listaPersonasTotal) GetPersonas()
    },[])

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


    const Eliminar =({id})=>{
        let jwt = window.localStorage.getItem("jwt");
        let idPersona = id
        EliminarPersona({jwt,idPersona}).then(data=>{
            //formik.setSubmitting(false)
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
                                        GetPersonaPorEmpresa(e.value)
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
                            globalFilterFields={['nombres', 'correo','dni']}
                            loading={loading}
                        >
                            <Column field="idPersona" header="ID" sortable></Column>
                            <Column field="nombres" header="Nombre" sortable></Column>
                            <Column field="correo" header="Email"sortable> </Column>
                            <Column field="tipoPersona.descripcionTipo" header="Tipo"sortable> </Column>
                            <Column field="documento" header="Documento" sortable></Column>
                            <Column field="activo" header="Estado"dataType="boolean" sortable body={booleanTemplate}></Column>
                            <Column body={accion} style={{display:"flex",justifyContent:"center"}} header="Acciones"></Column>
                        </DatatableDefault>
                    </div>
                    
                }
                
            </div>
        </div>
     );
}
 
export default Usuario;