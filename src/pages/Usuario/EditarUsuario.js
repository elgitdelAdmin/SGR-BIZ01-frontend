import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Usuario.scss"
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import { ObtenerPersonaPorId ,ActualizarPersona} from "../../service/UsuarioService";
import { Field,FieldArray, Formik ,useFormik,FormikProvider} from "formik";
import * as Yup from "yup";
import { Toast } from 'primereact/toast';
const EditarUsuario = () => {
    const navigate = useNavigate();
    const [persona, setPersona] = useState(null);
    let { id } = useParams();
    const toast = useRef(null);

    useEffect(()=>{
        const getPersona= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            let idPersona = id
            await ObtenerPersonaPorId({jwt,idPersona}).then(data=>setPersona(data))
        }
        if(id) getPersona()
    },[id])

    const schema = Yup.object().shape({

    });

    const formik = useFormik({
        enableReinitialize:true,
        initialValues: { 
            idPersona: persona?persona.idPersona:0,
            nombres: persona?persona.nombres:"",
            primerApellido : persona?persona.primerApellido:"",
            segundoApellido:  persona?persona.segundoApellido:"",
            ocupacion:persona?persona.ocupacion:"",
            descripcion:persona?persona.descripcion:"",
            activo:persona?persona.activo:false,
            password:"",
            dni: persona?persona.dni:"",
            correo: persona?persona.correo:"",
        },
      validationSchema: schema,
      onSubmit: values => {
       let activo = values.activo
       let password = values.password
       let idPersona = id
        
        let jsonPersona = JSON.stringify({activo,password,idPersona},null,2)
        //alert(jsonPersona);
        Actualizar({jsonPersona})
        
      },
    });
    const Actualizar =({jsonPersona})=>{
        let jwt = window.localStorage.getItem("jwt");
        ActualizarPersona({jsonPersona,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Success', detail:"Registro actualizado exitosamente.", life: 7000})


            // setTimeout(() => {
            //     navigate(-1);
            // }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})

        })
    }


    return ( 
        <form onSubmit={formik.handleSubmit}>
            <div className="zv-editarUsuario" style={{paddingTop:16}}>
                <Toast ref={toast} position="top-center"></Toast>
                <div className="header" >
                    <span style={{cursor:"pointer"}} onClick={()=>navigate(-1)}><Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft></span>
                </div>
                <div className="header-titulo"  style={{marginTop:16}}>Datos del usuario</div>
                <div className="zv-editarUsuario-body" style={{marginTop:16}}>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-9">
                            <label className="label-form">Nombres</label>
                            <InputText type={"text"} 
                                id="nombres"
                                name="nombres"
                                placeholder="Escribe aquí"
                                value ={formik.values.nombres} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                                disabled></InputText>
                        </div>
                        <div className="field col-12 md:col-3">
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
                        <div className="field col-12 md:col-9">
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
                        <div className="field col-12 md:col-3">
                            <label className="label-form">Contraseña</label>
                            <InputText type={"password"}
                                id="password"
                                name="password"
                                value ={formik.values.password} 
                                onChange={formik.handleChange}
                                onblur={formik.handleBlur}
                            >

                                
                            </InputText>
                        </div>
                        
                    </div>
                    <div className="zv-editarUsuario-footer">
                        <Boton label="Guardar cambios" style={{fontSize:12}} color="primary" type="submit" loading={formik.isSubmitting}></Boton>
                        <Boton label="Agregar curso" style={{fontSize:12}} color="secondary"></Boton>
                        <Boton label="Agregar programa" style={{fontSize:12}} color="secondary"></Boton>
                    </div>
                </div>
            </div>
        </form>
        
     );
}
 
export default EditarUsuario;