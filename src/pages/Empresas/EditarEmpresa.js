import React, { useEffect, useState, useRef } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Empresas.scss"
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
import DataTable from 'react-data-table-component';
import {RegistrarEmpresa,ListarFrentes,ListarParametros,ObtenerEmpresa,ActualizarEmpresa,ObtenerPersona,ObtenerPersonaResponsable} from "../../service/EmpresaService";
import { ListarPais,ListarGestorCuenta} from "../../service/TiketService";
import {ListarGestoresPorSocio,ListarGestores} from "../../service/GestorService";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
const EditarConsultor = () => {
  const navigate = useNavigate();
  const { isLogged } = useUsuario();
  const [parametros, setParametro] = useState([]);
  const [pais, setPais] = useState(null);
  const [gestor, setGestor] = useState(null);

  const [empresa, setEmpresa] = useState(null);
  const [persona, setPersona] = useState(null);
  const [tituloPagina, setTituloPagina] = useState("Crear Empresa");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuariosDropdown, setUsuariosDropdown] = useState([]);
  const [user, setUser] = useState([]);
  const codRol = localStorage.getItem("codRol");

const [soloUnUsuario, setSoloUnUsuario] = useState(false);

  let { id } = useParams();
  let { IdEmpresa } = useParams();
  const toast = useRef(null);

  const [checked, setChecked] = useState(false);
  const [showModal, setShowModal] = useState(false);


  useEffect(() => {
  const getEmpresaYPersona = async () => {
    if (!id) return;

    try {
      const idEmpresa = id;
      const empresaData = await ObtenerEmpresa({ idEmpresa });
      console.log("Empresa:", empresaData);
      setEmpresa(empresaData);
      setTituloPagina("Datos de la Empresa");
      setModoEdicion(true);
       const idTipoDocumento = empresaData.personaResponsable.tipoDocumento;
      const numeroDocumento = empresaData.personaResponsable.numeroDocumento;
       await ObtenerPersonaResponsable({idTipoDocumento,numeroDocumento}).then(data=>{
              setUser(data.data.users)

       })


    } catch (error) {
      console.error("Error al obtener empresa o persona", error);
    }
  };

  getEmpresaYPersona();
}, [id]);

    useEffect(() => {
      const getPais = async () => {
       await ListarPais().then(data=>{setPais(data)})
      };
      getPais();
    }, []);
     useEffect(() => {
      const getGestor = async () => {
      // const fetchFunction = codRol === "SUPERADMIN" ? ListarGestores : ListarGestoresPorSocio;
        
       await ListarGestorCuenta().then(data=>{setGestor(data)})
      };
      getGestor();
    }, []);
  
  useEffect(() => {
      const getParametro = async () => {
        await ListarParametros().then(data=>{setParametro(data)})
    };
      getParametro();
    }, []);

   useEffect(() => {
      const getPais = async () => {
       await ListarPais().then(data=>{setPais(data)})
      };
      getPais();
    }, []);
    
    useEffect(() => {
    if (user?.length === 1) {
      const unicoUsuario = user[0];
      formik.setFieldValue("idUser", unicoUsuario.id); 
            setSoloUnUsuario(true); 

    }
  }, [user]);

  const handleBuscar = async () => {
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
      if (data.data) {
      console.log("Datos recibidos:", data.data);

      formik.setFieldValue("nombres", data.data.nombres || "");
      formik.setFieldValue("apellidoPaterno", data.data.apellidoPaterno || "");
      formik.setFieldValue("apellidoMaterno", data.data.apellidoMaterno || "");
      formik.setFieldValue("telefonopersona", data.data.telefono || "");
      formik.setFieldValue("telefono2", data.data.telefono2 || "");
      formik.setFieldValue("direccionpersona", data.data.direccion || "");
      formik.setFieldValue("correopersona", data.data.correo || "");
      formik.setFieldValue("fechaNacimiento", new Date(data.data.fechaNacimiento) || "");

      setUser(data.data.users)

    } else {
    console.warn("No se encontró información de la persona.");
          setShowModal(true);

    // Opcional: limpiar campos o mostrar alerta
  }
    } catch (error) {
      console.error("Error al buscar responsable:", error.message);
    }
  };
  const footer = (
    <div className="flex gap-2 justify-end" style={{ float: "right" }}>
      <Button
        label="Crear Usuario"
        icon="pi pi-user-plus"
        onClick={() => {
          window.open("/usuarios/CrearUsuario/", "_blank"); // abre en nueva pestaña
          setShowModal(false);
        }}
      />
    </div>
  );
  const schema = Yup.object().shape({
    razonSocial: Yup.string().required("La razón social es obligatoria"),
    nombreComercial: Yup.string().required("El nombre comercial es obligatorio"),
    numDocContribuyente: Yup.string()
      .required("El RUC es obligatorio"),
      // .matches(/^\d+$/, "El RUC debe contener solo números")
      // .length(11, "El RUC debe tener exactamente 11 dígitos"),
    direccion: Yup.string().required("La dirección es obligatoria"),
    telefono: Yup.string()
      .required("El teléfono es obligatorio")
      .matches(/^\d+$/, "El teléfono debe contener solo números")
      .min(8, "El teléfono debe tener al menos 8 dígitos")
      .max(15, "El teléfono no puede exceder 15 dígitos"),
    email: Yup.string()
      .required("El correo es obligatorio")
      .email("Debe ser un correo válido"),
    usuarioRegistro: Yup.string().required("El usuario de registro es obligatorio"),
    idPais: Yup.number()
      .required("El país es obligatorio")
      .min(1, "Debe seleccionar un país válido"),
    idGestor: Yup.number()
      .required("El gestor es obligatorio")
      .min(1, "Debe seleccionar un gestor válido"),
    cargoResponsable: Yup.string().required("Cargo es un campo obligatorio"),
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
      telefonopersona: Yup.string()
        .required("Teléfono es un campo obligatorio")
        .matches(/^\d+$/, "El teléfono solo debe contener números")
        .min(8, "El teléfono debe tener al menos 8 dígitos")
        .max(15, "El teléfono no puede exceder 15 dígitos"),
      telefono2: Yup.string()
        .required("Teléfono es un campo obligatorio")
        .matches(/^\d+$/, "El teléfono solo debe contener números")
        .min(8, "El teléfono debe tener al menos 8 dígitos")
        .max(15, "El teléfono no puede exceder 15 dígitos"),
      direccionpersona: Yup.string(),
      correopersona: Yup.string(),
      fechaNacimiento: Yup.date()
              .required("Fecha de nacimiento es obligatoria")
              .max(new Date(), "La fecha de nacimiento no puede ser en el futuro"),
    
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      razonSocial: empresa?.razonSocial || "",
      nombreComercial: empresa?.nombreComercial || "",
      numDocContribuyente: empresa?.numDocContribuyente || "",
      direccion: empresa?.direccion || "",
      telefono: empresa?.telefono?.replace(/\D/g, "") || "",
      email: empresa?.email || "",
      usuarioRegistro:empresa?.usuarioRegistro|| window.localStorage.getItem("username"), 
      usuarioModificacion:empresa?.usuarioModificacion|| window.localStorage.getItem("username"), 
      idPais: empresa?.idPais || 0,
      idGestor: empresa?.idGestor || 0,
      idSocio: empresa?.idSocio || Number(window.localStorage.getItem("idsocio")),
      activo:empresa?.activo|| true,
      cargoResponsable:empresa?.cargoResponsable|| "",
      nombres: empresa?.personaResponsable.nombres || "",
      apellidoPaterno: empresa?.personaResponsable.apellidoPaterno || "",
      apellidoMaterno:empresa?.personaResponsable.apellidoMaterno || "",
      numeroDocumento: empresa?.personaResponsable.numeroDocumento || "",
      tipoDocumento: empresa?.personaResponsable.tipoDocumento || "",
      telefonopersona: empresa?.personaResponsable.telefono || "",
      telefono2: empresa?.personaResponsable.telefono2 || "",
      direccionpersona: empresa?.personaResponsable.direccion || "",
      correopersona: empresa?.personaResponsable.correo || "",
      fechaNacimiento: empresa?.personaResponsable.fechaNacimiento || "",
      usuarioCreacionpersona:empresa?.personaResponsable.usuarioCreacion|| window.localStorage.getItem("username"), 
      idUser: empresa?.idUser||"",
      usuarioActualizacion:empresa?.personaResponsable.usuarioActualizacion||window.localStorage.getItem("username"), 

    },
    validationSchema:schema,
  onSubmit: (values) => {
    const data = {
      razonSocial: values.razonSocial,
      nombreComercial: values.nombreComercial,
      numDocContribuyente: values.numDocContribuyente,
      direccion: values.direccion,
      telefono: values.telefono,
      email: values.email,
      cargoResponsable:values.cargoResponsable,
      activo:true,
        ...(modoEdicion
      ? { usuarioModificacion: values.usuarioModificacion }
      : { usuarioRegistro: values.usuarioRegistro }),
      idPais: values.idPais,
      idGestor: values.idGestor,
      idSocio:values.idSocio,
      idUser:values.idUser,
      persona: {
        ...(modoEdicion && { id: persona?.id }), 
                nombres: values.nombres,
                apellidoMaterno: values.apellidoMaterno,
                apellidoPaterno: values.apellidoPaterno,
                numeroDocumento: values.numeroDocumento,
                tipoDocumento: Number(values.tipoDocumento),
                telefono: values.telefonopersona,
                telefono2: values.telefono2,
                direccion: values.direccionpersona || "",
                correo: values.correopersona || "",
                fechaNacimiento:values.fechaNacimiento,
                  ...(modoEdicion
                ? { usuarioActualizacion: values.usuarioActualizacion }
                : { usuarioCreacion: values.usuarioCreacionpersona }),
              },
    };
    const jsonData = JSON.stringify(data, null, 2);

    if (modoEdicion) {
      const idEmpresa = empresa?.id;
      console.log(idEmpresa)
      
      Actualizar({ jsonData, idEmpresa });
    } else {

      Registrar({ jsonData });
    }
  }

  });

  const Registrar = ({ jsonData }) => {
    RegistrarEmpresa({ jsonData})
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

   const Actualizar = ({ jsonData,idEmpresa }) => {
      ActualizarEmpresa({ jsonData, idEmpresa })
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
            {/* <div className="field col-12 md:col-6">
                            <label className="label-form">Codigo</label>
                            <InputText
                              type={"text"}
                              id="codigo"
                              name="codigo"
                              placeholder="Escribe aquí"
                              value={formik.values.codigo}
                              onBlur={formik.handleBlur}
                              onChange={formik.handleChange}
            
                              // onChange={(e)=>handleSoloLetras(e,formik,"codigo")}
                            ></InputText>
                            <div className="p-error">
                              {formik.touched.codigo && formik.errors.codigo}
                            </div>
            </div> */}
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
              <label className="label-form"> N° Documento del contribuyente</label>
              <InputText
                type={"numeric"}
                id="numDocContribuyente"
                name="numDocContribuyente"
                placeholder="Escribe aquí"
                value={formik.values.numDocContribuyente}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                // maxLength={11}
                // keyfilter={ /^\d+$/}
              ></InputText>
              <small className="p-error">
                {formik.touched.numDocContribuyente && formik.errors.numDocContribuyente}
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
              <label className="label-form">Pais</label>
              <DropdownDefault
                type={"text"}
                id="idPais"
                name="idPais"
                placeholder="Seleccione"
                value={formik.values.idPais}
                onChange={(e) => {
                  formik.setFieldValue("idPais", "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                options={pais}
                optionLabel="nombre"
                optionValue="id"
              ></DropdownDefault>
              <small className="p-error">
                {formik.touched.idPais && formik.errors.idPais}
              </small>
            </div>
             <div className="field col-12 md:col-6">
              <label className="label-form">Gestor Cuenta</label>
              <DropdownDefault
                type={"text"}
                id="idGestor"
                name="idGestor"
                placeholder="Seleccione"
                value={formik.values.idGestor}
                onChange={(e) => {
                  formik.setFieldValue("idGestor", "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                options={gestor}
                optionLabel={(option) => `${option.nombres} ${option.apellidoPaterno} ${option.apellidoMaterno}`}
                optionValue="id"
              ></DropdownDefault>
              <small className="p-error">
                {formik.touched.idGestor && formik.errors.idGestor}
              </small>
            </div>

            <hr style={{ width: "100%", border: "1px solid #ccc", margin: "20px 0" }} />
            <div className="field col-12">
                <label style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "10px", display: "block" }}>
                  Persona Responsable
                </label>
            </div>

            <div className="field col-12 md:col-4">
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
                // options={tipoDocumento}
                options={parametros?.filter((item) => item.tipoParametro === "TipoDocumento")}
                optionLabel="nombre"
                optionValue="id"
              ></DropdownDefault>
              <small className="p-error">
                {formik.touched.tipoDocumento && formik.errors.tipoDocumento}
              </small>
            </div>
            <div className="field col-12 md:col-4">
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
                disabled={!formik.values.tipoDocumento}
              ></InputText>
              <small className="p-error">
                {formik.touched.numeroDocumento && formik.errors.numeroDocumento}
              </small>
            </div>
            <div className="field col-12 md:col-4">
                <Boton
                type="button"
                label="Buscar"
                style={{ fontSize: 13, borderRadius: 15 }}
                onClick={handleBuscar}
              />

            </div>
             <Dialog
                header="Usuario no encontrado"
                visible={showModal}
                style={{ width: "30vw" }}
                modal
                onHide={() => setShowModal(false)}
                footer={footer}
              >
                <p>No se encontró el usuario, por favor créalo primero.</p>
              </Dialog>
            
              <div className="field col-12 md:col-6">
              <label className="label-form">Users</label>
              <DropdownDefault
                type={"text"}
                id="idUser"
                name="idUser"
                placeholder="Seleccione"
                value={formik.values.idUser}
                onChange={(e) => {
                  formik.setFieldValue("idUser", "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                options={user}
                optionLabel="username"
                optionValue="id"
                itemTemplate={(option) => `${option.username} - ${option.email}`}
                valueTemplate={(option) => option ? `${option.username} - ${option.email}` : ""}
                disabled={soloUnUsuario}

              ></DropdownDefault>
              <small className="p-error">
                {formik.touched.idUser && formik.errors.idUser}
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
                disabled={true}
                // onChange={(e)=>handleSoloLetras(e,formik,"nombres")}
              ></InputText>
              <div className="p-error">
                {formik.touched.nombres && formik.errors.nombres}
              </div>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Apellidos</label>
              <InputText
                type={"text"}
                id="apellidoPaterno"
                name="apellidoPaterno"
                placeholder="Escribe aquí"
                value={`${formik.values.apellidoPaterno || ""} ${formik.values.apellidoMaterno || ""}`}              
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                disabled={true}
                // onChange={(e)=>handleSoloLetras(e,formik,"apellidoPaterno")}
              ></InputText>
              <div className="p-error">
                {formik.touched.apellidoPaterno && formik.errors.apellidoPaterno}
              </div>
            </div>      
            {/* <div className="field col-12 md:col-6">
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
            </div> */}
             <div className="field col-12 md:col-6">
              <label className="label-form">Cargo del Responsable</label>
              <InputText
                type={"text"}
                id="cargoResponsable"
                name="cargoResponsable"
                placeholder="Escribe aquí"
                value={formik.values.cargoResponsable}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              ></InputText>
              <div className="p-error">
                {formik.touched.cargoResponsable && formik.errors.cargoResponsable}
              </div>
            </div>
            <div className="field col-12 md:col-6">
                <label className="label-form">Teléfono</label>
                <InputNumber
                  id="telefonopersona"
                  name="telefonopersona"
                  placeholder="Escribe aquí"
                  value={formik.values.telefonopersona}
                  //onValueChange={formik.handleChange}
                  onValueChange={(e) => handleSoloNumeros(e, formik, "telefonopersona")}
                  onChange={(e) => {
                    if (e.value == "-") {
                      formik.setFieldValue("telefonopersona", "");
                    }
                  }}
                  onBlur={formik.handleBlur}
                  disabled={true}
                  useGrouping={false}
                  maxLength={9}
                  autoComplete={false}
                ></InputNumber>
                <small className="p-error">
                  {formik.touched.telefonopersona && formik.errors.telefonopersona}
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
                  disabled={true}
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
                id="direccionpersona"
                name="direccionpersona"
                placeholder="Escribe aquí"
                value={formik.values.direccionpersona}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                disabled={true}
              ></InputText>
              <div className="p-error">
                {formik.touched.direccionpersona && formik.errors.direccionpersona}
              </div>
            </div>
             <div className="field col-12 md:col-6">
              <label className="label-form">Correo</label>
              <InputText
                type={"text"}
                id="correopersona"
                name="correopersona"
                placeholder="Escribe aquí"
                value={formik.values.correopersona}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                disabled={true}
              ></InputText>
              <div className="p-error">
                {formik.touched.correopersona && formik.errors.correopersona}
              </div>
            </div>
            {/* <div className="field col-12 md:col-6">
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
              </div>   */}
            
          
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

export default EditarConsultor;
