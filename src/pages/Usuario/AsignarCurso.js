import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import * as Yup from "yup";
import { Field,FieldArray, Formik ,useFormik,FormikProvider} from "formik";
import { Toast } from 'primereact/toast';
import useUsuario from "../../hooks/useUsuario";
const AsignarCurso = () => {
    const navigate = useNavigate();
    const {isLogged} = useUsuario()

    let { IdUsuario } = useParams();
    let { IdCurso } = useParams();
    const toast = useRef(null);

    const [tituloPagina, setTituloPagina] = useState("Agregar curso");
    const [modoEdicion, setModoEdicion] = useState(false);
    const [curso, setCurso] = useState(null);

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
            celular: persona?persona.celular:"",
        },
      validationSchema: schema,
      onSubmit: values => {
       let activo = values.activo
       let password = values.password
       let idPersona = id
       let nombres = values.nombres
       let primerApellido = values.primerApellido
       let segundoApellido = values.segundoApellido
       let ocupacion = values.ocupacion
       let descripcion = values.descripcion
       let dni = values.dni
       let correo = values.correo
       let celular = values.celular

       let idEmpresa = IdEmpresa
       let idTipoPersona = checked ? 3 : 1
        
      let jsonPersona = JSON.stringify({activo,password,idPersona,nombres,primerApellido,segundoApellido,
          ocupacion,descripcion,dni,correo,celular,idEmpresa,idTipoPersona},null,2)
        //alert(jsonPersona);
        //console.log(jsonPersona)
       if(modoEdicion) Actualizar({jsonPersona}) ;else{Registrar({jsonPersona})} 
        
      },
    });
    return ( 
        <div className="zv-editarUsuarioCurso" style={{ paddingTop: 16 }}>
            <Toast ref={toast} position="top-center"></Toast>
            <div className="header">
                <span style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
                <Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft>
                </span>
            </div>
            <div className="header-titulo" style={{ marginTop: 16 }}>
                {tituloPagina}
            </div>
            <div className="zv-editarUsuarioCurso-body" style={{ marginTop: 16 }}>
                <form onSubmit={formik.handleSubmit}>

                </form>
            </div>
        </div>
     );
}
 
export default AsignarCurso;