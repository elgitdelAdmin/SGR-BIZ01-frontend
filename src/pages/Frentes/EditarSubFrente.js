import React, { useEffect, useState, useRef } from "react";
import * as Iconsax from "iconsax-react";
import "./Frentes.scss";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import Boton from "../../components/Boton/Boton";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import { InputSwitch } from "primereact/inputswitch";
import { Dialog } from "primereact/dialog";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ObtenerSubFrente, RegistrarSubFrente, ActualizarSubFrente, ListarFrentes, ObtenerConsultoresAsociadosSubFrente } from "../../service/FrenteService";

const EditarSubFrente = ({ visible, onHide, onSave, id, frenteId }) => {
  const [tituloPagina, setTituloPagina] = useState("Crear Sub-Frente");
  const [modoEdicion, setModoEdicion] = useState(false);
  const toast = useRef(null);
  const [subFrente, setSubFrente] = useState(null);
  const [frentes, setFrentes] = useState([]);

  // Estados para el Dialog de consultores asociados
  const [consultoresDialogVisible, setConsultoresDialogVisible] = useState(false);
  const [consultoresAsociados, setConsultoresAsociados] = useState([]);

  useEffect(() => {
    // Cargar lista de frentes para el dropdown
    const loadFrentes = async () => {
      try {
        const data = await ListarFrentes();
        const frentesActivos = data.filter(f => f.activo).map(f => ({
          label: `${f.codigo} - ${f.nombre}`,
          value: f.id
        }));
        setFrentes(frentesActivos);
      } catch (error) {
        console.error("Error al cargar frentes:", error);
      }
    };
    loadFrentes();
  }, []);

  useEffect(() => {
    if (!visible) return;

    if (id) {
      const getSubFrente = async () => {
        await ObtenerSubFrente({ id }).then((data) => {
          setTituloPagina("Datos del Sub-Frente");
          setSubFrente(data);
          setModoEdicion(true);
        });
      };
      getSubFrente();
    } else {
      setTituloPagina("Crear Sub-Frente");
      setSubFrente(null);
      setModoEdicion(false);
      formik.resetForm();
    }
  }, [id, visible]);

  const schema = Yup.object().shape({
    codigo: Yup.string()
      .max(20, "El código no puede exceder 20 caracteres"),
    nombre: Yup.string()
      .required("Nombre es un campo obligatorio")
      .max(100, "El nombre no puede exceder 100 caracteres"),
    descripcion: Yup.string()
      .max(200, "La descripción no puede exceder 200 caracteres"),
    idFrente: Yup.number()
      .required("El frente padre es obligatorio")
      .min(1, "Debe seleccionar un frente"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      codigo: subFrente ? subFrente.codigo : "",
      nombre: subFrente ? subFrente.nombre : "",
      descripcion: subFrente ? subFrente.descripcion : "",
      idFrente: subFrente ? subFrente.idFrente : (frenteId ? parseInt(frenteId) : ""),
      activo: subFrente ? subFrente.activo : true,
      usuarioRegistro: subFrente?.usuarioRegistro || window.localStorage.getItem("username"),
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const data = {
        codigo: values.codigo,
        nombre: values.nombre,
        descripcion: values.descripcion,
        idFrente: values.idFrente,
        activo: values.activo,
        ...(modoEdicion
          ? { usuarioModificacion: window.localStorage.getItem("username") }
          : { usuarioRegistro: values.usuarioRegistro }),
      };
      let jsonData = JSON.stringify(data, null, 2);
      if (modoEdicion) {
        const subFrenteId = subFrente.id;
        Actualizar({ jsonData, id: subFrenteId });
      } else {
        Registrar({ jsonData });
      }
    }
  });

  const handleSwitchChange = async (newValue) => {
    // Si se quiere desactivar y estamos en modo edición, validar consultores
    if (!newValue && modoEdicion && subFrente) {
      try {
        const consultores = await ObtenerConsultoresAsociadosSubFrente({ id: subFrente.id });
        if (consultores && consultores.length > 0) {
          setConsultoresAsociados(consultores);
          setConsultoresDialogVisible(true);
          return; // No cambiar el switch
        }
      } catch (error) {
        console.error("Error al verificar consultores:", error);
      }
    }
    formik.setFieldValue("activo", newValue);
  };

  const Registrar = ({ jsonData }) => {
    RegistrarSubFrente({ jsonData })
      .then((data) => {
        formik.setSubmitting(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Sub-Frente registrado exitosamente.",
          life: 7000,
        });
        setTimeout(() => {
          onSave();
          onHide();
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

  const Actualizar = ({ jsonData, id }) => {
    ActualizarSubFrente({ jsonData, id })
      .then((data) => {
        formik.setSubmitting(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Sub-Frente actualizado exitosamente.",
          life: 7000,
        });
        setTimeout(() => {
          onSave();
          onHide();
        }, 1000);
      })
      .catch((errors) => {
        formik.setSubmitting(false);
        if (errors.consultores && errors.consultores.length > 0) {
          formik.setFieldValue("activo", true);
          setConsultoresAsociados(errors.consultores);
          setConsultoresDialogVisible(true);
        } else {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: errors.message,
            life: 7000,
          });
        }
      });
  };

  return (
    <Dialog 
      visible={visible} 
      onHide={onHide} 
      header={tituloPagina} 
      modal 
      className="p-fluid" 
      style={{ width: '40vw', minWidth: '400px' }}
    >
      <div className="zv-editarUsuario" style={{ paddingTop: 10 }}>
        <ConfirmDialog />
        <Toast ref={toast} position="top-center"></Toast>

        {/* Dialog de consultores asociados */}
        <Dialog 
          visible={consultoresDialogVisible} 
          onHide={() => setConsultoresDialogVisible(false)} 
          header="No se puede desactivar el Sub-Frente"
          modal
          style={{ width: '550px', maxWidth: '90vw' }}
          footer={
            <Boton 
              label="Entendido" 
              color="primary" 
              style={{ fontSize: 13 }}
              onClick={() => setConsultoresDialogVisible(false)} 
            />
          }
        >
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: 0, marginBottom: 10, color: '#e74c3c', fontWeight: 500 }}>
              <i className="pi pi-exclamation-triangle" style={{ marginRight: 8 }}></i>
              Los siguientes consultores están asociados. Debe desvincularlos antes de desactivar.
            </p>
          </div>
          <DataTable value={consultoresAsociados} size="small" stripedRows>
            <Column field="nombreCompleto" header="Consultor" />
            <Column field="frenteNombre" header="Frente" />
            <Column field="subFrenteNombre" header="Sub-Frente" />
          </DataTable>
        </Dialog>

        <div className="zv-editarUsuario-body">
          <form onSubmit={formik.handleSubmit}>
            <div className="p-fluid formgrid grid">
              <div className="field col-12 md:col-6">
                <label className="label-form">Código</label>
                <InputText
                  type="text"
                  id="codigo"
                  name="codigo"
                  placeholder="Autogenerado"
                  value={formik.values.codigo}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  disabled={true}
                />
                <div className="p-error">
                  {formik.touched.codigo && formik.errors.codigo}
                </div>
              </div>
              <div className="field col-12 md:col-6">
                <label className="label-form">Nombre</label>
                <InputText
                  type="text"
                  id="nombre"
                  name="nombre"
                  placeholder="Escribe aquí"
                  value={formik.values.nombre}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
                <div className="p-error">
                  {formik.touched.nombre && formik.errors.nombre}
                </div>
              </div>
              <div className="field col-12 md:col-6">
                <label className="label-form">Frente Padre</label>
                <Dropdown
                  id="idFrente"
                  name="idFrente"
                  value={formik.values.idFrente}
                  onChange={(e) => formik.setFieldValue("idFrente", e.value)}
                  options={frentes}
                  placeholder="Seleccione un frente"
                  filter
                  showClear
                  disabled={!modoEdicion && !!frenteId}
                />
                <div className="p-error">
                  {formik.touched.idFrente && formik.errors.idFrente}
                </div>
              </div>
              <div className="field col-12 md:col-6">
                <label className="label-form">Estado</label>
                <div style={{ display: "flex", alignItems: "center", height: "42px" }}>
                  <InputSwitch
                    id="activo"
                    name="activo"
                    checked={formik.values.activo}
                    onChange={(e) => handleSwitchChange(e.value)}
                    disabled={!modoEdicion}
                  />
                  <span style={{ marginLeft: "10px", fontWeight: 500 }}>
                    {formik.values.activo ? "Habilitado" : "Deshabilitado"}
                  </span>
                </div>
              </div>
              <div className="field col-12 md:col-12">
                <label className="label-form">Descripción</label>
                <InputText
                  type="text"
                  id="descripcion"
                  name="descripcion"
                  placeholder="Escribe aquí"
                  value={formik.values.descripcion}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
                <div className="p-error">
                  {formik.touched.descripcion && formik.errors.descripcion}
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
              />
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};

export default EditarSubFrente;
