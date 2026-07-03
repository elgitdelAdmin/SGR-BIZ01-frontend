import React, { useEffect, useState, useRef } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import DropdownDefault from "../../components/DropdownDefault/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Usuarios.scss"
import InputTextDefault from "../../components/InputTextDefault/InputTextDefault";
import Boton from "../../components/Boton/Boton";

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
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { handleSoloLetras, handleSoloLetrastest } from "../../helpers/helpers";
import { handleSoloNumeros } from "../../helpers/helpers";
import { formatDate } from "../../helpers/helpers";
import { Divider } from "primereact/divider";
import CalendarDefault from "../../components/CalendarDefault/CalendarDefault";
import MultiSelectDefault from "../../components/MultiSelectDefault/MultiSelectDefault";
import { Dialog } from 'primereact/dialog';
import { ListarParametros } from "../../service/GestorService";
import { RegistrarUsuario, ListaRoles, ListaSocio, ObtenerUsuario, ActualizarUsuario } from "../../service/UsuarioService";
import { ObtenerPersonaResponsable } from "../../service/EmpresaService";

const EditarUsuario = () => {
  // console.log("Render de EditarUsuario");
  const navigate = useNavigate();
  const [parametros, setParametro] = useState([]);
  const [usuario, setUsuario] = useState(null);
  // const [usuario, setUsuario] = useState([]);
  const [tituloPagina, setTituloPagina] = useState("Crear Usuario");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [rol, setRol] = useState(null);
  let { id } = useParams();
  const toast = useRef(null);
  const [socio, setSocio] = useState(null);
  const [mostrarInputPassword, setMostrarInputPassword] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [nuevaAsignacion, setNuevaAsignacion] = useState({ idSocio: "", idRoles: [] });

  // Datos de sesión
  const codRol = window.localStorage.getItem("codRol");
  const idSocioSesion = Number(window.localStorage.getItem("idsocio")) || 0;
  const nombreSocioSesion = window.localStorage.getItem("nombreSocio") || "";

  useEffect(() => {
    const getPersona = async () => {
      let idUsuario = id;
      await ObtenerUsuario({ idUsuario }).then((data) => {
        console.log("data", data);
        setTituloPagina("Datos del Usuario");
        setUsuario(data);
        setModoEdicion(true);
      });
    };
    if (id) getPersona();
  }, [id]);

  useEffect(() => {
    const getRol = async () => {
      await ListaRoles().then(data => { setRol(data) })
    };
    getRol();
  }, []);

  useEffect(() => {
    const getSocio = async () => {
      // const data=[{id: 1,nombre: 'CSTI'},
      // ]
      // setSocio(data);
      await ListaSocio().then(data => { setSocio(data) })

    };
    getSocio();
  }, []);

  useEffect(() => {
    const getParametro = async () => {
      await ListarParametros().then(data => { setParametro(data) })
    };
    getParametro();
  }, []);

  const schema = Yup.object().shape({
    nombres: Yup.string().required("Nombres es un campo obligatorio"),
    apellidoPaterno: Yup.string().required("Apellido Paterno es un campo obligatorio"),
    apellidoMaterno: Yup.string().required("Apellido Materno es un campo obligatorio"),
    // numeroDocumento: Yup.string()
    //   .required("Documento de Identidad es un campo obligatorio")
    //   .matches(/^\d+$/, "Documento debe contener solo números")
    //   .min(8, "Documento debe tener mínimo 8 números")
    //   .test("no-es-ceros", "Documento no puede ser igual a '00000000'", value => value !== "00000000"),
    numeroDocumento: Yup.string()
      .required("Documento de Identidad es un campo obligatorio")
      .when("tipoDocumento", {
        is: 1,
        then: (schema) =>
          schema
            .matches(/^\d+$/, "Documento debe contener solo números")
            .min(8, "Documento debe tener mínimo 8 números")
            .test(
              "no-es-ceros",
              "Documento no puede ser igual a '00000000'",
              (value) => value !== "00000000"
            ),
        otherwise: (schema) =>
          schema
            .matches(/^[0-9a-zA-Z-]+$/, "Documento solo puede contener letras, números o guiones")
            .min(5, "Documento debe tener mínimo 5 caracteres"),
      }),

    tipoDocumento: Yup.number().required("Tipo de documento es un campo obligatorio"),
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
    username: Yup.string().required("username es un campo obligatorio"),
    // password: Yup.string().required("password es un campo obligatorio"),

    password: Yup.string().when([], {
      is: () => !modoEdicion, // si NO está en modo edición → requerido
      then: (schema) => schema.required("password es un campo obligatorio"),
      otherwise: (schema) => schema.notRequired()
    }),
    rolSociosList: Yup.array().of(
      Yup.object().shape({
        idSocio: Yup.number().required("Socio es obligatorio"),
        idRoles: Yup.array().min(1, "Debe seleccionar al menos un rol").required("Debe seleccionar al menos un rol")
      })
    ).min(1, "Debe tener al menos una asignación de Socio/Rol"),
    email: Yup.string(),
  });


  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      nombres: usuario ? usuario.persona.nombres : "",
      apellidoPaterno: usuario?.persona.apellidoPaterno || "",
      apellidoMaterno: usuario?.persona.apellidoMaterno || "",
      numeroDocumento: usuario?.persona.numeroDocumento || "",
      tipoDocumento: usuario?.persona.tipoDocumento || "",
      telefono: usuario?.persona.telefono || "",
      telefono2: usuario?.persona.telefono2 || "",
      direccion: usuario?.persona.direccion || "",
      correo: usuario?.persona.correo || "",
      fechaNacimiento: usuario?.persona.fechaNacimiento ? new Date(usuario.persona.fechaNacimiento) : "",
      usuarioCreacionPersona: usuario?.persona.usuarioCreacion || window.localStorage.getItem("username"),
      username: usuario?.username || "",
      password: usuario?.password || "",
      email: usuario?.email || "",
      rolSociosList: usuario && usuario.rolSocios && usuario.rolSocios.length > 0
        ? (() => {
            const grouped = {};
            usuario.rolSocios.forEach(rs => {
              if (!grouped[rs.idSocio]) {
                grouped[rs.idSocio] = [];
              }
              grouped[rs.idSocio].push(rs.idRol);
            });
            return Object.keys(grouped).map(idSocio => ({
              idSocio: Number(idSocio),
              idRoles: grouped[idSocio]
            }));
          })()
        : [],
      usuarioCreacion: usuario?.usuarioCreacion || window.localStorage.getItem("username"),
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const rolSocios = [];
      values.rolSociosList.forEach(item => {
          if (item.idSocio && item.idRoles && item.idRoles.length > 0) {
              item.idRoles.forEach(idRol => {
                  rolSocios.push({
                      idRol: Number(idRol),
                      idSocio: Number(item.idSocio)
                  });
              });
          }
      });

      const firstSocio = values.rolSociosList.length > 0 && values.rolSociosList[0].idSocio 
          ? Number(values.rolSociosList[0].idSocio) 
          : 0;

      const data = {
        ...(modoEdicion && { id: usuario.id }),
        username: values.username,
        email: values.correo || "",
        password: values.password,
        idSocio: firstSocio,
        rolSocios: rolSocios,
        ...(modoEdicion
          ? { usuarioActualizacion: window.localStorage.getItem("username") }
          : { usuarioCreacion: values.usuarioCreacion || window.localStorage.getItem("username") }),
        fechaCreacion: new Date(),
        persona: {
          nombres: values.nombres,
          apellidoMaterno: values.apellidoMaterno,
          apellidoPaterno: values.apellidoPaterno,
          numeroDocumento: values.numeroDocumento,
          tipoDocumento: Number(values.tipoDocumento),
          telefono: values.telefono,
          telefono2: values.telefono2,
          direccion: values.direccion || "",
          correo: values.correo || "",
          fechaNacimiento: new Date(values.fechaNacimiento).toISOString(),
          ...(modoEdicion
            ? { usuarioActualizacion: window.localStorage.getItem("username") }
            : { usuarioCreacion: values.usuarioCreacionPersona }),
        },
      };
      let jsonData = JSON.stringify(data, null, 2);
      if (modoEdicion) {
        const idUsuario = usuario.id;
        Actualizar({ jsonData, idUsuario });
      } else {
        Registrar({ jsonData });
      }
    }
  });
  useEffect(() => {
    if (formik.submitCount > 0) {
      console.log("Errores actuales:", formik.errors);
    }
  }, [formik.submitCount]);

  const Registrar = ({ jsonData }) => {
    console.log("RegistrarUsuario", jsonData)
    RegistrarUsuario({ jsonData })
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

  const Actualizar = ({ jsonData, idUsuario }) => {
    console.log("RegistrarUsuario", jsonData)

    ActualizarUsuario({ jsonData, idUsuario })
      .then((data) => {
        formik.setSubmitting(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Registro actualizado exitosamente.",
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

  const handleBuscar = async () => {
    console.log("Datos recibidos:");
    const tipoDocumento = formik.values.tipoDocumento;
    const numeroDocumento = formik.values.numeroDocumento;

    if (!tipoDocumento || !numeroDocumento) {
      console.warn("Debe completar tipo y número de documento");
      return;
    }

    try {
      const data = await ObtenerPersonaResponsable({
        idTipoDocumento: tipoDocumento,
        numeroDocumento: numeroDocumento
      });

      console.log("Datos recibidos:", data);

      formik.setFieldValue("nombres", data.nombres || "");
      formik.setFieldValue("apellidoPaterno", data.apellidoPaterno || "");
      formik.setFieldValue("apellidoMaterno", data.apellidoMaterno || "");
      formik.setFieldValue("telefono", data.telefono || "");
      formik.setFieldValue("telefono2", data.telefono2 || "");
      formik.setFieldValue("direccion", data.direccion || "");
      formik.setFieldValue("correo", data.correo || "");
      formik.setFieldValue("fechaNacimiento", new Date(data.fechaNacimiento) || "");

    } catch (error) {
      console.error("Error al buscar responsable:", error.message);
    }
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
        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>
          <div className="p-fluid formgrid grid">
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
                options={parametros?.filter((item) => item.tipoParametro === "TipoDocumento")}

                // options={tipoDocumento}
                optionLabel="nombre"
                optionValue="id"
                disabled={modoEdicion}

              ></DropdownDefault>
              <small className="p-error">
                {formik.touched.tipoDocumento && formik.errors.tipoDocumento}
              </small>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form"> N° Documento de Identidad </label>
              <InputTextDefault
                type={"numeric"}
                id="numeroDocumento"
                name="numeroDocumento"
                placeholder="Escribe aquí"
                value={formik.values.numeroDocumento}
                onChange={formik.handleChange}
                // onBlur={formik.handleBlur}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  const tipoDocumento = formik.values.tipoDocumento;
                  const numeroDocumento = e.target.value;

                  if (tipoDocumento && numeroDocumento) {
                    handleBuscar();
                  }
                }}
                maxLength={
                  formik.values.tipoDocumento === 1
                    ? 8
                    : formik.values.tipoDocumento === 2
                    ? 12
                    : formik.values.tipoDocumento === 3
                    ? 12
                    : 15
                }
                keyfilter={
                  formik.values.tipoDocumento === 1
                    ? /[0-9]/
                    : formik.values.tipoDocumento === 2
                    ? /^[0-9a-zA-Z||-]+$/gi
                    : formik.values.tipoDocumento === 3
                    ? /^[0-9a-zA-Z||-]+$/gi
                    : /^[0-9a-zA-Z||-]+$/gi
                }
                disabled={!formik.values.tipoDocumento || modoEdicion}
              ></InputTextDefault>
              <small className="p-error">
                {formik.touched.numeroDocumento && formik.errors.numeroDocumento}
              </small>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Nombres</label>
              <InputTextDefault
                type={"text"}
                id="nombres"
                name="nombres"
                placeholder="Escribe aquí"
                value={formik.values.nombres}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              ></InputTextDefault>
              <div className="p-error">
                {formik.touched.nombres && formik.errors.nombres}
              </div>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Apellido Paterno</label>
              <InputTextDefault
                type={"text"}
                id="apellidoPaterno"
                name="apellidoPaterno"
                placeholder="Escribe aquí"
                value={formik.values.apellidoPaterno}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              // onChange={(e)=>handleSoloLetras(e,formik,"apellidoPaterno")}
              ></InputTextDefault>
              <div className="p-error">
                {formik.touched.apellidoPaterno && formik.errors.apellidoPaterno}
              </div>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Apellido Materno</label>
              <InputTextDefault
                type={"text"}
                id="apellidoMaterno"
                name="apellidoMaterno"
                placeholder="Escribe aquí"
                value={formik.values.apellidoMaterno}
                onChange={formik.handleChange}
                // onChange={(e) => handleSoloLetras(e, formik, "apellidoMaterno")}
                onBlur={formik.handleBlur}
              ></InputTextDefault>
              <small className="p-error">
                {formik.touched.apellidoMaterno &&
                  formik.errors.apellidoMaterno}
              </small>
            </div>

            <div className="field col-12 md:col-6">
               <label className="label-form">Teléfono</label>
               <InputTextDefault
                 id="telefono"
                 name="telefono"
                 placeholder="Escribe aquí"
                 value={formik.values.telefono}
                 onChange={(e) => {
                   const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                   formik.setFieldValue("telefono", val);
                 }}
                 onBlur={formik.handleBlur}
               />
               <small className="p-error">
                 {formik.touched.telefono && formik.errors.telefono}
               </small>
             </div>
             <div className="field col-12 md:col-6">
               <label className="label-form">Teléfono 2</label>
               <InputTextDefault
                 id="telefono2"
                 name="telefono2"
                 placeholder="Escribe aquí"
                 value={formik.values.telefono2}
                 onChange={(e) => {
                   const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                   formik.setFieldValue("telefono2", val);
                 }}
                 onBlur={formik.handleBlur}
               />
               <small className="p-error">
                 {formik.touched.telefono2 && formik.errors.telefono2}
               </small>
             </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Dirección</label>
              <InputTextDefault
                type={"text"}
                id="direccion"
                name="direccion"
                placeholder="Escribe aquí"
                value={formik.values.direccion}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              ></InputTextDefault>
              <div className="p-error">
                {formik.touched.direccion && formik.errors.direccion}
              </div>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Correo</label>
              <InputTextDefault
                type={"text"}
                id="correo"
                name="correo"
                placeholder="Escribe aquí"
                value={formik.values.correo}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              ></InputTextDefault>
              <div className="p-error">
                {formik.touched.correo && formik.errors.correo}
              </div>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Fecha de nacimiento</label>
              <CalendarDefault
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
              <label className="label-form">Usuario</label>
              <InputTextDefault
                type="text"
                id="username"
                name="username"
                placeholder="Escribe tu usuario"
                value={formik.values.username}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                disabled={modoEdicion}

              />
              <div className="p-error">
                {formik.touched.username && formik.errors.username}
              </div>
            </div>
            {/* <div className="field col-12 md:col-6">
            <label className="label-form">Contraseña</label>
            <Password
              id="password"
              name="password"
              placeholder="Escribe tu contraseña"
              value={formik.values.password}
              onBlur={formik.handleBlur}
              onChange={(e) => formik.setFieldValue('password', e.target.value)}
              toggleMask
              feedback={false} // Oculta la sugerencia de seguridad si no la quieres
            />
            <div className="p-error">
              {formik.touched.password && formik.errors.password}
            </div>
          </div> */}
            <div className="field col-12 md:col-6">
              <label className="label-form">Contraseña</label>

              {modoEdicion ? (
                !mostrarInputPassword ? (
                  <Boton
                    type="button"
                    label="Resetear contraseña"
                    color="secondary"
                    onClick={() => setMostrarInputPassword(true)}
                  />
                ) : (
                  <>
                    <Password
                      id="password"
                      name="password"
                      placeholder="Escribe tu nueva contraseña"
                      value={formik.values.password}
                      onBlur={formik.handleBlur}
                      onChange={(e) => formik.setFieldValue('password', e.target.value)}
                      toggleMask
                      feedback={false}
                    />
                    <div className="p-error">
                      {formik.touched.password && formik.errors.password}
                    </div>
                  </>
                )
              ) : (
                <>
                  <Password
                    id="password"
                    name="password"
                    placeholder="Escribe tu contraseña"
                    value={formik.values.password}
                    onBlur={formik.handleBlur}
                    onChange={(e) => formik.setFieldValue('password', e.target.value)}
                    toggleMask
                    feedback={false}
                  />
                  <div className="p-error">
                    {formik.touched.password && formik.errors.password}
                  </div>
                </>
              )}
            </div>


            <div className="field col-12" style={{ marginTop: '20px' }}>
              {/* Contenedor flexible para alinear título y botón — igual que Especializaciones */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", width: "100%" }}>
                <label style={{ fontWeight: "bold", fontSize: 20, margin: 0 }}>
                  Asignación de Socios y Roles
                </label>

                <Boton
                  icon="pi pi-plus"
                  label="Agregar Asignación"
                  color="primary"
                  type="button"
                  onClick={() => {
                    // Si NO es SUPERADMIN, pre-seleccionar el socio de la sesión y cargar sus roles existentes
                    if (codRol !== "SUPERADMIN") {
                      const existing = (formik.values.rolSociosList || []).find(
                        (item) => Number(item.idSocio) === Number(idSocioSesion)
                      );
                      setNuevaAsignacion({
                        idSocio: idSocioSesion,
                        idRoles: existing ? existing.idRoles : []
                      });
                    } else {
                      setNuevaAsignacion({ idSocio: "", idRoles: [] });
                    }
                    setVisibleModal(true);
                  }}
                  style={{
                    height: 42,
                    padding: "0 18px",
                    minWidth: "auto",
                    width: "fit-content",
                    whiteSpace: "nowrap",
                    borderRadius: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                />
              </div>
            </div>

            {/* ✅ Modal para agregar asignación Socio/Roles */}
            <Dialog
              header="Agregar Asignación de Socio y Roles"
              visible={visibleModal}
              onHide={() => { setVisibleModal(false); setNuevaAsignacion({ idSocio: "", idRoles: [] }); }}
              style={{ width: "min(550px, 90vw)" }}
              modal
              draggable={true}
              resizable={false}
              footer={
                <div className="flex justify-content-end gap-2">
                  <Boton
                    label="Cancelar"
                    icon="pi pi-times"
                    style={{ backgroundColor: "#dd4b39", color: "white" }}
                    onClick={() => { setVisibleModal(false); setNuevaAsignacion({ idSocio: "", idRoles: [] }); }}
                  />
                  <Boton
                    label="Agregar"
                    icon="pi pi-plus"
                    color="primary"
                    onClick={() => {
                      // Validar
                      if (!nuevaAsignacion.idSocio) {
                        toast.current.show({ severity: "warn", summary: "Atención", detail: "Debe seleccionar un Socio", life: 4000 });
                        return;
                      }
                      if (!nuevaAsignacion.idRoles || nuevaAsignacion.idRoles.length === 0) {
                        toast.current.show({ severity: "warn", summary: "Atención", detail: "Debe seleccionar al menos un Rol", life: 4000 });
                        return;
                      }

                      const existingIndex = (formik.values.rolSociosList || []).findIndex(
                        (item) => Number(item.idSocio) === Number(nuevaAsignacion.idSocio)
                      );

                      const currentList = [...(formik.values.rolSociosList || [])];
                      if (existingIndex > -1) {
                        // Reemplazar roles asignados (ya que el multiselect incluye los existentes y los nuevos/modificados)
                        currentList[existingIndex] = {
                          idSocio: Number(nuevaAsignacion.idSocio),
                          idRoles: nuevaAsignacion.idRoles,
                        };
                      } else {
                        // Agregar nueva fila
                        currentList.push({
                          idSocio: Number(nuevaAsignacion.idSocio),
                          idRoles: nuevaAsignacion.idRoles,
                        });
                      }
                      formik.setFieldValue("rolSociosList", currentList);

                      setNuevaAsignacion({ idSocio: "", idRoles: [] });
                      setVisibleModal(false);
                    }}
                  />
                </div>
              }
            >
              <div className="p-fluid grid">
                {/* Socio — solo visible para SUPERADMIN */}
                {codRol === "SUPERADMIN" ? (
                  <div className="field col-12">
                    <label className="label-form">Socio</label>
                    <DropdownDefault
                      placeholder="Seleccione Socio"
                      value={nuevaAsignacion.idSocio}
                      onChange={(e) => {
                        const selectedId = e.value;
                        const existing = (formik.values.rolSociosList || []).find(
                          (item) => Number(item.idSocio) === Number(selectedId)
                        );
                        setNuevaAsignacion({
                          idSocio: selectedId,
                          idRoles: existing ? existing.idRoles : []
                        });
                      }}
                      options={socio}
                      optionLabel="nombre"
                      optionValue="id"
                    />
                  </div>
                ) : (
                  <div className="field col-12">
                    <label className="label-form">Socio</label>
                    <InputTextDefault
                      value={(socio || []).find(s => s.id === idSocioSesion)?.nombre || nombreSocioSesion || `Socio #${idSocioSesion}`}
                      disabled
                      style={{ background: '#f0f0f0' }}
                    />
                  </div>
                )}

                {/* Roles */}
                <div className="field col-12">
                  <label className="label-form">Roles</label>
                  <MultiSelectDefault
                    placeholder="Seleccione Roles"
                    value={nuevaAsignacion.idRoles}
                    onChange={(e) => setNuevaAsignacion(prev => ({ ...prev, idRoles: e.value }))}
                    options={rol}
                    optionLabel="nombre"
                    optionValue="id"
                    display="chip"
                  />
                </div>
              </div>
            </Dialog>

            {/* ✅ Tabla resumen de asignaciones Socio/Roles */}
            <div className="col-12">
              <DatatableDefault
                showSearch={false}
                paginator={false}
                value={formik.values.rolSociosList || []}
              >
                <Column
                  header="Socio"
                  body={(rowData) => {
                    const s = (socio || []).find(s => s.id === Number(rowData.idSocio));
                    return s ? s.nombre : `Socio #${rowData.idSocio}`;
                  }}
                />
                <Column
                  header="Roles"
                  body={(rowData) => {
                    if (!rowData.idRoles || rowData.idRoles.length === 0) return "—";
                    return rowData.idRoles.map(idR => {
                      const r = (rol || []).find(r => r.id === idR);
                      return r ? r.nombre : `Rol #${idR}`;
                    }).join(", ");
                  }}
                />
                <Column
                  header="Acciones"
                  body={(rowData, { rowIndex }) => (
                    <div className="profesor-datatable-accion">
                      <div
                        className="accion-eliminar"
                        onClick={() => {
                          confirmDialog({
                            message: "¿Está seguro de eliminar esta asignación?",
                            header: "Confirmación",
                            icon: "pi pi-exclamation-triangle",
                            acceptClassName: "p-button-danger",
                            acceptLabel: "Eliminar",
                            rejectLabel: "Cancelar",
                            accept: () => {
                              const newList = [...(formik.values.rolSociosList || [])];
                              newList.splice(rowIndex, 1);
                              formik.setFieldValue("rolSociosList", newList);
                            }
                          });
                        }}
                      >
                        <span><Iconsax.Trash color="#ffffff" /></span>
                      </div>
                    </div>
                  )}
                  style={{ width: '80px' }}
                />
              </DatatableDefault>
              {formik.errors.rolSociosList && typeof formik.errors.rolSociosList === 'string' && (
                <small className="p-error" style={{ display: 'block', marginTop: '8px' }}>{formik.errors.rolSociosList}</small>
              )}
            </div>

          </div>

          {/* <button type="button" onClick={() => console.log("VALUES", formik.values)}>
            Ver valores
          </button>  */}
          <div className="zv-editarUsuario-footer">
            <Boton
              icon="pi pi-save"
              label="Guardar cambios"
              color="primary"
              type="submit"
              loading={formik.isSubmitting}
              style={{
                height: 42,
                padding: "0 18px",
                minWidth: "auto",
                width: "fit-content",
                whiteSpace: "nowrap",
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            />
          </div>
        </form>
        </FormikProvider>
      </div>
    </div>
  );
};

export default EditarUsuario;
