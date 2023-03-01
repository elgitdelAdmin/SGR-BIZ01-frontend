import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Profesor.scss"
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import { BuscarProfesorID } from "../../service/ProfesorService";
import { Field,FieldArray, Formik ,useFormik,FormikProvider} from "formik";
import * as Yup from "yup";
import { Toast } from 'primereact/toast';
const EditarProfesor = () => {
    const navigate = useNavigate();
    const [profesor, setProfesor] = useState(null);
    let { id } = useParams();
    const toast = useRef(null);
    useEffect(()=>{
        const getProfesor= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            let idPersona = id
            await BuscarProfesorID({jwt,idPersona}).then(data=>setProfesor(data))
        }
        if(id) getProfesor()
    },[id])
    const formik = useFormik({
        enableReinitialize:true,
        initialValues: { 
            idProfesor: profesor?profesor.idProfesor:0,
            nombres: profesor?profesor.nombres:"",
            primerApellido : profesor?profesor.primerApellido:"",
            segundoApellido:  profesor?profesor.segundoApellido:"",
            password:"",
            dni: profesor?profesor.dni:"",
            correo: profesor?profesor.correo:"",
        },
    //   validationSchema: schema,
      onSubmit: values => {
       
        
      },
    });
    return ( 
        <form onSubmit={formik.handleSubmit}>
            <div className="zv-editarProfesor" style={{paddingTop:16}}>
                <Toast ref={toast} position="top-center"></Toast>
                <div className="header" >
                    <span style={{cursor:"pointer"}} onClick={()=>navigate(-1)}><Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft></span>
                </div>
                <div className="header-titulo"  style={{marginTop:16}}>Editar profesor</div>
                <div className="zv-editarUsuario-body" style={{marginTop:16}}>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-12">
                            <label className="label-form">Nombre</label>
                            <InputText type={"text"} 
                                id="nombres"
                                name="nombres"
                                placeholder="Escribe aquí"
                                value ={formik.values.nombres} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                disabled></InputText>
                        </div>
                        <div className="field col-12 md:col-12">
                            <label className="label-form">Primer Apellido</label>
                            <InputText type={"text"} 
                                id="primerApellido"
                                name="primerApellido"
                                placeholder="Escribe aquí"
                                value ={formik.values.primerApellido} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                disabled></InputText>
                        </div>
                        <div className="field col-12 md:col-12">
                            <label className="label-form">Segundo Apellido</label>
                            <InputText type={"text"} 
                                id="segundoApellido"
                                name="segundoApellido"
                                placeholder="Escribe aquí"
                                value ={formik.values.segundoApellido} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                disabled></InputText>
                        </div>
                        <div className="field col-12 md:col-12">
                            <label className="label-form">DNI </label>
                            <InputText 
                                type={"numeric"} 
                                id="dni"
                                name="dni"
                                placeholder="Escribe aquí"
                                value ={formik.values.dni} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                disabled></InputText>
                        </div>
                        <div className="field col-12 md:col-12">
                            <label className="label-form">Correo</label>
                            <InputText type={"text"}  
                                id="correo"
                                name="correo"
                                placeholder="Escribe aquí"
                                value ={formik.values.correo} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                disabled></InputText>
                        </div>
                        {/* <div className="field col-12 md:col-3">
                            <label className="label-form">Contraseña</label>
                            <InputText type={"password"}
                                id="password"
                                name="password"
                                value ={formik.values.password} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                            >

                                
                            </InputText>
                        </div> */}
                        
                    </div>
                    <div className="zv-editarUsuario-footer">
                        <Boton label="Guardar cambios" style={{fontSize:12}} color="primary" type="submit" loading={formik.isSubmitting}></Boton>
                        <Boton label="Agregar curso" style={{fontSize:12}} color="secondary"></Boton>
                    </div>
                </div>
            </div>
        </form>
     );
}
 
export default EditarProfesor;