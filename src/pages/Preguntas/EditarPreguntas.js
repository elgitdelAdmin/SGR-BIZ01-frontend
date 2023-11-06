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

import { Field, FieldArray, Formik, useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { Toast } from "primereact/toast";
import { InputTextarea } from "primereact/inputtextarea";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import {
  ActualizarPregunta,
  RegistrarPregunta,
  BuscarPreguntaID,
  ListarRespuestasPorPregunta,
} from "../../service/PreguntaService";
const EditarPreguntas = () => {
  const navigate = useNavigate();

  const [pregunta, setPregunta] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tituloPagina, setTituloPagina] = useState("Crear Pregunta");
  const [listaRespuestas, setListaRespuestas] = useState(null);

  let { IDCurso } = useParams();
  let { IDUnidad } = useParams();
  let { IDLeccion } = useParams();
  let { IDPregunta } = useParams();
  const toast = useRef(null);

  useEffect(() => {
    const getRespuestas = async () => {
      let jwt = window.localStorage.getItem("jwt");
      let id = IDPregunta;
      await ListarRespuestasPorPregunta({ jwt, id }).then((data) => {
        setListaRespuestas(data);
      });
    };
    if (IDPregunta) getRespuestas();
  }, [IDPregunta]);

  const comboTipoRecurso = [
    { valor: "imagen", label: "Imagen" },
    { valor: "video", label: "Video" },
    { valor: "galeria", label: "Galería" },
  ];

  const comboTipoPregunta = [
    { valor: 1, label: "Select" },
    { valor: 2, label: "Input" },
  ];

  useEffect(() => {
    const getPregunta = async () => {
      let jwt = window.localStorage.getItem("jwt");
      let id = IDPregunta;
      await BuscarPreguntaID({ jwt, id }).then((data) => {
        setPregunta(data);
        setModoEdicion(true);
        setTituloPagina("Datos de pregunta");
      });
    };

    if (IDPregunta) getPregunta();
  }, [IDPregunta]);

  const accionEditarRespuesta = (rowData) => {
    console.log(rowData);
    return (
      <div className="datatable-accion">
        <div
          className="accion-editar"
          onClick={() =>
                navigate(
                  "../Curso/Editar/" +
                    IDCurso +
                    "/Unidad/Editar/" +
                    IDUnidad +
                    "/Pregunta/Editar/" +
                    IDPregunta +
                    "/EditarRespuesta/"+
                    rowData.idRespuesta
            )
          }
        >
          <span>
            <Iconsax.Eye color="#ffffff" />
          </span>
        </div>
        {/* <div className="accion-eliminar" onClick={()=>navigate()}>
                <span><Iconsax.Trash color="#ffffff"/></span>
            </div> */}
      </div>
    );
  };

  const Actualizar = ({ jsonPregunta }) => {
    let jwt = window.localStorage.getItem("jwt");
    ActualizarPregunta({ jsonPregunta, jwt })
      .then((data) => {
        formik.setSubmitting(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Pregunta actualizada exitosamente.",
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

  const Registrar = ({ jsonPregunta }) => {
    let jwt = window.localStorage.getItem("jwt");
    RegistrarPregunta({ jsonPregunta, jwt })
      .then((data) => {
        formik.setSubmitting(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Pregunta registrada exitosamente.",
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
    idPreguntaTipo: Yup.string().required(
      "Tipo de pregunta es un campo obligatorio"
    ),
    titulo: Yup.string().required("Pregunta es un campo obligatorio"),
  });
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      idPregunta: pregunta ? pregunta.idPregunta : 0,
      idUnidad: IDUnidad,
      idPreguntaTipo: pregunta ? pregunta.idPreguntaTipo : "",
      idTipoRecurso: pregunta
        ? pregunta.idTipoRecurso == 1
          ? "galeria"
          : pregunta.idTipoRecurso == 2
          ? "imagen"
          : "video"
        : 0,
      titulo: pregunta ? pregunta.titulo : "",
      respuesta: pregunta ? pregunta.respuesta : "",
      recurso: pregunta ? pregunta.recurso : "",
      fuente: pregunta ? pregunta.fuente : "",
      linkMaterial: pregunta ? pregunta.linkMaterial : "",
    },
    validationSchema: schema, 
    onSubmit: (values) => {
      let idPregunta = values.idPregunta;
      let idUnidad = values.idUnidad;
      let idPreguntaTipo = values.idPreguntaTipo;
      let titulo = values.titulo;
      //console.log(values.idTipoRecurso);
      //console.log(pregunta.idTipoRecurso);
      let idTipoRecurso = values.idTipoRecurso?
         (values.idTipoRecurso =="galeria")? 1 : 
            (values.idTipoRecurso =="imagen") ? 2:
                (values.idTipoRecurso=="video")? 0:0:0;
      let respuesta = values.respuesta;
      let fuente = values.fuente;
      let linkMaterial = values.linkMaterial;

      let jsonPregunta = JSON.stringify(
        {
          idPregunta,
          idUnidad,
          idPreguntaTipo,
          titulo,
          idTipoRecurso,
          respuesta,
          fuente,
          linkMaterial,
        },
        null,
        2
      );

      if (!modoEdicion) Registrar({ jsonPregunta });
      else {
        Actualizar({ jsonPregunta });
      }
    },
  });

  const bodyEstadoRespuesta = (rowData) => {
    return <div>{rowData.correcta ? 1 : 0}</div>;
  };
  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="zv-editarPregunta" style={{ paddingTop: 16 }}>
        <Toast ref={toast} position="top-center"></Toast>
        <div className="header">
          <span style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
            <Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft>
          </span>
        </div>
        <div className="header-titulo" style={{ marginTop: 16 }}>
          {tituloPagina}
        </div>
        <div className="zv-editarPregunta-body" style={{ marginTop: 16 }}>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-6">
              <label className="label-form">Tipo de Pregunta</label>
              <DropdownDefault
                type={"text"}
                id="idPreguntaTipo"
                name="idPreguntaTipo"
                placeholder="Seleccionar..."
                value={formik.values.idPreguntaTipo}
                onChange={formik.handleChange}
                onblur={formik.handleBlur}
                options={comboTipoPregunta}
                optionLabel="label"
                optionValue="valor"
              ></DropdownDefault>
              <small className="p-error">
                {formik.touched.idPreguntaTipo && formik.errors.idPreguntaTipo}
              </small>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Tipo de Recurso</label>
              <DropdownDefault
                type={"text"}
                id="idTipoRecurso"
                name="idTipoRecurso"
                placeholder="Seleccionar..."
                value={formik.values.idTipoRecurso}
                onChange={formik.handleChange}
                onblur={formik.handleBlur}
                options={comboTipoRecurso}
                optionLabel="label"
                optionValue="valor"
              ></DropdownDefault>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Pregunta</label>
              <InputText
                type={"text"}
                id="titulo"
                name="titulo"
                placeholder="Empecemos"
                value={formik.values.titulo}
                onChange={formik.handleChange}
                onblur={formik.handleBlur}
              ></InputText>
              <small className="p-error">
                {formik.touched.titulo && formik.errors.titulo}
              </small>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Recurso</label>
              <InputText
                type={"text"}
                id="recurso"
                name="recurso"
                placeholder="Link"
                value={formik.values.recurso}
                onChange={formik.handleChange}
                onblur={formik.handleBlur}
              ></InputText>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Respuesta</label>
              <InputText
                type={"text"}
                id="respuesta"
                name="respuesta"
                placeholder="Respueesta correcta para pregunta tipo Input"
                value={formik.values.respuesta}
                onChange={formik.handleChange}
                onblur={formik.handleBlur}
              ></InputText>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Fuente</label>
              <InputText
                type={"text"}
                id="fuente"
                name="fuente"
                placeholder="Ejemplo: La respuesta se encuentra en la Unidad 1 Lección 1"
                value={formik.values.fuente}
                onChange={formik.handleChange}
                onblur={formik.handleBlur}
              ></InputText>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Link Material (Opcional)</label>
              <InputText
                type={"text"}
                id="linkMaterial"
                name="linkMaterial"
                placeholder="Link del material de referencia"
                value={formik.values.linkMaterial}
                onChange={formik.handleChange}
                onblur={formik.handleBlur}
              ></InputText>
            </div>
          </div>
        </div>
        <div
          className="zv-editarPregunta-footer"
          style={{ display: "flex", gap: 8 }}
        >
          <Boton
            label="Guardar cambios"
            style={{ fontSize: 12 }}
            color="primary"
            type="submit"
            loading={formik.isSubmitting}
          ></Boton>
          {modoEdicion && (
            <Boton
              label="Crear Respuesta"
              style={{ fontSize: 12 }}
              color="secondary"
              type="button"
              onClick={() =>
                navigate(
                  "../Curso/Editar/" +
                    IDCurso +
                    "/Unidad/Editar/" +
                    IDUnidad +
                    "/Pregunta/Editar/" +
                    IDPregunta +
                    "/CrearRespuesta"
                )
              }
            ></Boton>
          )}
        </div>
        {modoEdicion && (
          <div className="zv-listado-respuestas" style={{ marginTop: 16 }}>
            <div className="header-subTitulo">Respuestas</div>
            <DatatableDefault value={listaRespuestas}>
              <Column field="idRespuesta" header="ID" sortable></Column>
              <Column
                field="descripcion"
                header="Descripción"
                sortable
              ></Column>
              <Column
                field="correcta"
                header="Correcta/Incorrecta"
                body={bodyEstadoRespuesta}
                sortable
              ></Column>
              <Column field="tipoRecurso" header="Tipo" sortable></Column>
              <Column
                body={accionEditarRespuesta}
                style={{ display: "flex", justifyContent: "center" }}
                header="Acciones"
              ></Column>
            </DatatableDefault>
          </div>
        )}
      </div>
    </form>
  );
};

export default EditarPreguntas;
