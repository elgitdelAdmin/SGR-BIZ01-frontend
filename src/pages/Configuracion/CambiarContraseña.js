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
import {ActualizarContraseña} from "../../service/UsuarioService";



const CambiarContraseña = () => {
  const navigate = useNavigate();
  const toast = useRef(null);
  
  // Estados para validación de contraseña
  const [passwordValidation, setPasswordValidation] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasMinLength: false,
  });

  const schema = Yup.object().shape({
    passwordAnterior: Yup.string().required("Contraseña anterior es obligatoria"),
    password: Yup.string()
      .required("Nueva contraseña es obligatoria")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .matches(/[a-z]/, "Debe contener al menos una letra minúscula")
      .matches(/[A-Z]/, "Debe contener al menos una letra mayúscula")
      .matches(/[0-9]/, "Debe contener al menos un número"),
    confirmarPassword: Yup.string()
      .required("Debe confirmar la contraseña")
      .oneOf([Yup.ref('password')], "Las contraseñas no coinciden")
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      passwordAnterior: "",
      password: "",
      confirmarPassword: "",
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const data = {
            userId: Number(window.localStorage.getItem("idUser")),
            currentPassword: values.passwordAnterior,
            newPassword:values.password,
            
          };
      // Aquí va tu lógica para cambiar la contraseña
      console.log("Cambiar contraseña:", values);
      let jsonData = JSON.stringify(data,null,2);
     Actualizar({ jsonData });

      // toast.current.show({
      //   severity: "success",
      //   summary: "Éxito",
      //   detail: "Contraseña cambiada exitosamente.",
      //   life: 3000,
      // });

      // setTimeout(() => {
      //   navigate(-1);
      // }, 1000);
    }
  });

  const Actualizar = ({ jsonData }) => {
        ActualizarContraseña({ jsonData })
          .then((data) => {
            formik.setSubmitting(false);
            toast.current.show({
              severity: "success",
              summary: "Éxito",
              detail: "Contraseña cambiada exitosamente.",
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
  // Validar contraseña en tiempo real
  const validatePassword = (password) => {
    setPasswordValidation({
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasMinLength: password.length >= 8,
    });
  };

  // Manejar cambio de contraseña
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    formik.setFieldValue('password', newPassword);
    validatePassword(newPassword);
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
        Cambiar Contraseña
      </div>
      <div className="zv-editarUsuario-body" style={{ marginTop: 16 }}>
        <form onSubmit={formik.handleSubmit}>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-12">
              <label className="label-form">Contraseña Anterior</label>
              <Password
                id="passwordAnterior"
                name="passwordAnterior"
                placeholder="Escribe tu contraseña anterior"
                value={formik.values.passwordAnterior}
                onBlur={formik.handleBlur}
                onChange={(e) => formik.setFieldValue('passwordAnterior', e.target.value)}
                toggleMask
                feedback={false}
              />
              <div className="p-error">
                {formik.touched.passwordAnterior && formik.errors.passwordAnterior}
              </div>
            </div>

            <div className="field col-12 md:col-6">
              <label className="label-form">Nueva Contraseña</label>
              <Password
                id="password"
                name="password"
                placeholder="Escribe tu nueva contraseña"
                value={formik.values.password}
                onBlur={formik.handleBlur}
                onChange={handlePasswordChange}
                toggleMask
                feedback={false}
              />
              <div className="p-error">
                {formik.touched.password && formik.errors.password}
              </div>
              
              {/* Requisitos de contraseña con checks */}
            
            </div>
              <div className="field col-12 md:col-6">
              <label className="label-form">Confirmar Nueva Contraseña</label>
              <Password
                id="confirmarPassword"
                name="confirmarPassword"
                placeholder="Confirma tu nueva contraseña"
                value={formik.values.confirmarPassword}
                onBlur={formik.handleBlur}
                onChange={(e) => formik.setFieldValue('confirmarPassword', e.target.value)}
                toggleMask
                feedback={false}
              />
              <div className="p-error">
                {formik.touched.confirmarPassword && formik.errors.confirmarPassword}
              </div>
            </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 8,
                  color: passwordValidation.hasMinLength ? '#22c55e' : '#64748b',
                  fontSize: '14px'
                }}>
                  <Checkbox 
                    checked={passwordValidation.hasMinLength} 
                    disabled
                    style={{ marginRight: 8 }}
                  />
                  <span>Mínimo 8 caracteres</span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 8,
                  color: passwordValidation.hasUpperCase ? '#22c55e' : '#64748b',
                  fontSize: '14px'
                }}>
                  <Checkbox 
                    checked={passwordValidation.hasUpperCase} 
                    disabled
                    style={{ marginRight: 8 }}
                  />
                  <span>Al menos una letra mayúscula</span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 8,
                  color: passwordValidation.hasLowerCase ? '#22c55e' : '#64748b',
                  fontSize: '14px'
                }}>
                  <Checkbox 
                    checked={passwordValidation.hasLowerCase} 
                    disabled
                    style={{ marginRight: 8 }}
                  />
                  <span>Al menos una letra minúscula</span>
                </div>

                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 8,
                  color: passwordValidation.hasNumber ? '#22c55e' : '#64748b',
                  fontSize: '14px'
                }}>
                  <Checkbox 
                    checked={passwordValidation.hasNumber} 
                    disabled
                    style={{ marginRight: 8 }}
                  />
                  <span>Al menos un número</span>
                </div>
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default CambiarContraseña;