import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import 'primeicons/primeicons.css';
// import useUsuario from "../../hooks/useUsuario";
import { Button } from "primereact/button";
import { useLocation,useNavigate } from "react-router-dom";
// import Slider from "../../components/slider/Slider";
import "../components/Inicio/FormsEva.scss"
import "./Login.scss";
import Boton from "../components/Boton/Boton.js";
import * as Iconsax from "iconsax-react";
import InputDefault from "../components/InputDefault/InputDefault"
import InputIcon from "../components/InputIcon/InputIcon"
//const Login = () => {
//const Login = () =>{
export default function Login() {
    const [checked, setChecked] = useState(false);
    // const [username, setUserName] = useState("");
    // const [password, setPassword] = useState("");
    const setPassword = useState("");
    const setUserName = useState("");
    // const { isloginLoading,hasLoginError,login, isLogged } = useUsuario();
    const navigate = useNavigate();
    // useEffect(() => {
        
    //     if (isLogged)
    //     {
    //         navigate("/Dashboard/Home")
            
    //     }

    // }, [isLogged]);

    const handleSubmit = (e) =>{
        e.preventDefault()
        //login()
    };
    const schema = Yup.object().shape({
        username: Yup.string().required("El código de colaborador es un campo obligatorio"),
        //.email("Invalid email format"),
        password: Yup.string().required("Contraseña es un campo obligatorio").min(5, "La contraseña debe tener al menos 8 caracteres"),
    });
    const [passwordType, setpasswordType] = useState("password");
    const togglePassword = () => {
        if (passwordType === "password") {
            setpasswordType("text");
            return;
        }
        setpasswordType("password");
    };

    const Logarse = async(userName,password,setSubmitting)=>{
       
       // await login({ userName, password},()=>setSubmitting(false));
        // setSubmitting(false)
        // await Promise.all([login({ userName, password })]).catch(
        //     () => setSubmitting(false)
        //     )

    }

    return (
        <>
        
            <Formik
                enableReinitialize
                validationSchema={schema}
                initialValues={{ username: "", password: "" }}
                onSubmit={(values,{ setSubmitting }) => {

                    // Alert the input values of the form that we filled
                    let userName = values.username;
                    let password = values.password;

                    Logarse(userName,password,setSubmitting)
                    // window.localStorage.setItem('jwt','test')
                    // window.location = "#/Home";

                    //   alert(JSON.stringify(values));

                }}
            >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting,setSubmitting }) => (
                    <form onSubmit={handleSubmit}>
                        <div style={{background:"#f2f2f2",display:"flex",justifyContent:"center",height:"100vh",alignItems:"center"}}>
                            {/* <Slider/> */}
                                <div className="card contentLogin">
                                {/* <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6"> */}
                                    <div className="text-center form-img">
                                        <img src="images/Logo_Zegel_Rojo.png" alt="hyper" width={365} />
                                    </div>

                                    <div className="p-titulo-login"> Adminsitrador</div>
                                    <div className="p-fluid formgrid grid form-login">
                                        <div className="field col-12 md:col-12">
                                            <label htmlFor="CodigoColaborador" className="peva-label">
                                                Código Colaborador
                                            </label>
                                            <InputDefault
                                                id={"CodigoColaborador"}
                                                type="text"
                                                placeholder="Escribe aquí"
                                                name="username"
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                className="grey"
                                                height={48}
                                                />
                                       
                                            <p className="error">{errors.username && touched.username && errors.username}</p>
                                        </div>
                                        
                                        <div className="field col-12 md:col-12">
                                            <label htmlFor="Password" className="peva-label">
                                                Contraseña
                                            </label>
                                            <div className="peva-input-icon">
                                                <InputIcon
                                                    id="Password"
                                                    type={passwordType}
                                                    className = "grey"
                                                    placeholder="Escribe aquí"
                                                    name="password"
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    icon={passwordType === "password"?<Iconsax.EyeSlash /> : <Iconsax.Eye />}
                                                    onClickIcon={togglePassword}
                                                    width="100%"
                                                    height={48}
                                                />
                                                
                                                <p className="error">{errors.password && touched.password && errors.password}</p>
                                        </div>
                                        
                                        </div>

                                        {/* <Button label="Ingresar"  className="peva-button-login" to="./Inicio" disabled={isloginLoading}/> */}
                                        <div className="form-footer">
                                            <Boton nombre={"Ingresar"} color="secondary" widths="100%" type="submit" loading={isSubmitting}></Boton>
                                        </div>
                                        
                                        <div className="flex">
                                            <a className="peva-request-pass">Olvidaste tu contraseña?</a>
                                        </div>
                                    </div>
                                </div>

                        </div>

                        {/* </div> */}
                    </form>
                )}
            </Formik>
        </>
    );
}

//export default Login;
