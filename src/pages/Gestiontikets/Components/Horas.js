// src/pages/Gestiontikets/Components/Horas.js
import React, { useMemo, useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import Boton from "../../../components/Boton/Boton";
import { Calendar } from "primereact/calendar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import DropdownDefault from "../../../components/Dropdown/DropdownDefault";

const getPermKey = (mode) =>
  mode === "PLAN" ? "divHorasPlanificacion" : "divHorasTareo";

/**
 * Normaliza entrada a "HH.MM" con 2 decimales
 * - "10" => "10.00"
 * - "2.5" => "2.50"
 * - "2." => "2.00"
 * - "02.7" => "2.70"
 */
const normalizeHHMM = (raw) => {
  const s = String(raw ?? "").trim();
  if (!s) return "";

  // permitir solo números y punto
  const cleaned = s.replace(/[^0-9.]/g, "");
  if (!cleaned) return "";

  const parts = cleaned.split(".");
  const hhStr = parts[0] ?? "0";
  const mmStrRaw = parts[1] ?? "";

  const hh = String(Number(hhStr || "0"));

  // minutos: si viene vacío => 00, si 1 dígito => x0, si 2 => ok, si más => corta
  let mm = mmStrRaw;
  if (mm === "") mm = "00";
  if (mm.length === 1) mm = `${mm}0`;
  if (mm.length > 2) mm = mm.slice(0, 2);

  return `${hh}.${mm}`;
};

const isValidHHMM = (hhmm) => {
  const s = String(hhmm ?? "").trim();
  if (!s) return false;
  // "10" o "10.5" o "10.50"
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return false;

  const norm = normalizeHHMM(s);
  const [hhStr, mmStr = "00"] = norm.split(".");
  const hh = Number(hhStr);
  const mm = Number(mmStr);

  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return false;
  if (hh < 0) return false;
  if (mm < 0 || mm > 59) return false;

  return true;
};

const hhmmToMinutes = (hhmm) => {
  if (!hhmm) return null;
  const norm = normalizeHHMM(hhmm);
  const [hhStr, mmStr = "00"] = norm.split(".");
  const hh = Number(hhStr);
  const mm = Number(mmStr);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  if (mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
};

const addMinutes = (date, minutes) => {
  if (!(date instanceof Date) || isNaN(date)) return null;
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
};

// TAREO: FechaFin = FechaInicio + duración HH.MM
const buildFechaFinTareo = (fechaInicio, horasHHMM) => {
  if (!fechaInicio || !horasHHMM) return null;
  const mins = hhmmToMinutes(horasHHMM);
  if (!mins || mins <= 0) return null;
  return addMinutes(new Date(fechaInicio), mins);
};

const Horas = ({
  mode, // "TAREO" | "PLAN"
  index,
  asignacion,
  frenteSubFrente,
  formik,
  permisosActual,
  parametros,
  codFrentes,
  toastRef,
  readOnly = false,
}) => {
  const isPlan = mode === "PLAN";
  const isTareo = mode === "TAREO";

  const fieldKey = isPlan
    ? "DetallePlanificacionConsultor"
    : "DetalleTareasConsultor";

  const permKey = getPermKey(mode);

  const [visible, setVisible] = useState(false);

  const [addDisabledGate, setAddDisabledGate] = useState(true);
  const [delDisabledGate, setDelDisabledGate] = useState(true);

  const [nuevo, setNuevo] = useState({
    FechaInicio: null,
    FechaFin: null,
    Horas: "", // <-- texto crudo mientras escribe
    Descripcion: "",
    Activo: true,
    IdTicketConsultorAsignacion: 0,
    Id: 0,
    IdTipoActividad: 0,
  });

  const [errorHoras, setErrorHoras] = useState("");

  // ========= Permisos =========
  const estaBloqueado = useMemo(() => {
    // Si es planificación, no se bloquea por permisos para que el Gestor de Consultoría
    // pueda ingresar la planificación después de agregar la asignación correspondiente.
    if (isPlan) return false;
    return permisosActual?.divsBloqueados?.includes(permKey);
  }, [permisosActual, permKey, isPlan]);

  const localIdConsultor = window.localStorage.getItem("idConsultor");
  const isOwner = asignacion?.IdConsultor == localIdConsultor;

  // - TAREO: solo owner puede editar
  // - PLAN: no exige owner
  const puedeEditar = useMemo(() => {
    if (readOnly) return false;
    if (estaBloqueado) return false;
    if (isTareo) return isOwner;
    return true;
  }, [readOnly, estaBloqueado, isTareo, isOwner]);

  const iconBtn = puedeEditar ? "pi pi-plus" : "pi pi-eye";

  const dialogTitle = useMemo(() => {
    if (!puedeEditar) return isPlan ? "Ver Planificación" : "Ver Horas";
    return isPlan ? "Planificar Horas" : "Asignar Horas";
  }, [puedeEditar, isPlan]);

  // reset al abrir
  useEffect(() => {
    if (!visible) return;
    setAddDisabledGate(true);
    setDelDisabledGate(true);
    setErrorHoras("");

    setNuevo({
      FechaInicio: null,
      FechaFin: null,
      Horas: "",
      Descripcion: "",
      Activo: true,
      IdTicketConsultorAsignacion: isTareo ? (asignacion?.Id ?? 0) : 0,
      IdTicketFrenteSubFrente: isPlan ? (frenteSubFrente?.id ?? frenteSubFrente?.Id ?? 0) : 0,
      Id: 0,
      IdTipoActividad: 0,
    });
  }, [visible, asignacion?.Id, frenteSubFrente?.id, frenteSubFrente?.Id, isPlan, isTareo]);

  const current = useMemo(() => {
    const arr = isPlan
      ? (formik.values.frenteSubFrentes?.[index]?.DetallePlanificacionConsultor || [])
      : (formik.values.asignaciones?.[index]?.[fieldKey] || []);
    return Array.isArray(arr) ? arr : [];
  }, [formik.values.frenteSubFrentes, formik.values.asignaciones, index, isPlan, fieldKey]);

  const currentActivos = useMemo(() => current.filter((d) => d.Activo), [current]);

  const totalHorasHHMM = useMemo(() => {
    const totalMin = currentActivos.reduce((acc, it) => {
      const mins = hhmmToMinutes(it.Horas);
      return acc + (mins || 0);
    }, 0);
    const hh = Math.floor(totalMin / 60);
    const mm = totalMin % 60;
    return `${hh}.${String(mm).padStart(2, "0")}`;
  }, [currentActivos]);

  const optionsTipoActividad = useMemo(() => {
    return (parametros || []).filter(
      (p) =>
        p.tipoParametro === "TipoActividad" &&
        (codFrentes || []).includes(p.valor1)
    );
  }, [parametros, codFrentes]);

  const minFechaPlan = isPlan
    ? (frenteSubFrente?.fechaInicio ? new Date(frenteSubFrente.fechaInicio) : null)
    : (asignacion?.FechaAsignacion ? new Date(asignacion.FechaAsignacion) : null);
  const maxFechaPlan = isPlan
    ? (frenteSubFrente?.fechaFin ? new Date(frenteSubFrente.fechaFin) : null)
    : (asignacion?.FechaDesasignacion ? new Date(asignacion.FechaDesasignacion) : null);

  // ✅ En TAREO: si ya tienes Horas válida y cambias FechaInicio => recalcula FechaFin
  const recalcularFechaFinTareoSiAplica = (FechaInicio, horasRaw) => {
    if (!isTareo) return null;
    if (!FechaInicio) return null;
    if (!horasRaw) return null;

    if (!isValidHHMM(horasRaw)) return null;
    const horasNorm = normalizeHHMM(horasRaw);

    const mins = hhmmToMinutes(horasNorm);
    if (!mins || mins <= 0) return null;
    if (mins > 16 * 60) return null;

    return buildFechaFinTareo(FechaInicio, horasNorm);
  };

  const validarYNormalizarHorasEnBlur = () => {
    if (!nuevo.Horas) {
      setErrorHoras("");
      return;
    }

    if (!isValidHHMM(nuevo.Horas)) {
      setErrorHoras("Formato inválido. Usa HH.MM con minutos 00–59 (ej: 2.50).");
      return;
    }

    const horasNorm = normalizeHHMM(nuevo.Horas);
    const mins = hhmmToMinutes(horasNorm);

    if (!mins || mins <= 0) {
      setErrorHoras("Horas debe ser mayor a 0 (ej: 0.30).");
      return;
    }

    if (isTareo && mins > 16 * 60) {
      setErrorHoras("En tareo, el máximo permitido es 16.00 horas.");
      return;
    }

    setErrorHoras("");

    // ✅ normaliza el texto SOLO en blur
    // ✅ y en TAREO calcula FechaFin automático SOLO en blur
    const fechaFinAuto = isTareo
      ? buildFechaFinTareo(nuevo.FechaInicio, horasNorm)
      : null;

    setNuevo((p) => ({
      ...p,
      Horas: horasNorm,
      FechaFin: isTareo ? fechaFinAuto : p.FechaFin,
    }));
  };

  const agregar = () => {
    if (!puedeEditar) return;

    const { FechaInicio, FechaFin, Horas, Descripcion, IdTipoActividad } = nuevo;

    if (!FechaInicio || !Horas || !Descripcion || !IdTipoActividad) {
      toastRef?.current?.show?.({
        severity: "warn",
        summary: "Campos incompletos",
        detail:
          "Debes completar Fecha de inicio, Horas, Tipo Actividad y Descripción antes de agregar.",
        life: 5000,
      });
      return;
    }

    if (!isValidHHMM(Horas)) {
      setErrorHoras("Formato inválido. Usa HH.MM con minutos 00–59 (ej: 2.50).");
      return;
    }

    const horasNorm = normalizeHHMM(Horas);
    const minsNuevo = hhmmToMinutes(horasNorm);

    if (!minsNuevo || minsNuevo <= 0) {
      setErrorHoras("Horas debe ser mayor a 0 (ej: 0.30).");
      return;
    }

    // ✅ TAREO: máximo 16 y FechaFin automática
    let finalFechaFin = FechaFin;

    if (isTareo) {
      if (minsNuevo > 16 * 60) {
        setErrorHoras("En tareo, el máximo permitido es 16.00 horas.");
        return;
      }

      finalFechaFin = buildFechaFinTareo(FechaInicio, horasNorm);
      if (!finalFechaFin) {
        toastRef?.current?.show?.({
          severity: "warn",
          summary: "Campos incompletos",
          detail:
            "No se pudo calcular Fecha fin automáticamente. Revisa Fecha inicio y Horas.",
          life: 5000,
        });
        return;
      }
    }

    // ✅ PLAN: FechaFin obligatoria y válida
    if (isPlan) {
      if (!FechaFin) {
        toastRef?.current?.show?.({
          severity: "warn",
          summary: "Campos incompletos",
          detail: "Debes seleccionar Fecha fin en planificación.",
          life: 5000,
        });
        return;
      }

      const fi = new Date(FechaInicio);
      const ff = new Date(FechaFin);
      fi.setHours(0, 0, 0, 0);
      ff.setHours(0, 0, 0, 0);

      if (ff.getTime() < fi.getTime()) {
        toastRef?.current?.show?.({
          severity: "warn",
          summary: "Fecha inválida",
          detail: "Fecha fin no puede ser menor que Fecha inicio.",
          life: 5000,
        });
        return;
      }
    }

    setErrorHoras("");
    setAddDisabledGate(false);

    // ✅ TAREO: máximo 16h por día (sumatoria del día)
    if (isTareo) {
    const fechaInicioDia = new Date(FechaInicio);
    fechaInicioDia.setHours(0, 0, 0, 0);

    const minutosEnDia = current
        .filter((d) => d.Activo) // por si acaso
        .reduce((total, det) => {
        const detDia = new Date(det.FechaInicio);
        detDia.setHours(0, 0, 0, 0);

        if (detDia.getTime() === fechaInicioDia.getTime()) {
            return total + (hhmmToMinutes(det.Horas) || 0);
        }
        return total;
        }, 0);

    const limiteDia = 16 * 60;

    if (minutosEnDia + minsNuevo > limiteDia) {
        const restante = Math.max(0, limiteDia - minutosEnDia);
        const hh = Math.floor(restante / 60);
        const mm = restante % 60;

        toastRef?.current?.show?.({
        severity: "error",
        summary: "Límite diario",
        detail: `En tareo solo se permite 16.00 horas por día. Disponible hoy: ${hh}.${String(mm).padStart(2, "0")}`,
        life: 7000,
        });
        return;
    }
    }
  
    const updated = [
      ...current,
      {
        ...nuevo,
        Horas: horasNorm,
        FechaFin: finalFechaFin,
        Activo: true,
        IdTicketConsultorAsignacion: isTareo ? (formik.values.asignaciones[index]?.Id ?? 0) : 0,
        IdTicketFrenteSubFrente: isPlan ? (formik.values.frenteSubFrentes[index]?.id ?? formik.values.frenteSubFrentes[index]?.Id ?? 0) : 0,
      },
    ];

    if (isPlan) {
      formik.setFieldValue(`frenteSubFrentes[${index}].DetallePlanificacionConsultor`, updated);
    } else {
      formik.setFieldValue(`asignaciones[${index}].${fieldKey}`, updated);
    }

    setNuevo({
      FechaInicio: null,
      FechaFin: null,
      Horas: "",
      Descripcion: "",
      Activo: true,
      IdTicketConsultorAsignacion: isTareo ? (formik.values.asignaciones[index]?.Id ?? 0) : 0,
      IdTicketFrenteSubFrente: isPlan ? (formik.values.frenteSubFrentes[index]?.id ?? formik.values.frenteSubFrentes[index]?.Id ?? 0) : 0,
      Id: 0,
      IdTipoActividad: 0,
    });
  };

  const eliminar = (rowData) => {
    if (!puedeEditar) return;

    setDelDisabledGate(false);

    const updated = [...current];
    const idx = updated.findIndex(
      (d) =>
        d.FechaInicio === rowData.FechaInicio &&
        d.FechaFin === rowData.FechaFin &&
        String(d.Horas) === String(rowData.Horas) &&
        d.Descripcion === rowData.Descripcion
    );

    if (idx !== -1) {
      updated[idx] = { ...updated[idx], Activo: false };
      if (isPlan) {
        formik.setFieldValue(`frenteSubFrentes[${index}].DetallePlanificacionConsultor`, updated);
      } else {
        formik.setFieldValue(`asignaciones[${index}].${fieldKey}`, updated);
      }
    }
  };

  const footer = (
    <div className="w-full flex justify-between items-center border-t pt-3 px-3">
      <div className="text-left font-semibold text-blue-700">
        Total de horas:&nbsp;{totalHorasHHMM}
      </div>

      <Boton
        label="Registrar"
        color="secondary"
        type="button"
        disabled={addDisabledGate && delDisabledGate}
        onClick={() => {
          formik.handleSubmit();
          setVisible(false);
        }}
      />
    </div>
  );

  return (
    <>
      <Boton
        label=""
        icon={iconBtn}
        onClick={() => setVisible(true)}
        disabled={false}
        color="primary"
        style={{ width: '42px', height: '35px', justifyContent: 'center', minWidth: 'auto', borderRadius: '8px' }}
        type="button"
      />

      <Dialog
        header={dialogTitle}
        visible={visible}
        style={{ width: "60vw" }}
        modal
        onHide={() => setVisible(false)}
        footer={footer}
      >
        {puedeEditar && (
          <>
            <div className="p-fluid formgrid grid">
              <div className="field col-12 md:col-6">
                <label>Fecha Inicio</label>
                <Calendar
                  value={nuevo.FechaInicio}
                  onChange={(e) => {
                    const FechaInicio = e.value;

                    // PLAN: si FechaFin existe y es menor, la limpio
                    let FechaFin = nuevo.FechaFin;
                    if (isPlan && FechaFin && FechaInicio) {
                      const fi = new Date(FechaInicio);
                      const ff = new Date(FechaFin);
                      fi.setHours(0, 0, 0, 0);
                      ff.setHours(0, 0, 0, 0);
                      if (ff.getTime() < fi.getTime()) FechaFin = null;
                    }

                    // TAREO: recalculo si ya hay horas válida
                    if (isTareo) {
                      const autoFin = recalcularFechaFinTareoSiAplica(FechaInicio, nuevo.Horas);
                      FechaFin = autoFin ?? FechaFin;
                    }

                    setNuevo((prev) => ({ ...prev, FechaInicio, FechaFin }));
                  }}
                  dateFormat="yy-mm-dd"
                  showIcon
                  className="w-full"
                  minDate={minFechaPlan}
                  maxDate={isPlan ? maxFechaPlan : new Date()}
                />
              </div>

              <div className="field col-12 md:col-6">
                <label>Fecha Fin</label>
                <Calendar
                  value={nuevo.FechaFin}
                  onChange={(e) => setNuevo((p) => ({ ...p, FechaFin: e.value }))}
                  dateFormat="yy-mm-dd"
                  showIcon
                  className="w-full"
                  disabled={isTareo} // ✅ TAREO deshabilitada (auto)
                  minDate={
                    isPlan
                      ? (nuevo.FechaInicio ? new Date(nuevo.FechaInicio) : minFechaPlan)
                      : null
                  }
                  maxDate={isPlan ? maxFechaPlan : null}
                />
              </div>

              <div className="field col-12 md:col-6">
                <label>Horas (HH.MM)</label>
                <InputText
                  value={nuevo.Horas}
                  onChange={(e) => {
                    // ✅ NO normalizamos aquí (para que puedas escribir 10, 12, 13...)
                    setNuevo((p) => ({ ...p, Horas: e.target.value }));
                    setErrorHoras("");
                  }}
                  onBlur={validarYNormalizarHorasEnBlur}
                  placeholder="Ej: 2.50 (2h 50m)"
                  className="w-full"
                />

                {errorHoras && (
                  <small className="block mt-1 text-red-500">{errorHoras}</small>
                )}

                {isTareo && (
                  <small className="block mt-1 text-gray-500">
                    Máximo 16 horas laborables por día
                  </small>
                )}
              </div>

              <div className="field col-12 md:col-6">
                <label>Tipo de Actividad</label>
                <DropdownDefault
                  value={nuevo.IdTipoActividad}
                  options={optionsTipoActividad}
                  onChange={(e) =>
                    setNuevo((p) => ({ ...p, IdTipoActividad: e.value }))
                  }
                  optionLabel="nombre"
                  optionValue="id"
                  placeholder="Seleccione tipo"
                  className="w-full"
                />
              </div>

              <div className="field col-12 md:col-6">
                <label>Descripción</label>
                <InputText
                  value={nuevo.Descripcion}
                  onChange={(e) =>
                    setNuevo((p) => ({ ...p, Descripcion: e.target.value }))
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="mb-4">
              <Boton
                label="Añadir"
                icon="pi pi-plus"
                color="primary"
                onClick={agregar}
                type="button"
              />
            </div>
          </>
        )}

        <DataTable value={currentActivos} responsiveLayout="scroll" className="w-full">
          <Column
            field="FechaInicio"
            header="Fecha Inicio"
            body={(row) =>
              row.FechaInicio ? new Date(row.FechaInicio).toLocaleDateString() : ""
            }
          />
          <Column
            field="FechaFin"
            header="Fecha Fin"
            body={(row) =>
              row.FechaFin ? new Date(row.FechaFin).toLocaleDateString() : ""
            }
          />
          <Column field="Horas" header="Horas" body={(row) => row.Horas || "0.00"} />
          <Column
            field="IdTipoActividad"
            header="Tipo de Actividad"
            body={(rowData) => {
              const tipo = (parametros || []).find(
                (item) =>
                  item.tipoParametro === "TipoActividad" &&
                  (codFrentes || []).includes(item.valor1) &&
                  item.id === rowData.IdTipoActividad
              );
              return tipo?.nombre || "—";
            }}
          />
          <Column field="Descripcion" header="Descripción" />

          {puedeEditar && (
            <Column
              header="Acciones"
              body={(rowData) => (
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  className="p-button-text"
                  onClick={() => eliminar(rowData)}
                  type="button"
                />
              )}
            />
          )}
        </DataTable>
      </Dialog>
    </>
  );
};

export default Horas;