// src/pages/Gestiontikets/Components/Especializaciones.js

import { useMemo, useState } from "react";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { confirmDialog } from "primereact/confirmdialog";
import * as Iconsax from "iconsax-react";

import DropdownDefault from "../../../components/Dropdown/DropdownDefault";
import DatatableDefault from "../../../components/Datatable/DatatableDefault";
import Boton from "../../../components/Boton/Boton";
import Horas from "./Horas";

const normalizeHHMM = (raw) => {
  const s = String(raw ?? "").trim();
  if (!s) return "";

  const cleaned = s.replace(/[^0-9.]/g, "");
  if (!cleaned) return "";

  const parts = cleaned.split(".");
  const hhStr = parts[0] ?? "0";
  const mmStrRaw = parts[1] ?? "";

  const hh = String(Number(hhStr || "0"));

  let mm = mmStrRaw;
  if (mm === "") mm = "00";
  if (mm.length === 1) mm = `${mm}0`;
  if (mm.length > 2) mm = mm.slice(0, 2);

  return `${hh}.${mm}`;
};

const hhmmToMinutes = (hhmm) => {
  if (!hhmm) return 0;
  const norm = normalizeHHMM(hhmm);
  const [hhStr, mmStr = "00"] = norm.split(".");
  const hh = Number(hhStr);
  const mm = Number(mmStr);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 0;
  if (mm < 0 || mm > 59) return 0;
  return hh * 60 + mm;
};

const calcularTotalHorasPlan = (frenteSubFrente) => {
  const detalles = frenteSubFrente?.DetallePlanificacionConsultor || [];
  const totalMin = detalles
    .filter((d) => d.Activo)
    .reduce((acc, it) => acc + hhmmToMinutes(it.Horas), 0);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  return `${hh}.${String(mm).padStart(2, "0")}`;
};

const Especializaciones = ({
  formik,
  frentes,
  permisosActual,
  setSubfrentesSeleccionados,
  toastRef,
  consultores,
  parametros,
  codFrentes,
}) => {
  const [subfrentes, setSubfrentes] = useState([]);
  const [visibleDescripcion, setVisibleDescripcion] = useState(false);
  const [rowSeleccionada, setRowSeleccionada] = useState(null);
  const [visibleModal, setVisibleModal] = useState(false);

  const frentesById = useMemo(() => {
    const map = new Map();
    (frentes || []).forEach((f) => map.set(f.id, f));
    return map;
  }, [frentes]);

  const getAsignacionVinculada = (rowData) => {
    return (formik.values.asignaciones || []).find(
      (a) => a.Activo !== false && a._frenteSubFrenteUid === rowData._uid
    );
  };

  const getIndexAsignacion = (rowData) => {
    return (formik.values.asignaciones || []).findIndex(
      (a) => a.Activo !== false && a._frenteSubFrenteUid === rowData._uid
    );
  };

  const getConsultorName = (rowData) => {
    const asignacion = getAsignacionVinculada(rowData);
    if (!asignacion) return "—";
    const consultor = (consultores || []).find((c) => Number(c.id) === Number(asignacion.IdConsultor));
    return consultor ? consultor.nombre : "—";
  };

  const handleFrenteChange = (e) => {
    const idFrenteSeleccionado = e.value;

    formik.setFieldValue("nuevaEspecializacion.idFrente", idFrenteSeleccionado);
    formik.setFieldValue("nuevaEspecializacion.idSubFrente", "");

    const frenteSeleccionado = frentesById.get(idFrenteSeleccionado);

    if (frenteSeleccionado) {
      const subfrentesOrdenados = [...(frenteSeleccionado.subFrente || [])].sort(
        (a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      );
      setSubfrentes(subfrentesOrdenados);
    } else {
      setSubfrentes([]);
    }
  };

  const verDescripcion = (rowData) => {
    setRowSeleccionada(rowData);
    setVisibleDescripcion(true);
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const confirmarEliminacion = (rowData) => {
    confirmDialog({
      message: "¿Está seguro de desactivar esta especialización?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Desactivar",
      rejectLabel: "Cancelar",
      accept: () => {
        const nuevas = (formik.values.frenteSubFrentes || []).map((esp) =>
          esp === rowData ? { ...esp, activo: false } : esp
        );
        formik.setFieldValue("frenteSubFrentes", nuevas);

        // Desactivar asignaciones vinculadas a esta especialización por _uid
        const uid = rowData._uid;
        const nuevasAsig = (formik.values.asignaciones || []).map((a) =>
          a._frenteSubFrenteUid === uid ? { ...a, Activo: false } : a
        );
        formik.setFieldValue("asignaciones", nuevasAsig);

        // Quitar de subfrentes seleccionados para la lista de asignación
        // Solo quitar si no hay otra especialización activa con el mismo subfrente
        const subFrenteId = Number(rowData.idSubFrente);
        const otraEspActiva = (nuevas || []).some(
          (esp) => esp.activo !== false && Number(esp.idSubFrente) === subFrenteId && esp._uid !== uid
        );
        if (!otraEspActiva) {
          setSubfrentesSeleccionados((prev) =>
            prev.filter((sf) => Number(sf.idSubFrente) !== subFrenteId)
          );
        }
      },
    });
  };

  const accion = (rowData) => (
    <div className="profesor-datatable-accion">
      <div className="accion-eliminar" onClick={() => confirmarEliminacion(rowData)}>
        <span>
          <Iconsax.Trash color="#ffffff" />
        </span>
      </div>
    </div>
  );

  const agregarEspecializacion = () => {
    const nueva = formik.values.nuevaEspecializacion;

    if (!nueva.idFrente || !nueva.idSubFrente) {
      toastRef.current.show({
        severity: "warn",
        summary: "Atención",
        detail: "Completa todos los campos de la especialización",
        life: 5000,
      });
      return false;
    }

    const especializacionesActuales = Array.isArray(formik.values.frenteSubFrentes)
      ? formik.values.frenteSubFrentes
      : [];

    // Generar un _uid único para esta nueva especialización
    const nuevaUid = generateUUID();

    formik.setFieldValue("frenteSubFrentes", [
      ...especializacionesActuales,
      {
        id: Number(nueva.id || 0),
        idFrente: Number(nueva.idFrente),
        idSubFrente: Number(nueva.idSubFrente),
        cantidad: 1,
        fechaInicio: nueva.fechaInicio ? new Date(nueva.fechaInicio).toISOString() : null,
        fechaFin: nueva.fechaFin ? new Date(nueva.fechaFin).toISOString() : null,
        activo: true,
        descripcion: nueva.descripcion || "",
        _uid: nuevaUid,
        DetallePlanificacionConsultor: [],
      },
    ]);

    setSubfrentesSeleccionados((prev) => {
      const yaEsta = prev.some((sf) => String(sf.idSubFrente) === String(nueva.idSubFrente));
      if (yaEsta) return prev;

      const subfrenteSeleccionado = subfrentes.find(
        (s) => String(s.id) === String(nueva.idSubFrente)
      );
      if (!subfrenteSeleccionado) return prev;

      return [
        ...prev,
        {
          idSubFrente: subfrenteSeleccionado.id,
          idFrente: subfrenteSeleccionado.idFrente,
          nombre: subfrenteSeleccionado.nombre,
        },
      ];
    });

    // SIEMPRE crear asignación placeholder para esta especialización (vinculada por _uid)
    const subFrenteId = Number(nueva.idSubFrente);
    const asignacionesActuales = Array.isArray(formik.values.asignaciones)
      ? formik.values.asignaciones
      : [];

    const placeholderAsig = {
      idUnico: generateUUID(),
      Id: 0,
      IdSubFrente: subFrenteId,
      IdFrente: Number(nueva.idFrente),
      IdConsultor: 0,
      IdTipoActividad: 25,
      FechaAsignacion: nueva.fechaInicio ? new Date(nueva.fechaInicio).toISOString() : null,
      FechaDesasignacion: nueva.fechaFin ? new Date(nueva.fechaFin).toISOString() : null,
      DetalleTareasConsultor: [],
      Activo: true,
      esPlaceholder: true,
      _frenteSubFrenteUid: nuevaUid,
    };
    formik.setFieldValue("asignaciones", [...asignacionesActuales, placeholderAsig]);

    formik.setFieldValue("nuevaEspecializacion", {
      id: "",
      idFrente: "",
      idSubFrente: "",
      cantidad: "",
      fechaInicio: "",
      fechaFin: "",
      activo: true,
      descripcion: "",
    });

    setSubfrentes([]);
    return true;
  };

  const handleCloseModal = () => {
    setVisibleModal(false);
    formik.setFieldValue("nuevaEspecializacion", {
      id: "",
      idFrente: "",
      idSubFrente: "",
      cantidad: "",
      fechaInicio: "",
      fechaFin: "",
      activo: true,
      descripcion: "",
    });
    setSubfrentes([]);
  };

  const handleAgregar = () => {
    const ok = agregarEspecializacion();
    if (ok) {
      setVisibleModal(false);
    }
  };

  const modalFooter = (
    <div className="flex justify-content-end gap-2">
      <Boton
        label="Cancelar"
        icon="pi pi-times"
        style={{ backgroundColor: "#dd4b39", color: "white" }}
        onClick={handleCloseModal}
      />
      <Boton
        label="Agregar"
        icon="pi pi-plus"
        color="primary"
        onClick={handleAgregar}
      />
    </div>
  );

  return (
    <>
      {/* Contenedor flexible para alinear título y botón */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", width: "100%" }}>
        <label style={{ fontWeight: "bold", fontSize: 20, margin: 0 }}>
          Especializaciones
        </label>

        <Boton
          icon="pi pi-plus"
          label="Agregar Especialización"
          color="primary"
          type="button"
          onClick={() => setVisibleModal(true)}
          style={{
            height: 42,
            padding: "0 18px",
            minWidth: "auto",
            width: "fit-content",
            whiteSpace: "nowrap",
            borderRadius: 8,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        />
      </div>

      {/* ✅ Modal draggable para el formulario de especializaciones */}
      <Dialog
        header="Agregar Especialización"
        visible={visibleModal}
        onHide={handleCloseModal}
        style={{ width: "min(600px, 90vw)" }}
        footer={modalFooter}
        modal
        draggable={true}
        resizable={false}
      >
        <div className="p-fluid grid">
          {/* Frente */}
          <div className="field col-12 md:col-6">
            <label className="label-form">Frente</label>
            <DropdownDefault
              value={formik.values.nuevaEspecializacion.idFrente}
              options={frentes}
              optionLabel="nombre"
              optionValue="id"
              onChange={handleFrenteChange}
              placeholder="Frente"
            />
          </div>

          {/* Subfrente */}
          <div className="field col-12 md:col-6">
            <label className="label-form">Subfrente</label>
            <DropdownDefault
              value={formik.values.nuevaEspecializacion.idSubFrente}
              options={subfrentes}
              optionLabel="nombre"
              optionValue="id"
              onChange={(e) => formik.setFieldValue("nuevaEspecializacion.idSubFrente", e.value)}
              placeholder="Subfrente"
              disabled={!formik.values.nuevaEspecializacion.idFrente}
            />
          </div>

          {/* Inicio */}
          <div className="field col-12 md:col-6">
            <label className="label-form">Inicio</label>
            <Calendar
              value={formik.values.nuevaEspecializacion.fechaInicio}
              onChange={(e) => formik.setFieldValue("nuevaEspecializacion.fechaInicio", e.value)}
              placeholder="Inicio"
              dateFormat="yy-mm-dd"
              showIcon
              style={{ width: "100%" }}
              minDate={formik.values.fechaSolicitud ? new Date(formik.values.fechaSolicitud) : undefined}
            />
          </div>

          {/* Fin */}
          <div className="field col-12 md:col-6">
            <label className="label-form">Fin</label>
            <Calendar
              value={formik.values.nuevaEspecializacion.fechaFin}
              onChange={(e) => formik.setFieldValue("nuevaEspecializacion.fechaFin", e.value)}
              placeholder="Fin"
              dateFormat="yy-mm-dd"
              showIcon
              style={{ width: "100%" }}
              minDate={
                formik.values.nuevaEspecializacion.fechaInicio
                  ? new Date(formik.values.nuevaEspecializacion.fechaInicio)
                  : new Date()
              }
            />
          </div>

          {/* Descripción */}
          <div className="field col-12">
            <label className="label-form">Descripción</label>
            <InputText
              type="text"
              name="nuevaEspecializacion.descripcion"
              placeholder="Descripción"
              value={formik.values.nuevaEspecializacion.descripcion}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </Dialog>

      {/* Tabla */}
      <div className="field col-12" style={{ marginTop: 8 }}>
        {!frentes || frentes.length === 0 ? (
          <p>Cargando frentes...</p>
        ) : (
          <>
            <DatatableDefault
              showSearch={false}
              paginator={false}
              value={(formik.values.frenteSubFrentes || []).filter((item) => item.activo)}
            >
              <Column
                field="idFrente"
                header="Frente"
                body={(rowData) => frentesById.get(rowData.idFrente)?.nombre || "—"}
              />

              <Column
                field="idSubFrente"
                header="Subfrente"
                body={(rowData) => {
                  const frente = frentesById.get(rowData.idFrente);
                  const sub = (frente?.subFrente || []).find((sf) => sf.id === rowData.idSubFrente);
                  return sub?.nombre || "—";
                }}
              />

              <Column
                header="Fecha Inicio"
                body={(row) => (row.fechaInicio ? new Date(row.fechaInicio).toLocaleDateString() : "")}
              />

              <Column
                header="Fecha Fin"
                body={(row) => (row.fechaFin ? new Date(row.fechaFin).toLocaleDateString() : "")}
              />

              <Column
                header="Consultor"
                body={getConsultorName}
              />

              <Column
                header="Planificación"
                body={(rowData) => {
                  const idx = (formik.values.frenteSubFrentes || []).findIndex(
                    (f) => f._uid === rowData._uid
                  );
                  if (idx === -1) return null;
                  return (
                    <Horas
                      mode="PLAN"
                      index={idx}
                      frenteSubFrente={rowData}
                      formik={formik}
                      permisosActual={permisosActual}
                      parametros={parametros}
                      codFrentes={codFrentes}
                      toastRef={toastRef}
                    />
                  );
                }}
                align="center"
                alignHeader="center"
                style={{ width: "95px", textAlign: "center" }}
                headerStyle={{ textAlign: "center", justifyContent: "center" }}
              />

              <Column
                header="H. Planificadas"
                body={(rowData) => {
                  return calcularTotalHorasPlan(rowData);
                }}
                align="center"
                alignHeader="center"
                style={{ width: "95px", textAlign: "center" }}
                headerStyle={{ textAlign: "center", justifyContent: "center" }}
              />

              <Column
                header="Descripción"
                body={(rowData) => (
                  <Button
                    type="button"
                    icon="pi pi-eye"
                    className="p-button-text p-button-sm"
                    onClick={() => verDescripcion(rowData)}
                    tooltip="Ver descripción"
                  />
                )}
              />

              <Column header="Acciones" body={accion} />
            </DatatableDefault>

            <Dialog
              header="Descripción"
              visible={visibleDescripcion}
              style={{ width: 450 }}
              modal
              onHide={() => setVisibleDescripcion(false)}
            >
              <p>{rowSeleccionada?.descripcion || "Sin descripción"}</p>
            </Dialog>
          </>
        )}
      </div>
    </>
  );
};

export default Especializaciones;