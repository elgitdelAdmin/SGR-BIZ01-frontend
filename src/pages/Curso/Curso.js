import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate } from "react-router-dom";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import * as Iconsax from "iconsax-react";
import "./Curso.scss"
import Boton from "../../components/Boton/Boton";
import { ListarCursos,EliminarCurso } from "../../service/CursoService";
import { Toast } from 'primereact/toast';
import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method
const Curso = () => {
    const navigate = useNavigate();

    const [listaCursos, setListaCursos] = useState(null);

    const [loading, setLoading] = useState(true);
    const toast = useRef(null);
    useEffect(()=>{
        const GetCurso= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            await ListarCursos({jwt}).then(data=>{setListaCursos(data);setLoading(false)})
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
            <div className="accion-editar" onClick={()=>navigate("../Curso/Editar/"+rowData.idCurso)}>
                <span><Iconsax.Edit color="#ffffff"/></span>
            </div>
            <div className="accion-eliminar" onClick={()=>{
               
               confirmCurso(rowData.idCurso)
               
            }}>
               <span><Iconsax.Trash color="#ffffff"/></span>
           </div> 
        </div>
             
       
    }
    const booleanTemplate = (rowData)=>{
        return(
            <span>{rowData.activo ? "Activado":"Desactivado"}</span>
        )
    }
    const paginatorLeft = <button type="button" icon="pi pi-refresh" className="p-button-text" />;
    const paginatorRight = <button type="button" icon="pi pi-cloud" className="p-button-text" />;     

    const Eliminar =({id})=>{
        let jwt = window.localStorage.getItem("jwt");
    
        EliminarCurso({jwt,id}).then(data=>{
            //formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Success', detail:"Registro eliminado.", life: 7000})
  
  
            setTimeout(() => {
                window.location.reload();
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            //formik.setSubmitting(false)
        })
    }

    const confirmCurso = (id) => {
        confirmDialog({
            message: 'Seguro de eliminar curso?',
            header: 'Eliminar',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel:"Aceptar",
            accept:()=>Eliminar({id})
        });
    };

    return ( 
        <div className="zv-curso" style={{ paddingTop: 16 }}>
            <Toast ref={toast} position="top-center"></Toast>
            <ConfirmDialog />
            <div className="header-titulo">Módulo de cursos</div>   
            <div className="zv-curso-body" style={{ marginTop: 16 }}>
                <div className="zv-curso-body-header">
                    <Boton label="Crear curso" style={{fontSize:12}} color="primary" type="submit" onClick={()=>navigate("Crear")} ></Boton>
                    <Boton label="Importar curso" style={{fontSize:12}} color="secondary" onClick={()=>navigate("../ImportarCurso")}></Boton>
                    <Boton label="Cargar archivos" style={{fontSize:12}} color="secondary"></Boton>
                </div>
                <div className="zv-curso-body-listado" style={{ marginTop: 24 }}>
                    <DatatableDefault
                    value={listaCursos}
                    loading={loading}
                    >
                    <Column field="idCurso" header="ID" sortable></Column>
                    <Column field="nombre" header="Curso" sortable ></Column>
                    <Column field="categoria.descripcionCategoria" header="Categoría" sortable></Column>
                    <Column field="estadoCurso.nombre" header="Estado" sortable ></Column>
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
 
export default Curso;