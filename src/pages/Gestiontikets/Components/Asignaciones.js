// Asignaciones.js
import DropdownDefault from "../../../components/DropdownDefault/DropdownDefault";
import Horas from "./Horas";
import CalendarFormik from "../../../components/Calendar/CalendarFormik";
import * as Iconsax from "iconsax-react";
import Boton from "../../../components/Boton/Boton";

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

  return (
    <div className="field col-12 md:col-12">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", width: "100%" }}>
        <label style={{ fontWeight: "bold", fontSize: 20, margin: 0 }}>
          Asignaciones
        </label>

        {!permisosActual.controlesOcultos.includes("btnAgregarAsignacion") && (
          <Boton
            icon="pi pi-plus"
            label="Agregar Asignación"
            color="primary"
            type="button"
            onClick={addRow}
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
        <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Subfrente</th>
            <th className="p-2 border">Consultor</th>
            <th className="p-2 border">Fecha Inicio</th>
            <th className="p-2 border">Fecha Fin</th>
            <th className="p-2 border">H. Planificadas</th>
            <th className="p-2 border">H. Trabajadas</th>
            <th className="p-2 border">Tareo</th>
            {!permisosActual.controlesOcultos.includes("btnEliminar") && (
              <th className="p-2 border">Eliminar</th>
            )}
          </tr>
        </thead>

        <tbody>
          {(formik.values.asignaciones || [])
            .filter((a) => a.Activo !== false && !a.esPlaceholder)
            .map((asignacion, idxMap) => {
              const originalIndex = (formik.values.asignaciones || []).findIndex(
                (a) => a.idUnico === asignacion.idUnico
              );
              if (originalIndex === -1) return null;

              return (
                <tr key={asignacion.idUnico} className="border-t">
                  {/* SUBFRENTE */}
                  <td className="p-2 border">
                    <DropdownDefault
                      id={`IdSubFrente-${originalIndex}`}
                      name={`asignaciones[${originalIndex}].IdSubFrente`}
                      placeholder="Seleccione"
                      value={formik.values.asignaciones[originalIndex].IdSubFrente}
                      options={obtenerOpcionesSubfrente(formik.values.asignaciones[originalIndex].IdSubFrente)}
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

                        const seleccionado = subfrentesSeleccionados.find(
                          (s) => s.idSubFrente === idSubFrente
                        );
                        const idFrente = seleccionado?.idFrente;

                        // Buscar placeholder vinculado a la misma especialización que esta asignación
                        // o un placeholder para este subfrente sin vínculo específico
                        const currentFsfUid = asignacion._frenteSubFrenteUid;
                        const placeholderIdx = (formik.values.asignaciones || []).findIndex(
                          (a) => a.Activo !== false && a.esPlaceholder &&
                            (currentFsfUid
                              ? a._frenteSubFrenteUid === currentFsfUid
                              : Number(a.IdSubFrente) === Number(idSubFrente))
                        );

                        if (placeholderIdx !== -1) {
                          // Encontró una asignación placeholder. La activamos (esPlaceholder: false)
                          // y removemos el nuevo renglón vacío que se estaba editando (en originalIndex).
                          const placeholder = formik.values.asignaciones[placeholderIdx];

                          if (idSubFrente) {
                            const data = await ObtenerConsultoresPorFrente(
                              idFrente,
                              idSubFrente
                            );
                            setConsultoresPorFila((prev) => ({
                              ...prev,
                              [placeholderIdx]: data,
                            }));
                          }

                          const especializacion = formik.values.frenteSubFrentes.find(
                            (esp) => esp.activo && esp._uid === placeholder._frenteSubFrenteUid
                          );

                          // Construir la nueva lista de asignaciones aplicando todos los cambios en un solo paso
                          const uuidAEliminar = asignacion.idUnico;
                          const nuevasAsig = (formik.values.asignaciones || [])
                            .filter((a) => a.idUnico !== uuidAEliminar)
                            .map((a) => {
                              if (a.idUnico === placeholder.idUnico) {
                                const updated = {
                                  ...a,
                                  esPlaceholder: false,
                                };
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

                          formik.setFieldValue("asignaciones", nuevasAsig);

                        } else {
                          // Flujo normal: actualizar la fila que se está editando
                          formik.setFieldValue(
                            `asignaciones[${originalIndex}].IdSubFrente`,
                            idSubFrente
                          );
                          formik.setFieldValue(
                            `asignaciones[${originalIndex}].IdFrente`,
                            idFrente
                          );

                          if (idSubFrente) {
                            const data = await ObtenerConsultoresPorFrente(
                              idFrente,
                              idSubFrente
                            );
                            setConsultoresPorFila((prev) => ({
                              ...prev,
                              [originalIndex]: data,
                            }));
                          }
                        }
                      }}
                      onBlur={formik.handleBlur}
                      disabled={
                        permisosActual.divsBloqueados.includes("divAsignaciones") &&
                        formik.values.asignaciones[originalIndex].IdSubFrente !== "" &&
                        formik.values.asignaciones[originalIndex].Activo === true
                      }
                    />
                  </td>

                  {/* CONSULTOR */}
                  <td className="p-2 border">
                    <DropdownDefault
                      id={`IdConsultor-${asignacion.idUnico}`}
                      placeholder="Seleccione"
                      value={asignacion.IdConsultor}
                      options={
                        !formik.values.asignaciones?.[originalIndex]?.IdSubFrente
                          ? consultores
                          : consultoresPorFila[originalIndex] || []
                      }
                      optionLabel="nombre"
                      optionValue="id"
                      onChange={(e) => {
                        formik.setFieldValue(
                          `asignaciones[${originalIndex}].IdConsultor`,
                          e.value
                        );
                      }}
                      onBlur={formik.handleBlur}
                      disabled={
                        permisosActual.divsBloqueados.includes("divAsignaciones") &&
                        asignacion.IdConsultor !== "" &&
                        asignacion.Activo === true
                      }
                    />
                  </td>

                  {/* FECHA INICIO */}
                  <td className="p-2 border">
                    <CalendarFormik
                      name={`asignaciones[${originalIndex}].FechaAsignacion`}
                      value={asignacion.FechaAsignacion}
                      setFieldValue={formik.setFieldValue}
                      minDate={
                        formik.values.fechaSolicitud
                          ? new Date(formik.values.fechaSolicitud)
                          : null
                      }
                      showSeconds={false}
                    />
                  </td>

                  {/* FECHA FIN */}
                  <td className="p-2 border">
                    <CalendarFormik
                      name={`asignaciones[${originalIndex}].FechaDesasignacion`}
                      value={asignacion.FechaDesasignacion}
                      setFieldValue={formik.setFieldValue}
                      minDate={
                        asignacion.FechaAsignacion
                          ? new Date(asignacion.FechaAsignacion)
                          : new Date()
                      }
                      showSeconds={false}
                    />
                  </td>

                  {/* HORAS PLANIFICADAS */}
                  <td className="p-2 border text-center">
                    {calcularTotalHorasPlan(asignacion, formik.values.frenteSubFrentes)}
                  </td>

                  {/* HORAS TRABAJADAS */}
                  <td className="p-2 border text-center">
                    {(() => {
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
                        return (
                          <span className="hrs-t-cero-badge">
                            0
                          </span>
                        );
                      }
                      return totalHrs;
                    })()}
                  </td>

                  {/* HORAS (TAREO) */}
                  <td className="p-2 border">
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
                  </td>

                  {/* ELIMINAR FILA */}
                  {!permisosActual.controlesOcultos.includes("btnEliminar") && (
                    <td className="p-2 border">
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <div className="profesor-datatable-accion">
                          <div
                            className="accion-eliminar"
                            onClick={() => removeRow(asignacion.idUnico)}
                            title="Eliminar"
                          >
                            <span>
                              <Iconsax.Trash color="#ffffff" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>

    </div>
  );
};

export default Asignaciones;
