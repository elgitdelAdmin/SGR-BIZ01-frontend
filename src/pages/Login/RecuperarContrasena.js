import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import classNames from "classnames";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import * as Iconsax from "iconsax-react";
import "./Login.scss";

export default function RecuperarContrasena() {
  const navigate = useNavigate();
  const toast = useRef(null);
  const [emailEnviado, setEmailEnviado] = useState(false);

  const schema = Yup.object().shape({
    email: Yup.string()
      .email("Ingresa un correo electrónico válido")
      .required("El correo electrónico es obligatorio"),
  });

  const enviarCorreoRecuperacion = async (email, setSubmitting) => {
    try {
      // Aquí iría tu llamada al servicio para enviar el correo
      // await RecuperarContrasenaService({ email });
      
      // Simulación de llamada al servicio
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setEmailEnviado(true);
      toast.current.show({
        severity: "success",
        summary: "Correo enviado",
        detail: "Se ha enviado un enlace de recuperación a tu correo electrónico.",
        life: 5000,
      });

      setSubmitting(false);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "No se pudo enviar el correo de recuperación.",
        life: 5000,
      });
      setSubmitting(false);
    }
  };

  return (
    <>
      <Toast ref={toast} position="top-center" />
      <Formik
        enableReinitialize
        validationSchema={schema}
        initialValues={{ email: "" }}
        onSubmit={(values, { setSubmitting }) => {
          enviarCorreoRecuperacion(values.email, setSubmitting);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                background: "#f2f2f2",
                display: "flex",
                justifyContent: "center",
                minHeight: "100vh",
                alignItems: "center",
              }}
            >
              <div className="card contentLogin" style={{ maxWidth: "600px" }}>
                <div className="text-center">
                  <img
                    src="images/fondo.jpg"
                    alt="hyper"
                    className="imgResponsive"
                  />
                </div>

                <div className="login-container">
                  <div
                    style={{
                      width: "100%",
                      padding: "40px 30px",
                    }}
                  >
                    {/* Botón de regresar */}
                    <div style={{ marginBottom: "20px" }}>
                      <span
                        style={{ cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                        onClick={() => navigate(-1)}
                      >
                        <Iconsax.ArrowLeft size={24} color="#404BD9" />
                        <span style={{ marginLeft: "8px", color: "#404BD9", fontSize: "14px" }}>
                          Volver al inicio de sesión
                        </span>
                      </span>
                    </div>

                    {/* Encabezado */}
                    <div style={{ textAlign: "center", marginBottom: "30px" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
                        <img
                          src="images/bizlogo.jpg"
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "contain",
                          }}
                          alt="logo"
                        />
                      </div>
                      <h2
                        style={{
                          color: "#333",
                          fontSize: "24px",
                          fontWeight: "600",
                          marginBottom: "10px",
                        }}
                      >
                        {emailEnviado ? "Revisa tu correo" : "Recuperar Contraseña"}
                      </h2>
                      <p
                        style={{
                          color: "#666",
                          fontSize: "14px",
                          lineHeight: "1.5",
                        }}
                      >
                        {emailEnviado
                          ? "Te hemos enviado un enlace para restablecer tu contraseña. Por favor revisa tu bandeja de entrada y spam."
                          : "Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña."}
                      </p>
                    </div>

                    {!emailEnviado ? (
                      <>
                        {/* Formulario */}
                        <div className="p-fluid formgrid grid">
                          <div className="field col-12">
                            <label
                              htmlFor="email"
                              style={{
                                display: "block",
                                marginBottom: "8px",
                                color: "#333",
                                fontSize: "14px",
                                fontWeight: "500",
                              }}
                            >
                              Correo Electrónico
                            </label>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <img
                                src="images/correo.png"
                                alt="icono"
                                style={{ width: 34, height: 34 }}
                              />
                              <InputText
                                id="email"
                                type="email"
                                placeholder="tucorreo@ejemplo.com"
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={classNames({
                                  "p-invalid": touched.email && errors.email,
                                })}
                                style={{ flex: 1 }}
                              />
                            </div>
                            <small className="p-error">
                              {errors.email && touched.email && errors.email}
                            </small>
                          </div>
                        </div>

                        {/* Botón de enviar */}
                        <div style={{ marginTop: "20px" }}>
                          <Button
                            label="Enviar enlace de recuperación"
                            style={{
                              background: "#404BD9",
                              fontSize: 14,
                              width: "100%",
                              height: 50,
                              borderRadius: 6,
                              border: "none",
                            }}
                            loading={isSubmitting}
                            type="submit"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Mensaje de éxito */}
                        <div
                          style={{
                            textAlign: "center",
                            padding: "30px 20px",
                          }}
                        >
                          <div
                            style={{
                              width: "80px",
                              height: "80px",
                              borderRadius: "50%",
                              background: "#e8f5e9",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              margin: "0 auto 20px",
                            }}
                          >
                            <Iconsax.TickCircle size={50} color="#22c55e" />
                          </div>
                          <p
                            style={{
                              color: "#666",
                              fontSize: "14px",
                              marginBottom: "20px",
                            }}
                          >
                            Si no recibes el correo en los próximos minutos, verifica tu carpeta de spam o intenta nuevamente.
                          </p>
                          <Button
                            label="Volver al inicio de sesión"
                            style={{
                              background: "#404BD9",
                              fontSize: 14,
                              width: "100%",
                              height: 50,
                              borderRadius: 6,
                              border: "none",
                            }}
                            onClick={() => navigate(-1)}
                          />
                        </div>
                      </>
                    )}

                    {/* Información adicional */}
                    {!emailEnviado && (
                      <div
                        style={{
                          marginTop: "30px",
                          padding: "15px",
                          background: "#f8f9fa",
                          borderRadius: "6px",
                          border: "1px solid #e9ecef",
                        }}
                      >
                        <p
                          style={{
                            color: "#666",
                            fontSize: "13px",
                            margin: 0,
                            lineHeight: "1.6",
                          }}
                        >
                          <strong>Nota:</strong> El enlace de recuperación expirará en 24 horas. Si no recibes el correo, verifica que la dirección sea correcta o contacta con soporte.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </>
  );
}