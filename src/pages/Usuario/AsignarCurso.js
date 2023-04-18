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

import { RegistrarAsignarCurso,ActualizarAsignarCurso,ObtenerCursoUsuarioPorId } from "../../service/UsuarioService";
import { ListarCursos } from "../../service/CursoService";

import { Calendar } from 'primereact/calendar';
const AsignarCurso = () => {
    const navigate = useNavigate();
    const {isLogged} = useUsuario()

    let { IDPersona } = useParams();
    let { IdPersonaCurso } = useParams();
    const toast = useRef(null);

    const [tituloPagina, setTituloPagina] = useState("Agregar curso");
    const [modoEdicion, setModoEdicion] = useState(false);
    const [curso, setCurso] = useState(null);
    const [listaCursos, setListaCursos] = useState(null);
    useEffect(()=>{
        const GetCurso= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            await ListarCursos({jwt}).then(data=>{setListaCursos(data)})
        }
        if(!listaCursos) GetCurso()
      },[])
    useEffect(()=>{
        const GetCurso=()=>{
            let jwt = window.localStorage.getItem("jwt");
            let id = IdPersonaCurso
            ObtenerCursoUsuarioPorId({jwt,id}).then(data=>{
                
                setCurso(data)
                
                setTituloPagina("Editar Curso")
                
            })
        }

        if(IdPersonaCurso){
            setModoEdicion(true)
            GetCurso()
        }
    },[IdPersonaCurso])

    const Actualizar =({jsonCurso})=>{
        let jwt = window.localStorage.getItem("jwt");
        ActualizarAsignarCurso({jsonCurso,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Success', detail:"Registro actualizado exitosamente.", life: 7000})
            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    const Registrar =({jsonCurso})=>{
        let jwt = window.localStorage.getItem("jwt");
        RegistrarAsignarCurso({jsonCurso,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Success', detail:"Registro exitoso.", life: 7000})
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
        idCurso: Yup.string().required("Nombre de curso es un campo obligatorio"),
       
      });
    const formik = useFormik({
        enableReinitialize:true,
        initialValues: { 
            idPersonaCurso: curso?curso.idPersonaCurso:0,
            idCurso: curso?curso.idCurso:"",
            finCurso: curso?curso.finCurso:null
        },
      validationSchema: schema,
      onSubmit: values => {
        let idPersonaCurso = values.idPersonaCurso
        let idCurso = values.idCurso
        let finCurso = values.finCurso
        let idPersona = IDPersona
        
        let jsonCurso = JSON.stringify({idPersonaCurso,idPersona,idCurso,finCurso},null,2)
    //     //alert(jsonPersona);
    //     //console.log(jsonPersona)
       if(modoEdicion) Actualizar({jsonCurso}) ;else{Registrar({jsonCurso})} 
        
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
        <form onSubmit={formik.handleSubmit}>
            <div className="zv-editarUsuarioCurso-body" style={{ marginTop: 16 }}>
            
                <div className="p-fluid formgrid grid">
                <div className="field col-12 md:col-7" >
                    <label className="label-form">Nombre de curso</label>
                    <DropdownDefault
                    id={`idCurso`}
                    name={`idCurso`}
                    value={formik.values.idCurso}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    options={listaCursos}
                    optionLabel="nombre"
                    optionValue="idCurso"
                    placeholder="Seleccione curso"
                    ></DropdownDefault>
                    <small className="p-error">{formik.touched.idCurso && formik.errors.idCurso}</small>
                </div>
                {
                    modoEdicion && curso && curso.persona.idTipoPersona != 2 &&
                    <div className="field col-12 md:col-7" >
                        <label className="label-form">Fin del curso</label>
                        <Calendar
                            id="finCurso"
                            name="finCurso"
                            value={formik.values.finCurso}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        >
                        </Calendar>
                    </div>
                }
                
                </div>
            
            </div>
            <div className="zv-editarUsuarioCurso-footer" style={{display:"flex",gap:8}}>
                <Boton
                    label="Guardar cambios"
                    style={{ fontSize: 12 }}
                    color="primary"
                    type="submit"
                    loading={formik.isSubmitting}
                    ></Boton>
                {
                    modoEdicion && curso && curso.persona.idTipoPersona != 2 &&
                    <Boton
                    label="Ver Intentos"
                    style={{ fontSize: 12 }}
                    color="secondary"
                    type="button"
                    loading={formik.isSubmitting}
                    ></Boton>
                }
                
            </div>
        </form>
      </div>
    );
}
 
export default AsignarCurso;