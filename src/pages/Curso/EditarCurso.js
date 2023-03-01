import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Curso.scss"
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import { BuscarCursoID,RegistrarCurso,ActualizarCurso } from "../../service/CursoService";
import { ListarUnidadesPorCurso } from "../../service/UnidadService";

import { Field,FieldArray, Formik ,useFormik,FormikProvider} from "formik";
import * as Yup from "yup";
import { Toast } from 'primereact/toast';
import { InputTextarea } from "primereact/inputtextarea";
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from "primereact/column";

const EditarCurso = () => {
    const navigate = useNavigate();
    const [curso, setCurso] = useState(null);    
    const [listaUnidades, setListaUnidades] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [tituloTab, setTituloTab] = useState("");
    const [tituloPagina, setTituloPagina] = useState("Crear curso");
    let { id } = useParams();
    const toast = useRef(null);

    const tempDatatable = [
        {idUnidad:1,descripcion:"Idea de planes de negocio",duracion:"2h",secuencia:1},
        {idUnidad:2,descripcion:"Modelo de negocios",duracion:"2.5h",secuencia:2},
        {idUnidad:3,descripcion:"Sostenibilidad de negocios",duracion:"2.5h",secuencia:3},
        {idUnidad:4,descripcion:"Alcance de negocio",duracion:"2.5",secuencia:4}

    ]

    const accionEditar =(rowData)=>{
        return <div className="datatable-accion">
            <div className="accion-editar" onClick={()=>navigate("../Curso/Editar/"+curso.idCurso+"/Unidad/Editar/"+rowData.idUnidad)}>
                <span><Iconsax.Eye color="#ffffff"/></span>
            </div>
            <div className="accion-eliminar" onClick={()=>navigate()}>
                <span><Iconsax.Trash color="#ffffff"/></span>
            </div>
        </div>
             
       
    }

    const paginatorLeft = <button type="button" icon="pi pi-refresh" className="p-button-text" />;
    const paginatorRight = <button type="button" icon="pi pi-cloud" className="p-button-text" />;     

    useEffect(()=>{
        const GetCurso= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            let idCurso = id
            await BuscarCursoID({jwt,idCurso}).then(data=>{
                setCurso(data)
                setModoEdicion(true)
                setTituloPagina("Editar Curso")
            })
        }

        if(id)GetCurso()
    },[id])

    useEffect(()=>{
        const GetUnidades= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            let idCurso = id
            await ListarUnidadesPorCurso({jwt,idCurso}).then(data=>{
                setListaUnidades(data)
            })
        }

        if(id)GetUnidades()
    },[id])


    const formik = useFormik({
        enableReinitialize:true,
        initialValues: { 
            
            idCurso: curso?curso.idCurso:0,
            idCategoria: curso?curso.idCategoria:0,
            nombre: curso?curso.nombre:"",
            descripcion : curso?curso.descripcion:"",
            logros:  curso?curso.logros:"",
            descripcionSEO: curso?curso.descripcionSEO:"",
            duracion: curso?curso.duracion:"",
            color: curso?curso.color:"",
            videoIniciacion: curso?curso.videoIniciacion:"",
            videoIntroduccion: curso?curso.videoIntroduccion:"",
            descripcionMeta: curso?curso.descripcionMeta:"",
            introduccionDuracion: curso?curso.introduccionDuracion:"",
            precio: curso?curso.precio:"",
            codigoProducto: curso?curso.codigoProducto:"",
            idEstado: curso?curso.idEstado:"",
            
        },
    //   validationSchema: schema,
      onSubmit: values => {
       let idCurso = values.idCurso
        let idCategoria = values.idCategoria
            let nombre = values.nombre
            let descripcion =values.descripcion
            let logros = values.logros;
            let descripcionSEO = values.descripcionSEO;
            let duracion = values.duracion
            let color = values.color
            let videoIniciacion = values.videoIniciacion
            let videoIntroduccion = values.videoIntroduccion
            let descripcionMeta = values.descripcionMeta
            let introduccionDuracion =values.introduccionDuracion
            let precio =values.precio
            let codigoProducto = values.codigoProducto
            let idEstado = 1

            let jsonCurso = JSON.stringify({idCurso,idCategoria,nombre,descripcion,descripcionSEO,logros,duracion,color,videoIniciacion,videoIntroduccion,
                descripcionMeta,introduccionDuracion,precio,codigoProducto,idEstado},null,2)

            if(!modoEdicion) Registrar({jsonCurso}) 
            else {Actualizar({jsonCurso})}
      },
    });

    const Registrar =({jsonCurso})=>{
        let jwt = window.localStorage.getItem("jwt");
        RegistrarCurso({jsonCurso,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Success', detail:"Curso registrado exitosamente.", life: 7000})


            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    const Actualizar =({jsonCurso})=>{
        let jwt = window.localStorage.getItem("jwt");
        ActualizarCurso({jsonCurso,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Success', detail:"Curso actualizado exitosamente.", life: 7000})


            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }
    return ( 
        <form onSubmit={formik.handleSubmit}>
            <div className="zv-editarCurso" style={{paddingTop:16}}>
                <Toast ref={toast} position="top-center"></Toast>
                <div className="header" >
                    <span style={{cursor:"pointer"}} onClick={()=>navigate(-1)}><Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft></span>
                </div>
                <div className="header-titulo"  style={{marginTop:16}}>{tituloPagina}{curso && ": "+curso.nombre}</div>
                <div className="zv-editarCurso-body" style={{marginTop:16}}>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Categoria</label>
                            <DropdownDefault type={"text"} 
                                id="idCategoria"
                                name="idCategoria"
                                placeholder="Seleccione"
                                value ={formik.values.idCategoria} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></DropdownDefault>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Color </label><small style={{color:"#B5B5B5"}} >{"(Ejemeplo: #3e3e3 ó rgba(0,0,0,1))"}</small>
                            <InputText type={"text"} 
                                id="color"
                                name="color"
                                placeholder="Escribe aquí"
                                value ={formik.values.color} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="label-form">Nombre</label>
                            <InputText type={"text"} 
                                id="nombre"
                                name="nombre"
                                placeholder="Escribe aquí"
                                value ={formik.values.nombre} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="label-form">Video de iniciación</label><small style={{color:"#B5B5B5"}} >{" (ID de video de Vimeo)"}</small>
                            <InputText type={"text"} 
                                id="videoIniciacion"
                                name="videoIniciacion"
                                placeholder="Escribe aquí"
                                value ={formik.values.videoIniciacion} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="label-form">Descripción</label>
                            <InputTextarea type={"text"} 
                                id="descripcion"
                                name="descripcion"
                                placeholder="Escribe aquí"
                                value ={formik.values.descripcion} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputTextarea>
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="label-form">Video de introducción</label><small style={{color:"#B5B5B5"}} >{" (ID de video de Vimeo)"}</small>
                            <InputText type={"text"} 
                                id="videoIntroduccion"
                                name="videoIntroduccion"
                                placeholder="Escribe aquí"
                                value ={formik.values.videoIntroduccion} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Logros</label>
                            <InputTextarea type={"text"} 
                                id="logros"
                                name="logros"
                                placeholder="Escribe aquí"
                                value ={formik.values.logros} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputTextarea>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Descripción Meta</label>
                            <InputTextarea type={"text"} 
                                id="descripcionMeta"
                                name="descripcionMeta"
                                placeholder="Escribe aquí"
                                value ={formik.values.descripcionMeta} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputTextarea>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Descripción SEO</label><small style={{color:"#B5B5B5"}} >{" (Ejemplo: Lorem-Ipsum)"}</small>
                            <InputText type={"text"} 
                                id="descripcionSEO"
                                name="descripcionSEO"
                                placeholder="Escribe aquí"
                                value ={formik.values.descripcionSEO} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Introducción duración</label><small style={{color:"#B5B5B5"}} >{" (Tiempo de duración)"}</small>
                            <InputText type={"text"} 
                                id="introduccionDuracion"
                                name="introduccionDuracion"
                                placeholder="Escribe aquí"
                                value ={formik.values.introduccionDuracion} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Duración</label><small style={{color:"#B5B5B5"}} >{" (Ejemplo: 1.7h)"}</small>
                            <InputText type={"text"} 
                                id="duracion"
                                name="duracion"
                                placeholder="Escribe aquí"
                                value ={formik.values.duracion} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Precio</label><small style={{color:"#B5B5B5"}} >{" (Solo cantidad)"}</small>
                            <InputText type={"text"} 
                                id="precio"
                                name="precio"
                                placeholder="Escribe aquí"
                                value ={formik.values.precio} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="label-form">Código de producto</label><small style={{color:"#B5B5B5"}} >{" (Solo letras y números)"}</small>
                            <InputText type={"text"} 
                                id="codigoProducto"
                                name="codigoProducto"
                                placeholder="Escribe aquí"
                                value ={formik.values.codigoProducto} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Estado</label>
                            <DropdownDefault type={"text"} 
                                id="idEstado"
                                name="idEstado"
                                placeholder="Escribe aquí"
                                value ={formik.values.idEstado} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></DropdownDefault>
                        </div>
                    </div>
                </div>
                <div className="zv-editarCurso-footer" style={{display:"flex",gap:8}}>
                        <Boton label="Guardar cambios" style={{fontSize:12}} color="primary" type="submit" loading={formik.isSubmitting}></Boton>
                        {modoEdicion && <Boton label="Crear unidad" style={{fontSize:12}} color="secondary" type ="button"
                        onClick={()=>navigate("../Curso/Editar/"+curso.idCurso+"/Unidad/Crear")}></Boton>}
                    </div>
                
            </div>
            <div className="zv-listado-unidad" style={{marginTop:16 }}>
             <div className="header-subTitulo">Listado de Unidades</div>   
                <TabView>
                    
                    <TabPanel header="Unidad">
                        <DataTable
                            value={listaUnidades}
                            size="small"
                            paginator
                            responsiveLayout="scroll"
                            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                            currentPageReportTemplate="Desde {first} a {last} of {totalRecords}"
                            rows={10}
                            paginatorLeft={paginatorLeft}
                            paginatorRight={paginatorRight}
                            >
                            <Column field="idUnidad" header="ID" sortable></Column>
                            <Column field="descripcion" header="Descripción" sortable ></Column>
                            <Column field="duracion" header="Duración" sortable></Column>
                            <Column field="secuencia" header="Secuencia" sortable></Column>
                            <Column 
                                body={accionEditar}
                                style={{ display: "flex", justifyContent: "center" }}
                                header="Acciones"
                            ></Column>
                        
                        </DataTable>
                    </TabPanel>
                </TabView>
            </div>
            
        </form>
     );
}
 
export default EditarCurso;