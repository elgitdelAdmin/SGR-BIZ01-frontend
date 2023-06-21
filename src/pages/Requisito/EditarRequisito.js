import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";

import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import { Field,FieldArray, Formik ,useFormik,FormikProvider} from "formik";

import * as Yup from "yup";
import { Toast } from 'primereact/toast';
import { RegistrarRequisito,ActualizarRequisito } from "../../service/RequisitoService";
const Requisito = () => {
    const navigate = useNavigate();

    const [requisito, setRequisito] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [tituloPagina, setTituloPagina] = useState("Agregar requisito")
    let { IDCurso } = useParams();
    let { IDRequisito } = useParams();
    const toast = useRef(null);

    const Registrar =({jsonRequisito})=>{
        let jwt = window.localStorage.getItem("jwt");
        RegistrarRequisito({jsonRequisito,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Éxito', detail:"Requisito registrada exitosamente.", life: 7000})


            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    const Actualizar =({jsonRequisito})=>{
        let jwt = window.localStorage.getItem("jwt");
        ActualizarRequisito({jsonRequisito,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Éxito', detail:"Requisito actualizada exitosamente.", life: 7000})


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
            idRequisito: requisito?requisito.idRequisito:0,
            titulo : requisito?requisito.titulo:"",
            descripcion : requisito?requisito.descripcion:"",
            
            
        },
    validationSchema: schema,
      onSubmit: values => {
        let idRequisito = values.idRequisito
        let idCurso = IDCurso
        let titulo =values.titulo
        let descripcion =values.descripcion
       
        let jsonRequisito = JSON.stringify({idRequisito,idCurso,titulo,descripcion},null,2)

        if(!modoEdicion) Registrar({jsonRequisito}) 
        else {Actualizar({jsonRequisito})}
      },
    });


    return ( 
        <form onSubmit={formik.handleSubmit}>
            <div className="zv-editarRequisito" style={{paddingTop:16}}>
            <Toast ref={toast} position="top-center"></Toast>
            <div className="header" >
                    <span style={{cursor:"pointer"}} onClick={()=>navigate(-1)}><Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft></span>
                </div>
                <div className="header-titulo"  style={{marginTop:16}}>{tituloPagina}</div>
                <div className="zv-editarRequisito-body" style={{marginTop:16}}>
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
                    </div>
                </div>
                <div className="zv-editarRequisito-footer" style={{display:"flex",gap:8}}>
                        <Boton label="Guardar cambios" style={{fontSize:12}} color="primary" type="submit" loading={formik.isSubmitting}></Boton>
                    </div>
            </div>
        </form>
     );
}
 
export default Requisito;