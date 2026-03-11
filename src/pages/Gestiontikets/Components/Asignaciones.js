// Asignaciones.js
import DropdownDefault from "../../../components/Dropdown/DropdownDefault";
import Horas from "./Horas";
import CalendarFormik from "../../../components/Calendar/CalendarFormik";
import * as Iconsax from "iconsax-react";
import Boton from "../../../components/Boton/Boton";

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
}) => {
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
              borderRadius: 20,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          />
        )}
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Subfrente</th>
            <th className="p-2 border">Consultor</th>
            <th className="p-2 border">Fecha Inicio</th>
            <th className="p-2 border">Fecha Fin</th>
            <th className="p-2 border">Planificación</th>
            <th className="p-2 border">H. Trabajadas</th>
            <th className="p-2 border">Tareo</th>
            {!permisosActual.controlesOcultos.includes("btnEliminar") && (
              <th className="p-2 border">Eliminar</th>
            )}
          </tr>
        </thead>

        <tbody>
          {(formik.values.asignaciones || [])
            .filter((a) => a.Activo !== false)
            .map((asignacion, index) => (
              <tr key={asignacion.idUnico} className="border-t">
                {/* SUBFRENTE */}
                <td className="p-2 border">
                  <DropdownDefault
                    id={`IdSubFrente-${index}`}
                    name={`asignaciones[${index}].IdSubFrente`}
                    placeholder="Seleccione"
                    value={formik.values.asignaciones[index].IdSubFrente}
                    options={subfrentesSeleccionados}
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

                      formik.setFieldValue(
                        `asignaciones[${index}].IdSubFrente`,
                        idSubFrente
                      );
                      formik.setFieldValue(
                        `asignaciones[${index}].IdFrente`,
                        idFrente
                      );

                      if (idSubFrente) {
                        const data = await ObtenerConsultoresPorFrente(
                          idFrente,
                          idSubFrente
                        );
                        setConsultoresPorFila((prev) => ({
                          ...prev,
                          [index]: data,
                        }));
                      }
                    }}
                    onBlur={formik.handleBlur}
                    disabled={
                      permisosActual.divsBloqueados.includes("divAsignaciones") &&
                      formik.values.asignaciones[index].IdSubFrente !== "" &&
                      formik.values.asignaciones[index].Activo === true
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
                      !formik.values.asignaciones?.[index]?.IdSubFrente
                        ? consultores
                        : consultoresPorFila[index] || []
                    }
                    optionLabel="nombre"
                    optionValue="id"
                    onChange={(e) => {
                      const idx = (formik.values.asignaciones || []).findIndex(
                        (a) => a.idUnico === asignacion.idUnico
                      );
                      if (idx !== -1) {
                        formik.setFieldValue(
                          `asignaciones[${idx}].IdConsultor`,
                          e.value
                        );
                      }
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
                    name={`asignaciones[${index}].FechaAsignacion`}
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
                    name={`asignaciones[${index}].FechaDesasignacion`}
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
                <td className="p-2 border">
                  <Horas
                    mode="PLAN"
                    index={index}
                    asignacion={asignacion}
                    formik={formik}
                    permisosActual={permisosActual}
                    parametros={parametros}
                    codFrentes={codFrentes}
                    toastRef={toastRef}
                  />
                </td>

                {/* HORAS TRABAJADAS */}
                <td className="p-2 border text-center">
                  {totalesFijos?.[index]?.totalHoras || 0}
                </td>

                {/* HORAS (TAREO) */}
                <td className="p-2 border">
                  <Horas
                    mode="TAREO"
                    index={index}
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
            ))}
        </tbody>
      </table>

    </div>
  );
};

export default Asignaciones;
