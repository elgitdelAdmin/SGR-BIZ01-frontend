import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate } from "react-router-dom";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
//import "./Curso.scss"
import Boton from "../../components/Boton/Boton";

import { Toast } from 'primereact/toast';
import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method

import { ListarProgramas } from "../../service/ProgramaService";
const Programa = () => {
    const navigate = useNavigate();

    const [listaProgramas, setListaProgramas] = useState(null);
    const [loadingPrograma, setLoadingPrograma] = useState(true);
    const toast = useRef(null);

    useEffect(()=>{
        const getPrograma= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            await ListarProgramas({jwt}).then(data=>{setListaProgramas(data);setLoadingPrograma(false)})
        }
        if(!listaProgramas) getPrograma()
    },[])

    const accionEditar =(rowData)=>{
        return <div className="profesor-datatable-accion">
            <div className="accion-editar" onClick={()=>navigate("../Programa/Editar/"+rowData.idPrograma)}>
                <span><Iconsax.Edit color="#ffffff"/></span>
            </div>
            <div className="accion-eliminar" onClick={()=>{
               
               confirmPrograma(rowData.idPrograma)
               
            }}>
               <span><Iconsax.Trash color="#ffffff"/></span>
           </div> 
        </div> 
    }

    const paginatorLeft = <button type="button" icon="pi pi-refresh" className="p-button-text" />;
    const paginatorRight = <button type="button" icon="pi pi-cloud" className="p-button-text" />;   

    const confirmPrograma = (id) => {
        confirmDialog({
            message: 'Seguro de eliminar programa?',
            header: 'Eliminar',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel:"Aceptar",
            //accept:()=>Eliminar({id})
        });
    };

    return ( 
        <div className="zv-programa" style={{ paddingTop: 16 }}>
            <Toast ref={toast} position="top-center"></Toast>
            <ConfirmDialog />
            <div className="header-titulo">Módulo de Programa</div>
            <div className="zv-programa-body" style={{ marginTop: 16 }}>
                <div className="zv-programa-body-header">
                    <Boton label="Crear programa" style={{fontSize:12}} color="primary" type="submit" onClick={()=>navigate("Crear")} ></Boton>
                </div>
                <div className="zv-programa-body-listado" style={{ marginTop: 24 }}>
                <DatatableDefault
                    value={listaProgramas}
                    loading={loadingPrograma}
                    >
                    <Column field="idPrograma" header="ID" sortable></Column>
                    <Column field="nombre" header="Nombre de Programa" sortable ></Column>
                    <Column field="precio" header="Precio" sortable></Column>
                    <Column 
                        body={accionEditar}
                        style={{ display: "flex", justifyContent: "center" }}
                        header="Acciones"
                    ></Column>
                    
                    </DatatableDefault>
                </div>
            </div>   
        </div>
     );
}
 
export default Programa;