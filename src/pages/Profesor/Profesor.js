import React, { useEffect, useState } from "react";
import { Navigate, useLocation,useNavigate } from "react-router-dom";

import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Profesor.scss"
import { ListarProfesores } from "../../service/ProfesorService";


const Profesor = () => {

    const navigate = useNavigate();

    const [listaProfesores, setListaProfesores] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(()=>{
      const GetProfesores= async()=>{
          let jwt = window.localStorage.getItem("jwt");
          await ListarProfesores({jwt}).then(data=>{setListaProfesores(data);setLoading(false)})
      }
      if(!listaProfesores) GetProfesores()
    },[])


    const tempDatatable = 
    [{idProfesor:1,nombres:"Profesor 1",correo: "profesor1@prueba.com",dni:"11111111"},
    {idProfesor:2,nombres:"Profesor 2",correo: "profesor2@prueba.com",dni:"22222222"},
    {idProfesor:3,nombres:"Profesor 3",correo: "profesor3@prueba.com",dni:"33333333"},
    {idProfesor:4,nombres:"Profesor 4",correo: "profesor4@prueba.com",dni:"33333333"},
    {idProfesor:5,nombres:"Profesor 5",correo: "profesor5@prueba.com",dni:"33333333"},
    {idProfesor:6,nombres:"Profesor 6",correo: "profesor6@prueba.com",dni:"33333333"},
    {idProfesor:7,nombres:"Profesor 7",correo: "profesor7@prueba.com",dni:"33333333"},
    {idProfesor:8,nombres:"Profesor 8",correo: "profesor8@prueba.com",dni:"33333333"}]

    const accionEditar =(rowData)=>{
        return <div className="profesor-datatable-accion">
            <div className="accion-editar" onClick={()=>navigate("../EditarProfesor/"+rowData.idPersona)}>
                <span><Iconsax.Edit color="#ffffff"/></span>
            </div>
            {/* <div className="profesor-accion-eliminar" onClick={()=>navigate()}>
                <span><Iconsax.Trash color="#ffffff"/></span>
            </div> */}
        </div>
             
       
    }

    const accionEliminar =(rowData) =>{
        return <div className="datatable-accion-eliminar" onClick={()=>navigate()}>
                <span><Iconsax.Trash color="#ffffff"/></span>
            </div>
    }
    const paginatorLeft = <button type="button" icon="pi pi-refresh" className="p-button-text" />;
    const paginatorRight = <button type="button" icon="pi pi-cloud" className="p-button-text" />;     

    return (
      <div className="zv-profesor" style={{ paddingTop: 16 }}>
        <div className="header-titulo">Módulo de Docentes</div>
        <div className="zv-profesor-body" style={{ marginTop: 16 }}>
          <div className="zv-profesor-body-listado" style={{ marginTop: 24 }}>
            <DatatableDefault
              value={listaProfesores}
              loading={loading}
            >
              <Column field="idPersona" header="ID" sortable></Column>
              <Column field="nombres" header="Nombre" sortable></Column>
              <Column field="correo" header="Email"sortable> </Column>
              <Column field="dni" header="DNI" sortable></Column>
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
 
export default Profesor;