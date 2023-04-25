import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Usuario.scss"
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import { ObtenerPersonaPorId ,ActualizarPersona,RegistrarPersona} from "../../service/UsuarioService";
import * as Yup from "yup";
import { Field,FieldArray, Formik ,useFormik,FormikProvider} from "formik";

import { Toast } from 'primereact/toast';
import useUsuario from "../../hooks/useUsuario";
import { InputNumber } from "primereact/inputnumber";
import { Password } from "primereact/password";
import { Checkbox } from 'primereact/checkbox';
import { TabView, TabPanel } from 'primereact/tabview';
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";

import { ObtenerCursosPorUsuario,ObtenerProgramasPorUsuario ,EliminarPersonaCurso,EliminarPersonaPrograma} from "../../service/UsuarioService";
import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method

import { handleSoloLetras } from "../../helpers/helpers";
import { handleSoloNumeros } from "../../helpers/helpers";
import { formatDate } from "../../helpers/helpers";
const EditarUsuario = () => {
    const navigate = useNavigate();
    const {isLogged} = useUsuario()

    const [persona, setPersona] = useState(null);
    const [tituloPagina, setTituloPagina] = useState("Crear Usuario");
    const [modoEdicion, setModoEdicion] = useState(false);
    const [listaCursos, setListaCursos] = useState(null);
    const [listaPrograma, setListaPrograma] = useState(null);
    const [loadingCurso, setLoadingCurso] = useState(true);
    const [loadingPrograma, setLoadingPrograma] = useState(true);
    let { id } = useParams();
    let { IdEmpresa } = useParams();
    const toast = useRef(null);

    const [checked, setChecked] = useState(false);

    useEffect(()=>{
        const getPersona= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            let idPersona = id
            await ObtenerPersonaPorId({jwt,idPersona}).then(data=>{
              setTituloPagina("Datos de usuario")
              setPersona(data)
              setModoEdicion(true)
              data.idTipoPersona ==3 ? setChecked(true) : setChecked(false)
            })
        }
        if(id) getPersona()
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
      const getPrograma= async()=>{
        let jwt = window.localStorage.getItem("jwt");
        let idPersona = id
        await ObtenerProgramasPorUsuario({jwt,idPersona}).then(data=>{
          setListaPrograma(data)
          setLoadingPrograma(false)
        })
    }
      if(id) getPrograma()
    },[id])

    const schema = Yup.object().shape({
      nombres: Yup.string().required("Nombres es un campo obligatorio"),
      primerApellido: Yup.string().required("Primer apellido es un campo obligatorio"),
      segundoApellido: Yup.string().required("Segundo Apellido es un campo obligatorio"),
      dni: Yup.string().required("Documento es un campo obligatorio").min(8,"Documento debe tener mínimo 8 números"),
      correo: Yup.string().nullable().required("Correo es un campo obligatorio"),
      celular: Yup.number().nullable().required("Teléfono es un campo obligatorio"),
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
            celular: persona?persona.celular:null,
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
            formik.setSubmitting(false)
        })
    }

    const Registrar =({jsonPersona})=>{
      let jwt = window.localStorage.getItem("jwt");
      RegistrarPersona({jsonPersona,jwt}).then(data=>{
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

const accionEditarPrograma =(rowData)=>{
  return <div className="datatable-accion">
      <div className="accion-editar" onClick={()=>navigate("../Usuario/EditarUsuario/"+id+"/AsignarPrograma/"+rowData.idPersonaPrograma)}>
          <span><Iconsax.Eye color="#ffffff"/></span>
      </div>
      <div className="accion-eliminar" 
      onClick={()=>{confirmPrograma(rowData.idPersonaPrograma)}}
      >
         <span><Iconsax.Trash color="#ffffff"/></span>
     </div> 
  </div>
       
 
}
const dateBodyTemplate = (rowData) => {
  return formatDate(new Date(rowData.finCurso));
};
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

const EliminarPrograma =(id)=>{
  let jwt = window.localStorage.getItem("jwt");
  EliminarPersonaPrograma({jwt,id}).then(data=>{
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
const confirmPrograma = (id) => {
  confirmDialog({
      message: 'Seguro de eliminar programa?',
      header: 'Eliminar',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      acceptLabel:"Aceptar",
      accept:()=>EliminarPrograma(id)
  });
};
const programaTemplate = (rowData)=>{
  return(
      <span>{rowData.programa ? rowData.programa:"No"}</span>
  )
}
    return (
     
        <div className="zv-editarUsuario" style={{ paddingTop: 16 }}>
          <ConfirmDialog />
          <Toast ref={toast} position="top-center"></Toast>
          <div className="header">
            <span style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
              <Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft>
            </span>
          </div>
          <div className="header-titulo" style={{ marginTop: 16 }}>
            {tituloPagina}
          </div>
          <div className="zv-editarUsuario-body" style={{ marginTop: 16 }}>
            <form onSubmit={formik.handleSubmit}>
              <div className="p-fluid formgrid grid">
                <div className="field col-12 md:col-6">
                  <label className="label-form">Nombres</label>
                  <InputText
                    type={"text"}
                    id="nombres"
                    name="nombres"
                    placeholder="Escribe aquí"
                    value={formik.values.nombres}
                    //onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onChange={(e)=>handleSoloLetras(e,formik,"nombres")}
                  ></InputText>
                  <div className="p-error">{ formik.touched.nombres && formik.errors.nombres }</div>

                </div>
                <div className="field col-12 md:col-6">
                  <label className="label-form">Primer apellido</label>
                  <InputText
                    type={"text"}
                    id="primerApellido"
                    name="primerApellido"
                    placeholder="Escribe aquí"
                    value={formik.values.primerApellido}
                    //onChange={formik.handleChange}
                    onChange={(e)=>handleSoloLetras(e,formik,"primerApellido")}
                    onBlur={formik.handleBlur}
                    
                  ></InputText>
                  <small className="p-error">{formik.touched.primerApellido && formik.errors.primerApellido}</small>

                </div>
                <div className="field col-12 md:col-6">
                  <label className="label-form">Segundo apellido</label>
                  <InputText
                    type={"text"}
                    id="segundoApellido"
                    name="segundoApellido"
                    placeholder="Escribe aquí"
                    value={formik.values.segundoApellido}
                    //onChange={formik.handleChange}
                    onChange={(e)=>handleSoloLetras(e,formik,"segundoApellido")}
                    onBlur={formik.handleBlur}
                    
                  ></InputText>
                  <small className="p-error">{formik.touched.segundoApellido && formik.errors.segundoApellido}</small>
                </div>
                <div className="field col-12 md:col-6">
                  <label className="label-form">Documento </label>
                  <InputText
                    type={"numeric"}
                    id="dni"
                    name="dni"
                    placeholder="Escribe aquí"
                    value={formik.values.dni}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    //disabled={modoEdicion}
                    maxLength ={8}
                    pattern="[0-9]*"
                  ></InputText>
                  <small className="p-error">{formik.touched.dni && formik.errors.dni}</small>
                </div>
                <div className="field col-12 md:col-6">
                  <label className="label-form">Correo</label>
                  <InputText
                    type={"text"}
                    id="correo"
                    name="correo"
                    placeholder="Escribe aquí"
                    value={formik.values.correo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    
                  ></InputText>
                  <small className="p-error">{formik.touched.correo && formik.errors.correo}</small>
                </div>
                <div className="field col-12 md:col-6">
                  <label className="label-form">Telefono</label>
                  <InputNumber
                    type={"text"}
                    id="celular"
                    name="celular"
                    placeholder="Escribe aquí"
                    value={formik.values.celular}
                    //onValueChange={formik.handleChange}
                    onValueChange={(e)=>handleSoloNumeros(e,formik,"celular")}
                    onBlur={formik.handleBlur}
                    useGrouping={false}
                    maxLength ={9}
                  ></InputNumber>
                  <small className="p-error">{formik.touched.celular && formik.errors.celular}</small>
                </div>
                
                
                <div className="field col-12 md:col-3">
                  <label className="label-form">Contraseña</label>
                  {/* <InputText type={"password"}
                                  id="password"
                                  name="password"
                                  value ={formik.values.password} 
                                  onChange={formik.handleChange}
                                  onblur={formik.handleBlur}
                              >
                              </InputText> */}
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
                <div className="field col-12 md:col-3" style={{display:"flex", alignItems :"end",paddingBottom:20,gap:20}}>
                  <div><label className="label-form">Es Adminsitrador?</label></div>
                  <Checkbox onChange={e => setChecked(e.checked)} checked={checked}></Checkbox>
                </div>
              </div>
              <div className="zv-editarUsuario-footer">
                <Boton
                  label="Guardar cambios"
                  style={{ fontSize: 12 }}
                  color="primary"
                  type="submit"
                  loading={formik.isSubmitting}
                ></Boton>
                <Boton
                  label="Agregar curso"
                  style={{ fontSize: 12 }}
                  color="secondary"
                  type="button"
                  onClick={()=>navigate("../Usuario/EditarUsuario/"+persona.idPersona+"/AsignarCurso/Crear")}
                ></Boton>
                <Boton
                  label="Agregar programa"
                  style={{ fontSize: 12 }}
                  color="secondary"
                  type="button"
                  onClick={()=>navigate("../Usuario/EditarUsuario/"+persona.idPersona+"/AsignarPrograma/Crear")}
                ></Boton>
              </div>
              {
                modoEdicion &&
                <div className="zv-cursoPrograma" style={{marginTop:24}}>
                  <TabView>
                    <TabPanel header="Cursos">
                      <div className="header-subTitulo">Listado de Cursos</div>   
                      <DatatableDefault
                            value={listaCursos}
                            loading={loadingCurso}
                            >
                            <Column field="idPersonaCurso" header="ID" sortable></Column>
                            <Column field="curso.nombre" header="Nombre de curso" sortable ></Column>
                            <Column field="programa" header="Programa" sortable body={programaTemplate}></Column>
                            <Column field="fechaActivacion" header="Activación" sortable></Column>
                            <Column field="finCurso" header="Vigencia" dataType="date" body={dateBodyTemplate}  sortable></Column>
                            <Column field="diasFaltantes" header="Días faltantes" style={{textAlign:"center"}} sortable></Column>
                            <Column field="promedio" header="Promedio" sortable></Column>
                            <Column field="CondicionCursoPrograma.nombre" header="Condición" sortable></Column>
                            <Column field="estadoCursoPrograma.nombre" header="Estado" sortable></Column>
                            <Column 
                                body={accionEditarCursos}
                                style={{ display: "flex", justifyContent: "center" }}
                                header="Acciones"
                            ></Column>
                        
                      </DatatableDefault>
                    </TabPanel>
                    <TabPanel header="Programas">
                      <div className="header-subTitulo">Listado de Programas</div>   
                      <DatatableDefault
                            value={listaPrograma}
                            loading={loadingPrograma}
                            >
                            <Column field="idPrograma" header="ID" sortable></Column>
                            <Column field="programa.nombre" header="Nombre de Programa" sortable ></Column>
                            <Column field="promedio" header="Promedio" sortable></Column>
                            <Column field="condicionCursoPrograma.nombre" header="Condición" sortable></Column>
                            <Column field="estadoCursoPrograma.nombre" header="Estado" sortable></Column>
                            <Column 
                                body={accionEditarPrograma}
                                style={{ display: "flex", justifyContent: "center" }}
                                header="Acciones"
                            ></Column>
                        
                        </DatatableDefault>
                    </TabPanel>
                  </TabView>
                </div>
              }
              
            </form>
          </div>
        </div>
      
    );
}
 
export default EditarUsuario;