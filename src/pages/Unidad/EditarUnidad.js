import React, { useEffect, useState, useRef } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Unidad.scss";
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import {
  BuscarUnidadID,
  RegistrarUnidad,
  ActualizarUnidad,
} from "../../service/UnidadService";
import { EliminarLecciones, ListarLeccionesPorUnidad } from "../../service/LeccionService";
import { Field, FieldArray, Formik, useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { Toast } from "primereact/toast";
import { InputTextarea } from "primereact/inputtextarea";
import { TabView, TabPanel } from "primereact/tabview";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import {  EliminarPregunta, ListarPreguntasPorUnidad } from "../../service/PreguntaService";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { BuscarCursoID } from "../../service/CursoService";
const EditarUnidad = () => {
  const navigate = useNavigate();

  const [unidad, setUnidad] = useState();
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tituloPagina, setTituloPagina] = useState("Crear unidad");
  const [listaLecciones, setListaLecciones] = useState(null);
  const [listaPreguntas, setListaPreguntas] = useState(null);
  const [estadoCurso, setEstadoCurso] = useState(null);
  let { IDCurso } = useParams();
  let { IDUnidad } = useParams();
  const toast = useRef(null);


  const confirLeccion = (id) => {
    console.log(id);
    confirmDialog({
      message: "Seguro de eliminar lección?",
      header: "Eliminar",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Aceptar",
      accept: () => EliminarLeccion(id),
    });
  };

  const confirPreguntas = (id) => {
    confirmDialog({
      message: "Seguro de eliminar pregunta?",
      header: "Eliminar",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Aceptar",
      accept: () => EliminarPreguntas(id),
    });
  };

  const EliminarPreguntas = (idPregunta) => {
    let jwt = window.localStorage.getItem("jwt");
    let id = idPregunta;
    EliminarPregunta({ jwt, id })
      .then((data) => {
        //formik.setSubmitting(false)
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Registro eliminado.",
          life: 7000,
        });

        setTimeout(() => {
          window.location.reload();
        }, 3000);
      })
      .catch((errors) => {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: errors.message,
          life: 7000,
        });
        //formik.setSubmitting(false)
      });
  };



  const EliminarLeccion = (idLeccion) => {
    let jwt = window.localStorage.getItem("jwt");
    let id = idLeccion;
    EliminarLecciones({ jwt, idLeccion })
      .then((data) => {
        //formik.setSubmitting(false)
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Registro eliminado.",
          life: 7000,
        });

        setTimeout(() => {
          window.location.reload();
        }, 3000);
      })
      .catch((errors) => {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: errors.message,
          life: 7000,
        });
        //formik.setSubmitting(false)
      });
  };
  const accionEditar = (rowData) => {
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
                "/Leccion/" +
                rowData.idLeccion
            )
          }
        >
          <span>
            <Iconsax.Eye color="#ffffff" />
          </span>
        </div>
        {/* Si el estado del curso es igual a registrado puede eliminar */}
        {estadoCurso === 1? ( <div className="accion-eliminar" onClick={()=> confirLeccion(rowData.idLeccion)}>
                <span><Iconsax.Trash color="#ffffff"/></span>
            </div>): null}
       
      </div>
    );
  };

  const accionEditarPreguntas = (rowData) => {
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
                rowData.idPregunta
            )
          }
        >
          <span>
            <Iconsax.Eye color="#ffffff" />
          </span>
        </div>
        {/* Si el estado del curso es igual a registrado puede eliminar */}
        {estadoCurso === 1? ( <div className="accion-eliminar" onClick={()=> confirPreguntas( rowData.idPregunta)}>
                <span><Iconsax.Trash color="#ffffff"/></span>
            </div>): null}
      </div>
    );
  };

  useEffect(() => {
    const GetUnidad = async () => {
      let jwt = window.localStorage.getItem("jwt");
      let idUnidad = IDUnidad;
      await BuscarUnidadID({ jwt, idUnidad }).then((data) => {
        setUnidad(data);
        setModoEdicion(true);
        setTituloPagina("Datos de unidad");
      });
    };

    if (IDUnidad) GetUnidad();
  }, [IDUnidad]);

  useEffect(() => {
    const GetLecciones = async () => {
      let jwt = window.localStorage.getItem("jwt");
      let idUnidad = IDUnidad;
      let idCurso = IDCurso;
       await BuscarCursoID({ jwt, idCurso}).then((data) => {
          console.log(data?.idEstado);
          setEstadoCurso(data?.idEstado);
  
          
        });

      await ListarLeccionesPorUnidad({ jwt, idUnidad }).then((data) => {
        setListaLecciones(data);
      });
    };

    if (IDUnidad) GetLecciones();
  }, [IDUnidad]);

  useEffect(() => {
    const GetPreguntas = async () => {
      let jwt = window.localStorage.getItem("jwt");
      let idUnidad = IDUnidad;
      await ListarPreguntasPorUnidad({ jwt, idUnidad }).then((data) => {
        setListaPreguntas(data);
      });
    };
    if (IDUnidad) GetPreguntas();
  }, [IDUnidad]);

  // useEffect(()=>{
  //     const GetCurso= async()=>{
  //         let jwt = window.localStorage.getItem("jwt");
  //         let idCurso = IDCurso
  //         await BuscarCursoID({jwt,idCurso}).then(data=>{
  //             setCurso(data)
  //             setModoEdicion(true)
  //             //setTituloPagina("Editar Curso")
  //         })
  //     }

  //     if(IDCurso)GetCurso()
  // },[IDCurso])
  const Registrar = ({ jsonUnidad }) => {
    let jwt = window.localStorage.getItem("jwt");
    RegistrarUnidad({ jsonUnidad, jwt })
      .then((data) => {
        formik.setSubmitting(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Unidad registrada exitosamente.",
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

  const Actualizar = ({ jsonUnidad }) => {
    let jwt = window.localStorage.getItem("jwt");
    ActualizarUnidad({ jsonUnidad, jwt })
      .then((data) => {
        formik.setSubmitting(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Unidad actualizada exitosamente.",
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
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      idUnidad: unidad ? unidad.idCurso : 0,
      descripcion: unidad ? unidad.descripcion : "",
      descripcionSeo: unidad ? unidad.descripcionSEO : "",
      duracion: unidad ? unidad.duracion : "",
      secuencia: unidad ? unidad.secuencia : 0,
      logro: unidad ? unidad.logro : "",
    },
    //   validationSchema: schema,
    onSubmit: (values) => {
      let idCurso = IDCurso;
      let descripcion = values.descripcion;
      let descripcionSEO = values.descripcionSeo;
      let duracion = values.duracion;
      let secuencia = values.secuencia;
      let logro = values.logro;

      if (
        !descripcion == "" &&
        !descripcionSEO == "" &&
        !duracion == "" &&
        !secuencia == "" &&
        !logro == ""
      ) {
        if (Number.isInteger(secuencia)) {
          let jsonUnidad = JSON.stringify(
            {
              idCurso,
              descripcion,
              descripcionSEO,
              duracion,
              secuencia,
              logro,
            },
            null,
            2
          );
          if (!modoEdicion) Registrar({ jsonUnidad });
          else {
            Actualizar({ jsonUnidad });
          }
        } else {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "El campo secuencia debe de ser un número.",
            life: 7000,
          });
          formik.setSubmitting(false);
        }
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Todo los campos son obligatorios.",
          life: 7000,
        });
        formik.setSubmitting(false);
      }
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <ConfirmDialog />
      <div className="zv-editarUnidad" style={{ paddingTop: 16 }}>
        <Toast ref={toast} position="top-center"></Toast>
        <div className="header">
          <span style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
            <Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft>
          </span>
        </div>
        <div className="header-titulo" style={{ marginTop: 16 }}>
          {tituloPagina}
        </div>
        <div className="zv-editarUnidad-body" style={{ marginTop: 16 }}>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-6">
              <label className="label-form">Descripción </label>
              <InputText
                type={"text"}
                id="descripcion"
                name="descripcion"
                placeholder="Escribe aquí"
                value={formik.values.descripcion}
                onChange={formik.handleChange}
                onblur={formik.handleBlur}
              ></InputText>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Descripción SEO</label>
              <InputText
                type={"text"}
                id="descripcionSeo"
                name="descripcionSeo"
                placeholder="Escribe aquí"
                value={formik.values.descripcionSeo}
                onChange={formik.handleChange}
                onblur={formik.handleBlur}
              ></InputText>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Duración</label>
              <InputText
                type={"text"}
                id="duracion"
                name="duracion"
                placeholder="Escribe aquí"
                value={formik.values.duracion}
                onChange={formik.handleChange}
                onblur={formik.handleBlur}
              ></InputText>
            </div>

            <div className="field col-12 md:col-6">
              <label className="label-form">Secuencia</label>
              <InputText
                type={"number"}
                id="secuencia"
                name="secuencia"
                placeholder="Escribe aquí"
                value={formik.values.secuencia}
                onChange={formik.handleChange}
                onblur={formik.handleBlur}
              ></InputText>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Logro</label>
              <InputText
                type={"text"}
                id="logro"
                name="logro"
                placeholder="Escribe aquí"
                value={formik.values.logro}
                onChange={formik.handleChange}
                onblur={formik.handleBlur}
              ></InputText>
            </div>
          </div>
        </div>
        <div
          className="zv-editarUnidad-footer"
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
              label="Agregar lección"
              style={{ fontSize: 12 }}
              color="secondary"
              type="button"
              onClick={() =>
                navigate(
                  "../Curso/Editar/" +
                    IDCurso +
                    "/Unidad/Editar/" +
                    unidad.idUnidad +
                    "/Leccion/Crear"
                )
              }
            ></Boton>
          )}
          {modoEdicion && (
            <Boton
              label="Agregar Pregunta"
              style={{ fontSize: 12 }}
              color="secondary"
              type="button"
              onClick={() =>
                navigate(
                  "../Curso/Editar/" +
                    IDCurso +
                    "/Unidad/Editar/" +
                    IDUnidad +
                    "/Pregunta/Crear"
                )
              }
            ></Boton>
          )}
        </div>
      </div>
      <div className="zv-listado-leccion" style={{ marginTop: 16 }}>
        <TabView>
          <TabPanel header="Lecciones">
            <div className="header-subTitulo">Listado de lecciones</div>
            <DatatableDefault value={listaLecciones}>
              <Column field="idLeccion" header="ID" sortable></Column>
              <Column field="titulo" header="Título" sortable></Column>
              <Column
                field="descripcion"
                header="Descripción"
                sortable
              ></Column>
              <Column field="secuencia" header="Secuencia" sortable></Column>
              <Column
                body={accionEditar}
                style={{ display: "flex", justifyContent: "center" }}
                header="Acciones"
              ></Column>
            </DatatableDefault>
          </TabPanel>
          <TabPanel header="Preguntas">
            <div className="header-subTitulo">Preguntas</div>
            <DatatableDefault value={listaPreguntas}>
              <Column field="idPregunta" header="ID" sortable></Column>
              <Column field="titulo" header="Título" sortable></Column>
              <Column field="idUnidad" header="Quiz" sortable></Column>
              <Column
                body={accionEditarPreguntas}
                style={{ display: "flex", justifyContent: "center" }}
                header="Acciones"
              ></Column>
            </DatatableDefault>
          </TabPanel>
        </TabView>
      </div>
    </form>
  );
};

export default EditarUnidad;
