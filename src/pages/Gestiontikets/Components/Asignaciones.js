// Asignaciones.js
import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import DropdownDefault from "../../../components/DropdownDefault/DropdownDefault";
import Horas from "./Horas";
import CalendarFormik from "../../../components/Calendar/CalendarFormik";
import * as Iconsax from "iconsax-react";
import Boton from "../../../components/Boton/Boton";
import DatatableDefault from "../../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";

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

const calcularTotalHorasPlan = (asignacion, frenteSubFrentes) => {
  const especializacion = (frenteSubFrentes || []).find((esp) => {
    if (esp.activo === false) return false;

    if (asignacion._frenteSubFrenteUid && esp._uid) {
      return asignacion._frenteSubFrenteUid === esp._uid;
    }

    if (asignacion.IdTicketFrenteSubFrente && esp.id) {
      return Number(asignacion.IdTicketFrenteSubFrente) === Number(esp.id);
    }

    if (
      Number(asignacion.IdFrente) === Number(esp.idFrente) &&
      Number(asignacion.IdSubFrente) === Number(esp.idSubFrente)
    ) {
      return true;
    }

    return false;
  });

  const detalles = especializacion?.DetallePlanificacionConsultor || [];
  const totalMin = detalles
    .filter((d) => d.Activo)
    .reduce((acc, it) => acc + hhmmToMinutes(it.Horas), 0);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  return `${hh}.${String(mm).padStart(2, "0")}`;
};

const Asignaciones = ({
  formik,
  permisosActual,
  subfrentesSeleccionados,
  consultores,
  consultoresPorFila,
  setConsultoresPorFila,
  ObtenerConsultoresPorFrente,
  obtenerCantidadPermitida,
  contarAsignaciones,
  totalesFijos,
  toastRef,
  parametros,
  codFrentes,
  addRow,
  removeRow,
  highlightZero,
}) => {
  const [visibleModal, setVisibleModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleEditar = (idx) => {
    setEditingIndex(idx);
    setVisibleModal(true);
  };
  const obtenerOpcionesSubfrente = (currentIdSubFrente) => {
    // 1. Obtener la lista única (distinct) de subfrentes de las especializaciones seleccionadas
    const subfrentesUnicosMap = new Map();
    (subfrentesSeleccionados || []).forEach((sf) => {
      if (sf.idSubFrente) {
        subfrentesUnicosMap.set(Number(sf.idSubFrente), sf);
      }
    });
    const subfrentesUnicos = Array.from(subfrentesUnicosMap.values());

    // 2. Filtrar aquellos subfrentes que ya han completado su límite permitido
    return subfrentesUnicos.filter((sf) => {
      const idSubFrente = Number(sf.idSubFrente);

      // Si este es el subfrente seleccionado en la fila actual, debemos mostrarlo siempre
      if (currentIdSubFrente && Number(currentIdSubFrente) === idSubFrente) {
        return true;
      }

      // Obtener el límite máximo permitido
      const maxPermitido = obtenerCantidadPermitida(idSubFrente);

      // Contar asignaciones de consultores reales (con idConsultor > 0)
      const asignados = (formik.values.asignaciones || []).filter(
        (a) =>
          a.Activo !== false &&
          !a.esPlaceholder &&
          Number(a.IdSubFrente) === idSubFrente
      ).length;

      return asignados < maxPermitido;
    });
  };

  const opcionesDisponibles = obtenerOpcionesSubfrente(null);
  const sePuedeAgregar = opcionesDisponibles.length > 0;

  return (
    <div className="field col-12 md:col-12">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", width: "100%" }}>
        <label className="font-h3">
          Asignaciones
        </label>

        {!permisosActual.controlesOcultos.includes("btnAgregarAsignacion") && (
          <Boton
            icon="pi pi-plus"
            label="Agregar Asignación"
            color="primary"
            type="button"
            onClick={() => {
              if (!sePuedeAgregar) {
                toastRef.current.show({
                  severity: "warn",
                  summary: "Especialización Requerida",
                  detail: "Para agregar una nueva asignación, primero debes registrar una especialización en la sección superior o asegurarte de tener cupos disponibles.",
                  life: 5000,
                });
                const tablaEspecializaciones = document.getElementById("tabla-especializaciones");
                if (tablaEspecializaciones) {
                  tablaEspecializaciones.classList.add("table-warning-blink");
                  setTimeout(() => {
                    tablaEspecializaciones.classList.remove("table-warning-blink");
                  }, 5000);
                }
                return;
              }
              addRow();
              // Como formik se actualiza asincrónicamente, abriremos el modal en el último elemento (que se agregará)
              // Pero es mejor forzar la edición del último
              setTimeout(() => {
                const len = formik.values.asignaciones ? formik.values.asignaciones.length : 0;
                setEditingIndex(len);
                setVisibleModal(true);
              }, 100);
            }}
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
        )}
      </div>
      <div className={`table-warning-wrapper ${highlightZero ? "table-warning-blink" : ""}`}>
        <DatatableDefault
          showSearch={false}
          paginator={false}
          value={(formik.values.asignaciones || []).filter((a) => a.Activo !== false && !a.esPlaceholder)}
        >
          <Column
            header="Subfrente"
            body={(asignacion) => {
              const originalIndex = formik.values.asignaciones.findIndex((a) => a.idUnico === asignacion.idUnico);
              if (originalIndex === -1) return "—";
              return obtenerOpcionesSubfrente(formik.values.asignaciones[originalIndex].IdSubFrente).find(
                (s) => Number(s.idSubFrente) === Number(formik.values.asignaciones[originalIndex].IdSubFrente)
              )?.nombre || "—";
            }}
          />

          <Column
            header="Consultor"
            body={(asignacion) => {
              const originalIndex = formik.values.asignaciones.findIndex((a) => a.idUnico === asignacion.idUnico);
              if (originalIndex === -1) return "—";
              return (
                !formik.values.asignaciones?.[originalIndex]?.IdSubFrente
                  ? consultores
                  : consultoresPorFila[originalIndex] || []
              ).find((c) => Number(c.id) === Number(asignacion.IdConsultor))?.nombre || "—";
            }}
          />

          <Column
            header="Fecha Inicio"
            body={(asignacion) => asignacion.FechaAsignacion ? new Date(asignacion.FechaAsignacion).toLocaleDateString("es-ES") : "—"}
          />

          <Column
            header="Fecha Fin"
            body={(asignacion) => asignacion.FechaDesasignacion ? new Date(asignacion.FechaDesasignacion).toLocaleDateString("es-ES") : "—"}
          />

          <Column
            header="H. Planificadas"
            body={(asignacion) => calcularTotalHorasPlan(asignacion, formik.values.frenteSubFrentes)}
            align="center"
          />

          <Column
            header="H. Trabajadas"
            align="center"
            body={(asignacion) => {
              const originalIndex = formik.values.asignaciones.findIndex((a) => a.idUnico === asignacion.idUnico);
              if (originalIndex === -1) return 0;
              const codRol = localStorage.getItem("codRol");
              const tasks = formik.values.asignaciones[originalIndex]?.DetalleTareasConsultor || [];
              const tieneHorasEnFormik = tasks.some(t => t.Activo && parseFloat(t.Horas || 0) > 0);

              let totalHrs = 0;
              if (tieneHorasEnFormik) {
                totalHrs = tasks.filter(t => t.Activo).reduce((sum, t) => sum + parseFloat(t.Horas || 0), 0);
              } else {
                totalHrs = totalesFijos?.[originalIndex]?.totalHoras || 0;
              }

              const isZero = Number(totalHrs) === 0;
              const showWorkedHoursAlert = codRol === "CONSULTOR" || codRol === "GESTORCONSULTORIA" || codRol === "ADMIN" || codRol === "SUPERADMIN";

              if (showWorkedHoursAlert && isZero) {
                return <span className="hrs-t-cero-badge">0</span>;
              }
              return totalHrs;
            }}
          />

          <Column
            header="Tareo"
            body={(asignacion) => {
              const originalIndex = formik.values.asignaciones.findIndex((a) => a.idUnico === asignacion.idUnico);
              if (originalIndex === -1) return null;
              return (
                <Horas
                  mode="TAREO"
                  index={originalIndex}
                  asignacion={asignacion}
                  formik={formik}
                  permisosActual={permisosActual}
                  parametros={parametros}
                  codFrentes={codFrentes}
                  toastRef={toastRef}
                />
              );
            }}
          />

          {!permisosActual.controlesOcultos.includes("btnEliminar") && (
            <Column
              header="Acciones"
              body={(asignacion) => {
                const originalIndex = formik.values.asignaciones.findIndex((a) => a.idUnico === asignacion.idUnico);
                if (originalIndex === -1) return null;
                return (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div className="profesor-datatable-accion">
                      <div
                        className="accion-eliminar"
                        style={{ backgroundColor: "#0e71ae", marginRight: "8px" }}
                        onClick={() => handleEditar(originalIndex)}
                        title="Editar"
                      >
                        <span><Iconsax.Edit2 color="#ffffff" /></span>
                      </div>
                      <div
                        className="accion-eliminar"
                        onClick={() => removeRow(asignacion.idUnico)}
                        title="Eliminar"
                      >
                        <span><Iconsax.Trash color="#ffffff" /></span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          )}
        </DatatableDefault>
      </div>

      {/* MODAL DE EDICION */}
      <Dialog
        header={editingIndex !== null && formik.values.asignaciones[editingIndex]?.IdSubFrente ? "Editar Asignación" : "Agregar Asignación"}
        visible={visibleModal}
        onHide={() => {
          setVisibleModal(false);
          setEditingIndex(null);
        }}
        style={{ width: "min(600px, 90vw)" }}
        footer={
          <div className="flex justify-content-end gap-2">
            <Boton
              label="Guardar"
              icon="pi pi-save"
              color="primary"
              onClick={() => {
                setVisibleModal(false);
                setEditingIndex(null);
                formik.handleSubmit();
              }}
            />
            <Boton
              label="Cerrar"
              icon="pi pi-times"
              style={{ backgroundColor: "#dd4b39", color: "white" }}
              onClick={() => {
                setVisibleModal(false);
                setEditingIndex(null);
              }}
            />
          </div>
        }
        modal
        draggable={true}
        resizable={false}
      >
        {editingIndex !== null && formik.values.asignaciones[editingIndex] && (
          <div className="p-fluid grid">
            {/* Subfrente */}
            <div className="field col-12 md:col-6">
              <label className="label-form">Subfrente</label>
              <DropdownDefault
                id={`modal-IdSubFrente`}
                placeholder="Seleccione"
                value={formik.values.asignaciones[editingIndex].IdSubFrente}
                options={obtenerOpcionesSubfrente(formik.values.asignaciones[editingIndex].IdSubFrente)}
                optionLabel="nombre"
                optionValue="idSubFrente"
                onChange={async (e) => {
                  const idSubFrente = e.value;
                  const maxPermitido = obtenerCantidadPermitida(idSubFrente);
                  const asignados = contarAsignaciones(idSubFrente);

                  if (asignados >= maxPermitido) {
                    toastRef?.current?.show?.({
                      severity: "warn",
                      summary: "Límite",
                      detail: `Solo se permiten ${maxPermitido} asignaciones para este subfrente`,
                      life: 5000,
                    });
                    return;
                  }

                  const seleccionado = subfrentesSeleccionados.find((s) => s.idSubFrente === idSubFrente);
                  const idFrente = seleccionado?.idFrente;

                  const asignacion = formik.values.asignaciones[editingIndex];
                  const currentFsfUid = asignacion._frenteSubFrenteUid;
                  const placeholderIdx = (formik.values.asignaciones || []).findIndex(
                    (a) =>
                      a.Activo !== false &&
                      a.esPlaceholder &&
                      (currentFsfUid ? a._frenteSubFrenteUid === currentFsfUid : Number(a.IdSubFrente) === Number(idSubFrente))
                  );

                  if (placeholderIdx !== -1) {
                    const placeholder = formik.values.asignaciones[placeholderIdx];
                    if (idSubFrente) {
                      const data = await ObtenerConsultoresPorFrente(idFrente, idSubFrente);
                      setConsultoresPorFila((prev) => ({ ...prev, [placeholderIdx]: data }));
                    }

                    const especializacion = formik.values.frenteSubFrentes.find((esp) => esp.activo && esp._uid === placeholder._frenteSubFrenteUid);
                    const uuidAEliminar = asignacion.idUnico;
                    const nuevasAsig = (formik.values.asignaciones || [])
                      .filter((a) => a.idUnico !== uuidAEliminar)
                      .map((a) => {
                        if (a.idUnico === placeholder.idUnico) {
                          const updated = { ...a, esPlaceholder: false };
                          if (especializacion) {
                            if (!updated.FechaAsignacion && especializacion.fechaInicio) {
                              updated.FechaAsignacion = especializacion.fechaInicio;
                            }
                            if (!updated.FechaDesasignacion && especializacion.fechaFin) {
                              updated.FechaDesasignacion = especializacion.fechaFin;
                            }
                          }
                          return updated;
                        }
                        return a;
                      });

                    // Actualizar el formik state
                    formik.setFieldValue("asignaciones", nuevasAsig);

                    // Actualizar editingIndex al nuevo índice en lugar de cerrar el modal
                    const nuevoIndex = nuevasAsig.findIndex((a) => a.idUnico === placeholder.idUnico);
                    setEditingIndex(nuevoIndex);
                  } else {
                    formik.setFieldValue(`asignaciones[${editingIndex}].IdSubFrente`, idSubFrente);
                    formik.setFieldValue(`asignaciones[${editingIndex}].IdFrente`, idFrente);

                    if (idSubFrente) {
                      const data = await ObtenerConsultoresPorFrente(idFrente, idSubFrente);
                      setConsultoresPorFila((prev) => ({ ...prev, [editingIndex]: data }));
                    }
                  }
                }}
                onBlur={formik.handleBlur}
                disabled={
                  permisosActual.divsBloqueados.includes("divAsignaciones") &&
                  formik.values.asignaciones[editingIndex].IdSubFrente !== "" &&
                  formik.values.asignaciones[editingIndex].Activo === true
                }
              />
            </div>

            {/* Consultor */}
            <div className="field col-12 md:col-6">
              <label className="label-form">Consultor</label>
              <DropdownDefault
                id={`modal-IdConsultor`}
                placeholder="Seleccione"
                value={formik.values.asignaciones[editingIndex].IdConsultor}
                options={
                  !formik.values.asignaciones?.[editingIndex]?.IdSubFrente
                    ? consultores
                    : consultoresPorFila[editingIndex] || []
                }
                optionLabel="nombre"
                optionValue="id"
                onChange={(e) => {
                  formik.setFieldValue(`asignaciones[${editingIndex}].IdConsultor`, e.value);
                }}
                onBlur={formik.handleBlur}
                disabled={
                  permisosActual.divsBloqueados.includes("divAsignaciones") &&
                  formik.values.asignaciones[editingIndex].IdConsultor !== "" &&
                  formik.values.asignaciones[editingIndex].Activo === true
                }
              />
            </div>

            {/* Fecha Inicio */}
            <div className="field col-12 md:col-6">
              <label className="label-form">Fecha Inicio</label>
              <CalendarFormik
                name={`asignaciones[${editingIndex}].FechaAsignacion`}
                value={formik.values.asignaciones[editingIndex].FechaAsignacion}
                setFieldValue={formik.setFieldValue}
                minDate={formik.values.fechaSolicitud ? new Date(formik.values.fechaSolicitud) : null}
                showSeconds={false}
                showTime={false}
                dateFormat="dd/mm/yy"
              />
            </div>

            {/* Fecha Fin */}
            <div className="field col-12 md:col-6">
              <label className="label-form">Fecha Fin</label>
              <CalendarFormik
                name={`asignaciones[${editingIndex}].FechaDesasignacion`}
                value={formik.values.asignaciones[editingIndex].FechaDesasignacion}
                setFieldValue={formik.setFieldValue}
                minDate={
                  formik.values.asignaciones[editingIndex].FechaAsignacion
                    ? new Date(formik.values.asignaciones[editingIndex].FechaAsignacion)
                    : new Date()
                }
                showSeconds={false}
                showTime={false}
                dateFormat="dd/mm/yy"
              />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Asignaciones;
