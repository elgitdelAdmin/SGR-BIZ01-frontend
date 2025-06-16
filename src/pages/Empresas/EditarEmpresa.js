import React, { useEffect, useState, useRef } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Empresas.scss"
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import {
  ObtenerPersonaPorId,
  ActualizarPersona,
  RegistrarPersona,
  ObtenerTipoDocumento,
} from "../../service/UsuarioService";
import * as Yup from "yup";
import { Field, FieldArray, Formik, useFormik, FormikProvider } from "formik";

import { Toast } from "primereact/toast";
import useUsuario from "../../hooks/useUsuario";
import { InputNumber } from "primereact/inputnumber";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { TabView, TabPanel } from "primereact/tabview";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog"; // For confirmDialog method

import { handleSoloLetras, handleSoloLetrastest } from "../../helpers/helpers";
import { handleSoloNumeros } from "../../helpers/helpers";
import { formatDate } from "../../helpers/helpers";
import { Divider } from "primereact/divider";
import { Calendar } from 'primereact/calendar';
import DataTable from 'react-data-table-component';
import {RegistrarEmpresa,ListarFrentes,ListarParametros,ObtenerEmpresa,ActualizarEmpresa} from "../../service/EmpresaService";
import { ListarPais} from "../../service/TiketService";
import {ListarGestores} from "../../service/GestorService";

const EditarConsultor = () => {
  const navigate = useNavigate();
  const { isLogged } = useUsuario();
  const [parametros, setParametro] = useState([]);
  const [pais, setPais] = useState(null);
  const [gestor, setGestor] = useState(null);
  const [empresa, setConsultor] = useState(null);
  const [tituloPagina, setTituloPagina] = useState("Crear Empresa");
  const [modoEdicion, setModoEdicion] = useState(false);

  const [tipoDocumento, setTipoDocumento] = useState(null);
  const [modalidad, setModalidad] = useState(null);
  const [socio, setSocio] = useState(null);

  const [nivelExperiencia, setnivelExperiencia] = useState(null);
  const [loadingCurso, setLoadingCurso] = useState(true);
  const [loadingPrograma, setLoadingPrograma] = useState(true);
  const [frentes, setFrentes] = useState(null);
  const [subfrentes, setSubfrentes] = useState(null);
  
  let { id } = useParams();
  let { IdEmpresa } = useParams();
  const toast = useRef(null);

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const getPersona = async () => {
      // let jwt = window.localStorage.getItem("jwt");

      let idEmpresa = id;
      await ObtenerEmpresa({idEmpresa}).then((data) => {
        console.log("data",data);
        setTituloPagina("Datos de la Empresa");
        setConsultor(data);
        setModoEdicion(true);
      });
    };
    if (id) getPersona();
  }, [id]);
  useEffect(() => {
    const getTipoDoc = async () => {
      const data=[{id: 1,nombre: 'DNI'},
       {id: 2, nombre:'Pasaporte'},
       {id: 3,nombre:'Carnet de extranjeria'}
      ]
      setTipoDocumento(data);
    };
    getTipoDoc();
  }, []);
  
    useEffect(() => {
    const getModalidad = async () => {

      const data=[{id: 1,nombre: 'Interno'},
       {id: 2, nombre:'Externo'},
      ]
      setModalidad(data);


    };
    getModalidad();
  }, []);

    useEffect(() => {
    const getSocio = async () => {

      const data=[{id: 1,nombre: 'CSTI'},
      //  {id: 2, nombre:'Socio2'},
      ]
      setSocio(data);


    };
    getSocio();
  }, []);
    useEffect(() => {
      const getPais = async () => {
       await ListarPais().then(data=>{setPais(data)})
      };
      getPais();
    }, []);
     useEffect(() => {
      const getGestor = async () => {
       await ListarGestores().then(data=>{setGestor(data)})
      };
      getGestor();
    }, []);
   useEffect(() => {
    const getnivelExperiencia = async () => {
      const data=[{id: 1,nombre: 'Básico'},
       {id: 2, nombre:'intermedio'},
       {id: 3,nombre:'Avanzado'}
      ]
      setnivelExperiencia(data);


    };
    getnivelExperiencia();
  }, []);
  

  useEffect(() => {
    const getFrentes = async () => {
       await ListarFrentes().then(data=>{setFrentes(data)})
     };
    getFrentes();
  }, []);
 useEffect(() => {
    const getParametro = async () => {
      await ListarParametros().then(data=>{setParametro(data)})
   };
    getParametro();
  }, []);

   useEffect(() => {
      const getPais = async () => {
       await ListarPais().then(data=>{setPais(data)})
      };
      getPais();
    }, []);

const schema = Yup.object().shape({
  razonSocial: Yup.string().required("La razón social es obligatoria"),
  nombreComercial: Yup.string().required("El nombre comercial es obligatorio"),
  ruc: Yup.string()
    .required("El RUC es obligatorio")
    .matches(/^\d+$/, "El RUC debe contener solo números")
    .length(11, "El RUC debe tener exactamente 11 dígitos"),
  direccion: Yup.string().required("La dirección es obligatoria"),
  telefono: Yup.string()
    .required("El teléfono es obligatorio")
    .matches(/^\d+$/, "El teléfono debe contener solo números")
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .max(15, "El teléfono no puede exceder 15 dígitos"),
  email: Yup.string()
    .required("El correo es obligatorio")
    .email("Debe ser un correo válido"),
  usuarioRegistro: Yup.string().required("El usuario de registro es obligatorio"),
  idPais: Yup.number()
    .required("El país es obligatorio")
    .min(1, "Debe seleccionar un país válido"),
  gestorId: Yup.number()
    .required("El gestor es obligatorio")
    .min(1, "Debe seleccionar un gestor válido"),
  cargoResponsable: Yup.string().required("Cargo es un campo obligatorio"),
   nombres: Yup.string().required("Nombres es un campo obligatorio"),
    apellidoPaterno: Yup.string().required("Apellido Paterno es un campo obligatorio"),
    apellidoMaterno: Yup.string().required("Apellido Materno es un campo obligatorio"),
    numeroDocumento: Yup.string()
      .required("Documento de Identidad es un campo obligatorio")
      .matches(/^\d+$/, "Documento debe contener solo números")
      .min(8, "Documento debe tener mínimo 8 números")
      .test("no-es-ceros", "Documento no puede ser igual a '00000000'", value => value !== "00000000"),
    tipoDocumento: Yup.number().required("Tipo de documento es un campo obligatorio"),
    telefonopersona: Yup.string()
      .required("Teléfono es un campo obligatorio")
      .matches(/^\d+$/, "El teléfono solo debe contener números")
      .min(8, "El teléfono debe tener al menos 8 dígitos")
      .max(15, "El teléfono no puede exceder 15 dígitos"),
    telefono2: Yup.string()
      .required("Teléfono es un campo obligatorio")
      .matches(/^\d+$/, "El teléfono solo debe contener números")
      .min(8, "El teléfono debe tener al menos 8 dígitos")
      .max(15, "El teléfono no puede exceder 15 dígitos"),
    direccionpersona: Yup.string(),
    correopersona: Yup.string(),
  
});

 const formik = useFormik({
  enableReinitialize: true,
  initialValues: {
    razonSocial: empresa?.razonSocial || "",
    nombreComercial: empresa?.nombreComercial || "",
    ruc: empresa?.ruc || "",
    direccion: empresa?.direccion || "",
     telefono: empresa?.telefono?.replace(/\D/g, "") || "",
    email: empresa?.email || "",
    usuarioRegistro:empresa?.usuarioRegistro|| window.localStorage.getItem("username"), 
    idPais: empresa?.idPais || 0,
    gestorId: empresa?.idGestor || 0,
    socioId: empresa?.idSocio || Number(window.localStorage.getItem("idsocio")),
    activo:empresa?.activo|| true,
    cargoResponsable:empresa?.cargoResponsable|| "",
        nombres: empresa?.persona.nombres || "",
        apellidoPaterno: empresa?.persona.apellidoPaterno || "",
        apellidoMaterno: empresa?.persona.apellidoMaterno || "",
        numeroDocumento: empresa?.persona.numeroDocumento || "",
        tipoDocumento: empresa?.persona.tipoDocumento || "",
        telefonopersona: empresa?.persona.telefonopersona || "",
        telefono2: empresa?.persona.telefono2 || "",
        direccionpersona: empresa?.persona.direccionpersona || "",
        correopersona: empresa?.persona.correopersona || "",
        fechaNacimiento: null,
  },
  validationSchema:schema,
 onSubmit: (values) => {
  const data = {
    razonSocial: values.razonSocial,
    nombreComercial: values.nombreComercial,
    ruc: values.ruc,
    direccion: values.direccion,
    telefono: values.telefono,
    email: values.email,
    usuarioRegistro: window.localStorage.getItem("username"),
    idPais: values.idPais,
    gestorId: values.gestorId,
    socioId:Number(window.localStorage.getItem("idsocio")),
    activo:true,
    cargoResponsable:values.cargoResponsable,
    persona: {
              nombres: values.nombres,
              apellidoMaterno: values.apellidoMaterno,
              apellidoPaterno: values.apellidoPaterno,
              numeroDocumento: values.numeroDocumento,
              tipoDocumento: Number(values.tipoDocumento),
              telefono: values.telefonopersona,
              telefono2: values.telefono2,
              direccion: values.direccionpersona || "",
              correo: values.correopersona || "",
              fechaNacimiento:null
            },
  };
  const jsonData = JSON.stringify(data, null, 2);

  if (modoEdicion) {
    const idEmpresa = empresa?.id;
    console.log(idEmpresa)
    
    Actualizar({ jsonData, idEmpresa });
  } else {

    Registrar({ jsonData });
  }
}

});

  const Registrar = ({ jsonData }) => {
    RegistrarEmpresa({ jsonData})
      .then((data) => {
        formik.setSubmitting(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Registro exitoso.",
          life: 7000,
        });

        setTimeout(() => {
          navigate(-1);
        }, 1000);
      })
      .catch((errors) => {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: errors.message,
          life: 7000,
        });
        formik.setSubmitting(false);
      });
  };

   const Actualizar = ({ jsonData,idEmpresa }) => {
      ActualizarEmpresa({ jsonData, idEmpresa })
        .then((data) => {
          formik.setSubmitting(false);
          toast.current.show({
            severity: "success",
            summary: "Éxito",
            detail: "Registro actualizado exitosamente.",
            life: 7000,
          });
  
        })
        .catch((errors) => {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: errors.message,
            life: 7000,
          });
          formik.setSubmitting(false);
        });
    };



  const dateBodyTemplateFechaActivacion = (rowData) => {
    return rowData.fechaActivacion
      ? formatDate(new Date(rowData.fechaActivacion))
      : "";
  };
  const dateBodyTemplate = (rowData) => {
    console.log(rowData);
    return rowData.fechaVigencia ? formatDate(new Date(rowData.fechaVigencia)) : "";
  };
  const programaTemplate = (rowData) => {
    console.log(rowData);
    return (
      <span>
        {rowData.programa && rowData.idPersonaPrograma
          ? rowData.programa
          : "No"}
      </span>
    );
  };

  const headerPass = <div className="font-bold mb-3">Ingrese password</div>;
  const footerPass = (
    <>
      <Divider />
      <p className="mt-2">Sugerencias</p>
      <ul className="pl-2 ml-2 mt-0 line-height-3">
        <li>Al menos una minúscula</li>
        <li>Al menos una mayúscula</li>
        <li>Al menos un número</li>
        <li>Mínimo 8 caracteres</li>
      </ul>
    </>
  );
 

   const confirmarEliminacion = (rowData) => {
        confirmDialog({
          message: '¿Esta seguro de eliminar esta especialización?',
          header: 'Confirmación',
          icon: 'pi pi-exclamation-triangle',
          acceptClassName: 'p-button-danger',
          acceptLabel: 'Eliminar',
          rejectLabel: 'Cancelar',
          accept: () => {
            const nuevasEspecializaciones = formik.values.especializaciones.filter(
              (esp) => esp !== rowData
            );
            formik.setFieldValue('especializaciones', nuevasEspecializaciones);
          }
        });
      };

      const accion = (rowData) => {
        return (
          <div className="profesor-datatable-accion">
            <div className="accion-eliminar" onClick={() => confirmarEliminacion(rowData)}>
              <span>
                <Iconsax.Trash color="#ffffff" />
              </span>
            </div>
          </div>
        );
      };
      
     

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
            {/* <div className="field col-12 md:col-6">
                            <label className="label-form">Codigo</label>
                            <InputText
                              type={"text"}
                              id="codigo"
                              name="codigo"
                              placeholder="Escribe aquí"
                              value={formik.values.codigo}
                              onBlur={formik.handleBlur}
                              onChange={formik.handleChange}
            
                              // onChange={(e)=>handleSoloLetras(e,formik,"codigo")}
                            ></InputText>
                            <div className="p-error">
                              {formik.touched.codigo && formik.errors.codigo}
                            </div>
            </div> */}
            <div className="field col-12 md:col-6">
              <label className="label-form">Razon Social</label>
              <InputText
                type={"text"}
                id="razonSocial"
                name="razonSocial"
                placeholder="Escribe aquí"
                value={formik.values.razonSocial}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              ></InputText>
              <div className="p-error">
                {formik.touched.razonSocial && formik.errors.razonSocial}
              </div>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Nombre Comercial</label>
              <InputText
                type={"text"}
                id="nombreComercial"
                name="nombreComercial"
                placeholder="Escribe aquí"
                value={formik.values.nombreComercial}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              ></InputText>
              <div className="p-error">
                {formik.touched.nombreComercial && formik.errors.nombreComercial}
              </div>
            </div>      
            <div className="field col-12 md:col-6">
              <label className="label-form"> N° Documento del contribuyente</label>
              <InputText
                type={"numeric"}
                id="ruc"
                name="ruc"
                placeholder="Escribe aquí"
                value={formik.values.ruc}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                maxLength={11}
                keyfilter={ /^\d+$/}
              ></InputText>
              <small className="p-error">
                {formik.touched.ruc && formik.errors.ruc}
              </small>
            </div>
            <div className="field col-12 md:col-6">
                <label className="label-form">Teléfono</label>
                <InputNumber
                  id="telefono"
                  name="telefono"
                  placeholder="Escribe aquí"
                  value={formik.values.telefono}
                  //onValueChange={formik.handleChange}
                  onValueChange={(e) => handleSoloNumeros(e, formik, "telefono")}
                  onChange={(e) => {
                    if (e.value == "-") {
                      formik.setFieldValue("telefono", "");
                    }
                  }}
                  onBlur={formik.handleBlur}
                  useGrouping={false}
                  maxLength={9}
                  autoComplete={false}
                ></InputNumber>
                <small className="p-error">
                  {formik.touched.telefono && formik.errors.telefono}
                </small>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Dirección</label>
              <InputText
                type={"text"}
                id="direccion"
                name="direccion"
                placeholder="Escribe aquí"
                value={formik.values.direccion}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              ></InputText>
              <div className="p-error">
                {formik.touched.direccion && formik.errors.direccion}
              </div>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Correo</label>
              <InputText
                type={"text"}
                id="email"
                name="email"
                placeholder="Escribe aquí"
                value={formik.values.email}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              ></InputText>
              <div className="p-error">
                {formik.touched.email && formik.errors.email}
              </div>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Pais</label>
              <DropdownDefault
                type={"text"}
                id="idPais"
                name="idPais"
                placeholder="Seleccione"
                value={formik.values.idPais}
                onChange={(e) => {
                  formik.setFieldValue("idPais", "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                options={pais}
                optionLabel="nombre"
                optionValue="id"
              ></DropdownDefault>
              <small className="p-error">
                {formik.touched.idPais && formik.errors.idPais}
              </small>
            </div>
             <div className="field col-12 md:col-6">
              <label className="label-form">Gestor</label>
              <DropdownDefault
                type={"text"}
                id="gestorId"
                name="gestorId"
                placeholder="Seleccione"
                value={formik.values.gestorId}
                onChange={(e) => {
                  formik.setFieldValue("gestorId", "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                options={gestor}
                optionLabel="nombres"
                optionValue="id"
              ></DropdownDefault>
              <small className="p-error">
                {formik.touched.gestorId && formik.errors.gestorId}
              </small>
            </div>

            <hr style={{ width: "100%", border: "1px solid #ccc", margin: "20px 0" }} />
            <div className="field col-12">
                <label style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "10px", display: "block" }}>
                  Persona Responsable
                </label>
            </div>
             <div className="field col-12 md:col-6">
              <label className="label-form">Nombres</label>
              <InputText
                type={"text"}
                id="nombres"
                name="nombres"
                placeholder="Escribe aquí"
                value={formik.values.nombres}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}

                // onChange={(e)=>handleSoloLetras(e,formik,"nombres")}
              ></InputText>
              <div className="p-error">
                {formik.touched.nombres && formik.errors.nombres}
              </div>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Apellido Paterno</label>
              <InputText
                type={"text"}
                id="apellidoPaterno"
                name="apellidoPaterno"
                placeholder="Escribe aquí"
                value={formik.values.apellidoPaterno}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                // onChange={(e)=>handleSoloLetras(e,formik,"apellidoPaterno")}
              ></InputText>
              <div className="p-error">
                {formik.touched.apellidoPaterno && formik.errors.apellidoPaterno}
              </div>
            </div>      
            <div className="field col-12 md:col-6">
              <label className="label-form">Apellido Materno</label>
              <InputText
                type={"text"}
                id="apellidoMaterno"
                name="apellidoMaterno"
                placeholder="Escribe aquí"
                value={formik.values.apellidoMaterno}
                onChange={formik.handleChange}
                // onChange={(e) => handleSoloLetras(e, formik, "apellidoMaterno")}
                onBlur={formik.handleBlur}
              ></InputText>
              <small className="p-error">
                {formik.touched.apellidoMaterno &&
                  formik.errors.apellidoMaterno}
              </small>
            </div>

              <div className="field col-12 md:col-6">
              <label className="label-form">Tipo documento de Identidad</label>
              <DropdownDefault
                type={"text"}
                id="tipoDocumento"
                name="tipoDocumento"
                placeholder="Seleccione"
                value={formik.values.tipoDocumento}
                onChange={(e) => {
                  formik.setFieldValue("tipoDocumento", "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                options={tipoDocumento}
                optionLabel="nombre"
                optionValue="id"
              ></DropdownDefault>
              <small className="p-error">
                {formik.touched.tipoDocumento && formik.errors.tipoDocumento}
              </small>
            </div>
            
            <div className="field col-12 md:col-6">
              <label className="label-form"> N° Documento de Identidad </label>
              <InputText
                type={"numeric"}
                id="numeroDocumento"
                name="numeroDocumento"
                placeholder="Escribe aquí"
                value={formik.values.numeroDocumento}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                maxLength={
                  formik.values.tipoDocumento &&
                  formik.values.tipoDocumento == 1
                    ? 8
                    : 12
                }
                keyfilter={
                  formik.values.tipoDocumento &&
                  formik.values.tipoDocumento == 1
                    ? /^\d+$/
                    : /^[0-9a-zA-Z||-]+$/gi
                }
                disabled={formik.values.tipoDocumento != null ? false : true}
              ></InputText>
              <small className="p-error">
                {formik.touched.numeroDocumento && formik.errors.numeroDocumento}
              </small>
            </div>
             <div className="field col-12 md:col-6">
              <label className="label-form">Cargo del Responsable</label>
              <InputText
                type={"text"}
                id="cargoResponsable"
                name="cargoResponsable"
                placeholder="Escribe aquí"
                value={formik.values.cargoResponsable}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              ></InputText>
              <div className="p-error">
                {formik.touched.cargoResponsable && formik.errors.cargoResponsable}
              </div>
            </div>
            <div className="field col-12 md:col-6">
                <label className="label-form">Teléfono</label>
                <InputNumber
                  id="telefonopersona"
                  name="telefonopersona"
                  placeholder="Escribe aquí"
                  value={formik.values.telefonopersona}
                  //onValueChange={formik.handleChange}
                  onValueChange={(e) => handleSoloNumeros(e, formik, "telefonopersona")}
                  onChange={(e) => {
                    if (e.value == "-") {
                      formik.setFieldValue("telefonopersona", "");
                    }
                  }}
                  onBlur={formik.handleBlur}
                  useGrouping={false}
                  maxLength={9}
                  autoComplete={false}
                ></InputNumber>
                <small className="p-error">
                  {formik.touched.telefonopersona && formik.errors.telefonopersona}
                </small>
            </div>
            <div className="field col-12 md:col-6">
                <label className="label-form">Teléfono 2</label>
                <InputNumber
                  id="telefono2"
                  name="telefono2"
                  placeholder="Escribe aquí"
                  value={formik.values.telefono2}
                  //onValueChange={formik.handleChange}
                  onValueChange={(e) => handleSoloNumeros(e, formik, "telefono2")}
                  onChange={(e) => {
                    if (e.value == "-") {
                      formik.setFieldValue("telefono2", "");
                    }
                  }}
                  onBlur={formik.handleBlur}
                  useGrouping={false}
                  maxLength={9}
                  autoComplete={false}
                ></InputNumber>
                <small className="p-error">
                  {formik.touched.telefono2 && formik.errors.telefono2}
                </small>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Dirección</label>
              <InputText
                type={"text"}
                id="direccionpersona"
                name="direccionpersona"
                placeholder="Escribe aquí"
                value={formik.values.direccionpersona}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              ></InputText>
              <div className="p-error">
                {formik.touched.direccionpersona && formik.errors.direccionpersona}
              </div>
            </div>
             <div className="field col-12 md:col-6">
              <label className="label-form">Correo</label>
              <InputText
                type={"text"}
                id="correopersona"
                name="correopersona"
                placeholder="Escribe aquí"
                value={formik.values.correopersona}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              ></InputText>
              <div className="p-error">
                {formik.touched.correopersona && formik.errors.correopersona}
              </div>
            </div>
            
          
          </div>

          {/* <button type="button" onClick={() => console.log("VALUES", formik.values)}>
            Ver valores
          </button>  */}
          
          <div className="zv-editarUsuario-footer">
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
    </div>
  );
};

export default EditarConsultor;
