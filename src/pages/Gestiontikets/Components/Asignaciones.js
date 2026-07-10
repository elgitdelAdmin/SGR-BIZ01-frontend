// Asignaciones.js
import React, { useState, useMemo } from "react";
import { Dialog } from "primereact/dialog";
import InputTextDefault from "../../../components/InputTextDefault/InputTextDefault";
import DropdownDefault from "../../../components/DropdownDefault/DropdownDefault";
import Horas from "./Horas";
import CalendarFormik from "../../../components/Calendar/CalendarFormik";
import * as Iconsax from "iconsax-react";
import Boton from "../../../components/Boton/Boton";
import DatatableDefault from "../../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

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
  const detallesFiltrados = detalles.filter((d) => {
    if (!d.Activo) return false;

    // Si la planificación está asociada a un consultor/asignación específico
    if (d.IdTicketConsultorAsignacion > 0 && asignacion.Id > 0) {
      return Number(d.IdTicketConsultorAsignacion) === Number(asignacion.Id);
    }

    return true;
  });

  const totalMin = detallesFiltrados.reduce((acc, it) => acc + hhmmToMinutes(it.Horas), 0);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  return `${hh}:${String(mm).padStart(2, "0")}`;
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
  frentes,
}) => {
  const frentesById = useMemo(() => {
    const map = new Map();
    (frentes || []).forEach((f) => map.set(f.id, f));
    return map;
  }, [frentes]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

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
            actionType="agregar"
            label="Agregar Asignación"
            onClick={() => {
              const limiteTotal = (formik.values.frenteSubFrentes || [])
                .filter((e) => e.activo !== false)
                .reduce((sum, e) => sum + (e.cantidad ?? 0), 0);

              const asignacionesActivas = (formik.values.asignaciones || [])
                .filter((a) => a.Activo !== false && !a.esPlaceholder)
                .length;

              if (asignacionesActivas >= limiteTotal) {
                toastRef.current.show({
                  severity: "warn",
                  summary: "Cupos Completados",
                  detail: `Has completado todos los cupos de tus especializaciones (${limiteTotal}). Incrementa la cantidad de consultores en tu especialización superior para agregar más asignaciones.`,
                  life: 5000,
                });
                return;
              }

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
            header="Frente / subfrente"
            style={{ width: "20%" }}
            body={(asignacion) => {
              const originalIndex = formik.values.asignaciones.findIndex((a) => a.idUnico === asignacion.idUnico);
              if (originalIndex === -1) return "—";
              
              const asig = formik.values.asignaciones[originalIndex];
              
              const esp = (formik.values.frenteSubFrentes || []).find((e) => {
                if (e.activo === false) return false;
                if (asig._frenteSubFrenteUid && e._uid) {
                  return asig._frenteSubFrenteUid === e._uid;
                }
                if (asig.IdTicketFrenteSubFrente && e.id) {
                  return Number(asig.IdTicketFrenteSubFrente) === Number(e.id);
                }
                if (asig.IdSubFrente && e.idSubFrente) {
                  return Number(asig.IdSubFrente) === Number(e.idSubFrente);
                }
                return false;
              });

              let frente = "—";
              let subfrente = "—";

              if (esp) {
                const frenteData = frentesById.get(Number(esp.idFrente));
                frente = frenteData?.nombre || "—";
                const sub = (frenteData?.subFrente || []).find((sf) => Number(sf.id) === Number(esp.idSubFrente));
                subfrente = sub?.nombre || "—";
              }

              return (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 600, color: "#2e4878" }}>{frente}</span>
                  <span style={{ fontSize: "12px", color: "#9198a7", marginTop: "2px" }}>{subfrente}</span>
                </div>
              );
            }}
          />

          <Column
            header="Consultor"
            body={(asignacion) => {
              const originalIndex = formik.values.asignaciones.findIndex((a) => a.idUnico === asignacion.idUnico);
              if (originalIndex === -1) return "—";
              const name = (
                !formik.values.asignaciones?.[originalIndex]?.IdSubFrente
                  ? consultores
                  : consultoresPorFila[originalIndex] || []
              ).find((c) => Number(c.id) === Number(asignacion.IdConsultor))?.nombre || "—";
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
            body={(asignacion) => {
              const start = asignacion.FechaAsignacion ? new Date(asignacion.FechaAsignacion).toLocaleDateString("es-ES") : "";
              const end = asignacion.FechaDesasignacion ? new Date(asignacion.FechaDesasignacion).toLocaleDateString("es-ES") : "";
              if (!start && !end) return "—";
              return (
                <span style={{ color: "#646e8c", fontSize: "13px", whiteSpace: "nowrap" }}>
                  {start} &rarr; {end}
                </span>
              );
            }}
          />

          <Column
            header=""
            body={() => ""}
          />

          <Column
            header="Planificadas / Trabajadas"
            align="center"
            alignHeader="center"
            style={{ width: "120px", textAlign: "center" }}
            headerStyle={{ textAlign: "center", justifyContent: "center" }}
            body={(asignacion) => {
              const hrsPlan = calcularTotalHorasPlan(asignacion, formik.values.frenteSubFrentes);

              const originalIndex = formik.values.asignaciones.findIndex((a) => a.idUnico === asignacion.idUnico);
              if (originalIndex === -1) return "—";

              const tasks = formik.values.asignaciones[originalIndex]?.DetalleTareasConsultor || [];
              const tieneHorasEnFormik = tasks.some(t => t.Activo && hhmmToMinutes(t.Horas) > 0);
              let totalHrsStr = "0:00";
              if (tieneHorasEnFormik) {
                const totalMin = tasks.filter(t => t.Activo).reduce((sum, t) => sum + (hhmmToMinutes(t.Horas) || 0), 0);
                const hh = Math.floor(totalMin / 60);
                const mm = totalMin % 60;
                totalHrsStr = `${hh}:${String(mm).padStart(2, "0")}`;
              } else {
                const th = totalesFijos?.[originalIndex]?.totalHoras;
                totalHrsStr = th ? String(th).replace(".", ":") : "0:00";
              }
              const isZero = totalHrsStr === "0:00" || totalHrsStr === "0.00" || totalHrsStr === "0";
              const codRol = localStorage.getItem("codRol");
              const showWorkedHoursAlert = codRol === "CONSULTOR" || codRol === "GESTORCONSULTORIA" || codRol === "ADMIN" || codRol === "SUPERADMIN";

              let badgeClass = "horas-blue";
              if (isZero) {
                if (showWorkedHoursAlert) {
                  badgeClass = "hrs-t-cero-badge";
                } else {
                  badgeClass = "horas-warning";
                }
              }

              return (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span style={{ color: "#646e8c", fontSize: "13px" }}>{hrsPlan} h</span>
                  <span>/</span>
                  <span className={`horas-badge ${badgeClass}`}>
                    {totalHrsStr} h
                  </span>
                </div>
              );
            }}
          />

          <Column
            header="Tareo"
            align="center"
            alignHeader="center"
            style={{ width: "95px", textAlign: "center" }}
            headerStyle={{ textAlign: "center", justifyContent: "center" }}
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
              align="center"
              alignHeader="center"
              style={{ width: "100px", textAlign: "center" }}
              headerStyle={{ textAlign: "center", justifyContent: "center" }}
              body={(asignacion) => {
                const originalIndex = formik.values.asignaciones.findIndex((a) => a.idUnico === asignacion.idUnico);
                if (originalIndex === -1) return null;
                return (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                    <Button
                      type="button"
                      icon="pi pi-pencil"
                      className="accion-editar"
                      onClick={() => handleEditar(originalIndex)}
                      tooltip="Editar"
                      style={{ width: "32px", height: "32px", padding: 0 }}
                    />
                    <Button
                      type="button"
                      icon="pi pi-trash"
                      className="accion-eliminar"
                      onClick={() => removeRow(asignacion.idUnico)}
                      tooltip="Eliminar"
                      style={{ width: "32px", height: "32px", padding: 0 }}
                    />
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
          if (editingIndex !== null) {
            const currentItem = formik.values.asignaciones[editingIndex];
            if (currentItem && Number(currentItem.Id) === 0 && (Number(currentItem.IdSubFrente) === 0 || Number(currentItem.IdConsultor) === 0)) {
              const nuevas = (formik.values.asignaciones || []).filter((_, idx) => idx !== editingIndex);
              formik.setFieldValue("asignaciones", nuevas);
            }
          }
          setVisibleModal(false);
          setEditingIndex(null);
        }}
        style={{ width: "min(600px, 90vw)" }}
        footer={
          <div className="flex justify-content-end gap-2">
            <Boton
              actionType="guardar"
              onClick={() => {
                if (editingIndex !== null) {
                  const currentItem = formik.values.asignaciones[editingIndex];
                  if (!currentItem || !currentItem.IdSubFrente || !currentItem.IdConsultor) {
                    toastRef.current.show({
                      severity: "warn",
                      summary: "Campos Requeridos",
                      detail: "Por favor seleccione un Subfrente y un Consultor para guardar la asignación.",
                      life: 5000
                    });
                    return;
                  }
                  formik.handleSubmit();
                }
                setVisibleModal(false);
                setEditingIndex(null);
              }}
            />
            <Boton
              actionType="cerrar"
              onClick={() => {
                if (editingIndex !== null) {
                  const currentItem = formik.values.asignaciones[editingIndex];
                  if (currentItem && Number(currentItem.Id) === 0 && (Number(currentItem.IdSubFrente) === 0 || Number(currentItem.IdConsultor) === 0)) {
                    const nuevas = (formik.values.asignaciones || []).filter((_, idx) => idx !== editingIndex);
                    formik.setFieldValue("asignaciones", nuevas);
                  }
                }
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
    </div>
  );
};

export default Asignaciones;
