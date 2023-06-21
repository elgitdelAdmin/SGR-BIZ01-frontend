
import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";

import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import { Field,FieldArray, Formik ,useFormik,FormikProvider} from "formik";

import * as Yup from "yup";
import { Toast } from 'primereact/toast';
import { RegistrarBiblioteca,ActualizarBiblioteca,BuscarBibliotecaID} from "../../service/BlibliotecaService";
import { ObtenerListaLibroTipo } from "../../service/EmpresaService";
const EditarBiblioteca = () => {
    const navigate = useNavigate();

    const [biblioteca, setBiblioteca] = useState(null); 
    const [modoEdicion, setModoEdicion] = useState(false);
    const [tituloPagina, setTituloPagina] = useState("Crear Biblioteca");
    const [listaLibroTipo, setListaLibroTipo] = useState(null);
    let { IDCurso } = useParams();
    let { IDBiblioteca } = useParams();
    const toast = useRef(null);


    useEffect(()=>{
        const getListaLibroTipo = async ()=>
        {
            let jwt = window.localStorage.getItem("jwt");

            await ObtenerListaLibroTipo({jwt}).then(data=>{
                setListaLibroTipo(data);
            })
        }
        if(!listaLibroTipo)getListaLibroTipo();
        
    },[])

    useEffect(()=>{
        const getBiblioteca = async ()=>
        {
            let jwt = window.localStorage.getItem("jwt");
            let id = IDBiblioteca
            await BuscarBibliotecaID({jwt,id}).then(data=>{
                setBiblioteca(data);
                setModoEdicion(true);
                setTituloPagina("Datos de libro")
            })
        }
        if(IDBiblioteca)getBiblioteca();
        
    },[IDBiblioteca])

    const Registrar =({jsonBliblioteca})=>{
        let jwt = window.localStorage.getItem("jwt");
        RegistrarBiblioteca({jsonBliblioteca,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Éxito', detail:"Biblioteca registrada exitosamente.", life: 7000})


            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    const Actualizar =({jsonBliblioteca})=>{
        let jwt = window.localStorage.getItem("jwt");
        ActualizarBiblioteca({jsonBliblioteca,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Éxito', detail:"Biblioteca actualizada exitosamente.", life: 7000})


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
        idLibroTipo: Yup.string().required("Tipo es un campo obligatorio"),
       
      });
    const formik = useFormik({
        enableReinitialize:true,
        initialValues: { 
            idBiblioteca: biblioteca?biblioteca.idBiblioteca:0,
            nombre : biblioteca?biblioteca.nombre:"",
            idLibroTipo : biblioteca?biblioteca.idLibroTipo:"",
            linkZegel: biblioteca?biblioteca.linkZegel:"",
            linkIdat: biblioteca?biblioteca.linkIdat:""
            
        },
    validationSchema: schema,
      onSubmit: values => {
        let idBiblioteca = values.idBiblioteca
        let idCurso = IDCurso
        let nombre =values.nombre
        let idLibroTipo =values.idLibroTipo
        let linkZegel = values.linkZegel
        let linkIdat = values.linkIdat
       
        let jsonBliblioteca = JSON.stringify({idBiblioteca,idCurso,nombre,idLibroTipo,linkZegel,linkIdat},null,2)

        if(!modoEdicion) Registrar({jsonBliblioteca}) 
        else {Actualizar({jsonBliblioteca})}
      },
    });

    return ( 
        <form onSubmit={formik.handleSubmit}>
            <div className="zv-editarBiblioteca" style={{paddingTop:16}}>
            <Toast ref={toast} position="top-center"></Toast>
                <div className="header" >
                    <span style={{cursor:"pointer"}} onClick={()=>navigate(-1)}><Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft></span>
                </div>
                <div className="header-titulo"  style={{marginTop:16}}>{tituloPagina}</div>
                <div className="zv-editarBiblioteca-body" style={{marginTop:16}}>
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
                            <label className="label-form">Tipo</label>
                            <DropdownDefault type={"text"} 
                                id="idLibroTipo"
                                name="idLibroTipo"
                                placeholder="Seleccionar..."
                                value ={formik.values.idLibroTipo} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                options={listaLibroTipo} optionLabel="tipo" optionValue ="idLibroTipo"
                                ></DropdownDefault>
                                <small className="p-error">{formik.touched.idLibroTipo && formik.errors.idLibroTipo}</small>
                        </div>
                        <div className="field col-12 md:col-12">
                            <label className="label-form">Link Zegel </label>
                            <InputText type={"text"} 
                                id="linkZegel"
                                name="linkZegel"
                                placeholder="Escribir..."
                                value ={formik.values.linkZegel} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>

                        <div className="field col-12 md:col-12">
                            <label className="label-form">Link Idat </label>
                            <InputText type={"text"} 
                                id="linkIdat"
                                name="linkIdat"
                                placeholder="Escribir..."
                                value ={formik.values.linkIdat} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                ></InputText>
                        </div>
                    </div>
                    <div className="zv-editarBiblioteca-footer" style={{display:"flex",gap:8}}>
                        <Boton label="Guardar cambios" style={{fontSize:12}} color="primary" type="submit" loading={formik.isSubmitting}></Boton>
                    </div>
                </div>
            </div>
        </form>
     );
}
 
export default EditarBiblioteca;