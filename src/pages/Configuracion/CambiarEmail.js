// import React, { useEffect, useState, useRef } from "react";
// import {
//   Navigate,
//   useLocation,
//   useNavigate,
//   useParams,
// } from "react-router-dom";

// import DropdownDefault from "../../components/Dropdown/DropdownDefault";
// import * as Iconsax from "iconsax-react";
// import "./CambiarContraseña.scss"
// import { InputText } from "primereact/inputtext";
// import Boton from "../../components/Boton/Boton";

// import * as Yup from "yup";
// import { Field, FieldArray, Formik, useFormik, FormikProvider } from "formik";

// import { Toast } from "primereact/toast";

// import { Password } from "primereact/password";
// import { Checkbox } from "primereact/checkbox";

// import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
// import {ActualizarContraseña} from "../../service/UsuarioService";



// const CambiarEmail = () => {
//   const navigate = useNavigate();
//   const toast = useRef(null);
  
//   // Estados para validación de contraseña
//   const [passwordValidation, setPasswordValidation] = useState({
//     hasUpperCase: false,
//     hasLowerCase: false,
//     hasNumber: false,
//     hasMinLength: false,
//   });

//   const schema = Yup.object().shape({
//     passwordAnterior: Yup.string().required("Contraseña anterior es obligatoria"),
//     password: Yup.string()
//       .required("Nueva contraseña es obligatoria")
//       .min(8, "La contraseña debe tener al menos 8 caracteres")
//       .matches(/[a-z]/, "Debe contener al menos una letra minúscula")
//       .matches(/[A-Z]/, "Debe contener al menos una letra mayúscula")
//       .matches(/[0-9]/, "Debe contener al menos un número"),
//     confirmarPassword: Yup.string()
//       .required("Debe confirmar la contraseña")
//       .oneOf([Yup.ref('password')], "Las contraseñas no coinciden")
//   });

//   const formik = useFormik({
//     enableReinitialize: true,
//     initialValues: {
//       passwordAnterior: "",
//       password: "",
//       confirmarPassword: "",
//     },
//     validationSchema: schema,
//     onSubmit: (values) => {
//       const data = {
//             userId: Number(window.localStorage.getItem("idUser")),
//             currentPassword: values.passwordAnterior,
//             newPassword:values.password,
            
//           };
//       // Aquí va tu lógica para cambiar la contraseña
//       console.log("Cambiar contraseña:", values);
//       let jsonData = JSON.stringify(data,null,2);
//      Actualizar({ jsonData });

//       // toast.current.show({
//       //   severity: "success",
//       //   summary: "Éxito",
//       //   detail: "Contraseña cambiada exitosamente.",
//       //   life: 3000,
//       // });

//       // setTimeout(() => {
//       //   navigate(-1);
//       // }, 1000);
//     }
//   });

//   const Actualizar = ({ jsonData }) => {
//         ActualizarContraseña({ jsonData })
//           .then((data) => {
//             formik.setSubmitting(false);
//             toast.current.show({
//               severity: "success",
//               summary: "Éxito",
//               detail: "Contraseña cambiada exitosamente.",
//               life: 7000,
//             });
//              setTimeout(() => {
//             navigate(-1);
//           }, 1000);
    
//           })
//           .catch((errors) => {
//             toast.current.show({
//               severity: "error",
//               summary: "Error",
//               detail: errors.message,
//               life: 7000,
//             });
//             formik.setSubmitting(false);
//           });
//       };
//   // Validar contraseña en tiempo real
//   const validatePassword = (password) => {
//     setPasswordValidation({
//       hasUpperCase: /[A-Z]/.test(password),
//       hasLowerCase: /[a-z]/.test(password),
//       hasNumber: /[0-9]/.test(password),
//       hasMinLength: password.length >= 8,
//     });
//   };

//   // Manejar cambio de contraseña
//   const handlePasswordChange = (e) => {
//     const newPassword = e.target.value;
//     formik.setFieldValue('password', newPassword);
//     validatePassword(newPassword);
//   };

//   return (
//     <div className="zv-editarUsuario" style={{ paddingTop: 16 }}>
//       <ConfirmDialog />
//       <Toast ref={toast} position="top-center"></Toast>
//       <div className="header">
//         <span style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
//           <Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft>
//         </span>
//       </div>
//       <div className="header-titulo" style={{ marginTop: 16 }}>
//         Cambiar Correo
//       </div>
//       <div className="zv-editarUsuario-body" style={{ marginTop: 16 }}>
//         <form onSubmit={formik.handleSubmit}>
//           <div className="p-fluid formgrid grid">
//             <div className="field col-12 md:col-12">
//               <label className="label-form">Correo Anterior</label>
//               <Password
//                 id="passwordAnterior"
//                 name="passwordAnterior"
//                 placeholder="Escribe tu contraseña anterior"
//                 value={formik.values.passwordAnterior}
//                 onBlur={formik.handleBlur}
//                 onChange={(e) => formik.setFieldValue('passwordAnterior', e.target.value)}
//                 toggleMask
//                 feedback={false}
//               />
//               <div className="p-error">
//                 {formik.touched.passwordAnterior && formik.errors.passwordAnterior}
//               </div>
//             </div>

//             <div className="field col-12 md:col-6">
//               <label className="label-form">Nueva Correo</label>
//               <Password
//                 id="password"
//                 name="password"
//                 placeholder="Escribe tu nuevo Correo"
//                 value={formik.values.password}
//                 onBlur={formik.handleBlur}
//                 onChange={handlePasswordChange}
//                 toggleMask
//                 feedback={false}
//               />
//               <div className="p-error">
//                 {formik.touched.password && formik.errors.password}
//               </div>
              
//               {/* Requisitos de contraseña con checks */}
            
//             </div>
           
//           </div>

//           <div className="zv-editarUsuario-footer">
//             <Boton
//               label="Guardar cambios"
//               style={{ fontSize: 12 }}
//               color="primary"
//               type="submit"
//               loading={formik.isSubmitting}
//             ></Boton>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CambiarEmail;

import React, { useEffect, useState, useRef } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./CambiarContraseña.scss"
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";

import * as Yup from "yup";
import { Field, FieldArray, Formik, useFormik, FormikProvider } from "formik";

import { Toast } from "primereact/toast";

import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";

import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { EnviarCodigoVerificacion, ConfirmarEmail } from "../../service/UsuarioService";

const CambiarEmail = () => {
  const navigate = useNavigate();
  const toast = useRef(null);
  
  // Estados para control del flujo
  const [paso, setPaso] = useState(1); // 1: enviar código al correo actual, 2: ingresar nuevo email y código

  // Schema para el paso 1 (enviar código al correo actual)
  const schemaEnviarCodigo = Yup.object().shape({
    emailActual: Yup.string()
      .required("El correo actual es obligatorio")
      .email("Ingresa un correo válido")
  });

  // Schema para el paso 2 (confirmar con nuevo email y código)
  const schemaConfirmar = Yup.object().shape({
    nuevoEmail: Yup.string()
      .required("El nuevo correo es obligatorio")
      .email("Ingresa un correo válido"),
    codigo: Yup.string()
      .required("El código es obligatorio")
      .min(6, "El código debe tener al menos 6 caracteres")
  });

  // Formik para paso 1
  const formikEnviarCodigo = useFormik({
    enableReinitialize: true,
    initialValues: {
      emailActual: "",
    },
    validationSchema: schemaEnviarCodigo,
    onSubmit: (values) => {
      const data = {
        email: values.emailActual,
      };
      
      let jsonData = JSON.stringify(data, null, 2);
      EnviarCodigo({ jsonData });
    }
  });

  // Formik para paso 2
  const formikConfirmar = useFormik({
    enableReinitialize: true,
    initialValues: {
      nuevoEmail: "",
      codigo: "",
    },
    validationSchema: schemaConfirmar,
    onSubmit: (values) => {
      const data = {
        email: values.nuevoEmail,
        code: values.codigo,
      };
      
      let jsonData = JSON.stringify(data, null, 2);
      ConfirmarCodigo({ jsonData });
    }
  });

  // Función para enviar código de verificación al correo actual
  const EnviarCodigo = ({ jsonData }) => {
    EnviarCodigoVerificacion({ jsonData })
      .then((data) => {
        formikEnviarCodigo.setSubmitting(false);
        setPaso(2);
        toast.current.show({
          severity: "success",
          summary: "Código Enviado",
          detail: "Se ha enviado un código de verificación a tu correo actual.",
          life: 5000,
        });
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: error.message || "No se pudo enviar el código",
          life: 7000,
        });
        formikEnviarCodigo.setSubmitting(false);
      });
  };

  // Función para confirmar email con código
  const ConfirmarCodigo = ({ jsonData }) => {
    ConfirmarEmail({ jsonData })
      .then((data) => {
        formikConfirmar.setSubmitting(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Correo cambiado exitosamente.",
          life: 5000,
        });
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: error.message || "Código inválido o expirado",
          life: 7000,
        });
        formikConfirmar.setSubmitting(false);
      });
  };

  // Función para reenviar código
  const reenviarCodigo = () => {
    const data = {
      email: formikEnviarCodigo.values.emailActual,
    };
    
    let jsonData = JSON.stringify(data, null, 2);
    
    EnviarCodigoVerificacion({ jsonData })
      .then((data) => {
        toast.current.show({
          severity: "success",
          summary: "Código Reenviado",
          detail: "Se ha enviado un nuevo código de verificación.",
          life: 5000,
        });
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: error.message || "No se pudo reenviar el código",
          life: 7000,
        });
      });
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
        Validar Correo
      </div>
      <div className="zv-editarUsuario-body" style={{ marginTop: 16 }}>
        {/* PASO 1: Enviar código al correo actual */}
        {paso === 1 && (
          <form onSubmit={formikEnviarCodigo.handleSubmit}>
            <div className="p-fluid formgrid grid">
              <div className="field col-12 md:col-12">
                <label className="label-form">Correo Electrónico Actual</label>
                <InputText
                  id="emailActual"
                  name="emailActual"
                  placeholder="correo_actual@ejemplo.com"
                  value={formikEnviarCodigo.values.emailActual}
                  onBlur={formikEnviarCodigo.handleBlur}
                  onChange={(e) => formikEnviarCodigo.setFieldValue('emailActual', e.target.value)}
                />
                <div className="p-error">
                  {formikEnviarCodigo.touched.emailActual && formikEnviarCodigo.errors.emailActual}
                </div>
                <small className="p-text-secondary">
                  Enviaremos un código de verificación a este correo
                </small>
              </div>
            </div>

            <div className="zv-editarUsuario-footer">
              <Boton
                label="Enviar Código"
                style={{ fontSize: 12 }}
                color="primary"
                type="submit"
                loading={formikEnviarCodigo.isSubmitting}
              ></Boton>
            </div>
          </form>
        )}

        {/* PASO 2: Ingresar nuevo email y código de verificación */}
        {paso === 2 && (
          <form onSubmit={formikConfirmar.handleSubmit}>
            <div className="p-fluid formgrid grid">
              <div className="field col-12 md:col-12">
                <label className="label-form">Correo Electrónico</label>
                <InputText
                  id="nuevoEmail"
                  name="nuevoEmail"
                  placeholder="correo@ejemplo.com"
                  value={formikConfirmar.values.nuevoEmail}
                  onBlur={formikConfirmar.handleBlur}
                  onChange={(e) => formikConfirmar.setFieldValue('nuevoEmail', e.target.value)}
                />
                <div className="p-error">
                  {formikConfirmar.touched.nuevoEmail && formikConfirmar.errors.nuevoEmail}
                </div>
              </div>

              <div className="field col-12 md:col-12">
                <label className="label-form">Código de Verificación</label>
                <InputText
                  id="codigo"
                  name="codigo"
                  placeholder="Ingresa el código enviado a tu correo actual"
                  value={formikConfirmar.values.codigo}
                  onBlur={formikConfirmar.handleBlur}
                  onChange={(e) => formikConfirmar.setFieldValue('codigo', e.target.value)}
                />
                <div className="p-error">
                  {formikConfirmar.touched.codigo && formikConfirmar.errors.codigo}
                </div>
                <small className="p-text-secondary">
                  Revisa tu correo actual ({formikEnviarCodigo.values.emailActual})
                </small>
              </div>

              <div className="field col-12 md:col-12">
                <small 
                  style={{ cursor: 'pointer', color: '#3b82f6', textDecoration: 'underline' }}
                  onClick={reenviarCodigo}
                >
                  ¿No recibiste el código? Reenviar
                </small>
              </div>
            </div>

            <div className="zv-editarUsuario-footer" style={{ display: 'flex', gap: '10px' }}>
              <Boton
                label="Atrás"
                style={{ fontSize: 12 }}
                color="secondary"
                type="button"
                onClick={() => {
                  setPaso(1);
                  formikConfirmar.resetForm();
                }}
              ></Boton>
              <Boton
                label="Confirmar Cambio"
                style={{ fontSize: 12 }}
                color="primary"
                type="submit"
                loading={formikConfirmar.isSubmitting}
              ></Boton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CambiarEmail;