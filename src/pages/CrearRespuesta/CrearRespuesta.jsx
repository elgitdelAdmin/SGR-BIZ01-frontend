import React, { useEffect, useState, useRef } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import * as Yup from "yup";
import { Field, FieldArray, Formik, useFormik, FormikProvider } from "formik";
import { Toast } from "primereact/toast";
import useUsuario from "../../hooks/useUsuario";
// import RegistrarRespuesta from "../../service/PreguntaService";
import {
  RegistrarAsignarCurso,
  ActualizarAsignarCurso,
  ObtenerCursoUsuarioPorId,
  ObtenerPersonaPorId,
} from "../../service/UsuarioService";
import { ListarCursos } from "../../service/CursoService";

import { Calendar } from "primereact/calendar";
import { buscarConfiguracion } from "../../helpers/helpers";
import { Dropdown } from "rsuite";
import { RegistrarRespuesta } from "../../service/PreguntaService";

function CrearRespuesta() {
  const navigate = useNavigate();
  const toast = useRef(null);
  const options = [
    { name: "Correcto", value: true },
    { name: "Incorrecto", value: false },
  ];

  const show = (data) => {
    toast.current.show({
      severity: "success",
      summary: "Form Submitted",
      detail: `${data.option.name}`,
    });
  };
  let { IDUsuario, IDPregunta } = useParams();
  let { IdPersonaCurso } = useParams();

  const [tituloPagina, setTituloPagina] = useState("Crear respuesta");

  const Registrar = ({ jsonRespuesta }) => {
    let jwt = window.localStorage.getItem("jwt");
    RegistrarRespuesta({ jsonRespuesta, jwt })
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
        }, 3000);
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

  const schema = Yup.object().shape({
    option: Yup.string().required(
      "Debe seleccionar si la respuesta es correcta o incorrecta."
    ),
    respuesta: Yup.string().required("Debe ingresar la respuesta."),
  });
  const formik = useFormik({
    initialValues: {
      option: "",
      respuesta: "",
    },
    validationSchema: schema,

    onSubmit: (values) => {
      let IDRespuesta = 0;
      //let IDPregunta = IDPregunta;
      let Descripcion = values.respuesta;
      let Correcta = values.option;
      let Recurso = "";
      let TipoRecurso = "";
      let FechaRegistro = new Date().toISOString();
      let UsuarioRegistro = IDUsuario;

      let jsonRespuesta = JSON.stringify({
        IDRespuesta,
        IDPregunta,
        Descripcion,
        Correcta,
        Recurso,
        TipoRecurso,
        FechaRegistro,
        UsuarioRegistro,
      });
      console.log(jsonRespuesta);
      Registrar({ jsonRespuesta });
    },
  });

  return (
    <div className="zv-editarUsuarioCurso" style={{ paddingTop: 16 }}>
      <Toast ref={toast} position="top-center"></Toast>
      <div className="header">
        <span style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
          <Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft>
        </span>
      </div>
      <div className="header-titulo" style={{ marginTop: 16 }}>
        {tituloPagina}
      </div>
      <form onSubmit={formik.handleSubmit}>
        <div className="zv-editarUsuarioCurso-body" style={{ marginTop: 16 }}>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-7">
              <InputText
                type={"text"}
                id="respuesta"
                name="respuesta"
                placeholder="Escribe aquí"
                value={formik.values.respuesta}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              ></InputText>
              <small className="p-error">
                {formik.touched.respuesta && formik.errors.respuesta}
              </small>
            </div>
            <div className="field col-12 md:col-7">
              {/* <label className="label-form">Opción:</label> */}
              <DropdownDefault
                id={"option"}
                name={"option"}
                value={formik.values.option}
                onChange={formik.handleChange}
                options={options}
                optionLabel="name"
                placeholder="Correcto / Incorrecto"
                onBlur={formik.handleBlur}
                optionValue="value"
              ></DropdownDefault>
              <small className="p-error">
                {formik.touched.option && formik.errors.option}
              </small>
            </div>
          </div>
        </div>
        <div
          className="zv-editarUsuarioCurso-footer"
          style={{ display: "flex", gap: 8 }}
        >
          <Boton
            label="Guardar respuesta"
            style={{ fontSize: 12 }}
            color="primary"
            type="submit"
            loading={formik.isSubmitting}
          ></Boton>
        </div>
      </form>
    </div>
  );
}

export default CrearRespuesta;
