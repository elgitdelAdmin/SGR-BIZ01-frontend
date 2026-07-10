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
import CheckboxDefault from "../../../components/CheckboxDefault/CheckboxDefault";
import CalendarRangeDefault from "../../../components/CalendarRangeDefault/CalendarRangeDefault";

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
  let s = String(raw ?? "").trim();
  if (!s) return "";

  // Convertir punto a dos puntos
  s = s.replace(".", ":");

  // permitir solo números y dos puntos
  const cleaned = s.replace(/[^0-9:]/g, "");
  if (!cleaned) return "";

  const parts = cleaned.split(":");
  const hhStr = parts[0] ?? "0";
  const mmStrRaw = parts[1] ?? "";

  const hh = String(Number(hhStr || "0"));

  // minutos: si viene vacío => 00, si 1 dígito => x0, si 2 => ok, si más => corta
  let mm = mmStrRaw;
  if (mm === "") mm = "00";
  if (mm.length === 1) mm = `${mm}0`;
  if (mm.length > 2) mm = mm.slice(0, 2);

  return `${hh}:${mm}`;
};

const isValidHHMM = (hhmm) => {
  let s = String(hhmm ?? "").trim();
  if (!s) return false;
  
  // Convertir punto a dos puntos
  s = s.replace(".", ":");
  
  // "10" o "10:5" o "10:50" o "10:"
  if (!/^\d+(:[0-5]?\d?)?$/.test(s)) return false;

  const norm = normalizeHHMM(s);
  const [hhStr, mmStr = "00"] = norm.split(":");
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
  const [hhStr, mmStr = "00"] = norm.split(":");
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

const minutesToHHMM = (mins) => {
  if (mins === null || mins === undefined || isNaN(mins) || mins < 0) return "0:00";
  const hh = Math.floor(mins / 60);
  const mm = Math.round(mins % 60);
  return `${hh}:${String(mm).padStart(2, "0")}`;
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
  const [editingRow, setEditingRow] = useState(null);
  const [displayConfirmDialog, setDisplayConfirmDialog] = useState(false);
  const [initialDetailsSnapshot, setInitialDetailsSnapshot] = useState([]);

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
  const actionTypeBtn = puedeEditar ? "agregarsintexto" : "versintexto";

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
  const [dividirHoras, setDividirHoras] = useState(false);
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
    setEditingRow(null);
    setInitialDetailsSnapshot(current.map(d => ({ ...d })));

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
    setDividirHoras(false);
  }, [visible, asignacion?.Id, frenteSubFrente?.id, frenteSubFrente?.Id, frenteSubFrente?._uid, isPlan, isTareo, minFechaPlan]);

  const current = useMemo(() => {
    const arr = isPlan
      ? (formik.values.frenteSubFrentes?.[index]?.DetallePlanificacionConsultor || [])
      : (formik.values.asignaciones?.[index]?.[fieldKey] || []);
    return Array.isArray(arr) ? arr : [];
  }, [formik.values.frenteSubFrentes, formik.values.asignaciones, index, isPlan, fieldKey]);

  const currentActivos = useMemo(() => {
    return current
      .filter((d) => d.Activo)
      .sort((a, b) => {
        const dateA = a.FechaInicio ? new Date(a.FechaInicio) : new Date(0);
        const dateB = b.FechaInicio ? new Date(b.FechaInicio) : new Date(0);
        return dateA - dateB;
      });
  }, [current]);

  const totalHorasHHMM = useMemo(() => {
    const totalMin = currentActivos.reduce((acc, it) => {
      const mins = hhmmToMinutes(it.Horas);
      return acc + (mins || 0);
    }, 0);
    const hh = Math.floor(totalMin / 60);
    const mm = totalMin % 60;
    return `${hh}:${String(mm).padStart(2, "0")}`;
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
      toastRef?.current?.show?.({
        severity: "warn",
        summary: "Formato inválido",
        detail: "Formato inválido. Usa HH:MM con minutos 00–59 (ej: 2:50).",
        life: 5000,
      });
      setNuevo((p) => ({ ...p, Horas: "" }));
      setErrorHoras("");
      return;
    }

    const horasNorm = normalizeHHMM(nuevo.Horas);
    const mins = hhmmToMinutes(horasNorm);

    if (!mins || mins <= 0) {
      toastRef?.current?.show?.({
        severity: "warn",
        summary: "Horas inválidas",
        detail: "Horas debe ser mayor a 0 (ej: 0:30).",
        life: 5000,
      });
      setNuevo((p) => ({ ...p, Horas: "" }));
      setErrorHoras("");
      return;
    }

    const maxPerDay = isTareo ? 16 * 60 : 24 * 60;

    if (tipoIngreso > 1 && nuevo.FechaInicio && nuevo.FechaFin) {
      const fi = new Date(nuevo.FechaInicio);
      const ff = new Date(nuevo.FechaFin);
      fi.setHours(0, 0, 0, 0);
      ff.setHours(0, 0, 0, 0);

      const diffTime = Math.abs(ff - fi);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      let numDays = 0;
      for (let i = 0; i < diffDays; i++) {
        const checkDate = new Date(fi);
        checkDate.setDate(fi.getDate() + i);
        if (tipoIngreso === 3) {
          const dayOfWeek = checkDate.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        }
        numDays++;
      }

      if (numDays > 0) {
        if (dividirHoras) {
          // No validamos límite superior en blur si se van a dividir las horas.
          // El límite real diario se validará al presionar "Añadir".
        } else {
          if (mins > maxPerDay) {
            toastRef?.current?.show?.({
              severity: "warn",
              summary: "Límite superado",
              detail: `Las horas planificadas no pueden superar las ${maxPerDay / 60}.00 h por día.`,
              life: 5000,
            });
            setNuevo((p) => ({ ...p, Horas: "" }));
            setErrorHoras("");
            return;
          }
        }
      }
    } else {
      if (mins > maxPerDay) {
        toastRef?.current?.show?.({
          severity: "warn",
          summary: "Límite superado",
          detail: `Las horas no pueden superar las ${maxPerDay / 60}.00 h por día.`,
          life: 5000,
        });
        setNuevo((p) => ({ ...p, Horas: "" }));
        setErrorHoras("");
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
      toastRef?.current?.show?.({
        severity: "warn",
        summary: "Formato inválido",
        detail: "Formato inválido. Usa HH:MM con minutos 00–59 (ej: 2:50).",
        life: 5000,
      });
      setNuevo((p) => ({ ...p, Horas: "" }));
      setErrorHoras("");
      return;
    }

    const horasNorm = normalizeHHMM(Horas);
    const minsNuevo = hhmmToMinutes(horasNorm);

    if (!minsNuevo || minsNuevo <= 0) {
      toastRef?.current?.show?.({
        severity: "warn",
        summary: "Horas inválidas",
        detail: "Horas debe ser mayor a 0 (ej: 0:30).",
        life: 5000,
      });
      setNuevo((p) => ({ ...p, Horas: "" }));
      setErrorHoras("");
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

    let minsPerDay = minsNuevo;
    if (tipoIngreso > 1 && dividirHoras) {
      minsPerDay = Math.round(minsNuevo / diasValidos.length);
    }

    if (minsPerDay <= 0) {
      toastRef?.current?.show?.({
        severity: "warn",
        summary: "Horas inválidas",
        detail: "Las horas distribuidas por día deben ser mayores a 0.",
        life: 5000,
      });
      setNuevo((p) => ({ ...p, Horas: "" }));
      setErrorHoras("");
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

      if (minutosEnEseDia + minsPerDay > limitMins) {
        const disp = Math.max(0, limitMins - minutosEnEseDia);
        const hhDisp = Math.floor(disp / 60);
        const mmDisp = Math.floor(disp % 60);
        toastRef?.current?.show?.({
          severity: "warn",
          summary: "Límite superado",
          detail: `Las horas para el ${checkDate.toLocaleDateString()} superan el límite de ${limitMins / 60}h. Disponible: ${hhDisp}:${String(mmDisp).padStart(2, "0")}h`,
          life: 7000,
        });
        setNuevo((p) => ({ ...p, Horas: "" }));
        setErrorHoras("");
        return;
      }
    }

    setErrorHoras("");
    setAddDisabledGate(false);

    let nuevosRegistros = [];
    const horasParaDia = minutesToHHMM(minsPerDay);
    if (isPlan) {
      nuevosRegistros = diasValidos.map((d) => ({
        ...nuevo,
        FechaInicio: new Date(d),
        FechaFin: new Date(d),
        Horas: horasParaDia,
        Activo: true,
        IdTicketConsultorAsignacion: 0,
        IdTicketFrenteSubFrente: formik.values.frenteSubFrentes[index]?.id ?? formik.values.frenteSubFrentes[index]?.Id ?? 0,
      }));
    } else {
      nuevosRegistros = diasValidos.map((d) => {
        const dObj = new Date(d);
        const calcFin = buildFechaFinTareo(dObj, horasParaDia);
        return {
          ...nuevo,
          FechaInicio: dObj,
          FechaFin: calcFin || dObj,
          Horas: horasParaDia,
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

  const findRowIndex = (row) => {
    return current.findIndex(
      (d) =>
        d.Activo &&
        d.FechaInicio === row.FechaInicio &&
        d.FechaFin === row.FechaFin &&
        String(d.Horas) === String(row.Horas) &&
        d.Descripcion === row.Descripcion
    );
  };

  const cancelarEdicion = () => {
    setEditingRow(null);
  };

  const iniciarEdicion = (rowData) => {
    if (!puedeEditar) return;

    const idxEnCurrent = findRowIndex(rowData);
    if (idxEnCurrent === -1) return;

    setEditingRow({
      originalIndex: idxEnCurrent,
      Horas: normalizeHHMM(rowData.Horas),
      IdTipoActividad: rowData.IdTipoActividad,
      Descripcion: rowData.Descripcion,
    });
  };

  const confirmarEdicion = () => {
    if (editingRow === null) return;

    const horasNorm = normalizeHHMM(editingRow.Horas);

    if (!isValidHHMM(editingRow.Horas)) {
      toastRef?.current?.show?.({
        severity: "warn",
        summary: "Formato inválido",
        detail: "Usa HH:MM con minutos 00–59 (ej: 2:50).",
        life: 5000,
      });
      return;
    }

    const minsNuevo = hhmmToMinutes(horasNorm);
    if (!minsNuevo || minsNuevo <= 0) {
      toastRef?.current?.show?.({
        severity: "warn",
        summary: "Horas inválidas",
        detail: "Horas debe ser mayor a 0 (ej: 0:30).",
        life: 5000,
      });
      return;
    }

    if (!editingRow.IdTipoActividad) {
      toastRef?.current?.show?.({
        severity: "warn",
        summary: "Campo requerido",
        detail: "Seleccione un Tipo de Actividad.",
        life: 5000,
      });
      return;
    }

    if (!editingRow.Descripcion?.trim()) {
      toastRef?.current?.show?.({
        severity: "warn",
        summary: "Campo requerido",
        detail: "Ingrese una Descripción.",
        life: 5000,
      });
      return;
    }

    setAddDisabledGate(false);

    const updated = [...current];
    updated[editingRow.originalIndex] = {
      ...updated[editingRow.originalIndex],
      Horas: horasNorm,
      IdTipoActividad: editingRow.IdTipoActividad,
      Descripcion: editingRow.Descripcion,
    };

    if (isPlan) {
      formik.setFieldValue(`frenteSubFrentes[${index}].DetallePlanificacionConsultor`, updated);
    } else {
      formik.setFieldValue(`asignaciones[${index}].${fieldKey}`, updated);
    }

    setEditingRow(null);
  };

  const handleHideDialog = () => {
    const hasUnsavedChanges = !addDisabledGate || !delDisabledGate;
    if (hasUnsavedChanges) {
      setDisplayConfirmDialog(true);
    } else {
      setVisible(false);
    }
  };

  const descartarCambios = () => {
    if (isPlan) {
      formik.setFieldValue(`frenteSubFrentes[${index}].DetallePlanificacionConsultor`, initialDetailsSnapshot);
    } else {
      formik.setFieldValue(`asignaciones[${index}].${fieldKey}`, initialDetailsSnapshot);
    }
    setAddDisabledGate(true);
    setDelDisabledGate(true);
    setEditingRow(null);
    setVisible(false);
    setDisplayConfirmDialog(false);
  };

  const guardarCambiosConfirm = () => {
    formik.handleSubmit();
    setVisible(false);
    setDisplayConfirmDialog(false);
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

    if (nextFechaInicio && nextFechaFin) {
      let limitMax = isPlan
        ? (maxFechaPlan ? new Date(maxFechaPlan) : null)
        : (maxFechaPlan && new Date(maxFechaPlan) < new Date() ? new Date(maxFechaPlan) : new Date());
      let limitMin = minFechaPlan ? new Date(minFechaPlan) : null;

      const checkFi = new Date(nextFechaInicio);
      checkFi.setHours(0, 0, 0, 0);
      const checkFf = new Date(nextFechaFin);
      checkFf.setHours(0, 0, 0, 0);

      if (limitMax) limitMax.setHours(0, 0, 0, 0);
      if (limitMin) limitMin.setHours(0, 0, 0, 0);

      if (limitMax && checkFf.getTime() > limitMax.getTime()) {
        toastRef?.current?.show?.({
          severity: "warn",
          summary: "Vigencia excedida",
          detail: "La fecha duplicada excede la vigencia permitida.",
          life: 5000,
        });
        return;
      }
      if (limitMin && checkFi.getTime() < limitMin.getTime()) {
        toastRef?.current?.show?.({
          severity: "warn",
          summary: "Vigencia excedida",
          detail: "La fecha duplicada es menor a la vigencia permitida.",
          life: 5000,
        });
        return;
      }
    }

    const minsToAdd = hhmmToMinutes(rowData.Horas) || 0;
    const fi = new Date(nextFechaInicio);
    fi.setHours(0, 0, 0, 0);
    const ff = new Date(nextFechaFin);
    ff.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(Math.abs(ff - fi) / (1000 * 60 * 60 * 24)) + 1;
    const limitMins = isTareo ? 16 * 60 : 24 * 60;

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
      if (minutosEnEseDia + minsNuevoPorDia > limitMins) {
        const disp = Math.max(0, limitMins - minutosEnEseDia);
        const hhDisp = Math.floor(disp / 60);
        const mmDisp = Math.floor(disp % 60);
        toastRef?.current?.show?.({
          severity: isTareo ? "error" : "warn",
          summary: "Límite superado",
          detail: `Las horas para el ${checkDate.toLocaleDateString()} superan las ${limitMins / 60}h. Disponible: ${hhDisp}.${String(mmDisp).padStart(2, "0")}h`,
          life: 7000,
        });
        return;
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
        actionType={actionTypeBtn}
        onClick={() => setVisible(true)}
      />

      <Dialog
        header={dialogTitle}
        visible={visible}
        style={{ width: "60vw" }}
        modal
        onHide={handleHideDialog}
        footer={footer}
      >
        {puedeEditar && (
          <>
            <div className="p-fluid formgrid grid">
              <div className="field col-12 md:col-4">
                <label>Modo de ingreso</label>
                <div className="pulse-combo">
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
                      setDividirHoras(false);
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              {tipoIngreso === 1 ? (
                <div className="field col-12 md:col-4">
                  <label>Fecha Inicio</label>
                  <CalendarDefault
                    value={nuevo.FechaInicio}
                    onChange={(e) => {
                      const FechaInicio = e.value;
                      let FechaFin = FechaInicio;

                      // TAREO: recalculo si ya hay horas válidas
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
              ) : (
                <div className="field col-12 md:col-4">
                  <label>Rango de Fechas</label>
                  <CalendarRangeDefault
                    value={[
                      nuevo.FechaInicio ? new Date(nuevo.FechaInicio) : null,
                      nuevo.FechaFin ? new Date(nuevo.FechaFin) : null
                    ]}
                    onChange={(e) => {
                      const range = e.value || [];
                      setNuevo((prev) => ({
                        ...prev,
                        FechaInicio: range[0] || null,
                        FechaFin: range[1] || null
                      }));
                    }}
                    dateFormat="yy-mm-dd"
                    className="w-full"
                    minDate={minFechaPlan}
                    maxDate={isPlan ? maxFechaPlan : new Date()}
                  />
                </div>
              )}

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

              {/* Fila 2: Horas y Checkbox (si aplica) */}
              <div className="field col-12 md:col-3">
                <label>Horas (HH:MM)</label>
                <InputHorasDefault
                  value={nuevo.Horas}
                  onChange={(e) => {
                    // ✅ NO normalizamos aquí (para que puedas escribir 10, 12, 13...)
                    setNuevo((p) => ({ ...p, Horas: e.target.value }));
                    setErrorHoras("");
                  }}
                  onBlur={validarYNormalizarHorasEnBlur}
                  placeholder="Ej: 2:30 (2h 30m)"
                  className="w-full"
                />

                {isTareo && (
                  <small className="block mt-1 text-gray-500">
                    Máximo 16 horas laborables por día
                  </small>
                )}
              </div>

              <div className="field col-12 md:col-9 flex align-items-center" style={{ marginTop: tipoIngreso > 1 ? "24px" : "0px" }}>
                {tipoIngreso > 1 && (
                  <CheckboxDefault
                    id="dividirHoras"
                    checked={dividirHoras}
                    onChange={(e) => setDividirHoras(e.checked)}
                    label="Dividir el total de horas ingresado entre los días del rango (desmarcado: registra el valor completo en cada día)"
                  />
                )}
              </div>

              {/* Fila 3: Descripción */}
              <div className="field col-12 md:col-12">
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

            <div className="mb-4 flex flex-row align-items-center" style={{ gap: '1rem' }}>
              <div className="flex flex-wrap align-items-center" style={{ gap: '1rem' }}>
                <Boton
                  label="Añadir"
                  icon="pi pi-plus"
                  color="primary"
                  onClick={agregar}
                  type="button"
                />
                <Boton
                  label="Limpiar Todo"
                  icon="pi pi-trash"
                  className="p-button-danger"
                  onClick={limpiarTodo}
                  type="button"
                />
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
              const idxRow = findRowIndex(row);
              const isEditing = editingRow !== null && editingRow.originalIndex === idxRow;

              if (isEditing) {
                return (
                  <InputHorasDefault
                    value={editingRow.Horas}
                    onChange={(e) => setEditingRow(prev => ({ ...prev, Horas: e.target.value }))}
                    onBlur={() => {
                      if (isValidHHMM(editingRow.Horas)) {
                        setEditingRow(prev => ({ ...prev, Horas: normalizeHHMM(prev.Horas) }));
                      }
                    }}
                    placeholder="HH:MM"
                    style={{ width: '80px' }}
                  />
                );
              }

              const hStr = String(row.Horas ?? "").trim().replace(".", ":");
              return hStr || "0:00";
            }}
          />
          <Column
            field="IdTipoActividad"
            header="Tipo de Actividad"
            body={(rowData) => {
              const idxRow = findRowIndex(rowData);
              const isEditing = editingRow !== null && editingRow.originalIndex === idxRow;

              if (isEditing) {
                return (
                  <DropdownDefault
                    value={editingRow.IdTipoActividad}
                    options={optionsTipoActividad}
                    onChange={(e) => setEditingRow(prev => ({ ...prev, IdTipoActividad: e.value }))}
                    optionLabel="nombre"
                    optionValue="id"
                    placeholder="Seleccione"
                    style={{ width: '100%', minWidth: '140px' }}
                  />
                );
              }

              const tipo = (parametros || []).find(
                (item) =>
                  item.tipoParametro === "TipoActividad" &&
                  (codFrentes || []).includes(item.valor1) &&
                  item.id === rowData.IdTipoActividad
              );
              return tipo?.nombre || "—";
            }}
          />
          <Column
            field="Descripcion"
            header="Descripción"
            body={(rowData) => {
              const idxRow = findRowIndex(rowData);
              const isEditing = editingRow !== null && editingRow.originalIndex === idxRow;

              if (isEditing) {
                return (
                  <InputTextDefault
                    value={editingRow.Descripcion}
                    onChange={(e) => setEditingRow(prev => ({ ...prev, Descripcion: e.target.value }))}
                    style={{ width: '100%' }}
                  />
                );
              }

              return rowData.Descripcion || "";
            }}
          />

          {puedeEditar && (
            <Column
              header="Acciones"
              body={(rowData) => {
                const idxRow = findRowIndex(rowData);
                const isEditing = editingRow !== null && editingRow.originalIndex === idxRow;

                if (isEditing) {
                  return (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <Button
                        type="button"
                        icon="pi pi-check"
                        className="p-button-success"
                        title="Confirmar edición"
                        onClick={confirmarEdicion}
                        style={{ width: "32px", height: "32px", padding: 0 }}
                      />
                      <Button
                        type="button"
                        icon="pi pi-times"
                        className="p-button-secondary"
                        onClick={cancelarEdicion}
                        title="Cancelar edición"
                        style={{ width: "32px", height: "32px", padding: 0 }}
                      />
                    </div>
                  );
                }

                let showDuplicate = false;
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
                  let limitMax = isPlan
                    ? (maxFechaPlan ? new Date(maxFechaPlan) : null)
                    : (maxFechaPlan && new Date(maxFechaPlan) < new Date() ? new Date(maxFechaPlan) : new Date());
                  let limitMin = minFechaPlan ? new Date(minFechaPlan) : null;

                  if (limitMax) limitMax.setHours(0, 0, 0, 0);
                  if (limitMin) limitMin.setHours(0, 0, 0, 0);

                  let canDup = true;
                  if (limitMax && nextFf.getTime() > limitMax.getTime()) {
                    canDup = false;
                  }
                  if (limitMin && nextFi.getTime() < limitMin.getTime()) {
                    canDup = false;
                  }

                  if (canDup) {
                    const diffDays = Math.ceil(Math.abs(nextFf - nextFi) / (1000 * 60 * 60 * 24)) + 1;
                    const minsToAdd = hhmmToMinutes(rowData.Horas) || 0;
                    const limitMins = isTareo ? 16 * 60 : 24 * 60;

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

                      if (minutosEnEseDia + (minsToAdd / diffDays) > limitMins) {
                        canDup = false;
                        break;
                      }
                    }
                  }
                  showDuplicate = canDup;
                }

                return (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Button
                      type="button"
                      icon="pi pi-pencil"
                      className="accion-editar"
                      tooltip="Editar"
                      onClick={() => iniciarEdicion(rowData)}
                      style={{ width: "32px", height: "32px", padding: 0 }}
                    />
                    <Button
                      type="button"
                      icon="pi pi-trash"
                      className="accion-eliminar"
                      onClick={() => eliminar(rowData)}
                      style={{ width: "32px", height: "32px", padding: 0 }}
                    />
                    {showDuplicate && (
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

      <Dialog
        header="Confirmación"
        visible={displayConfirmDialog}
        style={{ width: "380px" }}
        modal
        onHide={() => setDisplayConfirmDialog(false)}
        footer={
          <div className="flex justify-content-end gap-2" style={{ gap: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Boton
              label="Cerrar"
              color="secondary"
              onClick={descartarCambios}
              type="button"
            />
            <Boton
              label="Registrar"
              color="primary"
              onClick={guardarCambiosConfirm}
              type="button"
            />
          </div>
        }
      >
        <div className="flex align-items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <i className="pi pi-exclamation-triangle" style={{ fontSize: '2.5rem', color: '#eab308' }} />
          <span>Tienes cambios pendientes de registrar. ¿Qué deseas hacer?</span>
        </div>
      </Dialog>
    </>
  );
};

export default Horas;