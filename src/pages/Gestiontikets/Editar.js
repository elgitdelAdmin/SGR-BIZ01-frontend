import React, { useEffect, useState, useRef } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Calendar } from 'primereact/calendar';

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Gestiontikets.scss"
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
import {ListarConsultores,ListarConsultoresPorSocio} from "../../service/ConsultorService";


import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog"; // For confirmDialog method

import { handleSoloLetras, handleSoloLetrastest } from "../../helpers/helpers";
import { handleSoloNumeros } from "../../helpers/helpers";
import { formatDate } from "../../helpers/helpers";
import { Divider } from "primereact/divider";
import { InputSwitch } from 'primereact/inputswitch';
import { FileUpload } from "primereact/fileupload";
import { ListarParametros,ListarPais,ListarFrentes,RegistrarTiket,ObtenerTicket,ActualizarTicket} from "../../service/TiketService";
import {ListarGestoresPorSocio,ListarGestores} from "../../service/GestorService";
import {ListarEmpresasPorSocio,ListarEmpresas} from "../../service/EmpresaService";

const Editar = () => {
  const navigate = useNavigate();
  const { isLogged } = useUsuario();
  const [persona, setTicket] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  //OK
  const [tituloPagina, setTituloPagina] = useState("Crear Tickets");
  const [frentes, setFrentes] = useState([]);
  const [subfrentes, setSubfrentes] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [pais, setPais] = useState(null);

  const [usuario, setUsuario] = useState(null);
  const [parametros, setParametro] = useState([]);
  const [prueba, setPrueba] = useState(null);
  const [mostrarSeccion, setMostrarSeccion] = useState(false);
  const [gestores, setGestores] = useState(null);
  const [consultores, setConsultores] = useState(null);
  const codRol = localStorage.getItem("codRol");

 const {permisos} = useUsuario();
    const permisosActual = permisos["/tickets"] || {
    divsOcultos: [],
    controlesBloqueados: [],
    controlesOcultos: []
    };

  //
const [opcionesEstadoTicket, setOpcionesEstadoTicket] = useState([]);
const [bloquearDropdown, setBloquearDropdown] = useState([]);


 useEffect(() => {
    const getParametro = async () => {
      await ListarParametros().then(data=>{setParametro(data)})
      };
    getParametro();
  }, []);


  let { id } = useParams();
  const toast = useRef(null);
  useEffect(() => {
      const getEmpresa = async () => {
        const fetchFunction = codRol === "SUPERADMIN" ? ListarEmpresas : ListarEmpresasPorSocio;

        await fetchFunction().then(data=>{setEmpresa(data)})
      };
      getEmpresa();
    }, []);


   useEffect(() => {
      const getFrentes = async () => {
       await ListarFrentes().then(data=>{setFrentes(data)})

          };
      getFrentes();
  }, []);
  useEffect(() => {
      const getTicket = async () => {
        // let jwt = window.localStorage.getItem("jwt");
        await ObtenerTicket({id}).then((data) => {
          setTituloPagina("Datos del Ticket");
          setTicket(data);
          setModoEdicion(true);
        });
      };
      if (id) getTicket();
    }, [id]);


  useEffect(() => {
    if (!parametros?.length) return;

    const estadoActual = parametros.find(
      (item) => item.id === formik.values.idEstadoTicket
    );

    const codigosPermitidos = estadoActual?.valor1?.split(",") || [];

    let opciones = parametros.filter(
      (item) =>
        item.tipoParametro === "EstadoTicket" &&
        codigosPermitidos.includes(item.codigo)
    );

    const yaIncluido = opciones.some(item => item.id === estadoActual?.id);
    if (!yaIncluido && estadoActual) {
      opciones = [estadoActual, ...opciones];
    }

    setOpcionesEstadoTicket(opciones);
      const rolesPermitidos = estadoActual?.valor2?.split(",") || [];
  setBloquearDropdown(!rolesPermitidos.includes(codRol));
  }, [parametros]); 



  //OK 
  
 useEffect(() => {
  if (
    persona &&
    persona.idEmpresa &&
    Array.isArray(empresa) &&
    empresa.length > 0
  ) {
    const empresaSeleccionada = empresa.find(emp => emp.id === persona.idEmpresa);
    
    if (empresaSeleccionada) {
      formik.setFieldValue("nombrePersonaResponsable", empresaSeleccionada.nombrePersonaResponsable);
      formik.setFieldValue("idUsuarioResponsableCliente", empresaSeleccionada.idPersonaResponsable);
    }
  }
}, [persona, empresa]);


    useEffect(() => {
    const getPais = async () => {
     await ListarPais().then(data=>{setPais(data)})
    };
    getPais();
  }, []);

 

  useEffect(() => {
    const getUsuario = async () => {
      // let jwt = window.localStorage.getItem("jwt");
      // await ObtenerTipoDocumento({ jwt }).then((data) => {
      //   setTipoDocumento(data);
      // });
      const data=[{id: 1,nombre: 'Oscar'},
       {id: 2, nombre:'Luis'},
       {id: 3,nombre:'Alberto'}
      ]
      setUsuario(data);
    };
    getUsuario();
  }, []);
  
   
   useEffect(() => {
    const getPrueba = async () => {
      const data=[{id: 1,nombre: 'Juan'},
       {id: 2, nombre:'Roberto'},
       {id: 3,nombre:'Francisco'}
      ]
      setPrueba(data);
    };
    getPrueba();
  }, []);
   useEffect(() => {
    const getGestores = async () => {
        const fetchFunction = codRol === "SUPERADMIN" ? ListarGestores : ListarGestoresPorSocio;
        await  fetchFunction().then(data=>{setGestores(data)})
    };
    getGestores();
  }, []);
  //  useEffect(() => {
  //   const getConsultores = async () => {
  //     // await ListarConsultores().then(data=>{
  //     //   console.log("Data",data)
  //     //   setConsultores(data)})
  //     const data=[{id: 1,nombre: 'Francisco'},
  //      {id: 2, nombre:'Eduardo'},
  //     ]
  //     setConsultores(data);
  //   };
  //   getConsultores();
  // }, []);
  
useEffect(() => {
  const getConsultores = async () => {
     const fetchFunction = codRol === "SUPERADMIN" ? ListarConsultores : ListarConsultoresPorSocio;

    await fetchFunction().then((data) => {
      const consultoresFormateados = data.map((item) => ({
        id: item.id,
        nombre: `${item.persona.nombres} ${item.persona.apellidoPaterno}`
      }));
      console.log("Data",consultoresFormateados)
      setConsultores(consultoresFormateados);
    });
  };
  getConsultores();
}, []);

  const schema = Yup.object().shape({

      codTicketInterno: Yup.string().required("Código interno es obligatorio"),
      titulo: Yup.string().required("Título es obligatorio"),
      fechaSolicitud: Yup.date().required("Fecha de solicitud es obligatoria"),
      idTipoTicket: Yup.number().required("Tipo de ticket es obligatorio"),
      idEstadoTicket: Yup.number().required("Estado del ticket es obligatorio"),
      idEmpresa: Yup.number().required("Empresa es obligatoria"),
      // idUsuarioResponsableCliente: Yup.number().required("Responsable del cliente es obligatorio"),
      // idPais: Yup.number().required("País es obligatorio"),
      idPrioridad: Yup.number().required("Prioridad es obligatoria"),
      descripcion: Yup.string().required("Descripción es obligatoria"),
      urlArchivos: Yup.string().nullable(),
      // urlArchivos: Yup.string(),
      idGestorAsignado: Yup.number().nullable(),
      nuevaEspecializacion: Yup.object().shape({
        idFrente: Yup.number().nullable().transform((v, o) => o === "" ? null : v),
        idSubFrente: Yup.number().nullable().transform((v, o) => o === "" ? null : v),
        cantidad: Yup.number().nullable(),
       
      }).notRequired(),
      frenteSubFrentes: Yup.array().of(
        Yup.object().shape({
          idFrente: Yup.number().required(),
          idSubFrente: Yup.number().required(),
          cantidad: Yup.number().nullable(),
        })
      ),
      asignaciones: Yup.array().of(
          Yup.object().shape({
            idConsultor: Yup.number(),
            idTipoActividad:Yup.number(),
            fechaAsignacion: Yup.string().nullable(),
            fechaDesasignacion: Yup.string().nullable(),
         })
      ),
     
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      codTicketInterno: persona ? persona.codTicketInterno : "",
      titulo: persona ? persona.titulo : "",
      fechaSolicitud: persona ? new Date(persona.fechaSolicitud) : null,
      idTipoTicket: persona ? persona.idTipoTicket : null,
      idEstadoTicket: persona ? persona.idEstadoTicket : 54,
      idEmpresa: persona ? persona.idEmpresa : null,
      idUsuarioResponsableCliente: persona ? persona.idUsuarioResponsableCliente : null,
      idPrioridad: persona ? persona.idPrioridad : null,
      descripcion: persona ? persona.descripcion : "",
      urlArchivos: persona ? persona.urlArchivos : "",
      idGestorAsignado: persona ? persona.idGestorAsignado : null,
      nuevaEspecializacion: {
          idFrente: "",
          idSubFrente: "",
          cantidad:""
      },
      frenteSubFrentes: persona ?persona.frenteSubFrentes:[],
      asignaciones:persona ? persona.consultorAsignaciones : [],
      usuarioCreacion:persona?.usuarioCreacion|| window.localStorage.getItem("username"), 
      nombrePersonaResponsable:  ""
  
    },
    validationSchema: schema,
  onSubmit: (values) => {
    console.log(values.frenteSubFrentes)

  //    if (values.frenteSubFrentes.length === 0) {
  //             formik.setSubmitting(false);

  //   confirmDialog({
  //     message: 'Debes cargar al menos un frente/subfrente antes de continuar.',
  //     header: 'Faltan datos',
  //     icon: 'pi pi-exclamation-triangle',
  //     acceptLabel: 'Entendido',
  //     acceptClassName: 'p-button-danger',
  //     accept: () => {}, // solo cierra el diálogo
  //     reject: null // no hay botón de cancelar
  //   });
  //   return; // evita que continúe
  // }
    const data = {
            // ...(modoEdicion && { id: persona.id }), 
          codTicketInterno:values.codTicketInterno,
          titulo: values.titulo,
          fechaSolicitud : values.fechaSolicitud ? new Date(values.fechaSolicitud) : null,
          idTipoTicket : values.idTipoTicket,
          idEstadoTicket : values.idEstadoTicket,
          idEmpresa : values.idEmpresa,
          idUsuarioResponsableCliente : values.idUsuarioResponsableCliente,
          idPrioridad : values.idPrioridad,
          descripcion : values.descripcion,
          urlArchivos : "",
          consultorAsignaciones : values.asignaciones?values.asignaciones:[],
           frenteSubFrentes: values.frenteSubFrentes.map(e => ({
              idFrente: Number(e.idFrente),
              idSubFrente: Number(e.idSubFrente),
              cantidad: e.cantidad,
            })),
          ...(modoEdicion
        ? { usuarioActualizacion: window.localStorage.getItem("username") }
        : { usuarioCreacion: values.usuarioCreacion }),
          // usuarioCreacion:values.usuarioCreacion,
          // ...(modoEdicion && { usuarioActualizacion:  window.localStorage.getItem("username") }), 

    }
       const jsonData = JSON.stringify(data, null, 2);
      console.log("JSON",jsonData)

      if (modoEdicion) {
        const idTicket = persona?.id;
        console.log(idTicket)
        
        Actualizar({ jsonData, idTicket });
      } else {

        Registrar({ jsonData });
      }

      },
    });
  useEffect(() => {
  if (formik.submitCount > 0) {
    console.log("Errores actuales:", formik.errors);
  }
}, [formik.submitCount]);
 useEffect(() => {
  if (
    persona &&
    persona.idEmpresa &&
    Array.isArray(empresa) &&
    empresa.length > 0
  ) {
    const empresaSeleccionada = empresa.find(emp => emp.id === persona.idEmpresa);
    
    if (empresaSeleccionada) {
      formik.setFieldValue("nombrePersonaResponsable", empresaSeleccionada.nombrePersonaResponsable);
      formik.setFieldValue("idUsuarioResponsableCliente", empresaSeleccionada.idPersonaResponsable);
    }
  }
}, [persona, empresa]);



  const Registrar = ({ jsonData }) => {
    RegistrarTiket({ jsonData})
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

  const Actualizar = ({ jsonData,idTicket }) => {
        ActualizarTicket({ jsonData, idTicket })
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
  



  const dateBodyTemplateFechaActivacion = (rowData) => {
    return rowData.fechaActivacion
      ? formatDate(new Date(rowData.fechaActivacion))
      : "";
  };
  const dateBodyTemplate = (rowData) => {
    console.log(rowData);
    return rowData.fechaVigencia ? formatDate(new Date(rowData.fechaVigencia)) : "";
  };


  const programaTemplate = (rowData) => {
    console.log(rowData);
    return (
      <span>
        {rowData.programa && rowData.idPersonaPrograma
          ? rowData.programa
          : "No"}
      </span>
    );
  };

  const headerPass = <div className="font-bold mb-3">Ingrese password</div>;
  const footerPass = (
    <>
      <Divider />
      <p className="mt-2">Sugerencias</p>
      <ul className="pl-2 ml-2 mt-0 line-height-3">
        <li>Al menos una minúscula</li>
        <li>Al menos una mayúscula</li>
        <li>Al menos un número</li>
        <li>Mínimo 8 caracteres</li>
      </ul>
    </>
  );
 const confirmarEliminacion = (rowData) => {
        confirmDialog({
          message: '¿Esta seguro de eliminar esta especialización?',
          header: 'Confirmación',
          icon: 'pi pi-exclamation-triangle',
          acceptClassName: 'p-button-danger',
          acceptLabel: 'Eliminar',
          rejectLabel: 'Cancelar',
          accept: () => {
            const nuevasEspecializaciones = formik.values.frenteSubFrentes.filter(
              (esp) => esp !== rowData
            );
            formik.setFieldValue('frenteSubFrentes', nuevasEspecializaciones);
          }
        });
      };

   const accion = (rowData) => {
          return (
            <div className="profesor-datatable-accion">
              <div className="accion-eliminar" onClick={() => confirmarEliminacion(rowData)}>
                <span>
                  <Iconsax.Trash color="#ffffff" />
                </span>
              </div>
            </div>
          );
    
        };
  const handleClick = () => {
    setMostrarSeccion(true);
  };

  const handleEmpresaChange = (e) => {
  const selectedEmpresaId = e.value;
  formik.setFieldValue("idEmpresa", selectedEmpresaId);

  const empresaSeleccionada = empresa.find(emp => emp.id === selectedEmpresaId);
  
  if (empresaSeleccionada) {
    formik.setFieldValue("idGestorAsignado", empresaSeleccionada.idGestor);
    formik.setFieldValue("nombrePersonaResponsable", empresaSeleccionada?.nombrePersonaResponsable);
    formik.setFieldValue("idUsuarioResponsableCliente", empresaSeleccionada?.idPersonaResponsable );


  } else {
    formik.setFieldValue("idGestorAsignado", "");
    formik.setFieldValue("nombrePersonaResponsable", "");
    formik.setFieldValue("idUsuarioResponsableCliente", "");


  }
};

 const handleChange = (index, field, value) => {
    const newAsignaciones = [...formik.values.asignaciones];
    newAsignaciones[index][field] = value;
    formik.setFieldValue("asignaciones", newAsignaciones);
  };

  const addRow = () => {
    formik.setFieldValue("asignaciones", [
      ...formik.values.asignaciones,
      {
        idConsultor: "",
        idTipoActividad: "",
        fechaAsignacion: null,
        fechaDesasignacion: null,
      },
    ]);
  };

  const removeRow = (index) => {
    const newAsignaciones = [...formik.values.asignaciones];
    newAsignaciones.splice(index, 1);
    formik.setFieldValue("asignaciones", newAsignaciones);
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
                <label className="label-form">Titulo</label>
                <InputText
                  type={"text"}
                  id="titulo"
                  name="titulo"
                  placeholder="Escribe aquí"
                  value={formik.values.titulo}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  disabled={permisosActual.controlesOcultos.includes("txtTitulo")}
                  // onChange={(e)=>handleSoloLetras(e,formik,"titulo")}
                ></InputText>
                <div className="p-error">
                  {formik.touched.titulo && formik.errors.titulo}
                </div>
              </div>
              <div className="field col-12 md:col-6">
                <label className="label-form">Fecha de solicitud </label>
                <Calendar
                  id="fechaSolicitud"
                  name="fechaSolicitud"
                  value={formik.values.fechaSolicitud}
                  onChange={(e) => formik.setFieldValue('fechaSolicitud', e.value)}
                  onBlur={formik.handleBlur}
                  dateFormat="dd/mm/yy"
                  placeholder="Selecciona la fecha"
                  showIcon
                   minDate={new Date()} 
                  disabled={permisosActual.controlesOcultos.includes("dateFechaSolicitud")}

                />
                <div className="p-error">
                  {formik.touched.fechaSolicitud && formik.errors.fechaSolicitud}
                </div>
              </div>
              <div className="field col-12 md:col-6">
              <label className="label-form">Tipo</label>
               <DropdownDefault
                type="text"
                id="idTipoTicket"
                name="idTipoTicket"
                placeholder="Seleccione"
                value={formik.values.idTipoTicket}
                onChange={(e) => {
                  formik.setFieldValue("idTipoTicket", "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                // options={tipotiket}
                 options={parametros?.filter((item) => item.tipoParametro === "TipoTicket")}
                optionLabel="nombre"
                optionValue="id"
                disabled={permisosActual.controlesOcultos.includes("cboTipo")}

              />
              <small className="p-error">
                {formik.touched.idTipoTicket && formik.errors.idTipoTicket}
              </small>
              </div>
              <div className="field col-12 md:col-6">
              <label className="label-form">Estado</label>
                <DropdownDefault
                type="text"
                id="idEstadoTicket"
                name="idEstadoTicket"
                placeholder="Seleccione"
                value={formik.values.idEstadoTicket}
                onChange={(e) => {
                  formik.setFieldValue("idEstadoTicket", "");
                  formik.handleChange(e);
                }}
                disabled={!modoEdicion || bloquearDropdown}
                onBlur={formik.handleBlur}
                // options={estadoTiket}
                // options={parametros?.filter((item) => item.tipoParametro === "EstadoTicket")}
                  options={opcionesEstadoTicket}

                optionLabel="nombre"
                optionValue="id"
              />
              <small className="p-error">
                {formik.touched.idEstadoTicket && formik.errors.idEstadoTicket}
              </small>
              </div>
              <div className="field col-12 md:col-6">
              <label className="label-form">Empresa</label>
              <DropdownDefault
                id="idEmpresa"
                name="idEmpresa"
                placeholder="Seleccione"
                value={formik.values.idEmpresa}
                onChange={handleEmpresaChange}
                
                onBlur={formik.handleBlur}
                options={empresa}
                optionLabel="nombreComercial"
                optionValue="id"
                disabled={permisosActual.controlesOcultos.includes("cboEmpresa")}

              />
              <small className="p-error">
                {formik.touched.idEmpresa && formik.errors.idEmpresa}
              </small>
              </div>
              <div className="field col-12 md:col-6">
                <label className="label-form">Usuario Responsable del Cliente</label>
                <InputText
                  type={"text"}
                  id="nombrePersonaResponsable"
                  name="nombrePersonaResponsable"
                  placeholder="Escribe aquí"
                  value={formik.values.nombrePersonaResponsable}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  disabled = {true}

                  // onChange={(e)=>handleSoloLetras(e,formik,"titulo")}
                ></InputText>
                <div className="p-error">
                  {formik.touched.titulo && formik.errors.titulo}
                </div>
            
              </div>
              <div className="field col-12 md:col-6">
              <label className="label-form">Prioridad</label>
               <DropdownDefault
                type="text"
                id="idPrioridad"
                name="idPrioridad"
                placeholder="Seleccione"
                value={formik.values.idPrioridad}
                onChange={(e) => {
                  formik.setFieldValue("idPrioridad", "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                // options={prueba}
                options={parametros?.filter((item) => item.tipoParametro === "Prioridad")}
                disabled={permisosActual.controlesOcultos.includes("cboPrioridad")}
                optionLabel="nombre"
                optionValue="id"
              />
              <small className="p-error">
                {formik.touched.idPrioridad && formik.errors.idPrioridad}
              </small>
              </div>
              <div className="field col-12 md:col-6">
                <label className="label-form">Codigo Interno</label>
                <InputText
                  type={"text"}
                  id="codTicketInterno"
                  name="codTicketInterno"
                  placeholder="Escribe aquí"
                  value={formik.values.codTicketInterno}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                 disabled={permisosActual.controlesOcultos.includes("textCodigoInterno")}

                  // onChange={(e)=>handleSoloLetras(e,formik,"codTicketInterno")}
                ></InputText>
                <div className="p-error">
                  {formik.touched.codTicketInterno && formik.errors.codTicketInterno}
                </div>
              </div>
              <div className="field col-12 md:col-6">
                <label className="label-form">Descripcion</label>
                <InputText
                  type={"text"}
                  id="descripcion"
                  name="descripcion"
                  placeholder="Escribe aquí"
                  value={formik.values.descripcion}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                 disabled={permisosActual.controlesOcultos.includes("cboDescripcion")}

                  // onChange={(e)=>handleSoloLetras(e,formik,"descripcion")}   
                ></InputText>
                <div className="p-error">
                  {formik.touched.descripcion && formik.errors.descripcion}
                </div>
              </div>           
              {/* <div className="field col-12 md:col-6">
                <label className="label-form">Subir archivo ZIP</label>
                <div className="custom-file-upload">
                  <label htmlFor="urlArchivos" className="upload-label">
                    {formik.values.urlArchivos
                    ? "Archivo cargado correctamente"
                    : "Seleccionar archivo .zip"}
                  </label>
                  <input
                    type="file"
                    id="urlArchivos"
                    name="urlArchivos"
                    accept=".zip"
                    onChange={async (event) => {
                      const file = event.currentTarget.files[0];

                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64String = reader.result; 
                          formik.setFieldValue("urlArchivos", base64String); 
                        };
                        reader.readAsDataURL(file);
                      } else {
                        formik.setFieldValue("urlArchivos", null);
                      }
                    }}
                 disabled={permisosActual.controlesOcultos.includes("fileArchivo")}

                    onBlur={formik.handleBlur}
                    className="hidden-input"
                  />
                </div>
                <small className="p-error">
                  {formik.touched.urlArchivos && formik.errors.urlArchivos}
                </small>
              </div> */}
               { modoEdicion && (
             <>
             {!permisosActual.divsOcultos.includes("divFrentes") && (
             <>
              <hr style={{ width: "100%", border: "1px solid #ccc", margin: "20px 0" }} />

              <div className="field col-12">
                  <label style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "10px", display: "block" }}>
                    Especializaciones
                  </label>
              </div>
              <div className="field col-12 md:col-3">
              <DropdownDefault
              value={formik.values.nuevaEspecializacion.idFrente}
              options={frentes}
              optionLabel="nombre"
              optionValue="id"
              onChange={(e) => {
                      const idFrenteSeleccionado = e.value;
                      formik.setFieldValue("nuevaEspecializacion.idFrente", idFrenteSeleccionado);
                      const frenteSeleccionado = frentes.find((f) => f.id === idFrenteSeleccionado);
                      if (frenteSeleccionado) {
                        setSubfrentes(frenteSeleccionado.subFrente || []);
                      } else {
                        setSubfrentes([]);
                      }
                    }}
                    placeholder="Selecciona Frente"
              />
              </div>
              <div className="field col-12 md:col-3">
              <DropdownDefault
                value={formik.values.nuevaEspecializacion.idSubFrente}
                options={subfrentes}
                optionLabel="nombre"
                optionValue="id"
                onChange={(e) => formik.setFieldValue("nuevaEspecializacion.idSubFrente", e.value)}
                placeholder="Selecciona Subfrente"
              />
              </div>
              <div className="field col-12 md:col-3">
              <InputText
                  type="number"
                  name="nuevaEspecializacion.cantidad"
                  placeholder="Ingresa la cantidad"
                  value={formik.values.nuevaEspecializacion.cantidad}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
              </div>

              <div className="field col-12 md:col-3">
             <Boton
                type="button"
                label="Agregar Especialización"
                style={{ fontSize: 13, borderRadius: 15 }}
                onClick={() => {
                  const nueva = formik.values.nuevaEspecializacion;

                  if (!nueva.idFrente || !nueva.idSubFrente) {
                    alert("Completa todos los campos de la especialización");
                    return;
                  }

                  const especializacionesActuales = Array.isArray(formik.values.frenteSubFrentes)
                    ? formik.values.frenteSubFrentes
                    : [];

                  const yaExiste = especializacionesActuales.some(
                    (item) =>
                      Number(item.idFrente) === Number(nueva.idFrente) &&
                      Number(item.idSubFrente) === Number(nueva.idSubFrente)
                  );

                  if (yaExiste) {
                    alert("Esta especialización ya fue agregada");
                    return;
                  }

                  formik.setFieldValue("frenteSubFrentes", [
                    ...especializacionesActuales,
                    {
                      idFrente: Number(nueva.idFrente),
                      idSubFrente: Number(nueva.idSubFrente),
                     cantidad: Number(nueva.cantidad),

                    },
                  ]);

                  formik.setFieldValue("nuevaEspecializacion", {
                    idFrente: "",
                    idSubFrente: "",
                    cantidad: "",
                  });
                }}
              />

              </div>
              <div className="field col-12 md:col-12">
                 {frentes.length === 0 ? (
                <p>Cargando frentes...</p> 
              ) : (
              <DatatableDefault showSearch={false} paginator={false} value={formik.values.frenteSubFrentes}>
                  <Column
                    field="idFrente"
                    header="Frente"
                    body={(rowData) =>
                      frentes.find((f) => f.id === rowData.idFrente)?.nombre || "—"
                    }
                  />
                  <Column
                    field="idSubFrente"
                    header="Subfrente"
                    body={(rowData) => {
                      const idFrente = rowData.idFrente;
                      // const frenteactual = frentes.filter(sf => sf.id === idFrente);
                      // const subfrentesDelFrente = frenteactual[0].subFrente
                      
                      const frenteactual = frentes? frentes.find(sf => sf.id === idFrente):[]
                      const subfrentesDelFrente = frenteactual?.subFrente || [];

                      const subfrente = subfrentesDelFrente.find(sf => sf.id === rowData.idSubFrente);
                      return subfrente?.nombre || "—";
                    }}
                    />     
                     <Column
                    field="cantidad"
                    header="Cantidad"
                      body={(rowData) => rowData.cantidad ?? "—"}
                  />
                      <Column
                        header="Acciones"
                        body={accion} 
                      />   
              </DatatableDefault>
              )}
              </div>
              </>
             )}

              {!permisosActual.divsOcultos.includes("divAsignacionConsultor") && (
             <>
              <hr style={{ width: "100%", border: "1px solid #ccc", margin: "20px 0" }} />
              <div className="field col-12">
                  <label style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "10px", display: "block" }}>
                    Asignaciones
                  </label>
              </div>
              <div className="field col-12 md:col-12">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    {/* <th className="p-2 border">Gestor</th> */}
                    <th className="p-2 border">Consultor</th>
                    <th className="p-2 border">Tipo actividad</th>
                    <th className="p-2 border">Fecha Inicio</th>
                    <th className="p-2 border">Fecha Fin</th>
                    <th className="p-2 border">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {formik.values.asignaciones.map((asignacion, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2 border">
                        <DropdownDefault
                          id={`idConsultor-${index}`}
                          name={`asignaciones[${index}].idConsultor`}
                          placeholder="Seleccione"
                          value={formik.values.asignaciones[index].idConsultor}
                          options={consultores}
                          optionLabel="nombre"
                          optionValue="id"
                          onChange={(e) =>
                            formik.setFieldValue(`asignaciones[${index}].idConsultor`, e.value)
                          }
                          onBlur={formik.handleBlur}
                        />
                        <small className="p-error">
                          {
                            formik.touched.asignaciones?.[index]?.idConsultor &&
                            formik.errors.asignaciones?.[index]?.idConsultor
                          }
                        </small>
                      </td>

                      <td className="p-2 border">
                        <DropdownDefault
                          id={`idTipoActividad-${index}`}
                          name={`asignaciones[${index}].idTipoActividad`}
                          placeholder="Seleccione"
                          value={formik.values.asignaciones[index].idTipoActividad}
                          options={parametros?.filter((item) => item.tipoParametro === "TipoActividad")}
                          optionLabel="nombre"
                          optionValue="id"
                          onChange={(e) =>
                            formik.setFieldValue(`asignaciones[${index}].idTipoActividad`, e.value)
                          }
                          onBlur={formik.handleBlur}
                        />
                        <small className="p-error">
                          {
                            formik.touched.asignaciones?.[index]?.idTipoActividad &&
                            formik.errors.asignaciones?.[index]?.idTipoActividad
                          }
                        </small>
                      </td>

                      <td className="p-2 border">
                        <Calendar
                        id={`fechaAsignacion-${index}`}
                        name={`asignaciones[${index}].fechaAsignacion`}
                        value={
                            formik.values.asignaciones[index].fechaAsignacion
                              ? new Date(formik.values.asignaciones[index].fechaAsignacion)
                              : null
                          }  
                        onChange={(e) =>
                          formik.setFieldValue(
                            `asignaciones[${index}].fechaAsignacion`,
                            e.value ? e.value.toISOString() : null
                          )
                        }
                      
                        //   onChange={(e) =>
                        //   formik.setFieldValue(`asignaciones[${index}].fechaAsignacion`, e.value)
                        // }
                        onBlur={formik.handleBlur}
                        showTime
                        hourFormat="24"
                      />

                        <small className="p-error">
                          {
                            formik.touched.asignaciones?.[index]?.fechaAsignacion &&
                            formik.errors.asignaciones?.[index]?.fechaAsignacion
                          }
                        </small>
                      </td>

                      <td className="p-2 border">
                        <Calendar
                        id={`fechaDesasignacion-${index}`}
                        name={`asignaciones[${index}].fechaDesasignacion`}
                        // value={new Date(formik.values.asignaciones[index].fechaDesasignacion)}
                        // onChange={(e) =>
                        //   formik.setFieldValue(`asignaciones[${index}].fechaDesasignacion`, e.value)
                        // }

                        value={
                            formik.values.asignaciones[index].fechaDesasignacion
                              ? new Date(formik.values.asignaciones[index].fechaDesasignacion)
                              : null
                          }  
                        onChange={(e) =>
                          formik.setFieldValue(
                            `asignaciones[${index}].fechaDesasignacion`,
                            e.value ? e.value.toISOString() : null
                          )
                        }
                        onBlur={formik.handleBlur}
                        showTime 
                        hourFormat="24"
                      />

                        <small className="p-error">
                          {
                            formik.touched.asignaciones?.[index]?.fechaDesasignacion &&
                            formik.errors.asignaciones?.[index]?.fechaDesasignacion
                          }
                        </small>
                      </td>

                      <td className="p-2 border">
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          className="text-red-600 hover:underline"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={addRow}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Agregar fila
              </button>
              </div>
              </>
             )}
              <div  className="field col-12 md:col-12">

              </div>
              </>)}
            </div>
           <div className="zv-editarUsuario-footer">
          {/* <button type="button" onClick={() => console.log("VALUES", formik.values)}>
            Ver valores
          </button> * */}
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

export default Editar;
