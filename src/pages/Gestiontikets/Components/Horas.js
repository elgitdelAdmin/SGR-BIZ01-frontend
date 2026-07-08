// src/pages/Gestiontikets/Components/Horas.js
import React, { useMemo, useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import Boton from "../../../components/Boton/Boton";
import CalendarDefault from "../../../components/CalendarDefault/CalendarDefault";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import InputTextDefault from "../../../components/InputTextDefault/InputTextDefault";
import DropdownDefault from "../../../components/DropdownDefault/DropdownDefault";
import InputHorasDefault from "../../../components/InputHorasDefault/InputHorasDefault";

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
    return isPlan ? "Planificar Horas" : "Registrar Horas";
  }, [puedeEditar, isPlan]);

  const minFechaPlan = useMemo(() => {
    return isPlan
      ? (frenteSubFrente?.fechaInicio ? new Date(frenteSubFrente.fechaInicio) : null)
      : (asignacion?.FechaAsignacion ? new Date(asignacion.FechaAsignacion) : null);
  }, [isPlan, frenteSubFrente?.fechaInicio, asignacion?.FechaAsignacion]);

  const maxFechaPlan = useMemo(() => {
    return isPlan
      ? (frenteSubFrente?.fechaFin ? new Date(frenteSubFrente.fechaFin) : null)
      : (asignacion?.FechaDesasignacion ? new Date(asignacion.FechaDesasignacion) : null);
  }, [isPlan, frenteSubFrente?.fechaFin, asignacion?.FechaDesasignacion]);

  const [tipoIngreso, setTipoIngreso] = useState(1);
  const opcionesTipoIngreso = [
    { label: "Día específico", value: 1 },
    { label: "Rango de fechas", value: 2 },
    { label: "Rango de fechas (Lun-Vie)", value: 3 },
  ];

  // reset al abrir
  useEffect(() => {
    if (!visible) return;
    setAddDisabledGate(true);
    setDelDisabledGate(true);
    setErrorHoras("");

    const linkedAsig = isPlan ? (formik.values.asignaciones || []).find(
      (a) => a.Activo !== false && (a._frenteSubFrenteUid === frenteSubFrente?._uid || (frenteSubFrente?.id > 0 && Number(a.IdTicketFrenteSubFrente) === Number(frenteSubFrente.id)))
    ) : null;

    setNuevo({
      FechaInicio: isPlan ? minFechaPlan : null,
      FechaFin: isPlan ? minFechaPlan : null,
      Horas: "",
      Descripcion: "",
      Activo: true,
      IdTicketConsultorAsignacion: isTareo ? (asignacion?.Id ?? 0) : (linkedAsig?.Id ?? 0),
      IdTicketFrenteSubFrente: isPlan ? (frenteSubFrente?.id ?? frenteSubFrente?.Id ?? 0) : 0,
      Id: 0,
      IdTipoActividad: 0,
    });
    setTipoIngreso(1);
  }, [visible, asignacion?.Id, frenteSubFrente?.id, frenteSubFrente?.Id, frenteSubFrente?._uid, isPlan, isTareo, minFechaPlan]);

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

    if (isPlan && nuevo.FechaInicio && nuevo.FechaFin) {
      const fi = new Date(nuevo.FechaInicio);
      const ff = new Date(nuevo.FechaFin);
      fi.setHours(0, 0, 0, 0);
      ff.setHours(0, 0, 0, 0);
      const diffTime = Math.abs(ff - fi);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const maxPermittedMins = diffDays * 24 * 60;
      if (mins > maxPermittedMins) {
        setErrorHoras(`Las horas planificadas no pueden superar las 24.00 h por día (${(diffDays * 24).toFixed(2)} h en total).`);
        return;
      }
    }

    setErrorHoras("");

    // ✅ normaliza el texto SOLO en blur
    // ✅ y en TAREO calcula FechaFin automático SOLO en blur si tipoIngreso === 1
    const fechaFinAuto = isTareo && tipoIngreso === 1
      ? buildFechaFinTareo(nuevo.FechaInicio, horasNorm)
      : null;

    setNuevo((p) => ({
      ...p,
      Horas: horasNorm,
      FechaFin: (isTareo && tipoIngreso === 1) ? fechaFinAuto : p.FechaFin,
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

    // ✅ OBTENER DÍAS VÁLIDOS (Aplica a Plan y Tareo)
    let diasValidos = [];

    if (tipoIngreso > 1 && !FechaFin) {
      toastRef?.current?.show?.({
        severity: "warn",
        summary: "Campos incompletos",
        detail: "Debes seleccionar Fecha fin.",
        life: 5000,
      });
      return;
    }

    const fi = new Date(FechaInicio);
    const ff = tipoIngreso > 1 ? new Date(FechaFin) : new Date(FechaInicio);
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

    const diffTime = Math.abs(ff - fi);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < diffDays; i++) {
      const checkDate = new Date(fi);
      checkDate.setDate(fi.getDate() + i);
      if (tipoIngreso === 3) {
        const dayOfWeek = checkDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
      }
      diasValidos.push(checkDate);
    }

    if (diasValidos.length === 0) {
      toastRef?.current?.show?.({
        severity: "warn",
        summary: "Días no laborales",
        detail: "El rango seleccionado no contiene días laborables (Lunes a Viernes).",
        life: 5000,
      });
      return;
    }

    const limitMins = isTareo ? 16 * 60 : 24 * 60;

    for (const checkDate of diasValidos) {
      let minutosEnEseDia = 0;
      current.filter(d => d.Activo).forEach(det => {
        const detFi = new Date(det.FechaInicio);
        detFi.setHours(0, 0, 0, 0);
        // Note: For Tareo we sum matching days, for Plan we calculate overlap.
        // Unifying: we calculate overlap for both based on detFi and detFf.
        const detFf = new Date(det.FechaFin);
        detFf.setHours(0, 0, 0, 0);
        const diffDetDays = Math.ceil(Math.abs(detFf - detFi) / (1000 * 60 * 60 * 24)) + 1;

        if (checkDate >= detFi && checkDate <= detFf) {
          const minsDet = hhmmToMinutes(det.Horas) || 0;
          minutosEnEseDia += (minsDet / diffDetDays);
        }
      });

      if (minutosEnEseDia + minsNuevo > limitMins) {
        const disp = Math.max(0, limitMins - minutosEnEseDia);
        const hhDisp = Math.floor(disp / 60);
        const mmDisp = Math.floor(disp % 60);
        toastRef?.current?.show?.({
          severity: isTareo ? "error" : "warn",
          summary: "Límite superado",
          detail: `Las horas para el ${checkDate.toLocaleDateString()} superan el límite de ${limitMins / 60}h. Disponible: ${hhDisp}.${String(mmDisp).padStart(2, "0")}h`,
          life: 7000,
        });
        return;
      }
    }

    setErrorHoras("");
    setAddDisabledGate(false);

    let nuevosRegistros = [];
    if (isPlan) {
      nuevosRegistros = diasValidos.map((d) => ({
        ...nuevo,
        FechaInicio: new Date(d),
        FechaFin: new Date(d),
        Horas: horasNorm,
        Activo: true,
        IdTicketConsultorAsignacion: 0,
        IdTicketFrenteSubFrente: formik.values.frenteSubFrentes[index]?.id ?? formik.values.frenteSubFrentes[index]?.Id ?? 0,
      }));
    } else {
      nuevosRegistros = diasValidos.map((d) => {
        const dObj = new Date(d);
        const calcFin = buildFechaFinTareo(dObj, horasNorm);
        return {
          ...nuevo,
          FechaInicio: dObj,
          FechaFin: calcFin || dObj,
          Horas: horasNorm,
          Activo: true,
          IdTicketConsultorAsignacion: formik.values.asignaciones[index]?.Id ?? 0,
          IdTicketFrenteSubFrente: 0,
        };
      });
    }

    const updated = [
      ...current,
      ...nuevosRegistros
    ];

    if (isPlan) {
      formik.setFieldValue(`frenteSubFrentes[${index}].DetallePlanificacionConsultor`, updated);
    } else {
      formik.setFieldValue(`asignaciones[${index}].${fieldKey}`, updated);
    }

    setNuevo({
      FechaInicio: isPlan ? minFechaPlan : null,
      FechaFin: isPlan ? minFechaPlan : null,
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

  const limpiarTodo = () => {
    if (!puedeEditar) return;
    setDelDisabledGate(false);
    
    const updated = current.map(d => ({ ...d, Activo: false }));
    
    if (isPlan) {
      formik.setFieldValue(`frenteSubFrentes[${index}].DetallePlanificacionConsultor`, updated);
    } else {
      formik.setFieldValue(`asignaciones[${index}].${fieldKey}`, updated);
    }
  };

  const duplicar = (rowData) => {
    if (!puedeEditar) return;

    let nextFechaInicio = null;
    let nextFechaFin = null;

    if (rowData.FechaInicio) {
      const d = new Date(rowData.FechaInicio);
      d.setDate(d.getDate() + 1);
      nextFechaInicio = d;
    }

    if (rowData.FechaFin) {
      const d = new Date(rowData.FechaFin);
      d.setDate(d.getDate() + 1);
      nextFechaFin = d;
    }

    if (isPlan) {
      const minsToAdd = hhmmToMinutes(rowData.Horas) || 0;
      const fi = new Date(nextFechaInicio);
      fi.setHours(0, 0, 0, 0);
      const ff = new Date(nextFechaFin);
      ff.setHours(0, 0, 0, 0);

      const diffDays = Math.ceil(Math.abs(ff - fi) / (1000 * 60 * 60 * 24)) + 1;

      for (let i = 0; i < diffDays; i++) {
        const checkDate = new Date(fi);
        checkDate.setDate(fi.getDate() + i);

        let minutosEnEseDia = 0;
        current.filter(d => d.Activo).forEach(det => {
          const detFi = new Date(det.FechaInicio);
          detFi.setHours(0, 0, 0, 0);
          const detFf = new Date(det.FechaFin);
          detFf.setHours(0, 0, 0, 0);
          const diffDetDays = Math.ceil(Math.abs(detFf - detFi) / (1000 * 60 * 60 * 24)) + 1;

          if (checkDate >= detFi && checkDate <= detFf) {
            const minsDet = hhmmToMinutes(det.Horas) || 0;
            minutosEnEseDia += (minsDet / diffDetDays);
          }
        });

        const minsNuevoPorDia = minsToAdd / diffDays;
        if (minutosEnEseDia + minsNuevoPorDia > 24 * 60) {
          const disp = Math.max(0, 24 * 60 - minutosEnEseDia);
          const hhDisp = Math.floor(disp / 60);
          const mmDisp = Math.floor(disp % 60);
          toastRef?.current?.show?.({
            severity: "warn",
            summary: "Límite superado",
            detail: `Las horas para el ${checkDate.toLocaleDateString()} superan las 24h. Disponible: ${hhDisp}.${String(mmDisp).padStart(2, "0")}h`,
            life: 7000,
          });
          return;
        }
      }
    }

    setAddDisabledGate(false);

    const duplicatedRow = {
      ...rowData,
      Id: 0, // Es un nuevo registro
      FechaInicio: nextFechaInicio,
      FechaFin: nextFechaFin,
      Activo: true,
    };

    const updated = [...current, duplicatedRow];

    if (isPlan) {
      formik.setFieldValue(`frenteSubFrentes[${index}].DetallePlanificacionConsultor`, updated);
    } else {
      formik.setFieldValue(`asignaciones[${index}].${fieldKey}`, updated);
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
      <style>{`
        @keyframes pulseBlue {
          0% { box-shadow: 0 0 0 0 rgba(14, 113, 174, 0.7); }
          50% { box-shadow: 0 0 0 8px rgba(14, 113, 174, 0); }
          100% { box-shadow: 0 0 0 0 rgba(14, 113, 174, 0); }
        }
        .pulse-combo {
          animation: pulseBlue 1.5s infinite;
          border-radius: 6px;
        }
      `}</style>
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
              <div className="field col-12 md:col-4">
                <label>Fecha Inicio</label>
                <CalendarDefault
                  value={nuevo.FechaInicio}
                  onChange={(e) => {
                    const FechaInicio = e.value;

                    let FechaFin = nuevo.FechaFin;
                    if (tipoIngreso === 1) {
                      FechaFin = FechaInicio;
                    } else if (FechaFin && FechaInicio) {
                      const fi = new Date(FechaInicio);
                      const ff = new Date(FechaFin);
                      fi.setHours(0, 0, 0, 0);
                      ff.setHours(0, 0, 0, 0);
                      if (ff.getTime() < fi.getTime()) FechaFin = null;
                    }

                    // TAREO: recalculo si ya hay horas válida
                    if (isTareo && tipoIngreso === 1) {
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

              <div className="field col-12 md:col-4" style={{ display: tipoIngreso === 1 ? 'none' : 'block' }}>
                <label>Fecha Fin</label>
                <CalendarDefault
                  value={nuevo.FechaFin}
                  onChange={(e) => setNuevo((p) => ({ ...p, FechaFin: e.value }))}
                  dateFormat="yy-mm-dd"
                  showIcon
                  className="w-full"
                  disabled={isTareo && tipoIngreso === 1}
                  minDate={
                    nuevo.FechaInicio ? new Date(nuevo.FechaInicio) : (isPlan ? minFechaPlan : null)
                  }
                  maxDate={isPlan ? maxFechaPlan : new Date()}
                />
              </div>

              <div className="field col-12 md:col-4">
                <label>Horas (HH.MM)</label>
                <InputHorasDefault
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

              <div className="field col-12 md:col-4">
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

              <div className="field col-12 md:col-8">
                <label>Descripción</label>
                <InputTextDefault
                  value={nuevo.Descripcion}
                  onChange={(e) =>
                    setNuevo((p) => ({ ...p, Descripcion: e.target.value }))
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="mb-4 flex align-items-center justify-content-between">
              <div className="flex align-items-center">
                <Boton
                  label="Añadir"
                  icon="pi pi-plus"
                  color="primary"
                  onClick={agregar}
                  type="button"
                />
                <div style={{ marginLeft: '1.5rem' }}>
                  <Boton
                    label="Limpiar Todo"
                    icon="pi pi-trash"
                    className="p-button-danger"
                    onClick={limpiarTodo}
                    type="button"
                  />
                </div>
              </div>
                <div className="flex align-items-center">
                  <span style={{ color: '#4b5563', fontWeight: '500', fontSize: '14px', marginRight: '1rem' }}>
                    Modo de ingreso:
                  </span>
                  <div style={{ width: '300px' }} className="pulse-combo">
                    <DropdownDefault
                    value={tipoIngreso}
                    options={opcionesTipoIngreso}
                    optionLabel="label"
                    optionValue="value"
                    onChange={(e) => {
                      setTipoIngreso(e.value);
                      if (e.value === 1) {
                        setNuevo(p => ({ ...p, FechaFin: p.FechaInicio }));
                      }
                    }}
                    className="w-full"
                  />
                  </div>
                </div>
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
          <Column
            field="Horas"
            header="Horas"
            body={(row) => {
              const h = Number(row.Horas);
              return isNaN(h) ? "0.00" : h.toFixed(2);
            }}
          />
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
              body={(rowData) => {
                let showDuplicate = false;
                if (isPlan) {
                  let nextFi = null;
                  let nextFf = null;
                  if (rowData.FechaInicio) {
                    nextFi = new Date(rowData.FechaInicio);
                    nextFi.setDate(nextFi.getDate() + 1);
                    nextFi.setHours(0, 0, 0, 0);
                  }
                  if (rowData.FechaFin) {
                    nextFf = new Date(rowData.FechaFin);
                    nextFf.setDate(nextFf.getDate() + 1);
                    nextFf.setHours(0, 0, 0, 0);
                  }

                  if (nextFi && nextFf) {
                    const diffDays = Math.ceil(Math.abs(nextFf - nextFi) / (1000 * 60 * 60 * 24)) + 1;
                    const minsToAdd = hhmmToMinutes(rowData.Horas) || 0;

                    let canDup = true;
                    for (let i = 0; i < diffDays; i++) {
                      const checkDate = new Date(nextFi);
                      checkDate.setDate(nextFi.getDate() + i);

                      let minutosEnEseDia = 0;
                      current.filter(d => d.Activo).forEach(det => {
                        const detFi = new Date(det.FechaInicio);
                        detFi.setHours(0, 0, 0, 0);
                        const detFf = new Date(det.FechaFin);
                        detFf.setHours(0, 0, 0, 0);
                        const diffDetDays = Math.ceil(Math.abs(detFf - detFi) / (1000 * 60 * 60 * 24)) + 1;

                        if (checkDate >= detFi && checkDate <= detFf) {
                          const minsDet = hhmmToMinutes(det.Horas) || 0;
                          minutosEnEseDia += (minsDet / diffDetDays);
                        }
                      });

                      if (minutosEnEseDia + (minsToAdd / diffDays) > 24 * 60) {
                        canDup = false;
                        break;
                      }
                    }
                    showDuplicate = canDup;
                  }
                }

                return (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button
                      type="button"
                      icon="pi pi-trash"
                      className="accion-eliminar"
                      onClick={() => eliminar(rowData)}
                      style={{ width: "32px", height: "32px", padding: 0 }}
                    />
                    {isPlan && showDuplicate && (
                      <Button
                        type="button"
                        icon="pi pi-calendar-plus"
                        className="p-button-outlined p-button-secondary"
                        title="Duplicar hacia el día siguiente"
                        onClick={() => duplicar(rowData)}
                        style={{ width: "32px", height: "32px", padding: 0 }}
                      />
                    )}
                  </div>
                );
              }}
            />
          )}
        </DataTable>
      </Dialog>
    </>
  );
};

export default Horas;