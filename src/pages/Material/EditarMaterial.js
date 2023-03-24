import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";
import * as Iconsax from "iconsax-react";
import "./Material.scss"
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import { Field,FieldArray, Formik ,useFormik,FormikProvider} from "formik";
import { BuscarMaterialID ,RegistrarMaterial,ActualizarMaterial} from "../../service/MaterialService";
import * as Yup from "yup";
import { Toast } from 'primereact/toast';

const EditarMaterial = () => {

    const navigate = useNavigate();
    const [material, setMaterial] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [tituloPagina, setTituloPagina] = useState("Crear material a esta sección");
    let { IDCurso } = useParams();
    let { IDUnidad } = useParams();
    let { IDLeccion } = useParams();
    let { IDMaterial } = useParams();

    const toast = useRef(null);
    useEffect(()=>{
        const getMaterial= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            let id = IDMaterial
            await BuscarMaterialID({jwt,id}).then(data=>{
                setTituloPagina("Datos de material")
                setMaterial(data)
            })
           
        }

        if(IDMaterial)getMaterial()
    },[IDMaterial])

    const Registrar =({jasonMaterial})=>{
        let jwt = window.localStorage.getItem("jwt");
        RegistrarMaterial({jasonMaterial,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Success', detail:"Material registrado exitosamente.", life: 7000})


            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    const Actualizar =({jasonMaterial})=>{
        let jwt = window.localStorage.getItem("jwt");
        ActualizarMaterial({jasonMaterial,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Success', detail:"Material actualizado exitosamente.", life: 7000})


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
        descripcion: Yup.string().required("Descripción es un campo obligatorio"),
       
      });
    const formik = useFormik({
        enableReinitialize:true,
        initialValues: { 
            idMaterial: material?material.idMaterial:0,
            descripcion : material?material.descripcion:"",
            titulo : material?material.titulo:"",
            link: material?material.link:""
            
        },
      validationSchema: schema,
      onSubmit: values => {
        let idLeccion = IDLeccion
        let descripcion =values.descripcion
        let titulo =values.titulo
        let link = values.link

        let jasonMaterial = JSON.stringify({idLeccion,descripcion,titulo,link},null,2)

        if(!modoEdicion) Registrar({jasonMaterial}) 
        else {Actualizar({jasonMaterial})}
      },
    });


    return (
      <form onSubmit={formik.handleSubmit}>
        <div className="zv-editarMaterial" style={{ paddingTop: 16 }}>
          <Toast ref={toast} position="top-center"></Toast>
          <div className="header">
            <span style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
              <Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft>
            </span>
          </div>
          <div className="header-titulo" style={{ marginTop: 16 }}>
            {tituloPagina}
          </div>
        </div>
        <div className="zv-editarMaterial-body" style={{ marginTop: 16 }}>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-12">
              <label className="label-form">Titulo</label>
              <InputText
                type={"text"}
                id="titulo"
                name="titulo"
                placeholder="Empecemos..."
                value={formik.values.titulo}
                onChange={formik.handleChange}
                onblur={formik.handleBlur}
              ></InputText>
              <small className="p-error">
                {formik.touched.titulo && formik.errors.titulo}
              </small>
            </div>
            <div className="field col-12 md:col-12">
              <label className="label-form">Descripción</label>
              <InputText
                type={"text"}
                id="descripcion"
                name="descripcion"
                placeholder="Empecemos..."
                value={formik.values.descripcion}
                onChange={formik.handleChange}
                onblur={formik.handleBlur}
              ></InputText>
              <small className="p-error">
                {formik.touched.descripcion && formik.errors.descripcion}
              </small>
            </div>
            <div className="field col-12 md:col-12">
              <label className="label-form">Link</label>
              <InputText
                type={"text"}
                id="link"
                name="link"
                placeholder="Empecemos..."
                value={formik.values.link}
                onChange={formik.handleChange}
                onblur={formik.handleBlur}
              ></InputText>
              <small className="p-error">
                {formik.touched.link && formik.errors.link}
              </small>
            </div>
          </div>
          <div
            className="zv-editarLeccion-footer"
            style={{ display: "flex", gap: 8 }}
          >
            <Boton
              label="Guardar cambios"
              style={{ fontSize: 12 }}
              color="primary"
              type="submit"
              loading={formik.isSubmitting}
            ></Boton>
           
          </div>
        </div>
      </form>
    );
}
 
export default EditarMaterial;