import React, { useEffect, useState } from "react";
import { Navigate, useLocation,useNavigate } from "react-router-dom";

import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Curso.scss"
import Boton from "../../components/Boton/Boton";
import { ListarCursos } from "../../service/CursoService";

const Curso = () => {
    const navigate = useNavigate();

    const [listaCursos, setListaCursos] = useState(null);
    useEffect(()=>{
        const GetCurso= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            await ListarCursos({jwt}).then(data=>setListaCursos(data))
        }
        if(!listaCursos) GetCurso()
      },[])
  
  
    const tempDatatable = 
    [{id:1,nombres:"Curso 1",categoria: "Administración",estado:"Desactivado"},
    {id:2,nombres:"Curso 2",categoria: "Ventas",estado:"Desactivado"},
    {id:3,nombres:"Curso 3",categoria: "Innovación y emprendimiento",estado:"Activado"},
    {id:4,nombres:"Curso 4",categoria: "Marketing Digital",estado:"Desactivado"},
    {id:5,nombres:"Curso 5",categoria: "Logística",estado:"Activado"},
    {id:6,nombres:"Curso 6",categoria: "Finanzas",estado:"Desactivado"},
    {id:7,nombres:"Curso 7",categoria: "Administración",estado:"Desactivado"},
    {id:8,nombres:"Curso 8",categoria: "Administración",estado:"Activado"}]

    const accionEditar =(rowData)=>{
        return <div className="profesor-datatable-accion">
            <div className="profesor-accion-editar" onClick={()=>navigate("../Curso/Editar/"+rowData.idCurso)}>
                <span><Iconsax.Edit color="#ffffff"/></span>
            </div>
            {/* <div className="profesor-accion-eliminar" onClick={()=>navigate()}>
                <span><Iconsax.Trash color="#ffffff"/></span>
            </div> */}
        </div>
             
       
    }
    const paginatorLeft = <button type="button" icon="pi pi-refresh" className="p-button-text" />;
    const paginatorRight = <button type="button" icon="pi pi-cloud" className="p-button-text" />;     
    return ( 
        <div className="zv-curso" style={{ paddingTop: 16 }}>
            <div className="header-titulo">Módulo de cursos</div>   
            <div className="zv-curso-body" style={{ marginTop: 16 }}>
                <div className="zv-curso-body-header">
                    <Boton label="Crear curso" style={{fontSize:12}} color="primary" type="submit" onClick={()=>navigate("Crear")} ></Boton>
                    <Boton label="Importar curso" style={{fontSize:12}} color="secondary"></Boton>
                    <Boton label="Cargar archivos" style={{fontSize:12}} color="secondary"></Boton>
                </div>
                <div className="zv-curso-body-listado" style={{ marginTop: 24 }}>
                    <DataTable
                    value={listaCursos}
                    size="small"
                    paginator
                    responsiveLayout="scroll"
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    currentPageReportTemplate="Desde {first} a {last} of {totalRecords}"
                    rows={10}
                    paginatorLeft={paginatorLeft}
                    paginatorRight={paginatorRight}
                    >
                    <Column field="idCurso" header="ID" sortable></Column>
                    <Column field="nombre" header="Curso" sortable ></Column>
                    <Column field="categoria.descripcionCategoria" header="Categoría" sortable></Column>
                    <Column field="activo" header="Estado" sortable></Column>
                    <Column 
                        body={accionEditar}
                        style={{ display: "flex", justifyContent: "center" }}
                        header="Acciones"
                    ></Column>
                    
                    </DataTable>
                </div>
            </div>
        </div>
     );
}
 
export default Curso;