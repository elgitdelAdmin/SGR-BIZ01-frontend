import React, { useEffect, useState, useRef } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Gestores.scss"
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
import {RegistrarGestor,ListarFrentes,ListarParametros,ObtenerGestor,ActualizarGestor} from "../../service/GestorService";

const EditarGestor = () => {
  const navigate = useNavigate();
  const { isLogged } = useUsuario();
  const [parametros, setParametro] = useState([]);

  const [consultor, setConsultor] = useState(null);
  const [tituloPagina, setTituloPagina] = useState("Crear Gestor");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [listaCursos, setListaCursos] = useState(null);
  const [listaPrograma, setListaPrograma] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState(null);
  const [modalidad, setModalidad] = useState(null);
  const [nivelExperiencia, setnivelExperiencia] = useState(null);
  const [loadingCurso, setLoadingCurso] = useState(true);
  const [loadingPrograma, setLoadingPrograma] = useState(true);
  const [frentes, setFrentes] = useState(null);
  const [subfrentes, setSubfrentes] = useState(null);
  let { id } = useParams();
  let { IdEmpresa } = useParams();
  const toast = useRef(null);
  const [empresa, setEmpresa] = useState(null);

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const getPersona = async () => {
      let idGestor = id;
      await ObtenerGestor({idGestor}).then((data) => {
        console.log("data",data);
        setTituloPagina("Datos del Gestor");
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
  
  // useEffect(() => {
  //   const getEmpresa = async () => {
  //     await ListarEmpresas().then(data=>{setEmpresa(data)})
  //     // let jwt = window.localStorage.getItem("jwt");
  //     // await ObtenerTipoDocumento({ jwt }).then((data) => {
  //     //   setTipoDocumento(data);
  //     // });
  //     // const data=[{id: 1,nombre: 'Empresa1'},
  //     //  {id: 2, nombre:'Empresa2'},
  //     //  {id: 3,nombre:'Empresa3'}
  //     // ]
  //     // setEmpresa(data);
  //   };
  //   getEmpresa();
  // }, []);

  const schema = Yup.object().shape({
  nombres: Yup.string().required("Nombres es un campo obligatorio"),
  apellidoPaterno: Yup.string().required("Apellido Paterno es un campo obligatorio"),
  apellidoMaterno: Yup.string().required("Apellido Materno es un campo obligatorio"),
  numeroDocumento: Yup.string()
    .required("Documento de Identidad es un campo obligatorio")
    .matches(/^\d+$/, "Documento debe contener solo números")
    .min(8, "Documento debe tener mínimo 8 números")
    .test("no-es-ceros", "Documento no puede ser igual a '00000000'", value => value !== "00000000"),
  tipoDocumento: Yup.number().required("Tipo de documento es un campo obligatorio"),
  idNivelExperiencia: Yup.number().required("Nivel de Experiencia es un campo obligatorio"),
  idModalidadLaboral: Yup.number().required("Modalidad laboral es un campo obligatorio"),
  telefono: Yup.string()
    .required("Teléfono es un campo obligatorio")
    .matches(/^\d+$/, "El teléfono solo debe contener números")
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .max(15, "El teléfono no puede exceder 15 dígitos"),
  telefono2: Yup.string()
    .required("Teléfono es un campo obligatorio")
    .matches(/^\d+$/, "El teléfono solo debe contener números")
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .max(15, "El teléfono no puede exceder 15 dígitos"),
  direccion: Yup.string(),
  correo: Yup.string(),
  fechaNacimiento: Yup.date()
    .required("Fecha de nacimiento es obligatoria")
    .max(new Date(), "La fecha de nacimiento no puede ser en el futuro"),
 nuevaEspecializacion: Yup.object().shape({
  idFrente: Yup.number().nullable().transform((v, o) => o === "" ? null : v),
  idSubFrente: Yup.number().nullable().transform((v, o) => o === "" ? null : v),
    idNivelExperiencia: Yup.number().nullable().transform((v, o) => o === "" ? null : v),

  // idNivelExperiencia: Yup.number().transform(value => value === "" ? null : value),
    esCertificado: Yup.boolean(),
}).notRequired(),
  especializaciones: Yup.array().of(
    Yup.object().shape({
      idFrente: Yup.number().required(),
      idSubFrente: Yup.number().required(),
      idNivelExperiencia: Yup.string().required(),
      esCertificado: Yup.boolean(),

    })
  )
});

    const formik = useFormik({
      enableReinitialize: true,
      initialValues: {
        nombres: consultor?.nombres || "",
        apellidoPaterno: consultor?.apellidoPaterno || "",
        apellidoMaterno: consultor?.apellidoMaterno || "",
        numeroDocumento: consultor?.numeroDocumento || "",
        tipoDocumento: consultor?.tipoDocumento || "",
        idNivelExperiencia:consultor?.idNivelExperiencia || "",
        idModalidadLaboral:consultor?.idModalidadLaboral || "",
        telefono: consultor?.telefono || "",
        telefono2: consultor?.telefono2 || "",
        direccion: consultor?.direccion || "",
        correo: consultor?.correo || "",
        fechaNacimiento: consultor?.fechaNacimiento ? new Date(consultor.fechaNacimiento) : "",
        idSocio: empresa?.idSocio ||  Number(window.localStorage.getItem("idsocio")),
 

        nuevaEspecializacion: {
          idFrente: "",
          idSubFrente: "",
          idNivelExperiencia: "",
          esCertificado:false,

        },
         especializaciones: consultor?.frentesSubFrente||[]
      },
      validationSchema: schema,

      onSubmit: (values) => {
      
          const data = {
            ...(modoEdicion && { id: consultor.id }), 
            idNivelExperiencia: values.idNivelExperiencia,
            idModalidadLaboral:values.idModalidadLaboral,
            nombres: values.nombres,
            apellidoMaterno: values.apellidoMaterno,
            apellidoPaterno: values.apellidoPaterno,
            numeroDocumento: values.numeroDocumento,
            tipoDocumento: Number(values.tipoDocumento),
            telefono: values.telefono,
            telefono2: values.telefono2,
            direccion: values.direccion || "",
            correo: values.correo || "",
            idSocio: Number(window.localStorage.getItem("idsocio")),

            fechaNacimiento: new Date(values.fechaNacimiento).toISOString(),
            ...(modoEdicion
              ? { usuarioActualizacion:window.localStorage.getItem("username")}
              : { usuarioCreacion: values.usuarioCreacion||window.localStorage.getItem("username")}),            
            frentesSubFrente: values.especializaciones.map(e => ({
              idFrente: Number(e.idFrente),
              idSubFrente: Number(e.idSubFrente),
              idNivelExperiencia: e.idNivelExperiencia,
              esCertificado: e.esCertificado,
              usuarioCreacion:window.localStorage.getItem("username"),
            }))
          };
           let jsonData = JSON.stringify(data,null,2);

        if (modoEdicion) {
          const idGestor = consultor.id;
          Actualizar({ jsonData, idGestor });
        } else {
          Registrar({ jsonData });
        }
      }
    });
 
  const Registrar = ({ jsonData }) => {
    console.log("RegistrarGestor",jsonData)

    RegistrarGestor({ jsonData})
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

   const Actualizar = ({ jsonData,idGestor }) => {
      ActualizarGestor({ jsonData, idGestor })
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
              <label className="label-form">Nivel de Experiencia</label>
              <DropdownDefault
                type={"text"}
                id="idNivelExperiencia"
                name="idNivelExperiencia"
                placeholder="Seleccione"
                value={formik.values.idNivelExperiencia}
                onChange={(e) => {
                  formik.setFieldValue("idNivelExperiencia", "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                options={nivelExperiencia}
                // options={parametros?.filter((item) => item.tipoParametro === "TipoTicket")}

                optionLabel="nombre"
                optionValue="id"
              ></DropdownDefault>
              <small className="p-error">
                {formik.touched.idNivelExperiencia && formik.errors.idNivelExperiencia}
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
                id="correo"
                name="correo"
                placeholder="Escribe aquí"
                value={formik.values.correo}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              ></InputText>
              <div className="p-error">
                {formik.touched.correo && formik.errors.correo}
              </div>
            </div>
            <div className="field col-12 md:col-6">
            <label className="label-form">Fecha de nacimiento</label>
            <Calendar
              id="fechaNacimiento"
              name="fechaNacimiento"
              value={formik.values.fechaNacimiento}
              onChange={(e) => formik.setFieldValue('fechaNacimiento', e.value)}
              onBlur={formik.handleBlur}
              dateFormat="dd/mm/yy"
              placeholder="Selecciona la fecha"
              showIcon
            />
              <div className="p-error">
                {formik.touched.fechaNacimiento && formik.errors.fechaNacimiento}
              </div>
            </div>  
            <div className="field col-12 md:col-6">
              <label className="label-form">Modalidad Laboral</label>
              <DropdownDefault
                type={"text"}
                id="idModalidadLaboral"
                name="idModalidadLaboral"
                placeholder="Seleccione"
                value={formik.values.idModalidadLaboral}
                onChange={(e) => {
                  formik.setFieldValue("idModalidadLaboral", "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                options={modalidad}
                optionLabel="nombre"
                optionValue="id"
              ></DropdownDefault>
              <small className="p-error">
                {formik.touched.idModalidadLaboral && formik.errors.idModalidadLaboral}
              </small>
            </div>
            <div className="field col-12">
              <label style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "10px", display: "block" }}>
                Especializaciones
              </label>
            </div>
            <div className="field col-12 md:col-3">
              <DropdownDefault
              value={formik.values.nuevaEspecializacion.idFrente}
              options={frentes}
              optionLabel="nombre"
              optionValue="id"
              onChange={(e) => {
                      const idFrenteSeleccionado = e.value;
                      formik.setFieldValue("nuevaEspecializacion.idFrente", idFrenteSeleccionado);
                      const frenteSeleccionado = frentes.find((f) => f.id === idFrenteSeleccionado);
                      if (frenteSeleccionado) {
                        setSubfrentes(frenteSeleccionado.subFrente || []);
                      } else {
                        setSubfrentes([]);
                      }
                    }}
                    placeholder="Selecciona Frente"
              />
            </div>
            <div className="field col-12 md:col-3">
            <DropdownDefault
              value={formik.values.nuevaEspecializacion.idSubFrente}
              options={subfrentes}
              optionLabel="nombre"
              optionValue="id"
              onChange={(e) => formik.setFieldValue("nuevaEspecializacion.idSubFrente", e.value)}
              placeholder="Selecciona Subfrente"
            />
            </div>
            <div className="field col-12 md:col-3">
              <DropdownDefault
              value={formik.values.nuevaEspecializacion.idNivelExperiencia}
              options={nivelExperiencia}
              optionLabel="nombre"
              optionValue="id"
              onChange={(e) => formik.setFieldValue("nuevaEspecializacion.idNivelExperiencia", e.value)}
              placeholder="Selecciona Nivel"
            />
            </div>
            <div className="field col-12 md:col-1">
            <div className="p-field-checkbox">
              <label htmlFor="esCertificado">Es Certificado</label>

              <Checkbox
                inputId="esCertificado"
                checked={formik.values.nuevaEspecializacion.esCertificado}
                onChange={(e) =>
                  formik.setFieldValue("nuevaEspecializacion.esCertificado", e.checked)
                }
              />
            </div>
            </div>
            <div className="field col-12 md:col-2">
              <Boton
              type="button"
              label="Agregar especialización"
              style={{ fontSize: 13, borderRadius: 15 }}
              onClick={() => {
                const nueva = formik.values.nuevaEspecializacion;

                if (!nueva.idFrente || !nueva.idSubFrente || !nueva.idNivelExperiencia) {
                  alert("Completa todos los campos de la especialización");
                  return;
                }

                const especializacionesActuales = Array.isArray(formik.values.especializaciones)
                  ? formik.values.especializaciones
                  : [];

                // Verificar si ya existe una igual
                const yaExiste = especializacionesActuales.some(
                  (esp) =>
                    esp.idFrente === Number(nueva.idFrente) &&
                    esp.idSubFrente === Number(nueva.idSubFrente) &&
                    esp.idNivelExperiencia === nueva.idNivelExperiencia
                );

                if (yaExiste) {
                  alert("Ya has agregado esta especialización.");
                  return;
                }

                // Si no existe, agregarla
                formik.setFieldValue("especializaciones", [
                  ...especializacionesActuales,
                  {
                    idFrente: Number(nueva.idFrente),
                    idSubFrente: Number(nueva.idSubFrente),
                    idNivelExperiencia: nueva.idNivelExperiencia,
                    esCertificado: nueva.esCertificado,
                  },
                ]);

                // Limpiar campos
                formik.setFieldValue("nuevaEspecializacion", {
                  idFrente: "",
                  idSubFrente: "",
                  idNivelExperiencia: "",
                  esCertificado:false
                });
              }}
            />

            </div>
            <div className="field col-12 md:col-12">
            <DatatableDefault showSearch={false} paginator={false} value={formik.values.especializaciones}>
              <Column
                field="idFrente"
                header="Frente"
                body={(rowData) => {
                  if (!rowData?.idFrente || !frentes?.length) return "—";
                  const frente = frentes.find(f => f.id === rowData.idFrente);
                  return frente?.nombre || "—";
                }}
              />
              <Column
              field="idSubFrente"
              header="Subfrente"
              body={(rowData) => {
                if (!rowData?.idFrente || !frentes?.length) return "—";
                
                const frenteactual = frentes.find(f => f.id === rowData.idFrente);
                const subfrentesDelFrente = frenteactual?.subFrente || [];
                const subfrente = subfrentesDelFrente.find(sf => sf.id === rowData.idSubFrente);
                return subfrente?.nombre || "—";
              }}

              
            />


                <Column
                  field="idNivelExperiencia"
                  header="Nivel de experiencia"
                  body={(rowData) => {
                    if (!nivelExperiencia || !Array.isArray(nivelExperiencia)) return '';
                    const item = nivelExperiencia.find((n) => n.id === rowData?.idNivelExperiencia);
                    return item?.nombre || '';
                  }}
                />


                  <Column
                  field="esCertificado"
                  header="Es certificado"
                  body={(rowData) => (rowData.esCertificado ? "SI" : "NO")}
                />

              <Column
                  header="Acciones"
                  body={accion} 
                />
            </DatatableDefault>
            </div>
          </div>

          <button type="button" onClick={() => console.log("VALUES", formik.values)}>
            Ver valores
          </button> 
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

export default EditarGestor;
