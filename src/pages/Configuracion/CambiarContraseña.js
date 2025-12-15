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
import {RegistrarConsultor,ListarFrentes,ListarParametros,ObtenerConsultor,ActualizarConsultor} from "../../service/ConsultorService";

const CambiarContraseña = () => {
  const navigate = useNavigate();
  const [parametros, setParametro] = useState([]);
  const [consultor, setConsultor] = useState(null);
  const [tituloPagina, setTituloPagina] = useState("Camniar Contraseña");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [nivelExperiencia, setnivelExperiencia] = useState(null);
  const [frentes, setFrentes] = useState(null);
  const [subfrentes, setSubfrentes] = useState(null);
  let { id } = useParams();
  const toast = useRef(null);


  useEffect(() => {
    const getPersona = async () => {
      // let jwt = window.localStorage.getItem("jwt");

      let idConsultor = id;
      await ObtenerConsultor({idConsultor}).then((data) => {
        console.log("data",data);
        setTituloPagina("Datos del Consultor");
        setConsultor(data);
        setModoEdicion(true);
      });
    };
    if (id) getPersona();
  }, [id]);


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
  idNivelExperiencia: Yup.number().required("Nivel de Experiencia es un campo obligatorio"),
  idModalidadLaboral: Yup.number().required("Modalidad laboral es un campo obligatorio"),
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
 nuevaEspecializacion: Yup.object().shape({
  idFrente: Yup.number().nullable().transform((v, o) => o === "" ? null : v),
  idSubFrente: Yup.number().nullable().transform((v, o) => o === "" ? null : v),
    idNivelExperiencia: Yup.number().nullable().transform((v, o) => o === "" ? null : v),

  // idNivelExperiencia: Yup.number().transform(value => value === "" ? null : value),
    esCertificado: Yup.boolean(),
}).notRequired(),
  especializaciones: Yup.array().of(
    Yup.object().shape({
      idFrente: Yup.number().required(),
      idSubFrente: Yup.number().required(),
      idNivelExperiencia: Yup.string().required(),
      esCertificado: Yup.boolean(),

    })
  )
});

    const formik = useFormik({
      enableReinitialize: true,
      initialValues: {
        nombres: consultor?.persona.nombres || "",
        apellidoPaterno: consultor?.persona.apellidoPaterno || "",
        apellidoMaterno: consultor?.persona.apellidoMaterno || "",
        numeroDocumento: consultor?.persona.numeroDocumento || "",
        tipoDocumento: consultor?.persona.tipoDocumento || "",
        idNivelExperiencia:consultor?.idNivelExperiencia || "",
        idModalidadLaboral:consultor?.idModalidadLaboral || "",
        telefono: consultor?.persona.telefono || "",
        telefono2: consultor?.persona.telefono2 || "",
        direccion: consultor?.persona.direccion || "",
        correo: consultor?.persona.correo || "",
        fechaNacimiento: consultor?.persona.fechaNacimiento ? new Date(consultor.persona.fechaNacimiento) : "",
        socioId: consultor?.idSocio || Number(window.localStorage.getItem("idsocio")),
        // fechaNacimiento: consultor?.persona.fechaNacimiento || "",

        nuevaEspecializacion: {
          idFrente: "",
          idSubFrente: "",
          idNivelExperiencia: "",
          esCertificado:false,

        },
         especializaciones: consultor?.especializaciones||[]
      },
      validationSchema: schema,

      onSubmit: (values) => {
      
          const data = {
            ...(modoEdicion && { id: consultor.id }), 
            idNivelExperiencia: values.idNivelExperiencia,
            idModalidadLaboral:values.idModalidadLaboral,
            usuarioActualizacion:window.localStorage.getItem("username"),
            idSocio: Number(window.localStorage.getItem("idsocio")),
            persona: {
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
              usuarioActualizacion:window.localStorage.getItem("username"),

            },
            especializaciones: values.especializaciones.map(e => ({
              idFrente: Number(e.idFrente),
              idSubFrente: Number(e.idSubFrente),
              idNivelExperiencia: e.idNivelExperiencia,
              esCertificado: e.esCertificado
            }))
          };
          // const idConsultor= consultor.id
           let jsonData = JSON.stringify(data,null,2);
          // Registrar({ jsonData });

          // if (modoEdicion) Actualizar({ jsonData,idConsultor});
          // else {
          //   Registrar({ jsonData });
          // }

        if (modoEdicion) {
          const idConsultor = consultor.id;
          Actualizar({ jsonData, idConsultor });
        } else {
          Registrar({ jsonData });
        }
      }
    });
 
  const Registrar = ({ jsonData }) => {
    RegistrarConsultor({ jsonData})
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

   const Actualizar = ({ jsonData,idConsultor }) => {
      ActualizarConsultor({ jsonData, idConsultor })
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
 
  // const allUsedSubfrentes = [
  //   ...subfrentes,
  //   ...formik.values.especializaciones.map(e => ({
  //     id: e.idSubFrente,
  //     nombre: e.nombreSubFrente,
  //   }))
  // ].reduce((acc, curr) => {
  //   if (!acc.some(sf => sf.id === curr.id)) acc.push(curr)
  //   return acc
  // }, []);
   const confirmarEliminacion = (rowData) => {
        confirmDialog({
          message: '¿Esta seguro de eliminar esta especialización?',
          header: 'Confirmación',
          icon: 'pi pi-exclamation-triangle',
          acceptClassName: 'p-button-danger',
          acceptLabel: 'Eliminar',
          rejectLabel: 'Cancelar',
          accept: () => {
            const nuevasEspecializaciones = formik.values.especializaciones.filter(
              (esp) => esp !== rowData
            );
            formik.setFieldValue('especializaciones', nuevasEspecializaciones);
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
                   <label className="label-form">Contraseña</label>
           
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

                // onChange={(e)=>handleSoloLetras(e,formik,"nombres")}
              ></InputText>
              <div className="p-error">
                {formik.touched.nombres && formik.errors.nombres}
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
