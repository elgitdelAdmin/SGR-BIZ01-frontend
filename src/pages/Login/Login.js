// import React, { useEffect, useState } from "react";
// import { Formik } from "formik";
// import classNames from "classnames";
// import * as Yup from "yup";
// import 'primeicons/primeicons.css';
// import useUsuario from "../../hooks/useUsuario";
// import { useNavigate } from "react-router-dom";
// import "../../components/Inicio/FormsEva.scss"
// import "./Login.scss";
// import { Button } from "primereact/button";
// import { InputText } from "primereact/inputtext";
// import { Password } from 'primereact/password';
// export default function Login() {
//     const [showUserMenu, setShowUserMenu] = useState(false);

//     const { isloginLoading,hasLoginError,login, isLogged } = useUsuario();
//     const navigate = useNavigate();
//     useEffect(() => {
//         if (isLogged)
//         {
//             navigate("/Dashboard/Dashboard")
//         }
//     }, [isLogged]);

//     const handleSubmit = (e) =>{
//         e.preventDefault()
//     };
//     const schema = Yup.object().shape({
//         username: Yup.string().required("El código de colaborador es un campo obligatorio"),
//         password: Yup.string().required("Contraseña es un campo obligatorio").min(4, "La contraseña debe tener al menos 4 caracteres"),
//     });
//     const [passwordType, setpasswordType] = useState("password");
//     const togglePassword = () => {
//         if (passwordType === "password") {
//             setpasswordType("text");
//             return;
//         }
//         setpasswordType("password");
//     };

//     const Logarse = async (userName, password, setSubmitting) => {
//     await login({ userName, password }, (success) => {
//         setSubmitting(false);
//         if (success) navigate("/Dashboard/Dashboard"); 
//     });
//    }
//    const handleChangePassword = () => {
//     console.log("Hola")
//         // setShowUserMenu(false);
//         // navigate("/Configuracion/CambiarContraseña"); // Cambia esta ruta según tu aplicación
//     };

//     return (
//         <>
        
//             <Formik
//                 enableReinitialize
//                 validationSchema={schema}
//                 initialValues={{ username: "", password: "" }}
//                 onSubmit={(values,{ setSubmitting }) => {
//                     let userName = values.username;
//                     let password = values.password;
//                     Logarse(userName,password,setSubmitting)
                   
//                 }}
//             >
//                 {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting,setSubmitting }) => (
//                     <form onSubmit={handleSubmit}>
//                         <div style={{background:"#f2f2f2",display:"flex",justifyContent:"center",minHeight:"100vh",alignItems:"center"}}>
//                             <div className="card contentLogin">
//                                 <div className="text-center ">
//                                     <img src="images/fondo.jpg" alt="hyper" className="imgResponsive" />
//                                 </div>
//                                 <div className="form-login">
//                                 {
//                                     hasLoginError && <p className="error">Credenciales no validas</p>

//                                 }
//                                 </div>
//                                 <div className="login-container">
//                                     <div className="login-left">
//                                         <img
//                                         src="images/bizlogo.jpg"
//                                         style={{ width: '30%', maxHeight: '120px', objectFit: 'contain', marginBottom: '20px' }}
//                                         />
//                                         <img
//                                         src="images/bizletra.png"
//                                         style={{ width: '30%', maxHeight: '120px', objectFit: 'contain' }}
//                                         />
//                                     </div>

//                                     <div className="login-right">
//                                           <div className="login-form-wrapper">
//                                             <div className="p-fluid formgrid grid form-login" >
//                                                 <div className="field col-12 md:col-12">
//                                                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                                                         <img
//                                                             src="images/correo.png"
//                                                             alt="icono"
//                                                             style={{ width: 34, height: 34 }}
//                                                         />
//                                                         <InputText
//                                                             id="CodigoColaborador"
//                                                             type="text"
//                                                             placeholder="Escribe aquí"
//                                                             name="username"
//                                                             onChange={handleChange}
//                                                             onBlur={handleBlur}
//                                                             className={classNames({ 'p-invalid': touched.username && errors.username })}
//                                                             style={{ flex: 1 }}
//                                                         />
//                                                     </div>
//                                                     <small className="p-error">{errors.username && touched.username && errors.username}</small>
//                                                 </div>
//                                                 <div className="field col-12 md:col-12">
//                                                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                                                     <img
//                                                         src="images/contraseña.png"
//                                                         alt="clave"
//                                                         style={{ width: 34, height: 34 }}
//                                                     />
//                                                     <Password
//                                                         id="Password"
//                                                         name="password"
//                                                         onChange={handleChange}
//                                                         onBlur={handleBlur}
//                                                         className={classNames({ 'p-invalid': touched.password && errors.password })}
//                                                         placeholder="Escribe aquí"
//                                                         toggleMask
//                                                         feedback={false}
//                                                         style={{ flex: 1 }}
//                                                     />
//                                                     </div>
//                                                     <small className="p-error">{errors.password && touched.password && errors.password}</small>
//                                                 </div>
//                                                    <div className="field col-12 md:col-12" style={{ textAlign: 'right', marginTop: '-10px' }}>
//                                                     <a 
//                                                         href="#" 
//                                                         onClick={handleChangePassword}
//                                                         style={{ 
//                                                             color: '#404BD9', 
//                                                             textDecoration: 'none',
//                                                             fontSize: '13px',
//                                                             fontWeight: '500'
//                                                         }}
//                                                     >
//                                                         ¿Olvidaste tu contraseña?
//                                                     </a>
//                                             </div>
//                                             </div>
                                         
                                            
//                                             <div className="form-footer" >
//                                                 <Button
//                                                 label="Iniciar sesión QA"
//                                                 style={{ background: "#404BD9", fontSize: 14, width: 160,height:90, borderRadius: 6 }}
//                                                 loading={isSubmitting}
//                                                 />
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </form>
//                 )}
//             </Formik>
//         </>
//     );
// }

// //export default Login;
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Formik, useFormik } from "formik";
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
import { Dialog } from 'primereact/dialog';
import { Toast } from "primereact/toast";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import {EnviarCorreo,RecuperarContraseña} from "../../service/LoginService";

export default function Login() {
    const [showRecuperarDialog, setShowRecuperarDialog] = useState(false);
    const [pasoActual, setPasoActual] = useState(1); // 1: Email, 2: Código, 3: Nueva contraseña
    const [emailRecuperacion, setEmailRecuperacion] = useState("");
    const toast = useRef(null);

    // Estados para login multi-rol/multi-socio
    const [showRolSocioDialog, setShowRolSocioDialog] = useState(false);
    const [rolSociosDisponibles, setRolSociosDisponibles] = useState([]);
    const [selectedSocio, setSelectedSocio] = useState(null);
    const [selectedRol, setSelectedRol] = useState(null);
    const [tempToken, setTempToken] = useState("");
    const [idUser, setIdUser] = useState(null);
    const [loginErrorMsg, setLoginErrorMsg] = useState("");

    // Obtener socios únicos a partir de rolSociosDisponibles
    const sociosOptions = useMemo(() => {
        const unique = [];
        const map = new Map();
        rolSociosDisponibles.forEach(item => {
            if (!map.has(item.idSocio)) {
                const s = { id: item.idSocio, nombre: item.socioNombre };
                map.set(item.idSocio, s);
                unique.push(s);
            }
        });
        return unique;
    }, [rolSociosDisponibles]);

    // Obtener roles filtrados por el socio seleccionado
    const rolesOptions = useMemo(() => {
        if (!selectedSocio) return [];
        return rolSociosDisponibles
            .filter(item => item.idSocio === selectedSocio.id)
            .map(item => ({ id: item.idRol, nombre: item.rolNombre, codigo: item.rolCodigo }));
    }, [selectedSocio, rolSociosDisponibles]);

    const showRolField = useMemo(() => {
        if (!selectedSocio) return false;
        return !rolesOptions.some(r => r.codigo === "ADMIN");
    }, [selectedSocio, rolesOptions]);

    const handleSocioChange = (e) => {
        const socio = e.value;
        setSelectedSocio(socio);
        // Filtrar y pre-seleccionar el primer rol disponible para este socio
        const filtered = rolSociosDisponibles
            .filter(item => item.idSocio === (socio ? socio.id : null))
            .map(item => ({ id: item.idRol, nombre: item.rolNombre, codigo: item.rolCodigo }));
        
        const adminRol = filtered.find(r => r.codigo === "ADMIN");
        if (adminRol) {
            setSelectedRol(adminRol);
        } else if (filtered.length > 0) {
            setSelectedRol(filtered[0]);
        } else {
            setSelectedRol(null);
        }
    };

    // Estados para validación de contraseña
    const [passwordValidation, setPasswordValidation] = useState({
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasMinLength: false,
    });

    const { isloginLoading, hasLoginError, login, completarLogin, isLogged } = useUsuario();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLogged) {
            navigate("/Dashboard/Dashboard")
        }
    }, [isLogged]);

    const handleSubmit = (e) => {
        e.preventDefault()
    };

    const schema = Yup.object().shape({
        username: Yup.string().required("El código de colaborador es un campo obligatorio"),
        password: Yup.string().required("Contraseña es un campo obligatorio").min(4, "La contraseña debe tener al menos 4 caracteres"),
    });

    // Schema para el paso 1: Email
    const schemaEmail = Yup.object().shape({
        email: Yup.string()
            .email("Ingresa un correo electrónico válido")
            .required("El correo electrónico es obligatorio"),
    });

    // Schema para el paso 2: Código
    const schemaCodigo = Yup.object().shape({
        codigo: Yup.string()
            .required("El código es obligatorio")
            .matches(/^\d{6}$/, "El código debe tener 6 dígitos")
            .length(6, "El código debe tener 6 dígitos"),
    });

    // Schema para el paso 3: Nueva contraseña
    const schemaNuevaPassword = Yup.object().shape({
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

    const [passwordType, setpasswordType] = useState("password");
    const togglePassword = () => {
        if (passwordType === "password") {
            setpasswordType("text");
            return;
        }
        setpasswordType("password");
    };

    const Logarse = async (userName, password, setSubmitting) => {
        setLoginErrorMsg("");
        try {
            const res = await login({ userName, password });
            setSubmitting(false);
            if (res.requiereSeleccionRol) {
                const available = res.rolSociosDisponibles || [];
                setRolSociosDisponibles(available);
                setTempToken(res.accessToken);
                setIdUser(res.user.id);

                // Opción 3: Si solo hay una combinación disponible, ingresar directo
                if (available.length === 1) {
                    const single = available[0];
                    await completarLogin({
                        idUser: res.user.id,
                        idRol: single.idRol,
                        idSocio: single.idSocio,
                        tempToken: res.accessToken
                    });
                    navigate("/Dashboard/Dashboard");
                    return;
                }

                setShowRolSocioDialog(true);
            } else {
                navigate("/Dashboard/Dashboard");
            }
        } catch (err) {
            setSubmitting(false);
            setLoginErrorMsg(err.message || "Credenciales no válidas");
            toast.current?.show({
                severity: "error",
                summary: "Error de autenticación",
                detail: err.message || "Credenciales no válidas",
                life: 5000
            });
        }
    }

    const handleSeleccionarOpcion = async (item) => {
        try {
            await completarLogin({
                idUser,
                idRol: item.idRol,
                idSocio: item.idSocio,
                tempToken
            });
            setShowRolSocioDialog(false);
            navigate("/Dashboard/Dashboard");
        } catch (err) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: err.message || "No se pudo completar la selección de rol.",
                life: 5000
            });
        }
    }

    // Formik para paso 1: Email
    const formikEmail = useFormik({
        initialValues: { email: "" },
        validationSchema: schemaEmail,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                  const data = {
                    email: values.email
                }
                let jsonData = JSON.stringify(data,null,2);
                 await EnviarCorreo({ jsonData });

                // Simulación
                //await new Promise((resolve) => setTimeout(resolve, 1500));

                setEmailRecuperacion(values.email);
                setPasoActual(2);

                toast.current?.show({
                    severity: "success",
                    summary: "Código enviado",
                    detail: "Se ha enviado un código de 6 dígitos a tu correo.",
                    life: 5000,
                });

                setSubmitting(false);

            } catch (error) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: error.message || "No se pudo enviar el código.",
                    life: 5000,
                });
                setSubmitting(false);
            }
        }
    });


    const formikCodigo = useFormik({
        initialValues: { codigo: "" },
        validationSchema: schemaCodigo,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                // await VerificarCodigoService({ email: emailRecuperacion, codigo: values.codigo });
                
               await new Promise((resolve) => setTimeout(resolve, 1500));

                setPasoActual(3);

                toast.current?.show({
                    severity: "success",
                    summary: "Código verificado",
                    detail: "Ahora puedes establecer tu nueva contraseña.",
                    life: 3000,
                });

                setSubmitting(false);

            } catch (error) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: error.message || "Código incorrecto o expirado.",
                    life: 5000,
                });
                setSubmitting(false);
            }
        }
    });

    // Formik para paso 3: Nueva contraseña
    const formikNuevaPassword = useFormik({
        initialValues: { password: "", confirmarPassword: "" },
        validationSchema: schemaNuevaPassword,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                // await ActualizarPasswordService({ 
                //     email: emailRecuperacion, 
                //     codigo: formikCodigo.values.codigo,
                //     nuevaPassword: values.password 
                // });

                // Simulación
                //await new Promise((resolve) => setTimeout(resolve, 1500));
                const data = {
                    token: formikCodigo.values.codigo,
                    newPassword: values.password 
                }
                let jsonData = JSON.stringify(data,null,2);
                 await RecuperarContraseña({ jsonData });
                toast.current?.show({
                    severity: "success",
                    summary: "Contraseña actualizada",
                    detail: "Tu contraseña ha sido cambiada exitosamente.",
                    life: 5000,
                });

                setSubmitting(false);

                // Cerrar dialog y resetear
                setTimeout(() => {
                    handleCloseDialog();
                }, 2000);

            } catch (error) {
                toast.current?.show({
                    severity: "error",
                    summary: "Error",
                    detail: error.message || "No se pudo actualizar la contraseña.",
                    life: 5000,
                });
                setSubmitting(false);
            }
        }
    });

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
        formikNuevaPassword.setFieldValue('password', newPassword);
        validatePassword(newPassword);
    };

    const handleOpenRecuperarDialog = (e) => {
        e.preventDefault();
        setShowRecuperarDialog(true);
        setPasoActual(1);
        formikEmail.resetForm();
        formikCodigo.resetForm();
        formikNuevaPassword.resetForm();
        setPasswordValidation({
            hasUpperCase: false,
            hasLowerCase: false,
            hasNumber: false,
            hasMinLength: false,
        });
    };

    const handleCloseDialog = () => {
        setShowRecuperarDialog(false);
        setPasoActual(1);
        formikEmail.resetForm();
        formikCodigo.resetForm();
        formikNuevaPassword.resetForm();
        setEmailRecuperacion("");
        setPasswordValidation({
            hasUpperCase: false,
            hasLowerCase: false,
            hasNumber: false,
            hasMinLength: false,
        });
    };

    const handleReenviarCodigo = async () => {
        try {
            // Aquí iría tu llamada al servicio
            // await EnviarCodigoRecuperacionService({ email: emailRecuperacion });

            await new Promise((resolve) => setTimeout(resolve, 1000));

            toast.current?.show({
                severity: "success",
                summary: "Código reenviado",
                detail: "Se ha enviado un nuevo código a tu correo.",
                life: 3000,
            });
        } catch (error) {
            toast.current?.show({
                severity: "error",
                summary: "Error",
                detail: "No se pudo reenviar el código.",
                life: 3000,
            });
        }
    };

    const getDialogHeader = () => {
        switch (pasoActual) {
            case 1:
                return "Recuperar Contraseña";
            case 2:
                return "Verificar Código";
            case 3:
                return "Nueva Contraseña";
            default:
                return "Recuperar Contraseña";
        }
    };

    return (
        <>
            <Toast ref={toast} position="top-center" />

            {/* Dialog de Selección de Rol + Socio - Tarjetas */}
            <Dialog
                header={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#d0e5f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="pi pi-user" style={{ color: '#0e71ae', fontSize: '16px' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#2e4878', fontFamily: "'Poppins', sans-serif" }}>¿Cómo deseas ingresar?</div>
                            <div style={{ fontSize: '12px', fontWeight: '400', color: '#9198a7', fontFamily: "'Inter', sans-serif", marginTop: '2px' }}>Selecciona una opción para continuar</div>
                        </div>
                    </div>
                }
                visible={showRolSocioDialog}
                style={{ width: '460px' }}
                onHide={() => setShowRolSocioDialog(false)}
                closable={true}
                draggable={true}
                resizable={false}
                pt={{ header: { style: { borderBottom: '1px solid #eef0f5', paddingBottom: '16px' } } }}
            >
                <div style={{ padding: '16px 0 4px' }}>
                    {/* Agrupar por Socio */}
                    {(() => {
                        const grupos = new Map();
                        rolSociosDisponibles.forEach(item => {
                            if (!grupos.has(item.idSocio)) {
                                grupos.set(item.idSocio, { socioNombre: item.socioNombre, roles: [] });
                            }
                            grupos.get(item.idSocio).roles.push(item);
                        });
                        return Array.from(grupos.entries()).map(([idSocio, grupo]) => (
                            <div key={idSocio} style={{ marginBottom: '16px' }}>
                                {/* Encabezado del Socio */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                    <i className="pi pi-building" style={{ color: '#0e71ae', fontSize: '13px' }} />
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#0e71ae', fontFamily: "'Poppins', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {grupo.socioNombre}
                                    </span>
                                    <div style={{ flex: 1, height: '1px', background: '#d0e5f0' }} />
                                </div>
                                {/* Roles como botones */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {grupo.roles.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSeleccionarOpcion(item)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '12px 14px',
                                                border: '1.5px solid #d0e5f0',
                                                borderRadius: '10px',
                                                background: '#ffffff',
                                                cursor: 'pointer',
                                                width: '100%',
                                                textAlign: 'left',
                                                transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.borderColor = '#0e71ae';
                                                e.currentTarget.style.boxShadow = '0 3px 10px rgba(14,113,174,0.12)';
                                                e.currentTarget.style.background = '#f5fafd';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.borderColor = '#d0e5f0';
                                                e.currentTarget.style.boxShadow = 'none';
                                                e.currentTarget.style.background = '#ffffff';
                                            }}
                                        >
                                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#d0e5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <i className="pi pi-id-card" style={{ color: '#0e71ae', fontSize: '16px' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#2e4878', fontFamily: "'Poppins', sans-serif" }}>
                                                    {item.rolNombre}
                                                </div>
                                            </div>
                                            <i className="pi pi-chevron-right" style={{ color: '#0e71ae', fontSize: '13px', flexShrink: 0 }} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ));
                    })()}
                </div>
            </Dialog>

            {/* Dialog de Recuperar Contraseña */}
            <Dialog
                header={getDialogHeader()}
                visible={showRecuperarDialog}
                style={{ width: '500px' }}
                onHide={handleCloseDialog}
                draggable={false}
                resizable={false}
            >
                {/* PASO 1: INGRESAR EMAIL */}
                {pasoActual === 1 && (
                    <form onSubmit={formikEmail.handleSubmit}>
                        <div style={{ padding: '10px 0' }}>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                                Ingresa tu correo electrónico y te enviaremos un código de verificación.
                            </p>

                            <div className="p-fluid">
                                <div className="field">
                                    <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Correo Electrónico
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                                            value={formikEmail.values.email}
                                            onChange={formikEmail.handleChange}
                                            onBlur={formikEmail.handleBlur}
                                            className={classNames({
                                                'p-invalid': formikEmail.touched.email && formikEmail.errors.email
                                            })}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                    <small className="p-error">
                                        {formikEmail.touched.email && formikEmail.errors.email}
                                    </small>
                                </div>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <Button
                                    label="Cancelar"
                                    type="button"
                                    onClick={handleCloseDialog}
                                    className="p-button-text"
                                    style={{ color: '#666' }}
                                />
                                <Button
                                    label="Enviar código"
                                    type="submit"
                                    style={{ background: "#0e71ae", border: "none" }}
                                    loading={formikEmail.isSubmitting}
                                />
                            </div>
                        </div>
                    </form>
                )}

                {/* PASO 2: INGRESAR CÓDIGO */}
                {pasoActual === 2 && (
                    <form onSubmit={formikCodigo.handleSubmit}>
                        <div style={{ padding: '10px 0' }}>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                                Hemos enviado un código de 6 dígitos a <strong>{emailRecuperacion}</strong>
                            </p>

                            <div className="p-fluid">
                                <div className="field">
                                    <label htmlFor="codigo" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Código de Verificación
                                    </label>
                                    <InputText
                                        id="codigo"
                                        type="text"
                                        placeholder="000000"
                                        name="codigo"
                                        value={formikCodigo.values.codigo}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            formikCodigo.setFieldValue('codigo', value);
                                        }}
                                        onBlur={formikCodigo.handleBlur}
                                        className={classNames({
                                            'p-invalid': formikCodigo.touched.codigo && formikCodigo.errors.codigo
                                        })}
                                        maxLength={6}
                                        style={{ 
                                            fontSize: '24px', 
                                            textAlign: 'center', 
                                            letterSpacing: '10px',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                    <small className="p-error">
                                        {formikCodigo.touched.codigo && formikCodigo.errors.codigo}
                                    </small>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleReenviarCodigo();
                                    }}
                                    style={{
                                        color: '#0e71ae',
                                        textDecoration: 'none',
                                        fontSize: '13px',
                                        fontWeight: '500'
                                    }}
                                >
                                    ¿No recibiste el código? Reenviar
                                </a>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <Button
                                    label="Atrás"
                                    type="button"
                                    onClick={() => setPasoActual(1)}
                                    className="p-button-text"
                                    style={{ color: '#666' }}
                                />
                                <Button
                                    label="Verificar"
                                    type="submit"
                                    style={{ background: "#0e71ae", border: "none" }}
                                    loading={formikCodigo.isSubmitting}
                                />
                            </div>
                        </div>
                    </form>
                )}

                {/* PASO 3: NUEVA CONTRASEÑA */}
                {pasoActual === 3 && (
                    <form onSubmit={formikNuevaPassword.handleSubmit}>
                        <div style={{ padding: '10px 0' }}>
                            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                                Ingresa tu nueva contraseña. Asegúrate de que sea segura.
                            </p>

                            <div className="p-fluid">
                                <div className="field">
                                    <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Nueva Contraseña
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img
                                            src="images/contraseña.png"
                                            alt="clave"
                                            style={{ width: 34, height: 34 }}
                                        />
                                        <Password
                                            id="password"
                                            name="password"
                                            placeholder="Escribe tu nueva contraseña"
                                            value={formikNuevaPassword.values.password}
                                            onBlur={formikNuevaPassword.handleBlur}
                                            onChange={handlePasswordChange}
                                            toggleMask
                                            feedback={false}
                                            className={classNames({
                                                'p-invalid': formikNuevaPassword.touched.password && formikNuevaPassword.errors.password
                                            })}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                    <small className="p-error">
                                        {formikNuevaPassword.touched.password && formikNuevaPassword.errors.password}
                                    </small>
                                </div>
 <div className="field">
                                    <label htmlFor="confirmarPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Confirmar Contraseña
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img
                                            src="images/contraseña.png"
                                            alt="clave"
                                            style={{ width: 34, height: 34 }}
                                        />
                                        <Password
                                            id="confirmarPassword"
                                            name="confirmarPassword"
                                            placeholder="Confirma tu nueva contraseña"
                                            value={formikNuevaPassword.values.confirmarPassword}
                                            onBlur={formikNuevaPassword.handleBlur}
                                            onChange={(e) => formikNuevaPassword.setFieldValue('confirmarPassword', e.target.value)}
                                            toggleMask
                                            feedback={false}
                                            className={classNames({
                                                'p-invalid': formikNuevaPassword.touched.confirmarPassword && formikNuevaPassword.errors.confirmarPassword
                                            })}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                    <small className="p-error">
                                        {formikNuevaPassword.touched.confirmarPassword && formikNuevaPassword.errors.confirmarPassword}
                                    </small>
                                </div>
                                {/* Validaciones visuales */}
                                <div style={{ marginTop: 10, marginBottom: 15 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: 6,
                                        color: passwordValidation.hasMinLength ? '#22c55e' : '#64748b',
                                        fontSize: '13px'
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
                                        marginBottom: 6,
                                        color: passwordValidation.hasUpperCase ? '#22c55e' : '#64748b',
                                        fontSize: '13px'
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
                                        marginBottom: 6,
                                        color: passwordValidation.hasLowerCase ? '#22c55e' : '#64748b',
                                        fontSize: '13px'
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
                                        marginBottom: 6,
                                        color: passwordValidation.hasNumber ? '#22c55e' : '#64748b',
                                        fontSize: '13px'
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

                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <Button
                                    label="Cancelar"
                                    type="button"
                                    onClick={handleCloseDialog}
                                    className="p-button-text"
                                    style={{ color: '#666' }}
                                />
                                <Button
                                    label="Cambiar contraseña"
                                    type="submit"
                                    style={{ background: "#0e71ae", border: "none" }}
                                    loading={formikNuevaPassword.isSubmitting}
                                />
                            </div>
                        </div>
                    </form>
                )}
            </Dialog>

            <Formik
                enableReinitialize
                validationSchema={schema}
                initialValues={{ username: "", password: "" }}
                onSubmit={(values, { setSubmitting }) => {
                            let userName = values.username;
                    let password = values.password;
                    Logarse(userName, password, setSubmitting)
                }}
            >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setSubmitting }) => (
                    <form onSubmit={handleSubmit}>
                        <div className="login-page-container">
                            {/* Floating Logo Icons in background */}
                            <img src="images/bizlogo.jpg" className="login-bg-icon float-1" alt="Logo" />
                            <img src="images/bizlogo.jpg" className="login-bg-icon float-2" alt="Logo" />
                            <img src="images/bizlogo.jpg" className="login-bg-icon float-3" alt="Logo" />
                            <img src="images/bizlogo.jpg" className="login-bg-icon float-4" alt="Logo" />
                            <img src="images/bizlogo.jpg" className="login-bg-icon float-5" alt="Logo" />
                            <img src="images/bizlogo.jpg" className="login-bg-icon float-6" alt="Logo" />

                            {/* Contenedor del Formulario Card */}
                            <div className="login-card-container">
                                <div className="login-card">
                                    {/* Logo integrado en la tarjeta */}
                                    <div className="login-card-logo">
                                        <img
                                            src="images/bizlogo.jpg"
                                            alt="Logo B"
                                            style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
                                        />
                                        <img
                                            src="images/bizletra.png"
                                            alt="Bizpartner"
                                            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
                                        />
                                    </div>

                                    <div className="login-card-body">
                                        <div className="login-welcome-text">
                                            Hola de nuevo, ingresa tus datos
                                        </div>

                                        {hasLoginError && (
                                            <div className="login-general-error">
                                                Credenciales no válidas
                                            </div>
                                        )}

                                        {/* Input Código de colaborador */}
                                        <div className="login-field-group">
                                            <label className="login-input-label" htmlFor="CodigoColaborador">Usuario</label>
                                            <div className={classNames("login-input-wrapper", { "login-input-error": touched.username && errors.username })}>
                                                <div className={classNames("login-icon-circle", { "login-icon-circle-error": touched.username && errors.username })}>
                                                    <i className="pi pi-user"></i>
                                                </div>
                                                <InputText
                                                    id="CodigoColaborador"
                                                    type="text"
                                                    placeholder="Escribe aquí"
                                                    name="username"
                                                    value={values.username}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    className="login-field-input"
                                                />
                                            </div>
                                            {touched.username && errors.username && (
                                                <small className="login-error-text">{errors.username}</small>
                                            )}
                                        </div>

                                        {/* Input Contraseña */}
                                        <div className="login-field-group">
                                            <label className="login-input-label" htmlFor="Password">Contraseña</label>
                                            <div className={classNames("login-input-wrapper", { "login-input-error": touched.password && errors.password })}>
                                                <div className={classNames("login-icon-circle", { "login-icon-circle-error": touched.password && errors.password })}>
                                                    <i className="pi pi-lock"></i>
                                                </div>
                                                <Password
                                                    id="Password"
                                                    name="password"
                                                    value={values.password}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    placeholder="Escribe aquí"
                                                    toggleMask
                                                    feedback={false}
                                                    className="login-password-container"
                                                    inputClassName="login-field-input"
                                                />
                                            </div>
                                            {touched.password && errors.password && (
                                                <small className="login-error-text">{errors.password}</small>
                                            )}
                                        </div>

                                        {/* Enlace recuperar contraseña */}
                                        <div className="login-forgot-password">
                                            <a href="#" onClick={handleOpenRecuperarDialog}>
                                                ¿Olvidaste tu contraseña?
                                            </a>
                                        </div>

                                        {/* Botón de envío */}
                                        <div className="login-action">
                                            <Button
                                                label={isSubmitting ? "Ingresando..." : "Iniciar sesión"}
                                                type="submit"
                                                loading={isSubmitting}
                                                className="login-btn"
                                            />
                                        </div>

                                        {/* Texto de soporte */}
                                        <div className="login-support-text">
                                            <i className="pi pi-comment" style={{ marginRight: '6px', fontSize: '13px' }}></i>
                                            ¿Necesitas ayuda? <a href="#" className="login-support-link">Contacta a soporte</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer de la página */}
                            <div className="login-footer">
                                © 2026 Bizpartner — v1.0
                            </div>
                        </div>
                    </form>
                )}
            </Formik>
        </>
    );
}