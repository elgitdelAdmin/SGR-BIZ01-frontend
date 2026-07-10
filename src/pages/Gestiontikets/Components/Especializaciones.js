// src/pages/Gestiontikets/Components/Especializaciones.js

import { useMemo, useState } from "react";
import CalendarDefault from "../../../components/CalendarDefault/CalendarDefault";
import InputTextDefault from "../../../components/InputTextDefault/InputTextDefault";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { confirmDialog } from "primereact/confirmdialog";
import * as Iconsax from "iconsax-react";

import DropdownDefault from "../../../components/DropdownDefault/DropdownDefault";
import DatatableDefault from "../../../components/Datatable/DatatableDefault";
import Boton from "../../../components/Boton/Boton";
import Horas from "./Horas";

const normalizeHHMM = (raw) => {
  let s = String(raw ?? "").trim();
  if (!s) return "";

  s = s.replace(".", ":");

  const cleaned = s.replace(/[^0-9:]/g, "");
  if (!cleaned) return "";

  const parts = cleaned.split(":");
  const hhStr = parts[0] ?? "0";
  const mmStrRaw = parts[1] ?? "";

  const hh = String(Number(hhStr || "0"));

  let mm = mmStrRaw;
  if (mm === "") mm = "00";
  if (mm.length === 1) mm = `${mm}0`;
  if (mm.length > 2) mm = mm.slice(0, 2);

  return `${hh}:${mm}`;
};

const hhmmToMinutes = (hhmm) => {
  if (!hhmm) return 0;
  const norm = normalizeHHMM(hhmm);
  const [hhStr, mmStr = "00"] = norm.split(":");
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
  return `${hh}:${String(mm).padStart(2, "0")}`;
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
  highlightWarning,
}) => {
  const [subfrentes, setSubfrentes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [frentesList, setFrentesList] = useState([]);
  const [consultoresList, setConsultoresList] = useState([]);

  // Tooltip state
  const [customTooltip, setCustomTooltip] = useState({ text: "", x: 0, y: 0, visible: false });

  const handleMouseEnter = (e, text) => {
    if (!text) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipMaxWidth = 320;
    const halfWidth = tooltipMaxWidth / 2;
    let x = rect.left + rect.width / 2;
    x = Math.max(halfWidth + 10, Math.min(x, window.innerWidth - halfWidth - 10));

    setCustomTooltip({
      text,
      x,
      y: rect.top,
      visible: true
    });
  };

  const handleMouseLeave = () => {
    setCustomTooltip(prev => ({ ...prev, visible: false }));
  };
  const [visibleDescripcion, setVisibleDescripcion] = useState(false);
  const [rowSeleccionada, setRowSeleccionada] = useState(null);
  const [visibleModal, setVisibleModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

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
      acceptClassName: "custom-confirm-accept",
      acceptLabel: "ELIMINAR",
      rejectClassName: "custom-confirm-reject",
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

        setTimeout(() => {
          formik.handleSubmit();
        }, 100);
      },
    });
  };

  const handleEditar = (rowData) => {
    const idx = (formik.values.frenteSubFrentes || []).findIndex(
      (esp) => esp._uid === rowData._uid
    );
    if (idx === -1) return;

    setEditingIndex(idx);

    const frenteSeleccionado = frentesById.get(Number(rowData.idFrente));
    if (frenteSeleccionado) {
      const subfrentesOrdenados = [...(frenteSeleccionado.subFrente || [])].sort(
        (a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      );
      setSubfrentes(subfrentesOrdenados);
    } else {
      setSubfrentes([]);
    }

    formik.setFieldValue("nuevaEspecializacion", {
      id: rowData.id || "",
      idFrente: rowData.idFrente,
      idSubFrente: rowData.idSubFrente,
      cantidad: rowData.cantidad,
      fechaInicio: rowData.fechaInicio ? new Date(rowData.fechaInicio) : null,
      fechaFin: rowData.fechaFin ? new Date(rowData.fechaFin) : null,
      activo: rowData.activo,
      descripcion: rowData.descripcion || "",
    });

    setVisibleModal(true);
  };

  const accion = (rowData) => (
    <div className="datatable-accion" style={{ justifyContent: "center" }}>
      <Button
        type="button"
        icon="pi pi-pencil"
        className="accion-editar"
        onClick={() => handleEditar(rowData)}
        tooltip="Editar"
        style={{ width: "32px", height: "32px", padding: 0 }}
      />
      <Button
        type="button"
        icon="pi pi-trash"
        className="accion-eliminar"
        onClick={() => confirmarEliminacion(rowData)}
        tooltip="Eliminar"
        style={{ width: "32px", height: "32px", padding: 0 }}
      />
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
      ? [...formik.values.frenteSubFrentes]
      : [];

    if (editingIndex !== null) {
      // Estamos editando
      const espAEditar = especializacionesActuales[editingIndex];
      especializacionesActuales[editingIndex] = {
        ...espAEditar,
        fechaInicio: nueva.fechaInicio ? new Date(nueva.fechaInicio).toISOString() : null,
        fechaFin: nueva.fechaFin ? new Date(nueva.fechaFin).toISOString() : null,
        descripcion: nueva.descripcion || "",
      };

      // Si las fechas cambiaron, actualizar fechas de la asignación vinculada
      const asignacionesActuales = Array.isArray(formik.values.asignaciones)
        ? [...formik.values.asignaciones]
        : [];

      const idxAsig = asignacionesActuales.findIndex(a => a._frenteSubFrenteUid === espAEditar._uid);
      if (idxAsig !== -1) {
        if (!asignacionesActuales[idxAsig].FechaAsignacion && especializacionesActuales[editingIndex].fechaInicio) {
          asignacionesActuales[idxAsig].FechaAsignacion = especializacionesActuales[editingIndex].fechaInicio;
        }
        if (!asignacionesActuales[idxAsig].FechaDesasignacion && especializacionesActuales[editingIndex].fechaFin) {
          asignacionesActuales[idxAsig].FechaDesasignacion = especializacionesActuales[editingIndex].fechaFin;
        }
        formik.setFieldValue("asignaciones", asignacionesActuales);
      }

      formik.setFieldValue("frenteSubFrentes", especializacionesActuales);
    } else {
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
    }

    formik.setFieldValue("nuevaEspecializacion", {
      id: "",
      idFrente: "",
      idSubFrente: "",
      cantidad: "",
      fechaInicio: null,
      fechaFin: null,
      activo: true,
      descripcion: "",
    });

    setSubfrentes([]);
    setEditingIndex(null);
    return true;
  };

  const handleCloseModal = () => {
    setVisibleModal(false);
    formik.setFieldValue("nuevaEspecializacion", {
      id: "",
      idFrente: "",
      idSubFrente: "",
      cantidad: "",
      fechaInicio: null,
      fechaFin: null,
      activo: true,
      descripcion: "",
    });
    setSubfrentes([]);
    setEditingIndex(null);
  };

  const handleGuardar = () => {
    const ok = agregarEspecializacion();
    if (ok) {
      setVisibleModal(false);
      formik.handleSubmit();
    }
  };

  const modalFooter = (
    <div className="flex justify-content-end gap-2">
      <Boton
        actionType="guardar"
        onClick={handleGuardar}
      />
      <Boton
        actionType="cerrar"
        onClick={handleCloseModal}
      />
    </div>
  );

  return (
    <>
      {/* Contenedor flexible para alinear título y botón */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", width: "100%" }}>
        <label className="font-h3">
          Especializaciones
        </label>

        <Boton
          actionType="agregar"
          label="Agregar Especialización"
          onClick={() => {
            setEditingIndex(null);
            setVisibleModal(true);
          }}
        />
      </div>

      {/* ✅ Modal draggable para el formulario de especializaciones */}
      <Dialog
        header={editingIndex !== null ? "Editar Especialización" : "Agregar Especialización"}
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
              disabled={editingIndex !== null}
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
              disabled={editingIndex !== null || !formik.values.nuevaEspecializacion.idFrente}
            />
          </div>

          {/* Inicio */}
          <div className="field col-12 md:col-6">
            <label className="label-form">Inicio</label>
            <CalendarDefault
              value={formik.values.nuevaEspecializacion.fechaInicio}
              onChange={(e) => formik.setFieldValue("nuevaEspecializacion.fechaInicio", e.value)}
              placeholder="Inicio"
              dateFormat="dd/mm/yy"
              showIcon
              style={{ width: "100%" }}
              minDate={formik.values.fechaSolicitud ? new Date(formik.values.fechaSolicitud) : undefined}
            />
          </div>

          {/* Fin */}
          <div className="field col-12 md:col-6">
            <label className="label-form">Fin</label>
            <CalendarDefault
              value={formik.values.nuevaEspecializacion.fechaFin}
              onChange={(e) => formik.setFieldValue("nuevaEspecializacion.fechaFin", e.value)}
              placeholder="Fin"
              dateFormat="dd/mm/yy"
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
            <InputTextDefault
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
            <div id="tabla-especializaciones" className={`table-warning-wrapper ${highlightWarning ? "table-warning-blink" : ""}`}>
              <DatatableDefault
                showSearch={false}
                paginator={false}
                value={(formik.values.frenteSubFrentes || []).filter((item) => item.activo)}
              >
                <Column
                  header="Frente / Subfrente"
                  body={(rowData) => {
                    const frente = frentesById.get(rowData.idFrente)?.nombre || "—";
                    const frenteData = frentesById.get(rowData.idFrente);
                    const sub = (frenteData?.subFrente || []).find((sf) => sf.id === rowData.idSubFrente);
                    const subfrente = sub?.nombre || "—";
                    return (
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: 600, color: "#2e4878" }}>{frente}</span>
                        <span style={{ fontSize: "12px", color: "#9198a7", marginTop: "2px" }}>{subfrente}</span>
                      </div>
                    );
                  }}
                  style={{ width: "20%" }}
                />

                <Column
                  header="Consultor"
                  body={(rowData) => {
                    const name = getConsultorName(rowData);
                    const initials = name !== "—" ? name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]).join("").toUpperCase() : "";
                    return (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {initials && <span className="consultor-avatar">{initials}</span>}
                        <span style={{ color: "#646e8c", fontSize: "13px" }}>{name}</span>
                      </div>
                    );
                  }}
                />

                <Column
                  header="Vigencia"
                  body={(row) => {
                    const start = row.fechaInicio ? new Date(row.fechaInicio).toLocaleDateString("es-ES") : "";
                    const end = row.fechaFin ? new Date(row.fechaFin).toLocaleDateString("es-ES") : "";
                    if (!start && !end) return "—";
                    return (
                      <span style={{ color: "#646e8c", fontSize: "13px", whiteSpace: "nowrap" }}>
                        {start} &rarr; {end}
                      </span>
                    );
                  }}
                />

                <Column
                  header="Descripción"
                  body={(rowData) => {
                    const text = rowData.descripcion || "—";
                    const isLong = text.length > 15;
                    const display = isLong ? text.substring(0, 15) + "..." : text;
                    return (
                      <span
                        style={{ cursor: isLong ? "pointer" : "default", color: "#646e8c", fontSize: "13px" }}
                        onMouseEnter={(e) => isLong ? handleMouseEnter(e, text) : null}
                        onMouseLeave={handleMouseLeave}
                      >
                        {display}
                      </span>
                    );
                  }}
                  align="center"
                  alignHeader="center"
                  style={{ width: "120px", textAlign: "center" }}
                  headerStyle={{ textAlign: "center", justifyContent: "center" }}
                />

                <Column
                  header="H. Planificadas"
                  body={(rowData) => {
                    const hrsPlan = calcularTotalHorasPlan(rowData);
                    const isZero = hrsPlan === "0:00" || hrsPlan === "0.00" || hrsPlan === "0" || hrsPlan === 0 || hrsPlan === null;
                    const codRol = localStorage.getItem("codRol");
                    const showWorkedHoursAlert = codRol === "GESTORCUENTA" || codRol === "GESTORCONSULTORIA" || codRol === "ADMIN" || codRol === "SUPERADMIN";

                    if (showWorkedHoursAlert && isZero) {
                      return <span className="horas-badge hrs-t-cero-badge">0:00 h</span>;
                    }
                    if (isZero) {
                      return <span className="horas-badge horas-warning">0:00 h</span>;
                    }
                    return <span style={{ color: "#646e8c", fontSize: "13px" }}>{hrsPlan} h</span>;
                  }}
                  align="center"
                  alignHeader="center"
                  style={{ width: "120px", textAlign: "center" }}
                  headerStyle={{ textAlign: "center", justifyContent: "center" }}
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
                  header="Acciones"
                  body={(rowData) => (
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" }}>
                      {accion(rowData)}
                    </div>
                  )}
                  align="center"
                  alignHeader="center"
                  style={{ width: "100px", textAlign: "center" }}
                  headerStyle={{ textAlign: "center", justifyContent: "center" }}
                />
              </DatatableDefault>
            </div>

            <Dialog
              header="Descripción"
              visible={visibleDescripcion}
              style={{ width: 450 }}
              modal
              onHide={() => setVisibleDescripcion(false)}
            >
              <p>{rowSeleccionada?.descripcion || "Sin descripción"}</p>
            </Dialog>

            {customTooltip.visible && (
              <div
                className="custom-self-designed-tooltip"
                style={{
                  left: `${customTooltip.x}px`,
                  top: `${customTooltip.y}px`,
                }}
              >
                {customTooltip.text}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .custom-self-designed-tooltip {
          background-color: #09507c;
          color: #ffffff;
          padding: 8px 12px;
          border-radius: 8px;
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          max-width: 320px;
          white-space: normal;
          word-break: break-word;
          text-align: left;
          animation: customTooltipFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          position: fixed;
          z-index: 99999;
          pointer-events: none;
        }

        .custom-self-designed-tooltip::after {
          content: "";
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 5px 5px 0;
          border-style: solid;
          border-color: #09507c transparent transparent transparent;
        }

        @keyframes customTooltipFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -100%) translateY(0px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -100%) translateY(-12px) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default Especializaciones;
