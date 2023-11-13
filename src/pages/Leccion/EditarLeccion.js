import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Leccion.scss"
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";

import {BuscarLeccionID ,RegistrarLeccion,ActualizarLeccion} from "../../service/LeccionService";
import { Field,FieldArray, Formik ,useFormik,FormikProvider} from "formik";
import * as Yup from "yup";
import { Toast } from 'primereact/toast';
import { InputTextarea } from "primereact/inputtextarea";
import { TabView, TabPanel } from 'primereact/tabview';
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import { ListarPreguntasPorLeccion } from "../../service/PreguntaService";
import { ListarMaterialesPorLeccion,EliminarMaterial } from "../../service/MaterialService";

import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method


const EditarLeccion = () => {
    const navigate = useNavigate();

    const [leccion, setLeccion] = useState(null);    
    const [modoEdicion, setModoEdicion] = useState(false);
    const [tituloPagina, setTituloPagina] = useState("Crear lección");
    const [preguntas, setPreguntas] = useState(null);
    const [material, setMaterial] = useState(null);

    const [loadingMaterial, setLoadingMaterial] = useState(true);
    const [loadingPreguntas, setLoadingPreguntas] = useState(true);

    let { IDCurso } = useParams();
    let { IDUnidad } = useParams();
    let { IDLeccion } = useParams();
    const toast = useRef(null);

    useEffect(()=>{
        const GetLeccion= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            let idLeccion = IDLeccion
            await BuscarLeccionID({jwt,idLeccion}).then(data=>{
                setLeccion(data)
                setModoEdicion(true)
                setTituloPagina("Datos de lección")
            })
           
        }

        if(IDLeccion)GetLeccion()
    },[IDLeccion])

    useEffect(()=>{
        const getPreguntas= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            let idLeccion = IDLeccion
            await ListarPreguntasPorLeccion({jwt,idLeccion}).then(data=>{

                setLoadingPreguntas(false)
                setPreguntas(data)
            })
           
        }

        if(IDLeccion)getPreguntas()
    },[IDLeccion])
    

    useEffect(()=>{
        const getMaterial= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            let idLeccion = IDLeccion
            await ListarMaterialesPorLeccion({jwt,idLeccion}).then(data=>{
                setLoadingMaterial(false)
                setMaterial(data)
            })
           
        }

        if(IDLeccion)getMaterial()
    },[IDLeccion])

    const Registrar =({jsonLeccion})=>{
        let jwt = window.localStorage.getItem("jwt");
        RegistrarLeccion({jsonLeccion,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Éxito', detail:"Lección registrada exitosamente.", life: 7000})


            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    const Actualizar =({jsonLeccion})=>{
        let jwt = window.localStorage.getItem("jwt");
        ActualizarLeccion({jsonLeccion,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Éxito', detail:"Lección actualizada exitosamente.", life: 7000})


            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    const formik = useFormik({
        enableReinitialize:true,
        initialValues: { 
            idLeccion: leccion?leccion.idLeccion:0,
            titulo : leccion?leccion.titulo:"",
            descripcion : leccion?leccion.descripcion:"",
            descripcionSeo : leccion?leccion.descripcionSEO:"",
            URLVideo: leccion?leccion.URLVideo:"",
            secuencia: leccion?leccion.secuencia:"",
            
        },
    //   validationSchema: schema,
      onSubmit: values => {
        let idLeccion = IDLeccion
        let titulo =values.titulo
        let descripcion =values.descripcion
        let descripcionSEO =values.descripcionSeo
        let URLVideo = values.URLVideo
        let secuencia = values.secuencia
        let idUnidad = IDUnidad

        let jsonLeccion = JSON.stringify({idUnidad,idLeccion,descripcion,descripcionSEO,URLVideo,secuencia,titulo},null,2)

        if(!modoEdicion) Registrar({jsonLeccion}) 
        else {Actualizar({jsonLeccion})}
      },
    });

    const accionEditarMaterial =(rowData)=>{
        return <div className="datatable-accion">
            <div className="accion-editar" onClick={()=>navigate("../Curso/Editar/"+IDCurso+"/Unidad/Editar/"+IDUnidad+"/Leccion/"+IDLeccion+"/Material/Editar/"+rowData.idMaterial)}>
                <span><Iconsax.Eye color="#ffffff"/></span>
            </div>
            <div className="accion-eliminar" onClick={()=>{
               
                confirm2(rowData.idMaterial)
                
             }}>
                <span><Iconsax.Trash color="#ffffff"/></span>
            </div> 
        </div>
     
    }

    const accionEditarPreguntas =(rowData)=>{
        return <div className="datatable-accion">
            <div className="accion-editar" onClick={()=>navigate("../Curso/Editar/"+IDCurso+"/Unidad/Editar/"+IDUnidad+"/Leccion/"+IDLeccion+"/Pregunta/Editar/"+rowData.idPregunta)}>
                <span><Iconsax.Eye color="#ffffff"/></span>
            </div>
            {/* <div className="accion-eliminar" onClick={()=>navigate()}>
                <span><Iconsax.Trash color="#ffffff"/></span>
            </div> */}
        </div>
     
    }

    const Eliminar =({id})=>{
        let jwt = window.localStorage.getItem("jwt");
        EliminarMaterial({jwt,id}).then(data=>{
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
            message: 'Seguro de eliminar material?',
            header: 'Eliminar',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel:"Aceptar",
            accept:()=>Eliminar({id})
        });
    };

    return ( 
        <form onSubmit={formik.handleSubmit}>
            <ConfirmDialog />
            <div className="zv-editarLeccion" style={{paddingTop:16}}>
                <Toast ref={toast} position="top-center"></Toast>
                <div className="header" >
                    <span style={{cursor:"pointer"}} onClick={()=>navigate(-1)}><Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft></span>
                </div>
                <div className="header-titulo"  style={{marginTop:16}}>{tituloPagina}</div>
                <div className="zv-editarLeccion-body" style={{marginTop:16}}>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Titulo</label>
                            <InputText type={"text"} 
                                id="titulo"
                                name="titulo"
                                placeholder="Escribe aquí"
                                value ={formik.values.titulo} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Descripción</label>
                            <InputText type={"text"} 
                                id="descripcion"
                                name="descripcion"
                                placeholder="Escribe aquí"
                                value ={formik.values.descripcion} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Descripción SEO</label>
                            <InputText type={"text"} 
                                id="descripcionSeo"
                                name="descripcionSeo"
                                placeholder="Escribe aquí"
                                value ={formik.values.descripcionSeo} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">URL de video</label>
                            <InputText type={"text"} 
                                id="URLVideo"
                                name="URLVideo"
                                placeholder="Escribe aquí"
                                value ={formik.values.URLVideo} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Secuencia</label>
                            <InputText type={"number"} 
                                id="secuencia"
                                name="secuencia"
                                placeholder="Escribe aquí"
                                value ={formik.values.secuencia} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>
                    </div>
                    <div className="zv-editarLeccion-footer" style={{display:"flex",gap:8}}>
                        <Boton label="Guardar cambios" style={{fontSize:12}} color="primary" type="submit" loading={formik.isSubmitting}></Boton>
                        {modoEdicion && <Boton label="Agregar material" style={{fontSize:12}} color="secondary" type ="button"
                        onClick={()=>navigate("../Curso/Editar/"+IDCurso+"/Unidad/Editar/"+IDUnidad+"/Leccion/"+IDLeccion+"/Material/Crear")}
                        ></Boton>}
                        {/* {modoEdicion && <Boton label="Agregar Pregunta" style={{fontSize:12}} color="secondary" type ="button"
                        onClick={()=>navigate("../Curso/Editar/"+IDCurso+"/Unidad/Editar/"+IDUnidad+"/Leccion/"+IDLeccion+"/Pregunta/Crear")}
                        ></Boton>} */}
                    </div>
                </div>
                <div className="zv-listado-leccion" style={{marginTop:16 }}>
             
                <TabView>
                    
                    <TabPanel header="Materiales">
                        <div className="header-subTitulo">Materiales de lección</div>   
                        <DatatableDefault
                            value={material}
                            loading={loadingMaterial}
                            >
                            <Column field="idMaterial" header="ID" sortable></Column>
                            <Column field="titulo" header="Título" sortable ></Column>
                            <Column field="descripcion" header="Descripción" sortable></Column>
                            <Column field="idLeccion" header="Id leccion" sortable></Column>
                            <Column 
                                body={accionEditarMaterial}
                                style={{ display: "flex", justifyContent: "center" }}
                                header="Acciones"
                            ></Column>
                        
                        </DatatableDefault>
                    </TabPanel>
                    {/* <TabPanel header="Preguntas">
                        <div className="header-subTitulo">Preguntas de lección</div>   
                        <DatatableDefault
                            value={preguntas}
                            loading={loadingPreguntas}
                            >
                            <Column field="idPregunta" header="ID" sortable></Column>
                            <Column field="titulo" header="Título" sortable ></Column>
                            <Column field="idLeccion" header="Id Leccion" sortable></Column>
                            <Column 
                                body={accionEditarPreguntas}
                                style={{ display: "flex", justifyContent: "center" }}
                                header="Acciones"
                            ></Column>
                        
                        </DatatableDefault>
                    </TabPanel> */}
                </TabView>
            </div>
            </div>
        </form>
     );
}
 
export default EditarLeccion;