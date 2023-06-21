import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";

import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import { Field,FieldArray, Formik ,useFormik,FormikProvider} from "formik";

import * as Yup from "yup";
import { Toast } from 'primereact/toast';
import { RegistrarBeneficio,ActualizarBeneficio } from "../../service/BeneficioService"; 
import { Uploader } from "rsuite";
import { getBase64 } from "../../helpers/helpers";

const EditarBeneficio = () => {
    const navigate = useNavigate();

    const [beneficio, setBeneficio] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [tituloPagina, setTituloPagina] = useState("Agregar beneficio")
    let { IDCurso } = useParams();
    let { IDBeneficio } = useParams();
    const toast = useRef(null);

    const [fileList, setFileList] = useState([]);
    const [defaultFile, setDefaultFile] = useState([]);
    const [imageBase64, setImageBase64] = useState(null);


    useEffect(()=>{
        if(fileList.length >0) {

            getBase64(fileList[0].blobFile).then((result) => {
                setImageBase64(result)
            });
        }
    },[fileList])

    const Registrar =({jsonBeneficio})=>{
        let jwt = window.localStorage.getItem("jwt");
        RegistrarBeneficio({jsonBeneficio,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Éxito', detail:"Beneficio registrada exitosamente.", life: 7000})


            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    const Actualizar =({jsonBeneficio})=>{
        let jwt = window.localStorage.getItem("jwt");
        ActualizarBeneficio({jsonBeneficio,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Éxito', detail:"Beneficio actualizada exitosamente.", life: 7000})


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
        titulo: Yup.string().required("Titulo es un campo obligatorio"),
        descripcion: Yup.string().required("Descripción es un campo obligatorio"),
       
      });
    const formik = useFormik({
        enableReinitialize:true,
        initialValues: { 
            idBeneficio: beneficio?beneficio.idBeneficio:0,
            titulo : beneficio?beneficio.titulo:"",
            descripcion : beneficio?beneficio.descripcion:"",
        },
    validationSchema: schema,
      onSubmit: values => {
        let idBeneficio = values.idBeneficio
        let idCurso = IDCurso
        let titulo =values.titulo
        let descripcion =values.descripcion
        let imagenBase64 = imageBase64;
        let tipoDocumento = imagenBase64 ? fileList[0].blobFile.type :null
        let iconoBeneficio = fileList.length >0 ?fileList[0].name:null
       
        let jsonBeneficio = JSON.stringify({idBeneficio,idCurso,titulo,descripcion,imagenBase64,tipoDocumento,iconoBeneficio},null,2)

        if(!modoEdicion) Registrar({jsonBeneficio}) 
        else {Actualizar({jsonBeneficio})}
      },
    });

    return ( 
        <form onSubmit={formik.handleSubmit}>
             <div className="zv-editarBeneficio" style={{paddingTop:16}}>
                <Toast ref={toast} position="top-center"></Toast>
                <div className="header" >
                    <span style={{cursor:"pointer"}} onClick={()=>navigate(-1)}><Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft></span>
                </div>
                <div className="header-titulo"  style={{marginTop:16}}>{tituloPagina}</div>
                <div className="zv-editarBeneficio-body" style={{marginTop:16}}>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-12">
                            <label className="label-form">Título </label>
                            <InputText type={"text"} 
                                id="titulo"
                                name="titulo"
                                placeholder="Escribir nombre..."
                                value ={formik.values.titulo} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                                <small className="p-error">{formik.touched.titulo && formik.errors.titulo}</small>

                        </div>
                        <div className="field col-12 md:col-12">
                            <label className="label-form">Descripción </label>
                            <InputText type={"text"} 
                                id="descripcion"
                                name="descripcion"
                                placeholder="Escribir nombre..."
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
                                <Boton label="Subir ícono" color="secondary" 
                                        type ="button" style={{fontSize:12,width:160}}></Boton>
                            </Uploader>
                        </div>
                    </div>
                    <div className="zv-editarRequisito-footer" style={{display:"flex",gap:8}}>
                        <Boton label="Guardar cambios" style={{fontSize:12}} color="primary" type="submit" loading={formik.isSubmitting}></Boton>
                    </div>
                </div>
             </div>
        </form>
     );
}
 
export default EditarBeneficio;