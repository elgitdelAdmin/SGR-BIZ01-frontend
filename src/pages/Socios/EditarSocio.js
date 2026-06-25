import React, { useEffect, useState, useRef } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Socios.scss"
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import * as Yup from "yup";
import { Field, FieldArray, Formik, useFormik, FormikProvider } from "formik";
import { Toast } from "primereact/toast";
import { InputNumber } from "primereact/inputnumber";

import { TabView, TabPanel } from "primereact/tabview";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog"; // For confirmDialog method
import { handleSoloNumeros } from "../../helpers/helpers";
import {RegistrarSocio,ObtenerSocio,ActualizarSocio} from "../../service/SocioService";
import {ObtenerPersonaResponsable} from "../../service/EmpresaService";

const EditarUsuario = () => {
  // console.log("Render de EditarUsuario");
  const navigate = useNavigate();
  const [tituloPagina, setTituloPagina] = useState("Crear Socio");
  const [modoEdicion, setModoEdicion] = useState(false);
  let { id } = useParams();
  const toast = useRef(null);
  const [socio, setSocio] = useState(null);
  const [mostrarInputPassword, setMostrarInputPassword] = useState(false);

  useEffect(() => {
    const getPersona = async () => {
      let idSocio = id;
      await ObtenerSocio({idSocio}).then((data) => {
        console.log("data",data);
        setTituloPagina("Datos del Socio");
        setSocio(data);
        setModoEdicion(true);
      });
    };
    if (id) getPersona();
  }, [id]);

 

   
   
  

    const schema = Yup.object().shape({
      razonSocial: Yup.string().required("Razon Social es un campo obligatorio"),
      codigo: Yup.string().required("Codigo es un campo obligatorio"),
      nombre: Yup.string().required("Nombre es un campo obligatorio"),
      nombreComercial: Yup.string().required("Nombre Comercial es un campo obligatorio"),
      numDocContribuyente: Yup.string().required("N° Documento de Contribuyente es un campo obligatorio"),
      direccion: Yup.string(),
      telefono1: Yup.string()
        .required("Teléfono es un campo obligatorio")
        .matches(/^\d+$/, "El teléfono solo debe contener números")
        .min(8, "El teléfono debe tener al menos 8 dígitos")
        .max(15, "El teléfono no puede exceder 15 dígitos"),
      telefono2: Yup.string()
        .required("Teléfono es un campo obligatorio")
        .matches(/^\d+$/, "El teléfono solo debe contener números")
        .min(8, "El teléfono debe tener al menos 8 dígitos")
        .max(15, "El teléfono no puede exceder 15 dígitos"),
      email: Yup.string(),

    });


    const formik = useFormik({
      enableReinitialize: true,
      initialValues: {
        razonSocial: socio ? socio.razonSocial : "",
        codigo: socio ? socio.codigo : "",
        nombre: socio ? socio.nombre : "",
        nombreComercial: socio ? socio.nombreComercial : "",
        numDocContribuyente: socio ? socio.numDocContribuyente : "",
        direccion: socio ? socio.direccion : "",
        telefono1: socio ? socio.telefono1 : "",
        telefono2: socio ? socio.telefono2 : "",
        email: socio ? socio.email : "",
        logo: socio ? socio.logo : "",
        usuarioRegistro:socio?.usuarioRegistro|| window.localStorage.getItem("username"), 
      },
      validationSchema: schema,
      onSubmit: (values) => {
      
          const data = {
            ...(modoEdicion && { id: socio.id }), 
            razonSocial: values.razonSocial,
            codigo: values.codigo,
            nombre: values.nombre,
            nombreComercial: values.nombreComercial,
            numDocContribuyente: values.numDocContribuyente,
            direccion: values.direccion,
            telefono1: values.telefono1,
            telefono2: values.telefono2,
            email: values.email,
            logo: values.logo,
            ...(modoEdicion
            ? { usuarioModificacion: window.localStorage.getItem("username") }
            : { usuarioRegistro: values.usuarioRegistro }),
                        
          };
           let jsonData = JSON.stringify(data,null,2);
        if (modoEdicion) {
          const idSocio = socio.id;
          Actualizar({ jsonData, idSocio });
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
    console.log("RegistrarSocio",jsonData)
    RegistrarSocio({ jsonData})
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

   const Actualizar = ({ jsonData,idSocio }) => {
        console.log("RegistrarUsuario",jsonData)

      ActualizarSocio({ jsonData, idSocio })
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

  const checkTransparency = (file) => {
    return new Promise((resolve) => {
      if (!['image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        resolve(false);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          try {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            // Check if there is any pixel with alpha < 255
            for (let i = 3; i < imgData.length; i += 4) {
              if (imgData[i] < 255) {
                resolve(true);
                return;
              }
            }
            resolve(false);
          } catch (e) {
            resolve(false);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.current.show({
          severity: "warn",
          summary: "Archivo muy grande",
          detail: "El tamaño máximo permitido es 2MB.",
          life: 4000
        });
        return;
      }
      
      const hasTransparency = await checkTransparency(file);
      if (!hasTransparency) {
        toast.current.show({
          severity: "error",
          summary: "Fondo no transparente",
          detail: "El logo debe ser una imagen con fondo transparente (formatos .png, .webp o .gif).",
          life: 6000
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        formik.setFieldValue("logo", reader.result);
      };
      reader.readAsDataURL(file);
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
              <label className="label-form">Código</label>
              <InputText
                type={"text"}
                id="codigo"
                name="codigo"
                placeholder="Escribe aquí"
                value={formik.values.codigo}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              ></InputText>
              <div className="p-error">
                {formik.touched.codigo && formik.errors.codigo}
              </div>
            </div>
             <div className="field col-12 md:col-6">
              <label className="label-form">Nombre</label>
              <InputText
                type={"text"}
                id="nombre"
                name="nombre"
                placeholder="Escribe aquí"
                value={formik.values.nombre}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              ></InputText>
              <div className="p-error">
                {formik.touched.nombre && formik.errors.nombre}
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
              <label className="label-form">N° Documento de Contribuyente</label>
              <InputText
                type={"text"}
                id="numDocContribuyente"
                name="numDocContribuyente"
                placeholder="Escribe aquí"
                value={formik.values.numDocContribuyente}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              ></InputText>
              <div className="p-error">
                {formik.touched.numDocContribuyente && formik.errors.numDocContribuyente}
              </div>
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
                <label className="label-form">Teléfono</label>
                <InputNumber
                  id="telefono1"
                  name="telefono1"
                  placeholder="Escribe aquí"
                  value={formik.values.telefono1}
                  onValueChange={(e) => handleSoloNumeros(e, formik, "telefono1")}
                  onChange={(e) => {
                    if (e.value == "-") {
                      formik.setFieldValue("telefono1", "");
                    }
                  }}
                  onBlur={formik.handleBlur}
                  useGrouping={false}
                  maxLength={9}
                  autoComplete={false}
                ></InputNumber>
                <small className="p-error">
                  {formik.touched.telefono1 && formik.errors.telefono1}
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
              <label className="label-form">Email</label>
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
              <label className="label-form">Logotipo (Imagen)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '8px',
                  border: '2px dashed #9198a7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  backgroundColor: '#f8f9fa'
                }}>
                  {formik.values.logo ? (
                    <img src={formik.values.logo} alt="Logo Socio" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <i className="pi pi-image" style={{ fontSize: '2rem', color: '#9198a7' }}></i>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="logo-upload"
                    style={{ display: 'none' }}
                    onChange={handleLogoChange}
                  />
                  <label htmlFor="logo-upload">
                    <span className="p-button p-component p-button-outlined" style={{
                      cursor: 'pointer',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      borderColor: '#0e71ae',
                      color: '#0e71ae',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      display: 'inline-block',
                      fontFamily: 'Poppins'
                    }}>
                      <i className="pi pi-upload" style={{ marginRight: '8px' }}></i> Seleccionar imagen
                    </span>
                  </label>
                  <small style={{ color: '#9198a7', marginTop: '2px', maxWidth: '250px', display: 'block', lineHeight: '1.2' }}>
                    * El logo debe tener fondo transparente (formatos .png, .webp, .gif) y pesar menos de 2MB.
                  </small>
                  {formik.values.logo && (
                    <Boton
                      label="Eliminar logo"
                      icon="pi pi-trash"
                      style={{ fontSize: 11, borderRadius: 8, padding: '6px 12px' }}
                      className="p-button-danger p-button-outlined"
                      onClick={() => formik.setFieldValue("logo", "")}
                      type="button"
                    />
                  )}
                </div>
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

export default EditarUsuario;
