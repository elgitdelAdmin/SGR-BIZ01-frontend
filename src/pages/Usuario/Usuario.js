import React, { useEffect, useState } from "react";
import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Usuario.scss"
import { Navigate, useLocation,useNavigate } from "react-router-dom";
import ObtenerListaEmpresas from "../../service/EmpresaService";
import {ObtenerListaPersonas,ObtenerPersonaPorEmpresa} from "../../service/UsuarioService";

const Usuario = () => {
    const navigate = useNavigate();

    const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
    const [listaEmpresa, setListaEmpresa] = useState(null);
    const [listaPersonas, setListaPersonas] = useState(null);
    const [listaPersonasTotal, setListaPersonasTotal] = useState(null);
    // const listaEmpresas =
    // [{value:1,name:"Zegel Virtual"}]

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
            setListaPersonas(personaTemp)
        }
        
    }


    useEffect(()=>{
        const GetPersonas= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            await ObtenerListaPersonas({jwt}).then(data=>setListaPersonasTotal(data))
        }
        if(!listaPersonasTotal) GetPersonas()
    },[])

    const tempDatatable = 
    [{id:1,nombre:"ADMIN",email: "admin@prueba.com",dni:"11111111",estado : true},
    {id:2,nombre:"Usuario 1",email: "usuario1@prueba.com",dni:"22222222",estado : true},
    {id:3,nombre:"Usuario 2",email: "usuario2@prueba.com",dni:"33333333",estado : true}]

    const accion =(rowData)=>{
        return <div className="datatable-accion-editar" onClick={()=>navigate("../EditarUsuario/"+rowData.idPersona)}>
                <span><Iconsax.Edit color="#ffffff"/></span>
            </div>
    }
            
    const paginatorLeft = <button type="button" icon="pi pi-refresh" className="p-button-text" />;
    const paginatorRight = <button type="button" icon="pi pi-cloud" className="p-button-text" />;
    return ( 
        <div className="zv-usuario" style={{paddingTop:16}}>
            <div className="header-titulo">Módulo de Usuario</div>
            <div className="zv-usuario-body" style={{marginTop:16}}>
                <div className="zv-usuario-body-filtro">
                    {
                        listaEmpresa &&
                        <>
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
                        </>
                    }
                    
                </div>
                {
                    listaPersonas && 
                    <div className="zv-usuario-body-listado" style={{marginTop:24}}>
                        <DataTable value={listaPersonas} size="small" paginator responsiveLayout="scroll" 
                        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                        currentPageReportTemplate="Desde {first} a {last} of {totalRecords}" rows={10} 
                        paginatorLeft={paginatorLeft} paginatorRight={paginatorRight}>
                            <Column field="idPersona" header="ID" sortable></Column>
                            <Column field="nombres" header="Nombre" sortable></Column>
                            <Column field="correo" header="Email"sortable> </Column>
                            <Column field="dni" header="DNI" sortable></Column>
                            <Column field="activo" header="Estado"dataType="boolean" sortable></Column>
                            <Column body={accion} style={{display:"flex",justifyContent:"center"}} header="Acciones"></Column>
                        </DataTable>
                    </div>
                }
                
            </div>
        </div>
     );
}
 
export default Usuario;