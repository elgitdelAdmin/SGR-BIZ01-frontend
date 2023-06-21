import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";

import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import { Field,FieldArray, Formik ,useFormik,FormikProvider} from "formik";

import * as Yup from "yup";
import { Toast } from 'primereact/toast';
import { RegistrarDisenador,ActualizarDisenador,BuscarDisenadorID} from "../../service/DisenadorService";
import * as constantes from "../../constants/constantes.js";
import { getBase64 } from "../../helpers/helpers";
import { Uploader } from "rsuite";

const EditarDisenador = () => {
    const navigate = useNavigate();
    const [disenador, setDisenador] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [tituloPagina, setTituloPagina] = useState("Crear Diseñador");
    let { IDCurso } = useParams();
    let { IDDisenador} = useParams();
    const toast = useRef(null);
    const [fileList, setFileList] = useState([]);
    const [defaultFile, setDefaultFile] = useState([]);
    const [imageBase64, setImageBase64] = useState(null);

    useEffect(()=>{
        const getDisenador = async ()=>
        {
            let jwt = window.localStorage.getItem("jwt");
            let id = IDDisenador
            await BuscarDisenadorID({jwt,id}).then(data=>{
                if(data.avatar)
                {
                    let temp = [{name: data.avatar,
                                fileKey: 1,
                                    url: constantes.URLBLOB_DISENADOR+"/"+data.avatar}]
                                    setDefaultFile(temp)
                                    setFileList(temp)
                }
                setDisenador(data);
               
                setTituloPagina("Datos de disenador")
            })
        }
        if(IDDisenador)
        {
            setModoEdicion(true);
            getDisenador();
        }
        
    },[IDDisenador])

    useEffect(()=>{
        if(fileList.length >0) {
            if(fileList[0].blobFile)
            {
                getBase64(fileList[0].blobFile).then((result) => {
                    setImageBase64(result)
                });
            }
            
        }
    },[fileList])

    const Registrar =({jsonDisenador})=>{
        let jwt = window.localStorage.getItem("jwt");
        RegistrarDisenador({jsonDisenador,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Éxito', detail:"Diseñador registrado exitosamente.", life: 7000})


            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    const Actualizar =({jsonDisenador})=>{
        let jwt = window.localStorage.getItem("jwt");
        ActualizarDisenador({jsonDisenador,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Éxito', detail:"Diseñador actualizado exitosamente.", life: 7000})


            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    const schema = Yup.object().shape({
        nombre: Yup.string().required("Nombre es un campo obligatorio"),
        ocupacion: Yup.string().required("Ocupación es un campo obligatorio"),
       
      });
    const formik = useFormik({
        enableReinitialize:true,
        initialValues: { 
            idDisenador: disenador?disenador.idDisenador:0,
            nombre : disenador?disenador.nombre:"",
            ocupacion : disenador?disenador.ocupacion:"",
            descripcion: disenador?disenador.descripcion:"",
            avatar: disenador?disenador.avatar:"",
            listaDefecto :disenador&& disenador.avatar?[{name: disenador.avatar,
                fileKey: 1,
                    url: constantes.URLBLOB_DISENADOR+"/"+disenador.avatar}] :[]
            
        },
    validationSchema: schema,
      onSubmit: values => {
        let idDisenador = values.idDisenador
        let idCurso = IDCurso
        let nombre =values.nombre
        let ocupacion =values.ocupacion
        let descripcion = values.descripcion
        let imagenBase64 = imageBase64;
        let tipoDocumento = imagenBase64 ? fileList[0].blobFile.type :null
        let avatar = imagenBase64 ? fileList[0].blobFile.name :values.avatar
       
        let jsonDisenador = JSON.stringify({idDisenador,idCurso,nombre,ocupacion,descripcion,imagenBase64,tipoDocumento,avatar},null,2)

        if(!modoEdicion) Registrar({jsonDisenador}) 
        else {Actualizar({jsonDisenador})}
      },
    });


    return ( 
        <form onSubmit={formik.handleSubmit}>
            <div className="zv-editarDisenador" style={{paddingTop:16}}>
                <Toast ref={toast} position="top-center"></Toast>
                <div className="header" >
                    <span style={{cursor:"pointer"}} onClick={()=>navigate(-1)}><Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft></span>
                </div>
                <div className="header-titulo"  style={{marginTop:16}}>{tituloPagina}</div>
                <div className="zv-editarDisenador-body" style={{marginTop:16}}>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-12">
                            <label className="label-form">Nombre </label>
                            <InputText type={"text"} 
                                id="nombre"
                                name="nombre"
                                placeholder="Escribir nombre..."
                                value ={formik.values.nombre} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                                <small className="p-error">{formik.touched.nombre && formik.errors.nombre}</small>

                        </div>
                        <div className="field col-12 md:col-12">
                            <label className="label-form">Ocupación </label>
                            <InputText type={"text"} 
                                id="ocupacion"
                                name="ocupacion"
                                placeholder="Escribir ocupación..."
                                value ={formik.values.ocupacion} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                                <small className="p-error">{formik.touched.ocupacion && formik.errors.ocupacion}</small>

                        </div>
                        <div className="field col-12 md:col-12">
                            <label className="label-form">Descripción </label>
                            <InputText type={"text"} 
                                id="descripcion"
                                name="descripcion"
                                placeholder="Escribir descripción..."
                                value ={formik.values.descripcion} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                                <small className="p-error">{formik.touched.descripcion && formik.errors.descripcion}</small>

                        </div>
                        <div className="field col-12 md:col-12">
                            <Uploader  listType="picture" className="zv-fileUploader"
                                fileList={defaultFile}
                                disabled={fileList.length}
                                onChange={setFileList} 
                                autoUpload={false}
                                
                                >
                                {/* <button type="button">
                                    <Iconsax.Camera></Iconsax.Camera>
                                </button> */}
                                <Boton label="Subir ávatar" color="secondary" 
                                        type ="button" style={{fontSize:12,width:160}}></Boton>
                            </Uploader>
                        </div>
                    </div>
                    <div className="zv-editarDisenador-footer" style={{display:"flex",gap:8}}>
                        <Boton label="Guardar cambios" style={{fontSize:12}} color="primary" type="submit" loading={formik.isSubmitting}></Boton>
                    </div>
                </div>
            </div>
        </form>
     );
}
 
export default EditarDisenador;