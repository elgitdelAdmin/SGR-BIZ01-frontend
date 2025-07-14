import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import classNames from "classnames";
import * as Yup from "yup";
import 'primeicons/primeicons.css';
import useUsuario from "../../hooks/useUsuario";
import { useNavigate } from "react-router-dom";
import "../../components/Inicio/FormsEva.scss"
import "./Login.scss";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from 'primereact/password';
export default function Login() {

    const { isloginLoading,hasLoginError,login, isLogged } = useUsuario();
    const navigate = useNavigate();
    useEffect(() => {
        if (isLogged)
        {
            navigate("/Dashboard/Dashboard")
        }
    }, [isLogged]);

    const handleSubmit = (e) =>{
        e.preventDefault()
    };
    const schema = Yup.object().shape({
        username: Yup.string().required("El código de colaborador es un campo obligatorio"),
        password: Yup.string().required("Contraseña es un campo obligatorio").min(4, "La contraseña debe tener al menos 4 caracteres"),
    });
    const [passwordType, setpasswordType] = useState("password");
    const togglePassword = () => {
        if (passwordType === "password") {
            setpasswordType("text");
            return;
        }
        setpasswordType("password");
    };

    const Logarse = async (userName, password, setSubmitting) => {
    await login({ userName, password }, (success) => {
        setSubmitting(false);
        if (success) navigate("/Dashboard/Dashboard"); 
    });
   }

    return (
        <>
        
            <Formik
                enableReinitialize
                validationSchema={schema}
                initialValues={{ username: "", password: "" }}
                onSubmit={(values,{ setSubmitting }) => {
                    let userName = values.username;
                    let password = values.password;
                    Logarse(userName,password,setSubmitting)
                   
                }}
            >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting,setSubmitting }) => (
                    <form onSubmit={handleSubmit}>
                        <div style={{background:"#f2f2f2",display:"flex",justifyContent:"center",minHeight:"100vh",alignItems:"center"}}>
                            <div className="card contentLogin">
                                <div className="text-center ">
                                    <img src="images/fondo.jpg" alt="hyper" className="imgResponsive" />
                                </div>
                                <div className="form-login">
                                {
                                    hasLoginError && <p className="error">Credenciales no validas</p>

                                }
                                </div>
                                <div className="login-container">
                                    <div className="login-left">
                                        <img
                                        src="images/bizlogo.jpg"
                                        style={{ width: '30%', maxHeight: '120px', objectFit: 'contain', marginBottom: '20px' }}
                                        />
                                        <img
                                        src="images/bizletra.png"
                                        style={{ width: '30%', maxHeight: '120px', objectFit: 'contain' }}
                                        />
                                    </div>

                                    <div className="login-right">
                                          <div className="login-form-wrapper">
                                            <div className="p-fluid formgrid grid form-login" >
                                                <div className="field col-12 md:col-12">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <img
                                                            src="images/correo.png"
                                                            alt="icono"
                                                            style={{ width: 34, height: 34 }}
                                                        />
                                                        <InputText
                                                            id="CodigoColaborador"
                                                            type="text"
                                                            placeholder="Escribe aquí"
                                                            name="username"
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            className={classNames({ 'p-invalid': touched.username && errors.username })}
                                                            style={{ flex: 1 }}
                                                        />
                                                    </div>
                                                    <small className="p-error">{errors.username && touched.username && errors.username}</small>
                                                </div>
                                                <div className="field col-12 md:col-12">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <img
                                                        src="images/contraseña.png"
                                                        alt="clave"
                                                        style={{ width: 34, height: 34 }}
                                                    />
                                                    <Password
                                                        id="Password"
                                                        name="password"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        className={classNames({ 'p-invalid': touched.password && errors.password })}
                                                        placeholder="Escribe aquí"
                                                        toggleMask
                                                        feedback={false}
                                                        style={{ flex: 1 }}
                                                    />
                                                    </div>
                                                    <small className="p-error">{errors.password && touched.password && errors.password}</small>
                                                </div>
                                            </div>

                                            <div className="form-footer" >
                                                <Button
                                                label="Iniciar sesión"
                                                style={{ background: "#404BD9", fontSize: 14, width: 160,height:90, borderRadius: 6 }}
                                                loading={isSubmitting}
                                                />
                                            </div>
                                        </div>
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

//export default Login;
