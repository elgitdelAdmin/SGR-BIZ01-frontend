import React, { useEffect, useState, useRef } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Usuario.scss";
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import {
  ObtenerPersonaPorId,
  ActualizarPersona,
  RegistrarPersona,
  ObtenerTipoDocumento,
} from "../../service/UsuarioService";
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

import {
  ObtenerCursosPorUsuario,
  ObtenerProgramasPorUsuario,
  EliminarPersonaCurso,
  EliminarPersonaPrograma,
} from "../../service/UsuarioService";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog"; // For confirmDialog method

import { handleSoloLetras, handleSoloLetrastest } from "../../helpers/helpers";
import { handleSoloNumeros } from "../../helpers/helpers";
import { formatDate } from "../../helpers/helpers";
import { Divider } from "primereact/divider";

const EditarUsuario = () => {
  const navigate = useNavigate();
  const { isLogged } = useUsuario();

  const [persona, setPersona] = useState(null);
  const [tituloPagina, setTituloPagina] = useState("Crear Usuario");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [listaCursos, setListaCursos] = useState(null);
  const [listaPrograma, setListaPrograma] = useState(null);
  const [tipoDocumento, setTipoDocumento] = useState(null);
  const [loadingCurso, setLoadingCurso] = useState(true);
  const [loadingPrograma, setLoadingPrograma] = useState(true);
  let { id } = useParams();
  let { IdEmpresa } = useParams();
  const toast = useRef(null);

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const getPersona = async () => {
      let jwt = window.localStorage.getItem("jwt");
      let idPersona = id;
      await ObtenerPersonaPorId({ jwt, idPersona }).then((data) => {
        setTituloPagina("Datos de usuario");
        setPersona(data);
        console.log(data);
        setModoEdicion(true);
        data.idTipoPersona == 3 ? setChecked(true) : setChecked(false);
      });
    };
    if (id) getPersona();
  }, [id]);

  useEffect(() => {
    const getCurso = async () => {
      let jwt = window.localStorage.getItem("jwt");
      let idPersona = id;
      await ObtenerCursosPorUsuario({ jwt, idPersona }).then((data) => {
        setListaCursos(data.filter((x) => x.idPersonaPrograma === null));
        setLoadingCurso(false);
      });
    };
    if (id) getCurso();
  }, [id]);

  useEffect(() => {
    const getPrograma = async () => {
      let jwt = window.localStorage.getItem("jwt");
      let idPersona = id;
      await ObtenerProgramasPorUsuario({ jwt, idPersona }).then((data) => {
        setListaPrograma(data);
        setLoadingPrograma(false);
      });
    };
    if (id) getPrograma();
  }, [id]);

  useEffect(() => {
    const getTipoDoc = async () => {
      let jwt = window.localStorage.getItem("jwt");
      await ObtenerTipoDocumento({ jwt }).then((data) => {
        setTipoDocumento(data);
      });
    };
    getTipoDoc();
  }, []);

  const schema = Yup.object().shape({
    nombres: Yup.string().required("Nombres es un campo obligatorio"),
    primerApellido: Yup.string().required(
      "Primer apellido es un campo obligatorio"
    ),
    segundoApellido: Yup.string().required(
      "Segundo Apellido es un campo obligatorio"
    ),
    documento: Yup.string()
      .required("Documento es un campo obligatorio")
      .min(8, "Documento debe tener mínimo 8 números")
      .test("no-es-ceros", "Documento no puede ser igual a '00000000'", (value) => {
        return value !== "00000000";
      }),
    correo: Yup.string()
      .nullable()
      .required("Correo es un campo obligatorio")
      .matches(
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        "Correo no válido"
      ),

    celular: Yup.number()
      .nullable()
      .required("Teléfono es un campo obligatorio"),
    tipoDocumento: Yup.string()
      .nullable()
      .required("Tipo documento es un campo obligatorio"),
    password: Yup.string().required("Password es un campo obligatorio"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      idPersona: persona ? persona.idPersona : 0,
      nombres: persona ? persona.nombres : "",
      primerApellido: persona ? persona.primerApellido : "",
      segundoApellido: persona ? persona.segundoApellido : "",
      ocupacion: persona ? persona.ocupacion : "",
      descripcion: persona ? persona.descripcion : "",
      activo: persona ? persona.activo : false,
      password: persona ? persona.password : "",
      tipoDocumento: persona ? persona.idTipoDocumento : null,
      documento: persona ? persona.documento : "",
      correo: persona ? persona.correo : "",
      celular: persona ? persona.celular : null,
      idUsuario: persona ? persona.idUsuario : null,
    },
    validationSchema: schema,
    onSubmit: (values) => {
      let activo = values.activo;
      let password = values.password;
      let idPersona = values.idPersona;
      let nombres = values.nombres;
      let primerApellido = values.primerApellido;
      let segundoApellido = values.segundoApellido;
      let ocupacion = values.ocupacion;
      let descripcion = values.descripcion;
      let documento = values.documento;
      let correo = values.correo;
      let celular = values.celular;

      let idEmpresa = IdEmpresa;
      let idTipoPersona = checked ? 3 : 1;
      let idUsuario = values.idUsuario;

      let jsonPersona = JSON.stringify(
        {
          activo,
          password,
          idPersona,
          nombres,
          primerApellido,
          segundoApellido,
          ocupacion,
          descripcion,
          documento,
          correo,
          celular,
          idEmpresa,
          idTipoPersona,
          idUsuario,
        },
        null,
        2
      );
      //alert(jsonPersona);
      //console.log(jsonPersona)
      if (modoEdicion) Actualizar({ jsonPersona });
      else {
        Registrar({ jsonPersona });
      }
    },
  });
  const Actualizar = ({ jsonPersona }) => {
    let jwt = window.localStorage.getItem("jwt");
    ActualizarPersona({ jsonPersona, jwt })
      .then((data) => {
        formik.setSubmitting(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Registro actualizado exitosamente.",
          life: 7000,
        });

        // setTimeout(() => {
        //     navigate(-1);
        // }, 3000)
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

  const Registrar = ({ jsonPersona }) => {
    let jwt = window.localStorage.getItem("jwt");
    console.log(jsonPersona);
    const jsonObject = JSON.parse(jsonPersona);
    console.log(jsonObject.password);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (passwordRegex.test(jsonObject.password)) {
    } else {
      console.log("La contraseña no cumple con los requisitos.");
      formik.setSubmitting(false);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "La contraseña no cumple con los requisitos.",
        life: 7000,
      });
      return;
    }
    RegistrarPersona({ jsonPersona, jwt })
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

  const accionEditarCursos = (rowData) => {
    return (
      <div className="datatable-accion">
        <div
          className="accion-editar"
          onClick={() =>
            navigate(
              "../Usuario/EditarUsuario/" +
                id +
                "/AsignarCurso/" +
                rowData.idPersonaCurso
            )
          }
        >
          <span>
            <Iconsax.Eye color="#ffffff" />
          </span>
        </div>
        <div
          className="accion-eliminar"
          onClick={() => {
            confirmCurso(rowData.idPersonaCurso);
          }}
        >
          <span>
            <Iconsax.Trash color="#ffffff" />
          </span>
        </div>
      </div>
    );
  };

  const accionEditarPrograma = (rowData) => {
    return (
      <div className="datatable-accion">
        <div
          className="accion-editar"
          onClick={() =>
            navigate(
              "../Usuario/EditarUsuario/" +
                id +
                "/AsignarPrograma/" +
                rowData.idPersonaPrograma
            )
          }
        >
          <span>
            <Iconsax.Eye color="#ffffff" />
          </span>
        </div>
        <div
          className="accion-eliminar"
          onClick={() => {
            confirmPrograma(rowData.idPersonaPrograma);
          }}
        >
          <span>
            <Iconsax.Trash color="#ffffff" />
          </span>
        </div>
      </div>
    );
  };
  const dateBodyTemplateFechaActivacion = (rowData) => {
    return rowData.fechaActivacion
      ? formatDate(new Date(rowData.fechaActivacion))
      : "";
  };
  const dateBodyTemplate = (rowData) => {
    return rowData.finCurso ? formatDate(new Date(rowData.finCurso)) : "";
  };
  const EliminarCurso = (id) => {
    let jwt = window.localStorage.getItem("jwt");
    EliminarPersonaCurso({ jwt, id })
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
        }, 1000);
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

  const EliminarPrograma = (id) => {
    let jwt = window.localStorage.getItem("jwt");
    EliminarPersonaPrograma({ jwt, id })
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
        }, 1000);
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

  const confirmCurso = (id) => {
    confirmDialog({
      message: "Seguro de eliminar curso?",
      header: "Eliminar",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Aceptar",
      accept: () => EliminarCurso(id),
    });
  };
  const confirmPrograma = (id) => {
    confirmDialog({
      message: "Seguro de eliminar programa?",
      header: "Eliminar",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Aceptar",
      accept: () => EliminarPrograma(id),
    });
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
              <label className="label-form">Nombres</label>
              <InputText
                type={"text"}
                id="nombres"
                name="nombres"
                placeholder="Escribe aquí"
                value={formik.values.nombres}
                //onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                // onChange={(e)=>handleSoloLetras(e,formik,"nombres")}
                onChange={formik.handleChange}
                onKeyPress={(e) => handleSoloLetrastest(e)}
              ></InputText>
              <div className="p-error">
                {formik.touched.nombres && formik.errors.nombres}
              </div>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Primer apellido</label>
              <InputText
                type={"text"}
                id="primerApellido"
                name="primerApellido"
                placeholder="Escribe aquí"
                value={formik.values.primerApellido}
                onChange={formik.handleChange}
                //onChange={(e) => handleSoloLetras(e, formik, "primerApellido")}
                onBlur={formik.handleBlur}
                onKeyPress={(e) => handleSoloLetrastest(e)}
              ></InputText>
              <small className="p-error">
                {formik.touched.primerApellido && formik.errors.primerApellido}
              </small>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Segundo apellido</label>
              <InputText
                type={"text"}
                id="segundoApellido"
                name="segundoApellido"
                placeholder="Escribe aquí"
                value={formik.values.segundoApellido}
                onChange={formik.handleChange}
                //onChange={(e) => handleSoloLetras(e, formik, "segundoApellido")}
                onBlur={formik.handleBlur}
                onKeyPress={(e) => handleSoloLetrastest(e)}
              ></InputText>
              <small className="p-error">
                {formik.touched.segundoApellido &&
                  formik.errors.segundoApellido}
              </small>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Tipo Documento </label>
              <DropdownDefault
                type={"text"}
                id="tipoDocumento"
                name="tipoDocumento"
                placeholder="Seleccione"
                value={formik.values.tipoDocumento}
                onChange={(e) => {
                  formik.setFieldValue("documento", "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                options={tipoDocumento}
                optionLabel="nombre"
                optionValue="id"
              ></DropdownDefault>
              <small className="p-error">
                {formik.touched.tipoDocumento && formik.errors.tipoDocumento}
              </small>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Documento </label>
              <InputText
                type={"numeric"}
                id="documento"
                name="documento"
                placeholder="Escribe aquí"
                value={formik.values.documento}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                //disabled={modoEdicion}
                maxLength={
                  formik.values.tipoDocumento &&
                  formik.values.tipoDocumento == 1
                    ? 8
                    : 12
                }
                //pattern="[0-9]*"
                keyfilter={
                  formik.values.tipoDocumento &&
                  formik.values.tipoDocumento == 1
                    ? /^\d+$/
                    : /^[0-9a-zA-Z||-]+$/gi
                }
                disabled={formik.values.tipoDocumento != null ? false : true}
              ></InputText>
              <small className="p-error">
                {formik.touched.documento && formik.errors.documento}
              </small>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Correo</label>
              <InputText
                type={"text"}
                id="correo"
                name="correo"
                placeholder="Escribe aquí"
                value={formik.values.correo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              ></InputText>
              <small className="p-error">
                {formik.touched.correo && formik.errors.correo}
              </small>
            </div>
            <div className="field col-12 md:col-6">
              <label className="label-form">Teléfono</label>
              <InputNumber
                id="celular1"
                name="celular1"
                placeholder="Escribe aquí"
                value={formik.values.celular}
                //onValueChange={formik.handleChange}
                onValueChange={(e) => handleSoloNumeros(e, formik, "celular")}
                onChange={(e) => {
                  if (e.value == "-") {
                    formik.setFieldValue("celular", "");
                  }
                }}
                onBlur={formik.handleBlur}
                useGrouping={false}
                maxLength={9}
                autoComplete={false}
              ></InputNumber>
              <small className="p-error">
                {formik.touched.celular && formik.errors.celular}
              </small>
            </div>

            <div className="field col-12 md:col-3">
              <label className="label-form">Contraseña</label>
              {/* <InputText type={"password"}
                                  id="password"
                                  name="password"
                                  value ={formik.values.password} 
                                  onChange={formik.handleChange}
                                  onblur={formik.handleBlur}
                              >
                              </InputText> */}
              <Password
                id="Password"
                // className = "grey"
                autoComplete={false}
                placeholder="Escribe aquí"
                name="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                toggleMask
                value={formik.values.password}
                //header={headerPass}
                footer={footerPass}
                promptLabel="Ingrese contraseña"
                weakLabel="Débil"
                mediumLabel="Fuerte"
                strongLabel="Muy Fuerte"
              />
            </div>
            {!modoEdicion && (
              <div
                className="field col-12 md:col-3"
                style={{
                  display: "flex",
                  alignItems: "end",
                  paddingBottom: 20,
                  gap: 20,
                }}
              >
                <div>
                  <label className="label-form">¿Es Adminsitrador?</label>
                </div>
                <Checkbox
                  onChange={(e) => setChecked(e.checked)}
                  checked={checked}
                ></Checkbox>
              </div>
            )}
          </div>

          <div className="zv-editarUsuario-footer">
            <Boton
              label="Guardar cambios"
              style={{ fontSize: 12 }}
              color="primary"
              type="submit"
              loading={formik.isSubmitting}
            ></Boton>
            {persona && (
              <>
                <Boton
                  label="Agregar curso"
                  style={{ fontSize: 12 }}
                  color="secondary"
                  type="button"
                  onClick={() =>
                    navigate(
                      "../Usuario/EditarUsuario/" +
                        persona.idUsuario +
                        "/AsignarCurso/Crear"
                    )
                  }
                ></Boton>
                <Boton
                  label="Agregar programa"
                  style={{ fontSize: 12 }}
                  color="secondary"
                  type="button"
                  onClick={() =>
                    navigate(
                      "../Usuario/EditarUsuario/" +
                        persona.idUsuario +
                        "/AsignarPrograma/Crear"
                    )
                  }
                ></Boton>
              </>
            )}
          </div>

          {modoEdicion && (
            <div className="zv-cursoPrograma" style={{ marginTop: 24 }}>
              <TabView>
                <TabPanel header="Cursos">
                  <div className="header-subTitulo">Listado de Cursos</div>
                  <DatatableDefault value={listaCursos} loading={loadingCurso}>
                    <Column
                      field="idPersonaCurso"
                      header="ID"
                      sortable
                    ></Column>
                    <Column
                      field="curso.nombre"
                      header="Nombre de curso"
                      sortable
                    ></Column>
                    <Column
                      field="programa"
                      header="Programa"
                      sortable
                      body={programaTemplate}
                    ></Column>
                    <Column
                      field="fechaActivacion"
                      header="Activación"
                      body={dateBodyTemplateFechaActivacion}
                      sortable
                    ></Column>
                    <Column
                      field="finCurso"
                      header="Vigencia"
                      body={dateBodyTemplate}
                      sortable
                    ></Column>
                    <Column
                      field="diasFaltantes"
                      header="Días faltantes"
                      style={{ textAlign: "center" }}
                      sortable
                    ></Column>
                    <Column
                      field="promedio"
                      header="Promedio"
                      sortable
                    ></Column>
                    <Column
                      field="condicionCursoPrograma.nombre"
                      header="Condición"
                      sortable
                    ></Column>
                    <Column
                      field="estadoCursoPrograma.nombre"
                      header="Estado"
                      sortable
                    ></Column>
                    <Column
                      body={accionEditarCursos}
                      style={{ display: "flex", justifyContent: "center" }}
                      header="Acciones"
                    ></Column>
                  </DatatableDefault>
                </TabPanel>
                <TabPanel header="Programas">
                  <div className="header-subTitulo">Listado de Programas</div>
                  <DatatableDefault
                    value={listaPrograma}
                    loading={loadingPrograma}
                  >
                    <Column field="idPrograma" header="ID" sortable></Column>
                    <Column
                      field="programa.nombre"
                      header="Nombre de Programa"
                      sortable
                    ></Column>
                    <Column
                      field="promedio"
                      header="Promedio"
                      sortable
                    ></Column>
                    <Column
                      field="condicionCursoPrograma.nombre"
                      header="Condición"
                      sortable
                    ></Column>
                    <Column
                      field="estadoCursoPrograma.nombre"
                      header="Estado"
                      sortable
                    ></Column>
                    <Column
                      body={accionEditarPrograma}
                      style={{ display: "flex", justifyContent: "center" }}
                      header="Acciones"
                    ></Column>
                  </DatatableDefault>
                </TabPanel>
              </TabView>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditarUsuario;
