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

import { RegistrarAsignarPrograma,ActualizarAsignarPrograma,ObtenerProgramaUsuarioPorId } from "../../service/UsuarioService";
import { ListarCursos } from "../../service/CursoService";
import { ListarProgramas } from "../../service/ProgramaService";
import { BuscarProgramaID } from "../../service/ProgramaService";

import { Calendar } from 'primereact/calendar';
const AsignarPrograma = () => {
    const navigate = useNavigate();
    const {isLogged} = useUsuario()

    let { IDUsuario } = useParams();
    let { IdPersonaPrograma } = useParams();
    const toast = useRef(null);

    const [tituloPagina, setTituloPagina] = useState("Agregar programa");
    const [modoEdicion, setModoEdicion] = useState(false);
    const [programa, setPrograma] = useState(null);
    const [listaCursos, setListaCursos] = useState(null);
    const [listaProgramas, setListaProgramas] = useState(null);
    const [cursosPrograma, setCursosPrograma] = useState(null);


    useEffect(()=>{
        const GetCurso= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            await ListarCursos({jwt}).then(data=>{setListaCursos(data)})
        }
        if(!listaCursos) GetCurso()
      },[])

      useEffect(()=>{
        const GetListaProgramas= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            await ListarProgramas({jwt}).then(data=>{setListaProgramas(data)})
        }
        if(!listaProgramas) GetListaProgramas()
      },[])
    
    useEffect(()=>{
        const GetPrograma=()=>{
            let jwt = window.localStorage.getItem("jwt");
            let id = IdPersonaPrograma
            ObtenerProgramaUsuarioPorId({jwt,id}).then(data=>{
                setPrograma(data)
                setTituloPagina("Editar Programa")
            })
        }
        if(IdPersonaPrograma){
            
            GetPrograma()
        }
    },[IdPersonaPrograma])

    
    const getProgramaCurso=(id)=>{
        let jwt = window.localStorage.getItem("jwt");
        let idPrograma  = id
        BuscarProgramaID({jwt,idPrograma}).then(data=>{
            setModoEdicion(true)
            setCursosPrograma(data)
        })
    }
    useEffect(()=>{
        
        if(programa) getProgramaCurso(programa.idPrograma)
    },[programa])

    const handleChangePrograma =(id)=>{
        let jwt = window.localStorage.getItem("jwt");
        let idPrograma  = id
        BuscarProgramaID({jwt,idPrograma}).then(data=>{
            formik.setFieldValue("listaCursos",data.listaCursos)
        })
        
        
    }
   
    const Actualizar =({jsonPrograma})=>{
        let jwt = window.localStorage.getItem("jwt");
        ActualizarAsignarPrograma({jsonPrograma,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Éxito', detail:"Registro actualizado exitosamente.", life: 7000})
            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    const Registrar =({jsonPrograma})=>{
        let jwt = window.localStorage.getItem("jwt");
        RegistrarAsignarPrograma({jsonPrograma,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Éxito', detail:"Registro exitoso.", life: 7000})
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
        idPrograma: Yup.string().required("Nombre de programa es un campo obligatorio"),
       
      });
    const formik = useFormik({
        enableReinitialize:modoEdicion?true:false,
        initialValues: { 
            idPersonaPrograma: modoEdicion?programa.idPersonaPrograma:0,
            idPrograma: modoEdicion?programa.idPrograma:"",
            listaCursos: modoEdicion?cursosPrograma.listaCursos:[]
        },
      validationSchema: schema,
      onSubmit: values => {
        let idPersonaPrograma = values.idPersonaCurso
        let idPrograma = values.idPrograma
        let idUsuario = IDUsuario
        
        let jsonPrograma = JSON.stringify({idPersonaPrograma,idUsuario,idPrograma},null,2)
    //     //alert(jsonPersona);
    //     //console.log(jsonPersona)
       if(modoEdicion) Actualizar({jsonPrograma}) ;else{Registrar({jsonPrograma})} 
        
      },
    });
    
    
    return ( 
        <div className="zv-editarUsuarioPrograma" style={{ paddingTop: 16 }}>
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
            <div className="zv-editarUsuarioPrograma-body" style={{ marginTop: 16 }}>
                <div className="p-fluid formgrid grid">
                <div className="field col-12 md:col-7" >
                    <label className="label-form">Nombre de programa</label>
                    <DropdownDefault
                    id={`idPrograma`}
                    name={`idPrograma`}
                    value={formik.values.idPrograma}
                    onChange={(e)=>{
                        formik.handleChange(e);
                        handleChangePrograma(e.value);
                        } }
                    // onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    options={listaProgramas}
                    optionLabel="nombre"
                    optionValue="idPrograma"
                    placeholder="Seleccione programa"
                    ></DropdownDefault>
                    <small className="p-error">{formik.touched.idPrograma && formik.errors.idPrograma}</small>
                </div>
                
                </div>
            
            </div>
            <div className="zv-editarProgramaCurso-body" style={{marginTop:16}}>
                <div className="header-titulo"  style={{marginTop:16,marginBottom:10}}>Lista de Cursos</div>
                <FormikProvider value={formik}>
                    <div className="p-fluid formgrid grid">
                    <FieldArray
                        name="listaCursos"
                        render={(arrayHelpers) => (
                            <>
                            {
                                formik.values.listaCursos &&
                                    formik.values.listaCursos.map((doumento,index)=>(
                                        <div className="field col-12 md:col-7" key={index}>
                                            <DropdownDefault 
                                                id={`listaCursos[${index}].idCurso`}
                                                name={`listaCursos[${index}].idCurso`}
                                                value={formik.values.listaCursos[index].idCurso}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                options={listaCursos} optionLabel="nombre" optionValue ="idCurso"
                                                placeholder="Seleccione curso"
                                                disabled
                                                ></DropdownDefault>
                                        </div>
                                    ))
                            }
                  
                            </>
                        )}
                    >

                    </FieldArray>
                    </div>
                </FormikProvider>
            </div>
            <div className="zv-editarUsuarioCurso-footer" style={{display:"flex",gap:8}}>
                <Boton
                    label="Guardar cambios"
                    style={{ fontSize: 12 }}
                    color="primary"
                    type="submit"
                    loading={formik.isSubmitting}
                    ></Boton>
            </div>
        </form>
      </div>
     );
}
 
export default AsignarPrograma;