import React, { useEffect, useState, useRef } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Usuarios.scss"
import { InputText } from "primereact/inputtext";
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
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog"; // For confirmDialog method
import { handleSoloLetras, handleSoloLetrastest } from "../../helpers/helpers";
import { handleSoloNumeros } from "../../helpers/helpers";
import { formatDate } from "../../helpers/helpers";
import { Divider } from "primereact/divider";
import { Calendar } from 'primereact/calendar';
import {ListarParametros} from "../../service/GestorService";
import {RegistrarUsuario,ListaRoles,ListaSocio,ObtenerUsuario,ActualizarUsuario} from "../../service/UsuarioService";
import {ObtenerPersonaResponsable} from "../../service/EmpresaService";

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

  useEffect(() => {
    const getPersona = async () => {
      let idUsuario = id;
      await ObtenerUsuario({idUsuario}).then((data) => {
        console.log("data",data);
        setTituloPagina("Datos del Usuario");
        setUsuario(data);
        setModoEdicion(true);
      });
    };
    if (id) getPersona();
  }, [id]);

    useEffect(() => {
      const getRol = async () => {
      await ListaRoles().then(data=>{setRol(data)})
    };
      getRol();
    }, []);

   useEffect(() => {
      const getSocio = async () => {
        // const data=[{id: 1,nombre: 'CSTI'},
        // ]
        // setSocio(data);
          await ListaSocio().then(data=>{setSocio(data)})

      };
      getSocio();
    }, []);
   
    useEffect(() => {
        const getParametro = async () => {
          await ListarParametros().then(data=>{setParametro(data)})
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
      idRol: Yup.number().required("Rol es un campo obligatorio"),
      email: Yup.string(),



    });


    const formik = useFormik({
      enableReinitialize: true,
      initialValues: {
        nombres:usuario ? usuario.persona.nombres : "",
        apellidoPaterno: usuario?.persona.apellidoPaterno || "",
        apellidoMaterno: usuario?.persona.apellidoMaterno || "",
        numeroDocumento: usuario?.persona.numeroDocumento || "",
        tipoDocumento: usuario?.persona.tipoDocumento || "",
        telefono: usuario?.persona.telefono || "",
        telefono2: usuario?.persona.telefono2 || "",
        direccion: usuario?.persona.direccion || "",
        correo: usuario?.persona.correo || "",
        fechaNacimiento: usuario?.persona.fechaNacimiento ? new Date(usuario.persona.fechaNacimiento) : "",
        usuarioCreacionPersona:usuario?.persona.usuarioCreacion|| window.localStorage.getItem("username"), 
        username: usuario?.username || "",
        password: usuario?.password || "",
        email: usuario?.email || "",
        idSocio: usuario?.socio.id || ( window.localStorage.getItem("idRol") == 1? "": Number(window.localStorage.getItem("idsocio"))),
        idRol: usuario?.idRol || "",
        usuarioCreacion:usuario?.usuarioCreacion|| window.localStorage.getItem("username"), 
        // fechaCreacion: usuario?.fechaCreacion ? new Date(usuario.fechaCreacion) : new Date(),
      },
      validationSchema: schema,
      onSubmit: (values) => {
      
          const data = {
            ...(modoEdicion && { id: usuario.id }), 
            username: values.username ,
            email: values.password,
            password: values.password,
            idSocio: values.idSocio,
            idRol:values.idRol,
            // usuarioCreacion:values.usuarioCreacion,
             ...(modoEdicion
              ? { usuarioActualizacion:window.localStorage.getItem("username")}
              : { usuarioCreacion: values.usuarioCreacion||window.localStorage.getItem("username")}),         
            fechaCreacion:new Date(),
            persona:{
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
                // usuarioCreacion:values.usuarioCreacionPersona,
                  ...(modoEdicion
                ? { usuarioActualizacion: window.localStorage.getItem("username") }
                : { usuarioCreacion: values.usuarioCreacionPersona }),
                    },        
          };
           let jsonData = JSON.stringify(data,null,2);
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
    console.log("RegistrarUsuario",jsonData)
    RegistrarUsuario({ jsonData})
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

   const Actualizar = ({ jsonData,idUsuario }) => {
        console.log("RegistrarUsuario",jsonData)

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
              <InputText
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
                disabled={!formik.values.tipoDocumento||modoEdicion}
              ></InputText>
              <small className="p-error">
                {formik.touched.numeroDocumento && formik.errors.numeroDocumento}
              </small>
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
                <label className="label-form">Teléfono</label>
                <InputNumber
                  id="telefono"
                  name="telefono"
                  placeholder="Escribe aquí"
                  value={formik.values.telefono}
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
            <label className="label-form">Usuario</label>
            <InputText
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
              <button
                type="button"
                className="p-button p-component"
                onClick={() => setMostrarInputPassword(true)}
              >
                Resetear contraseña
              </button>
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


          <div className="field col-12 md:col-6">
              <label className="label-form">Rol</label>
              <DropdownDefault
                type={"text"}
                id="idRol"
                name="idRol"
                placeholder="Seleccione"
                value={formik.values.idRol}
                onChange={(e) => {
                  formik.setFieldValue("idRol", "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                // options={parametros?.filter((item) => item.tipoParametro === "TipoDocumento")}
                 options={rol}
                optionLabel="nombre"
                optionValue="id"
                disabled={modoEdicion}
              ></DropdownDefault>
              <small className="p-error">
                {formik.touched.idRol && formik.errors.idRol}
              </small>
          </div>

            {window.localStorage.getItem("idRol") == 1 && (
            <div className="field col-12 md:col-6">
              <label className="label-form">Socio</label>
              <DropdownDefault
                id="idSocio"
                name="idSocio"
                placeholder="Seleccione"
                value={formik.values.idSocio}
                onChange={(e) => {
                  formik.setFieldValue("idSocio", e.value); 
                }}
                onBlur={formik.handleBlur}
                options={socio}
                optionLabel="nombre"
                optionValue="id"
                disabled={modoEdicion}

              />
              <small className="p-error">
                {formik.touched.idSocio && formik.errors.idSocio}
              </small>
            </div>
          )}

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

export default EditarUsuario;
