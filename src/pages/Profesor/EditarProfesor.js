import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Profesor.scss"
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import { BuscarProfesorID,ActualizarProfesor,RegistrarProfesor } from "../../service/ProfesorService";
import { Field,FieldArray, Formik ,useFormik,FormikProvider} from "formik";
import * as Yup from "yup";
import { Toast } from 'primereact/toast';
import { InputNumber } from "primereact/inputnumber";
import { Password } from "primereact/password";
import {Uploader} from "rsuite"
import * as constantes from "../../constants/constantes.js";
import { getBase64, handleSoloLetrastest } from "../../helpers/helpers";
import { ObtenerCursosPorUsuario } from "../../service/UsuarioService";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method
import { EliminarPersonaCurso } from "../../service/UsuarioService";
import { handleSoloLetras } from "../../helpers/helpers";
import { handleSoloNumeros } from "../../helpers/helpers";
import {
  ChangeNameFile,
  CreateDirectory,
  DeleteFile,
  fetchDirectoriesName,
  uploadFiles,
}from "../../service/DigitalOceansService";
const EditarProfesor = () => {
    const navigate = useNavigate();
    const [profesor, setProfesor] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [tituloPagina, setTituloPagina] = useState("Crear docente");
    let { id } = useParams();
    const toast = useRef(null);

    const [fileList, setFileList] = useState([]);
    const [defaultFile, setDefaultFile] = useState([]);
    const [imageBase64, setImageBase64] = useState(null);

    const [listaCursos, setListaCursos] = useState(null);
    const [loadingCurso, setLoadingCurso] = useState(true);

    useEffect(()=>{
        const getProfesor= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            let idPersona = id
            await BuscarProfesorID({jwt,idPersona}).then(data=>{
                setProfesor(data)
                setModoEdicion(true)
                setTituloPagina("Editar docente")
                if(data.avatar)
                {
                    let temp = [{name: data.avatar,
                                fileKey: 1,
                                    url: constantes.URLBLOB_DOCENTES+"/"+data.avatar}]
                                    setDefaultFile(temp)
                                    setFileList(temp)
                }
            })
        }
        if(id) getProfesor()
    },[id])

    useEffect(()=>{
        const getCurso= async()=>{
          let jwt = window.localStorage.getItem("jwt");
          let idPersona = id
          await ObtenerCursosPorUsuario({jwt,idPersona}).then(data=>{
            setListaCursos(data)
            setLoadingCurso(false)
          })
      }
        if(id) getCurso()
      },[id])

    useEffect(()=>{
        if(fileList.length >0) {

            getBase64(fileList[0].blobFile).then((result) => {
                setImageBase64(result)
            });
        }
    },[fileList])

    const schema = Yup.object().shape({
        nombres: Yup.string().required("Nombres es un campo obligatorio"),
        primerApellido: Yup.string().required("Primer apellido es un campo obligatorio"),
        segundoApellido: Yup.string().required("Segundo Apellido es un campo obligatorio"),
        dni: Yup.string().required("Documento es un campo obligatorio").min(8,"Documento debe tener mínimo 8 números"),
        correo: Yup.string().nullable().required("Correo es un campo obligatorio").email("Formato de correo incorrecto."),
        celular: Yup.number().nullable().required("Teléfono es un campo obligatorio"),
      });

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
            celular: profesor?profesor.celular:"",
            avatar: profesor?profesor.avatar:null,
            listaDefecto :profesor&& profesor.avatar?[{name: profesor.avatar,
                fileKey: 1,
                    url: constantes.URLBLOB_DOCENTES+"/"+profesor.avatar}] :[]
        },
    validationSchema: schema,
      onSubmit: values => {
        let imagenBase64 = imageBase64;
        let tipoDocumento = imagenBase64 ? fileList[0].blobFile.type :null
        let avatar = fileList.length >0 ?fileList[0].name:null
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
        let idEmpresa = 2
        
 
        //let idEmpresa = IdEmpresa
        let idTipoPersona = 2
         
       let jsonPersona = JSON.stringify({activo,password,idPersona,nombres,primerApellido,segundoApellido,
           ocupacion,descripcion,dni,correo,celular,idTipoPersona,imagenBase64,tipoDocumento,avatar,idEmpresa},null,2)

        if(modoEdicion) Actualizar({jsonPersona}) ;else{Registrar({jsonPersona})} 
        
      },
    });


    const Actualizar =({jsonPersona})=>{
        let jwt = window.localStorage.getItem("jwt");
        ActualizarProfesor({jsonPersona,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Success', detail:"Registro actualizado exitosamente.", life: 7000})


            // setTimeout(() => {
            //     navigate(-1);
            // }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    const Registrar =({jsonPersona})=>{
      let jwt = window.localStorage.getItem("jwt");
      RegistrarProfesor({jsonPersona,jwt}).then(data=>{
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

  const EliminarCurso =(id)=>{
    let jwt = window.localStorage.getItem("jwt");
    EliminarPersonaCurso({jwt,id}).then(data=>{
        //formik.setSubmitting(false)
        toast.current.show({severity:'success', summary: 'Success', detail:"Registro eliminado.", life: 7000})
  
  
        setTimeout(() => {
            window.location.reload();
        }, 3000)
    })
    .catch(errors => {
        toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
        //formik.setSubmitting(false)
    })
  }

  const confirmCurso = (id) => {
    confirmDialog({
        message: 'Seguro de eliminar curso?',
        header: 'Eliminar',
        icon: 'pi pi-info-circle',
        acceptClassName: 'p-button-danger',
        acceptLabel:"Aceptar",
        accept:()=>EliminarCurso(id)
    });
  };

  const accionEditarCursos =(rowData)=>{
    return <div className="datatable-accion">
        <div className="accion-editar" onClick={()=>navigate("../Usuario/EditarUsuario/"+id+"/AsignarCurso/"+rowData.idPersonaCurso)}>
            <span><Iconsax.Eye color="#ffffff"/></span>
        </div>
        <div className="accion-eliminar" 
        onClick={()=>{confirmCurso(rowData.idPersonaCurso)}}
        >
           <span><Iconsax.Trash color="#ffffff"/></span>
       </div> 
    </div>
  }
    return ( 
        <form onSubmit={formik.handleSubmit}>
            <div className="zv-editarProfesor" style={{paddingTop:16}}>
                <Toast ref={toast} position="top-center"></Toast>
                <ConfirmDialog />

                <div className="header" >
                    <span style={{cursor:"pointer"}} onClick={()=>navigate(-1)}><Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft></span>
                </div>
                <div className="header-titulo"  style={{marginTop:16}}>{tituloPagina}</div>
                <div className="zv-editarUsuario-body" style={{marginTop:16}}>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Nombre</label>
                            <InputText type={"text"} 
                                id="nombres"
                                name="nombres"
                                placeholder="Escribe aquí"
                                value ={formik.values.nombres} 
                                onChange={formik.handleChange}
                                //onChange={(e)=>handleSoloLetras(e,formik,"nombres")}
                                onBlur={formik.handleBlur}
                                onKeyPress={(e=>handleSoloLetrastest(e))}
                                ></InputText>
                                <div className="p-error">{ formik.touched.nombres && formik.errors.nombres }</div>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Primer Apellido</label>
                            <InputText type={"text"} 
                                id="primerApellido"
                                name="primerApellido"
                                placeholder="Escribe aquí"
                                value ={formik.values.primerApellido} 
                                onChange={formik.handleChange}
                                //onChange={(e)=>handleSoloLetras(e,formik,"primerApellido")}
                                onBlur={formik.handleBlur}
                                onKeyPress={(e=>handleSoloLetrastest(e))}
                                ></InputText>
                                <div className="p-error">{ formik.touched.primerApellido && formik.errors.primerApellido }</div>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Segundo Apellido</label>
                            <InputText type={"text"} 
                                id="segundoApellido"
                                name="segundoApellido"
                                placeholder="Escribe aquí"
                                value ={formik.values.segundoApellido} 
                                onChange={formik.handleChange}
                                //onChange={(e)=>handleSoloLetras(e,formik,"segundoApellido")}
                                onBlur={formik.handleBlur}
                                onKeyPress={(e=>handleSoloLetrastest(e))}
                                ></InputText>
                                <div className="p-error">{ formik.touched.segundoApellido && formik.errors.segundoApellido }</div>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">DNI </label>
                            <InputText 
                                type={"numeric"} 
                                id="dni"
                                name="dni"
                                placeholder="Escribe aquí"
                                value ={formik.values.dni} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={modoEdicion}></InputText>
                                <div className="p-error">{ formik.touched.dni && formik.errors.dni }</div>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Correo</label>
                            <InputText type={"text"}  
                                id="correo"
                                name="correo"
                                placeholder="Escribe aquí"
                                value ={formik.values.correo} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                ></InputText>
                                <div className="p-error">{ formik.touched.correo && formik.errors.correo }</div>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Celular</label>
                            <InputNumber
                                type={"text"}
                                id="celular"
                                name="celular"
                                placeholder="Escribe aquí"
                                value={formik.values.celular}
                                onValueChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                useGrouping={false}
                            ></InputNumber>
                            <div className="p-error">{ formik.touched.celular && formik.errors.celular }</div>
                            </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Contraseña</label>
                          
                            <Password
                                id="Password"
                                // className = "grey"
                                
                                placeholder="Escribe aquí"
                                name="password"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                toggleMask
                            />
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
                    <div className="zv-editarUsuario-footer">
                        <Boton label="Guardar cambios" style={{fontSize:12}} color="primary" type="submit" loading={formik.isSubmitting}></Boton>
                        <Boton label="Agregar curso" style={{fontSize:12}} color="secondary" type="button"
                         onClick={()=>navigate("../Usuario/EditarUsuario/"+id+"/AsignarCurso/Crear")}
                        ></Boton>
                    </div>
                </div>
                {
                    modoEdicion && 
                    <div className="zv-listadecursos-body" style={{marginTop:16}}>
                    <div className="header-titulo" style={{ marginTop: 16 }}>
                        Lista de Cursos
                    </div>
                    <DatatableDefault
                            value={listaCursos}
                            loading={loadingCurso}
                            >
                            <Column field="idPersonaCurso" header="ID" sortable></Column>
                            <Column field="curso.nombre" header="Nombre de curso" sortable ></Column>
                            <Column field="curso.descripcion" header="Dscripción" sortable></Column>
                            <Column 
                                body={accionEditarCursos}
                                style={{ display: "flex", justifyContent: "center" }}
                                header="Acciones"
                            ></Column>
                        
                      </DatatableDefault>
                </div>
                }
                
            </div>
        </form>
     );
}
 
export default EditarProfesor;