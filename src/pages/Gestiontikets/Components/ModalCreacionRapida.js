import { useEffect, useState, useRef, useMemo, useContext } from "react";
import ReactDOM from "react-dom";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CalendarDefault from "../../../components/CalendarDefault/CalendarDefault";
import DropdownDefault from "../../../components/DropdownDefault/DropdownDefault";
import MultiSelectDefault from "../../../components/MultiSelectDefault/MultiSelectDefault";
import ModalArchivos from "../../../components/Modals/ModalArchivos/ModalArchivos";
import * as Iconsax from "iconsax-react";
import "../Gestiontikets.scss"
import InputTextDefault from "../../../components/InputTextDefault/InputTextDefault";
import InputTextareaDefault from "../../../components/InputTextareaDefault/InputTextareaDefault";
import Boton from "../../../components/Boton/Boton";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Toast } from "primereact/toast";
import useUsuario from "../../../hooks/useUsuario";
import { ListarConsultores, ObtenerConsultor } from "../../../service/ConsultorService";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog"; // For confirmDialog method
import { ListarParametros, ListarPais, ListarFrentes, RegistrarTiket, RegistrarTiketRapido, ObtenerTicket, ActualizarTicket, ListarGestorConsultoria, ListarGestorCuenta } from "../../../service/TiketService";
import { ListarGestores, ListarGestoresPorRolSocio } from "../../../service/GestorService";
import { ListarEmpresasporRol } from "../../../service/EmpresaService";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Accordion, AccordionTab } from 'primereact/accordion';
import AsignacionesCreacionRapida from "./AsignacionesCreacionRapida";
import Especializaciones from "./Especializaciones";
import EspecializacionesCreacionRapida from "./EspecializacionesCreacionRapida";
import { CODIGOS, TIPO_PARAMETRO } from "../../../constants/codigosBD";
import Context from "../../../context/usuarioContext";

const ModalCreacionRapida = ({ visible, onHide, onSaveSuccess }) => {
  const navigate = useNavigate();
  const { isLogged } = useUsuario();
  const { setAlertas } = useContext(Context) || {};
  const [persona, setTicket] = useState(null);

  //OK
  const [frentes, setFrentes] = useState([]);
  const [subfrentes, setSubfrentes] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [gestorConsultoria, setgestorConsultoria] = useState(null);
  const [gestorCuenta, setgestorCuenta] = useState(null);

  const [pais, setPais] = useState(null);

  const [usuario, setUsuario] = useState(null);
  const [parametros, setParametro] = useState([]);
  const [prueba, setPrueba] = useState(null);
  const [mostrarSeccion, setMostrarSeccion] = useState(false);
  const [gestores, setGestores] = useState(null);
  const [consultores, setConsultores] = useState(null);
  const codRol = localStorage.getItem("codRol");
  const [activeIndex, setActiveIndex] = useState(0);
  const [codFrentes, setCodFrentes] = useState([]);
  const [subtiposFiltrados, setSubtiposFiltrados] = useState([]);
  const [visibleArchivos, setVisibleArchivos] = useState(false);
  // ✅ Modal Repositorios
  const [visibleRepos, setVisibleRepos] = useState(false);



  const location = useLocation();

  const isOpen = location.pathname.includes('/Crear/');
  let { idUser } = useParams();
  const { permisos } = useUsuario();
  const permisosActual = permisos["/tickets"] || {
    divsOcultos: [],
    controlesBloqueados: [],
    divsBloqueados: [],
    controlesOcultos: []
  };

  //

  const [add, setAñadir] = useState(true);
  const [eliminar, setEliminar] = useState(true);
  const [addPlanificacion, setAñadirPlanificacion] = useState(true);
  const [eliminarPlanificacion, setEliminarPlanificacion] = useState(true);

  const [opcionesEstadoTicket, setOpcionesEstadoTicket] = useState([]);
  const [bloquearDropdown, setBloquearDropdown] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(null);
  const [visibleIndexPlanificacion, setVisibleIndexPlanificacion] = useState(null);

  const [tempData, setTempData] = useState({
    FechaInicio: null,
    FechaFin: null,
    Horas: null,
    Descripcion: "",
    Activo: true,
    IdTicketConsultorAsignacion: 0,
    Id: 0
  });
  const [totalesFijos, setTotalesFijos] = useState([]);





  const [visibleLocal, setVisibleLocal] = useState(false);
  const [detalles, setDetalles] = useState([]);
  const [nuevoDetalle, setNuevoDetalle] = useState({
    FechaInicio: null,
    FechaFin: null,
    Horas: null,
    Descripcion: "",
    Activo: true,
    IdTicketConsultorAsignacion: 0,
    Id: 0,
    IdTipoActividad: 0
  });
  const [detallesPlanificacion, setDetallesPlanificacion] = useState([]);

  const [nuevoDetallePlanificacion, setNuevoDetallePlanificacion] = useState({
    FechaInicio: null,
    FechaFin: null,
    Horas: null,
    Descripcion: "",
    Activo: true,
    IdTicketConsultorAsignacion: 0,
    Id: 0,
    IdTipoActividad: 0
  });
  const [subfrentesSeleccionados, setSubfrentesSeleccionados] = useState([]);
  const [consultoresPorFila, setConsultoresPorFila] = useState({});

  const [visibleDescripcion, setVisibleDescripcion] = useState(false);
  const [rowSeleccionada, setRowSeleccionada] = useState(null);

  const archivosRows = useMemo(() => {
    try {
      return persona?.urlArchivos ? JSON.parse(persona.urlArchivos) : [];
    } catch {
      return [];
    }
  }, [persona?.urlArchivos]);

  const columnasArchivos = useMemo(() => ([
    { field: "Orden", header: "Orden", style: { width: "90px" } },
    {
      field: "Url",
      header: "Archivo",
      body: (row) => (row?.Url ? row.Url.split("/").pop() : "—"),
    },
    {
      field: "FechaInsert",
      header: "Fecha",
      body: (row) => row?.FechaInsert ? new Date(row.FechaInsert).toLocaleString() : "—",
    },
  ]), []);

  const idMesaDeAyuda = useMemo(() => {
    const param = parametros?.find(p => p.tipoParametro === TIPO_PARAMETRO.TipoTicket && p.codigo === CODIGOS.TipoTicket.MesaDeAyuda);
    return param ? Number(param.id) : null;
  }, [parametros]);

  const empresasFiltradas = useMemo(() => {
    if (!empresa || !idMesaDeAyuda) return empresa || [];
    if (codRol === "SUPERADMIN" || codRol === "ADMIN" || !idUser) return empresa;
    
    const myGestor = (gestorCuenta || []).find(g => Number(g.idUser) === Number(idUser));
    const miIdGestor = myGestor ? Number(myGestor.id) : null;

    if (!miIdGestor) return empresa;

    return empresa.filter(emp => {
      const g = (emp.gestores || []).find(g => Number(g.idGestor) === miIdGestor && g.activo !== false);
      if (g && g.idsTiposTicketPermitidos) {
        return g.idsTiposTicketPermitidos.includes(idMesaDeAyuda);
      }
      return false;
    });
  }, [empresa, codRol, idUser, idMesaDeAyuda, gestorCuenta]);

  useEffect(() => {
    const getParametro = async () => {
      await ListarParametros().then(data => { setParametro(data) })
    };
    getParametro();
  }, []);



  const toast = useRef(null);
  const descripcionRef = useRef(null);
  const lastSubmitCountRef = useRef(0);

  useEffect(() => {
    if (!visible) {
      lastSubmitCountRef.current = 0;
    }
  }, [visible]);


  useEffect(() => {
    const getEmpresa = async () => {
      // const fetchFunction = codRol === "SUPERADMIN" ? ListarEmpresas : ListarEmpresasPorSocio;
      await ListarEmpresasporRol({ idUser, codRol }).then(data => { setEmpresa(data) })
    };
    getEmpresa();
  }, []);

  useEffect(() => {
    const getgestorConsultoria = async () => {
      await ListarGestorConsultoria().then(data => { setgestorConsultoria(data) })
    };
    getgestorConsultoria();
  }, []);
  useEffect(() => {
    const getgestorCuenta = async () => {
      await ListarGestorCuenta().then(data => { setgestorCuenta(data) })
    };
    getgestorCuenta();
  }, []);

  useEffect(() => {
    const getConsultorFrente = async () => {
      let idConsultor = window.localStorage.getItem("idConsultor")
      if (!idConsultor || idConsultor === "null" || idConsultor === "undefined") {
        setCodFrentes(["FRN001", "FRN002"]);
        return;
      }
      await ObtenerConsultor({ idConsultor }).then((data) => {
        const codigosFrentes = [
          ...new Set(
            data.especializaciones.map((e) => e.frente.codigo)
          )
        ];
        setCodFrentes(codigosFrentes)
      });
    };
    getConsultorFrente();
  }, []);


  useEffect(() => {
    const getFrentes = async () => {
      const data = await ListarFrentes();
      const frentesOrdenados = [...data].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
      );
      setFrentes(frentesOrdenados);
    };

    getFrentes();
  }, []);


  // Sincroniza el contenido HTML del editor cuando carga el ticket
  useEffect(() => {
    if (descripcionRef.current && persona?.descripcion !== undefined) {
      // Solo actualiza si el contenido difiere (evita mover el cursor mientras el usuario escribe)
      if (descripcionRef.current.innerHTML !== (persona.descripcion || '')) {
        descripcionRef.current.innerHTML = persona.descripcion || '';
      }
    }
  }, [persona]);



  useEffect(() => {
    if (
      persona &&
      persona.idEmpresa &&
      Array.isArray(empresa) &&
      empresa.length > 0
    ) {
      const empresaSeleccionada = empresa.find(emp => emp.id === persona.idEmpresa);

      if (empresaSeleccionada) {
        formik.setFieldValue("nombrePersonaResponsable", empresaSeleccionada.nombrePersonaResponsable);
        formik.setFieldValue("idUsuarioResponsableCliente", empresaSeleccionada.idPersonaResponsable);
      }
    }
  }, [persona, empresa]);


  useEffect(() => {
    const getPais = async () => {
      await ListarPais().then(data => { setPais(data) })
    };
    getPais();
  }, []);



  useEffect(() => {
    const getUsuario = async () => {
      const data = [{ id: 1, nombre: 'Oscar' },
      { id: 2, nombre: 'Luis' },
      { id: 3, nombre: 'Alberto' }
      ]
      setUsuario(data);
    };
    getUsuario();
  }, []);


  useEffect(() => {
    const getPrueba = async () => {
      const data = [{ id: 1, nombre: 'Juan' },
      { id: 2, nombre: 'Roberto' },
      { id: 3, nombre: 'Francisco' }
      ]
      setPrueba(data);
    };
    getPrueba();
  }, []);
  useEffect(() => {
    const getGestores = async () => {
      const fetchFunction = codRol === "SUPERADMIN" ? ListarGestores : ListarGestoresPorRolSocio;
      await fetchFunction().then(data => { setGestores(data) })
    };
    getGestores();
  }, []);

  useEffect(() => {
    const getConsultores = async () => {
      // const fetchFunction = codRol === "SUPERADMIN" ? ListarConsultores : ListarConsultoresPorSocio;
      const fetchFunction = ListarConsultores; // Modificado para siempre listar todos tras anular IdSocio
      await fetchFunction().then((data) => {
        const consultoresFormateados = data.map((item) => ({
          id: item.id,
          nombre: `${item.persona.nombres} ${item.persona.apellidoPaterno}`,
          especializaciones: item.especializaciones || []
        })).sort((a, b) => a.nombre.localeCompare(b.nombre));
        setConsultores(consultoresFormateados);
      });
    };
    getConsultores();
  }, []);

  function toLocalISOString(date) {
    const d = new Date(date);
    const offset = d.getTimezoneOffset() * 60000; // minutos → milisegundos
    const local = new Date(d.getTime() - offset);
    return local.toISOString().slice(0, 19); // corta la "Z" (evita UTC)
  }

  const schema = Yup.object().shape({

    codTicketInterno: Yup.string().required("Código interno es obligatorio"),
    titulo: Yup.string().nullable(),
    fechaSolicitud: Yup.date().nullable(),
    idTipoTicket: Yup.number().nullable(),
    idSubtipoTicket: Yup.number().typeError("Subtipo es obligatorio").required("Subtipo es obligatorio"),
    idEstadoTicket: Yup.number().nullable(),
    idEmpresa: Yup.number().typeError("Empresa es obligatoria").required("Empresa es obligatoria"),
    // idUsuarioResponsableCliente: Yup.number().required("Responsable del cliente es obligatorio"),
    // idPais: Yup.number().required("País es obligatorio"),
    idPrioridad: Yup.number().nullable(),
    descripcion: Yup.string().nullable(),
    urlArchivos: Yup.string().nullable(),
    // urlArchivos: Yup.string(),
    idGestor: Yup.array().nullable(),
    nuevaEspecializacion: Yup.object().shape({
      idFrente: Yup.number().nullable().transform((v, o) => o === "" ? null : v),
      idSubFrente: Yup.number().nullable().transform((v, o) => o === "" ? null : v),
      cantidad: Yup.number().nullable(),
      fechaInicio: Yup.string().nullable(),
      fechaFin: Yup.string().nullable(),
      descripcion: Yup.string().nullable(),

    }).notRequired(),
    frenteSubFrentes: Yup.array().of(
      Yup.object().shape({
        id: Yup.number(),
        idFrente: Yup.number().required(),
        idSubFrente: Yup.number().required(),
        cantidad: Yup.number().nullable(),
        fechaInicio: Yup.string().nullable(),
        fechaFin: Yup.string().nullable(),
        descripcion: Yup.string().nullable(),
        DetallePlanificacionConsultor: Yup.array().of(
          Yup.object().shape({
            FechaInicio: Yup.date().required("Fecha inicio es obligatorio"),
            FechaFin: Yup.date().required(),
            Horas: Yup.string().required("Horas es obligatorio"),
            Descripcion: Yup.string().required("Descripción es obligatoria"),
            Activo: Yup.boolean().required(),
            Id: Yup.number(),
          })
        )
      })
    ),
    asignaciones: Yup.array().of(
      Yup.object().shape({
        Id: Yup.number(),
        IdConsultor: Yup.number(),
        IdTipoActividad: Yup.number(),
        FechaAsignacion: Yup.string().nullable(),
        FechaDesasignacion: Yup.string().nullable(),
        DetalleTareasConsultor: Yup.array().of(
          Yup.object().shape({
            FechaInicio: Yup.date().required("Fecha inicio es obligatorio"),
            FechaFin: Yup.date().required(),
            Horas: Yup.string().required("Horas es obligatorio"),
            Descripcion: Yup.string().required("Descripción es obligatoria"),
            Activo: Yup.boolean().required(),
            IdTicketConsultorAsignacion: Yup.number().nullable().notRequired(),
            Id: Yup.number(),
          })
        )
      })
    ),

    idGestorConsultoria: Yup.number().nullable(),


  });

  const initialValues = useMemo(() => {
    return {
      codTicketInterno: persona ? persona.codTicketInterno : "",
      titulo: persona ? persona.titulo : "",
      fechaSolicitud: persona ? new Date(persona.fechaSolicitud) : new Date(),
      idTipoTicket: persona ? Number(persona.idTipoTicket) : (() => {
        const param = parametros?.find(p => p.tipoParametro === TIPO_PARAMETRO.TipoTicket && p.codigo === CODIGOS.TipoTicket.MesaDeAyuda);
        return param ? Number(param.id) : null;
      })(),
      idSubtipoTicket: persona ? Number(persona.idSubTipoTicket ?? persona.idSubtipoTicket) : null,
      idEstadoTicket: (persona && persona.idEstadoTicket) ? persona.idEstadoTicket : 0,
      idEmpresa: persona ? persona.idEmpresa : null,
      idUsuarioResponsableCliente: persona ? persona.idUsuarioResponsableCliente : null,
      idPrioridad: persona ? persona.idPrioridad : (() => {
        const param = parametros?.find(p => p.tipoParametro === TIPO_PARAMETRO.Prioridad && p.codigo === CODIGOS.Prioridad.Alta);
        return param ? Number(param.id) : null;
      })(),
      descripcion: persona ? persona.descripcion : "",
      urlArchivos: persona ? persona.urlArchivos : "",
      idGestor: persona ? [persona.empresa?.idGestor, ...(persona.idGestoresSecundarios || [])].filter(Boolean) : [],
      nuevaEspecializacion: {
        id: "",
        idFrente: "",
        idSubFrente: "",
        cantidad: "",
        fechaInicio: "",
        fechaFin: "",
        activo: true,
        descripcion: ""
      },
      frenteSubFrentes: persona ? (persona.frenteSubFrentes || persona.FrenteSubFrentes || []).map((fsf) => {
        const detallesPlan = fsf.detallePlanificacionConsultor || fsf.DetallePlanificacionConsultor || [];
        return {
          ...fsf,
          _uid: fsf.id > 0 ? `db_${fsf.id}` : generateUUID(),
          DetallePlanificacionConsultor: detallesPlan.map((d) => {
            const hVal = d.horas ?? d.Horas;
            let hStr = "0:00";
            if (typeof hVal === "string" && hVal.includes(":")) {
              hStr = hVal;
            } else if (hVal !== null && hVal !== undefined && !isNaN(Number(hVal))) {
              const totalMins = Math.round(Number(hVal) * 60);
              const hh = Math.floor(totalMins / 60);
              const mm = totalMins % 60;
              hStr = `${hh}:${String(mm).padStart(2, "0")}`;
            }
            return {
              FechaInicio: (d.fechaInicio || d.FechaInicio) ? new Date(d.fechaInicio || d.FechaInicio) : null,
              FechaFin: (d.fechaFin || d.FechaFin) ? new Date(d.fechaFin || d.FechaFin) : null,
              Horas: hStr,
              Descripcion: d.descripcion ?? d.Descripcion ?? "",
              Activo: (d.activo !== undefined ? d.activo : d.Activo) !== false,
              IdTicketFrenteSubFrente: d.idTicketFrenteSubFrente ?? d.IdTicketFrenteSubFrente ?? fsf.id ?? 0,
              IdTicketConsultorAsignacion: d.idTicketConsultorAsignacion ?? d.IdTicketConsultorAsignacion ?? 0,
              Id: d.id ?? d.Id ?? 0,
              IdTipoActividad: d.idTipoActividad ?? d.IdTipoActividad ?? 0
            };
          })
        };
      }) : [],
      asignaciones: persona ? ((persona.consultorAsignaciones || persona.ConsultorAsignaciones || []).map((a) => {
        // Vincular la asignación a su especialización por IdTicketFrenteSubFrente
        const fsfId = a.idTicketFrenteSubFrente || a.IdTicketFrenteSubFrente || 0;
        let linkedFsf = fsfId > 0
          ? (persona.frenteSubFrentes || persona.FrenteSubFrentes || []).find((f) => (f.id || f.Id) === fsfId)
          : null;
        if (!linkedFsf && (a.idSubFrente || a.IdSubFrente)) {
          linkedFsf = (persona.frenteSubFrentes || persona.FrenteSubFrentes || []).find(
            (f) => (f.activo !== false && f.Activo !== false) && Number(f.idSubFrente || f.IdSubFrente) === Number(a.idSubFrente || a.IdSubFrente)
          );
        }
        const frenteSubFrenteUid = linkedFsf ? ((linkedFsf.id || linkedFsf.Id) > 0 ? `db_${linkedFsf.id || linkedFsf.Id}` : linkedFsf._uid) : (a._frenteSubFrenteUid || null);

        const detallesTareas = a.detalleTareasConsultor || a.DetalleTareasConsultor || [];

        return {
          idUnico: (a.id || a.Id) > 0 ? (a.id || a.Id).toString() : (a.idUnico || generateUUID()),
          Id: a.id || a.Id || 0,
          IdSubFrente: a.idSubFrente || a.IdSubFrente,
          IdConsultor: a.idConsultor || a.IdConsultor,
          IdTipoActividad: a.idTipoActividad || a.IdTipoActividad,
          IdTicketFrenteSubFrente: fsfId > 0 ? fsfId : (linkedFsf ? (linkedFsf.id || linkedFsf.Id) : 0),
          _frenteSubFrenteUid: frenteSubFrenteUid,
          FechaAsignacion: a.fechaAsignacion || a.FechaAsignacion,
          FechaDesasignacion: a.fechaDesasignacion || a.FechaDesasignacion,
          Activo: (a.activo !== undefined ? a.activo : a.Activo) !== false,
          DetalleTareasConsultor: detallesTareas.map((d) => {
            const hVal = d.horas ?? d.Horas;
            let hStr = "0:00";
            if (typeof hVal === "string" && hVal.includes(":")) {
              hStr = hVal;
            } else if (hVal !== null && hVal !== undefined && !isNaN(Number(hVal))) {
              const totalMins = Math.round(Number(hVal) * 60);
              const hh = Math.floor(totalMins / 60);
              const mm = totalMins % 60;
              hStr = `${hh}:${String(mm).padStart(2, "0")}`;
            }
            return {
              FechaInicio: d.fechaInicio || d.FechaInicio,
              FechaFin: d.fechaFin || d.FechaFin,
              Horas: hStr,
              Descripcion: d.descripcion ?? d.Descripcion ?? "",
              Activo: (d.activo !== undefined ? d.activo : d.Activo) !== false,
              IdTicketConsultorAsignacion: d.idTicketConsultorAsignacion ?? d.IdTicketConsultorAsignacion ?? 0,
              Id: d.id ?? d.Id ?? 0,
              IdTipoActividad: d.idTipoActividad ?? d.IdTipoActividad ?? 0
            };
          }),
          esPlaceholder: a.esPlaceholder !== undefined ? a.esPlaceholder : (Number(a.idConsultor || a.IdConsultor) === 0)
        };
      })) : [],
      usuarioCreacion: persona?.usuarioCreacion || window.localStorage.getItem("username"),
      nombrePersonaResponsable: "",

      idGestorConsultoria: persona ? persona.idGestorConsultoria : null,
      reposLinks: (() => {
        try {
          const arr = persona?.repositorios ? JSON.parse(persona.repositorios)
            : persona?.Repositorios ? JSON.parse(persona.Repositorios)
              : persona?.urlRepositorios ? JSON.parse(persona.urlRepositorios)
                : [];
          return Array.isArray(arr) ? arr : [];
        } catch {
          return [];
        }
      })(),
    };
  }, [persona, parametros]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: schema,

    onSubmit: (values) => {
      // 🚨 VALIDACIONES PERSONALIZADAS DE CREACIÓN RÁPIDA 🚨
      const activasAsignaciones = (values.asignaciones || []).filter(a => a.Activo !== false && !a.esPlaceholder);
      const activasEspecializaciones = (values.frenteSubFrentes || []).filter(f => f.activo !== false);

      if (activasAsignaciones.length === 0) {
        toast.current.show({
          severity: "warn",
          summary: "Faltan datos",
          detail: "Debe agregar al menos una asignación para crear el ticket.",
        });
        formik.setSubmitting(false);
        return;
      }

      if (activasEspecializaciones.length === 0) {
        toast.current.show({
          severity: "warn",
          summary: "Faltan datos",
          detail: "Debe existir al menos una especialización vinculada.",
        });
        formik.setSubmitting(false);
        return;
      }

      const especializacionSinPlan = activasEspecializaciones.find(f => {
        const planesActivos = (f.DetallePlanificacionConsultor || []).filter(p => p.Activo !== false);
        return planesActivos.length === 0;
      });

      if (especializacionSinPlan) {
        toast.current.show({
          severity: "warn",
          summary: "Planificación faltante",
          detail: "Todas las especializaciones deben tener al menos un registro de planificación de horas. Por favor, registre las horas.",
        });
        formik.setSubmitting(false);
        return;
      }

      const reposPayload = (values.reposLinks || []).map(r => ({
        Link: (r.Url ?? r.Link ?? "").trim(),
      })).filter(x => x.Link);

      // Helper para convertir HH:MM a Decimal antes de guardar en BD
      const parseHorasToDecimal = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const str = String(val);
        if (str.includes(':')) {
          const [h, m] = str.split(':');
          return Number(h) + (Number(m) / 60);
        }
        return Number(str.replace(',', '.')) || 0;
      };

      // 1) Construye payload limpio
      const asignacionesPayload = (values.asignaciones || [])
        .filter(a => {
          // ❌ NO mandar filas NUEVAS (Id=0) que se eliminaron en el front (Activo=false)
          if (Number(a.Id) === 0 && a.Activo === false) return false;

          // ✅ mandar activas (Id=0 o Id>0)
          if (a.Activo !== false) return true;

          // ✅ mandar eliminadas SOLO si existían en BD (Id>0)
          return Number(a.Id) > 0 && a.Activo === false;
        })
        .map(a => {
          // Resolver IdTicketFrenteSubFrente desde _frenteSubFrenteUid
          let resolvedFrenteSubFrenteId = a.IdTicketFrenteSubFrente || null;
          if (a._frenteSubFrenteUid && !resolvedFrenteSubFrenteId) {
            // Buscar en frenteSubFrentes el que tenga este _uid
            const linkedFsf = (values.frenteSubFrentes || []).find(
              (f) => f._uid === a._frenteSubFrenteUid
            );
            if (linkedFsf && linkedFsf.id > 0) {
              resolvedFrenteSubFrenteId = linkedFsf.id;
            }
          }

          // Mapear todas las tareas a camelCase
          const detalleTareas = (a.DetalleTareasConsultor || []).map(t => ({
            id: t.Id,
            idTicketConsultorAsignacion: t.IdTicketConsultorAsignacion,
            idTipoActividad: t.IdTipoActividad,
            fechaInicio: t.FechaInicio ? toLocalISOString(t.FechaInicio) : null,
            fechaFin: t.FechaFin ? toLocalISOString(t.FechaFin) : null,
            horas: parseHorasToDecimal(t.Horas),
            descripcion: t.Descripcion,
            activo: t.Activo
          }));

          return {
            id: a.Id,
            idConsultor: a.IdConsultor,
            idTipoActividad: a.IdTipoActividad,
            idFrente: a.IdFrente,
            idSubFrente: a.IdSubFrente,
            idTicketFrenteSubFrente: resolvedFrenteSubFrenteId,
            fechaAsignacion: a.FechaAsignacion ? toLocalISOString(a.FechaAsignacion) : null,
            fechaDesasignacion: a.FechaDesasignacion ? toLocalISOString(a.FechaDesasignacion) : null,
            activo: a.Activo !== false,
            detalleTareasConsultor: detalleTareas
          };
        });

      const frenteSubFrentesPayload = values.frenteSubFrentes.map(e => ({
        id: Number(e.id),
        idFrente: Number(e.idFrente),
        idSubFrente: Number(e.idSubFrente),
        cantidad: e.cantidad,
        fechaInicio: e.fechaInicio ? toLocalISOString(e.fechaInicio) : null,
        fechaFin: e.fechaFin ? toLocalISOString(e.fechaFin) : null,
        activo: e.activo,
        descripcion: e.descripcion,
        usuarioActualizacion: window.localStorage.getItem("username"),
        detallePlanificacionConsultor: (e.DetallePlanificacionConsultor || []).map(p => ({
          id: p.Id,
          idTicketConsultorAsignacion: p.IdTicketConsultorAsignacion || null,
          idTicketFrenteSubFrente: p.IdTicketFrenteSubFrente,
          idTipoActividad: p.IdTipoActividad,
          fechaInicio: p.FechaInicio ? toLocalISOString(p.FechaInicio) : null,
          fechaFin: p.FechaFin ? toLocalISOString(p.FechaFin) : null,
          horas: parseHorasToDecimal(p.Horas),
          descripcion: p.Descripcion,
          activo: p.Activo
        }))
      }));

      const ticketData = {
        codTicketInterno: values.codTicketInterno,
        titulo: values.titulo,
        fechaSolicitud: values.fechaSolicitud ? toLocalISOString(values.fechaSolicitud) : null,
        idTipoTicket: Number(values.idTipoTicket),
        idSubTipoTicket: values.idSubtipoTicket ? Number(values.idSubtipoTicket) : null,
        idEstadoTicket: Number(values.idEstadoTicket),
        idEmpresa: Number(values.idEmpresa),
        idUsuarioResponsableCliente: values.idUsuarioResponsableCliente ? Number(values.idUsuarioResponsableCliente) : null,
        idPrioridad: Number(values.idPrioridad),
        descripcion: values.descripcion,
        urlArchivos: "",
        codReqSgrCsti: "",
        idReqSgrCsti: null,
        idGestoresSecundarios: values.idGestor ? values.idGestor.filter(id => id !== persona?.empresa?.idGestor) : [],
        idGestorConsultoria: values.idGestorConsultoria ? Number(values.idGestorConsultoria) : null,
        repositorios: reposPayload.length > 0 ? JSON.stringify(reposPayload) : null,
        consultorAsignaciones: asignacionesPayload,
        frenteSubFrentes: frenteSubFrentesPayload,
      };

      ticketData.usuarioCreacion = values.usuarioCreacion || window.localStorage.getItem("username") || "admin";
      Registrar({ ticketData });
    },


  });

  const idConsultorLogged = window.localStorage.getItem("idConsultor");
  const isConsultor = codRol === "CONSULTOR";
  const isGestorCuenta = codRol === "GESTORCUENTA";
  const isAdmin = codRol === "ADMIN" || codRol === "SUPERADMIN";

  const mostrarAlertaSinHorasEdit = useMemo(() => {
    if (!isConsultor || !idConsultorLogged || !formik.values.asignaciones) return false;

    const asignacionConsultor = (formik.values.asignaciones || []).find(
      (a) => a.Activo !== false && !a.esPlaceholder && Number(a.IdConsultor) === Number(idConsultorLogged)
    );

    if (!asignacionConsultor) return false;

    const tareasFormik = asignacionConsultor.DetalleTareasConsultor || [];
    const tieneHorasEnFormik = tareasFormik.some(t => t.Activo && parseFloat(t.Horas || 0) > 0);
    if (tieneHorasEnFormik) return false;

    const originalIndex = (formik.values.asignaciones || []).findIndex(
      (a) => a.idUnico === asignacionConsultor.idUnico
    );
    if (originalIndex === -1) return true;

    const totalHoras = totalesFijos?.[originalIndex]?.totalHoras || 0;
    return Number(totalHoras) === 0;
  }, [isConsultor, idConsultorLogged, formik.values.asignaciones, totalesFijos]);

  const mostrarAlertaSinEspecializaciones = useMemo(() => {
    if (!isGestorCuenta || !persona) return false;

    // Si formik aún no ha cargado los valores del ticket recién traído (lag de inicialización),
    // validamos contra los datos reales de persona.frenteSubFrentes
    const frentesList = formik.values.frenteSubFrentes && formik.values.frenteSubFrentes.length > 0
      ? formik.values.frenteSubFrentes
      : (persona.frenteSubFrentes || []);

    const especializacionesActivas = frentesList.filter(
      (e) => e.activo !== false
    );

    return especializacionesActivas.length === 0;
  }, [isGestorCuenta, formik.values.frenteSubFrentes, persona]);

  const mostrarAlertaSinPlanificacion = useMemo(() => {
    if (!isGestorCuenta || !persona) return false;

    const frentesList = formik.values.frenteSubFrentes && formik.values.frenteSubFrentes.length > 0
      ? formik.values.frenteSubFrentes
      : (persona.frenteSubFrentes || []);

    const especializacionesActivas = frentesList.filter(
      (e) => e.activo !== false
    );

    if (especializacionesActivas.length === 0) return false;

    return especializacionesActivas.some((esp) => {
      const detalles = esp.DetallePlanificacionConsultor || esp.detallePlanificacionConsultor || [];
      const totalMin = detalles
        .filter((d) => d.Activo || d.activo)
        .reduce((acc, it) => {
          const hrs = it.Horas || it.horas || "0";
          const parts = String(hrs).split(".");
          const hh = Number(parts[0] || "0");
          let mmStr = parts[1] || "0";
          if (mmStr.length === 1) mmStr = `${mmStr}0`;
          const mm = Number(mmStr.slice(0, 2));
          return acc + (hh * 60 + mm);
        }, 0);
      return totalMin === 0;
    });
  }, [isGestorCuenta, formik.values.frenteSubFrentes, persona]);

  useEffect(() => {
    if (setAlertas) {
      if (mostrarAlertaSinHorasEdit && persona?.codTicket) {
        setAlertas([
          {
            id: `ticket-edit-sin-horas-${persona?.id}`,
            title: "Pendiente Registrar Horas",
            description: `Tengo pendiente registrar mis horas trabajadas para el ticket ${persona?.codTicket}`,
            icon: "pi pi-exclamation-triangle",
            message: `Tengo pendiente registrar mis horas trabajadas para el ticket ${persona?.codTicket}`,
            items: []
          }
        ]);
      } else if (mostrarAlertaSinEspecializaciones && persona?.codTicket) {
        setAlertas([
          {
            id: `ticket-edit-sin-especializaciones-${persona?.id}`,
            title: "Pendiente Registrar Especializaciones",
            description: `Tengo pendiente configurar las especializaciones para el ticket ${persona?.codTicket}`,
            icon: "pi pi-exclamation-triangle",
            message: `Tengo pendiente configurar las especializaciones para el ticket ${persona?.codTicket}`,
            items: []
          }
        ]);
      } else if (mostrarAlertaSinPlanificacion && persona?.codTicket) {
        setAlertas([
          {
            id: `ticket-edit-sin-planificacion-${persona?.id}`,
            title: "Pendiente Registrar Planificación",
            description: `Tengo pendiente registrar la planificación de horas para el ticket ${persona?.codTicket}`,
            icon: "pi pi-exclamation-triangle",
            message: `Tengo pendiente registrar la planificación de horas para el ticket ${persona?.codTicket}`,
            items: []
          }
        ]);
      } else {
        setAlertas([]);
      }
    }
    return () => {
      if (setAlertas) setAlertas([]);
    };
  }, [mostrarAlertaSinHorasEdit, mostrarAlertaSinEspecializaciones, mostrarAlertaSinPlanificacion, persona?.codTicket, setAlertas, persona?.id]);

  useEffect(() => {
    if (gestorConsultoria && gestorConsultoria.length === 1 && !formik.values.idGestorConsultoria) {
      formik.setFieldValue("idGestorConsultoria", gestorConsultoria[0].id);
    }
  }, [gestorConsultoria, formik.values.idGestorConsultoria, formik.setFieldValue]);

  const [visibleAlertHoras, setVisibleAlertHoras] = useState(false);
  const alertHorasShownRef = useRef(false);

  const [visibleAlertEspecializaciones, setVisibleAlertEspecializaciones] = useState(false);
  const alertEspecializacionesShownRef = useRef(false);

  const [visibleAlertPlanificacion, setVisibleAlertPlanificacion] = useState(false);
  const alertPlanificacionShownRef = useRef(false);

  useEffect(() => {
    if (mostrarAlertaSinHorasEdit && persona?.codTicket && !alertHorasShownRef.current) {
      alertHorasShownRef.current = true;
      setVisibleAlertHoras(true);
    }
  }, [mostrarAlertaSinHorasEdit, persona?.codTicket]);

  useEffect(() => {
    if (mostrarAlertaSinEspecializaciones && persona?.codTicket && !alertEspecializacionesShownRef.current) {
      alertEspecializacionesShownRef.current = true;
      setVisibleAlertEspecializaciones(true);
    }
  }, [mostrarAlertaSinEspecializaciones, persona?.codTicket]);

  useEffect(() => {
    if (mostrarAlertaSinPlanificacion && persona?.codTicket && !alertPlanificacionShownRef.current) {
      alertPlanificacionShownRef.current = true;
      setVisibleAlertPlanificacion(true);
    }
  }, [mostrarAlertaSinPlanificacion, persona?.codTicket]);

  useEffect(() => {
    if (Object.keys(formik.errors).length > 0) {
      console.log("Formik Validation Errors:", formik.errors);
    }
  }, [formik.errors]);

  const recalcularSubtipos = (idTipoTicket) => {
    if (!idTipoTicket || !parametros?.length) return;

    const tipo = parametros.find(
      (p) => p.tipoParametro === TIPO_PARAMETRO.TipoTicket && Number(p.id) === Number(idTipoTicket)
    );

    const codigoTipo = (tipo?.codigo ?? "").trim();

    // Si no hay código, no borres el valor (solo deja opciones vacías)
    if (!codigoTipo) {
      setSubtiposFiltrados([]);
      return;
    }

    const subs = parametros
      .filter(
        (p) =>
          p.tipoParametro === "Subtipos" &&
          String(p.valor1).trim() === codigoTipo
      )
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      .map((s) => ({ ...s, id: Number(s.id) })); // 🔥 normaliza ids

    setSubtiposFiltrados(subs);


    // En edición NO limpies el subtipo automáticamente
    const actual = Number(formik.values.idSubtipoTicket);
    const existe = subs.some((s) => Number(s.id) === actual);

    if (!existe) {
      formik.setFieldValue("idSubtipoTicket", null);
    }

  };


  useEffect(() => {
    if (!parametros?.length) return;

    if (formik.values.idEstadoTicket === 0) {
      const estadoPendiente = parametros.find(
        (item) => item.tipoParametro === TIPO_PARAMETRO.EstadoTicket && item.codigo === CODIGOS.EstadoTicket.EnEjecucion
      );
      if (estadoPendiente) {
        formik.setFieldValue("idEstadoTicket", estadoPendiente.id);
        return;
      }
    }

    const estadoActual = parametros.find(
      (item) => item.id === formik.values.idEstadoTicket
    );
    let opciones = [];
    if (estadoActual) {
      const codigosPermitidos = estadoActual?.valor1?.split(",") || [];
      opciones = parametros.filter(
        (item) =>
          item.tipoParametro === TIPO_PARAMETRO.EstadoTicket
          && codigosPermitidos.includes(item.codigo)
      );
      const yaIncluido = opciones.some(item => item.id === estadoActual?.id);
      if (!yaIncluido) {
        opciones = [estadoActual, ...opciones];
      }
    } else {
      // Si no hay estado actual (es 0 o null), mostrar todos los estados para que el usuario pueda corregirlo
      opciones = parametros.filter((item) => item.tipoParametro === TIPO_PARAMETRO.EstadoTicket);
    }

    setOpcionesEstadoTicket(opciones);

    // Bloquear dropdown solo si hay estado actual y no tiene permisos
    let bloquear = false;
    if (estadoActual) {
      const rolesPermitidos = estadoActual?.valor2?.split(",") || [];
      bloquear = !rolesPermitidos.includes(codRol);
    }
    setBloquearDropdown(bloquear);
  }, [parametros, formik.values.idEstadoTicket]);
  useEffect(() => {
    if (formik.submitCount > lastSubmitCountRef.current) {
      lastSubmitCountRef.current = formik.submitCount;
      if (Object.keys(formik.errors).length > 0) {
        console.log("Formik Validation Errors:", formik.errors);

        const getErrorMessages = (obj) => {
          let messages = [];
          const traverse = (o) => {
            if (!o) return;
            if (typeof o === "string") {
              messages.push(o);
            } else if (Array.isArray(o)) {
              o.forEach(item => traverse(item));
            } else if (typeof o === "object") {
              Object.values(o).forEach(val => traverse(val));
            }
          };
          traverse(obj);
          return messages;
        };

        const errorMsgs = getErrorMessages(formik.errors);
        toast.current.show({
          severity: "warn",
          summary: "Campos incompletos",
          detail: errorMsgs.length > 0 ? (
            <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px" }}>
              {errorMsgs.map((msg, idx) => (
                <li key={idx} style={{ listStyleType: 'disc', margin: '4px 0' }}>{msg}</li>
              ))}
            </ul>
          ) : "Revisa los datos ingresados.",
          life: 7000,
        });
      }
    }
  }, [formik.submitCount, formik.errors]);
  useEffect(() => {
    if (!parametros?.length) return;
    if (!formik.values.idTipoTicket) return;

    recalcularSubtipos(formik.values.idTipoTicket);
  }, [parametros, formik.values.idTipoTicket]);
  useEffect(() => {
    if (!persona) return;
    if (!subtiposFiltrados?.length) return;

    const idBackend = persona.idSubTipoTicket ?? persona.idSubtipoTicket ?? null;
    if (!idBackend) return;

    const existe = subtiposFiltrados.some(s => Number(s.id) === Number(idBackend));

    if (existe) {
      formik.setFieldValue("idSubtipoTicket", Number(idBackend));
    }
  }, [persona, subtiposFiltrados]);


  useEffect(() => {
    if (
      persona &&
      persona.idEmpresa &&
      Array.isArray(empresa) &&
      empresa.length > 0
    ) {
      const empresaSeleccionada = empresa.find(emp => emp.id === persona.idEmpresa);

      if (empresaSeleccionada) {
        formik.setFieldValue("nombrePersonaResponsable", empresaSeleccionada.nombrePersonaResponsable);
        formik.setFieldValue("idUsuarioResponsableCliente", empresaSeleccionada.idPersonaResponsable);
      }
    }
  }, [persona, empresa]);
  const asignacionesKey = useMemo(() => {
    return (formik.values.asignaciones || [])
      .map(a => `${a.IdSubFrente}-${a.Activo}`)
      .join(',');
  }, [formik.values.asignaciones]);

  const ObtenerConsultoresPorFrente = (idFrente, idSubFrente) => {
    if (!Array.isArray(consultores)) return [];
    return consultores.filter(c =>
      c.especializaciones.some(e =>
        Number(e.idSubFrente) === Number(idSubFrente)
      )
    );
  };

  useEffect(() => {
    if (!Array.isArray(consultores) || consultores.length === 0) return;
    if (!formik.values.asignaciones) return;

    const nuevasConsultoresPorFila = {};
    formik.values.asignaciones.forEach((a, index) => {
      if (a.IdSubFrente) {
        const seleccionado = subfrentesSeleccionados.find(
          s => Number(s.idSubFrente) === Number(a.IdSubFrente)
        );
        const idFrente = seleccionado?.idFrente;
        if (idFrente) {
          const data = ObtenerConsultoresPorFrente(idFrente, a.IdSubFrente);
          nuevasConsultoresPorFila[index] = data;
        }
      }
    });

    // Comparar si realmente cambió
    const hasChanged = Object.keys(nuevasConsultoresPorFila).length !== Object.keys(consultoresPorFila).length ||
      Object.keys(nuevasConsultoresPorFila).some(key => {
        const arr1 = nuevasConsultoresPorFila[key] || [];
        const arr2 = consultoresPorFila[key] || [];
        return arr1.length !== arr2.length || arr1.some((val, i) => val.id !== arr2[i].id);
      });

    if (hasChanged) {
      setConsultoresPorFila(nuevasConsultoresPorFila);
    }
  }, [
    asignacionesKey,
    subfrentesSeleccionados,
    consultores,
    consultoresPorFila
  ]);

  const Registrar = ({ ticketData }) => {
    RegistrarTiketRapido({ ticketData })
      .then((res) => {
        formik.setSubmitting(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Registro exitoso.",
          life: 7000,
        });
        setTimeout(() => {
          if (onSaveSuccess) onSaveSuccess();
          onHide();
        }, 1000);
      })

      // setTimeout(() => {
      // navigate(-1);
      // }, 1000);
      // })
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



  const confirmarEliminacion = (rowData) => {
    confirmDialog({
      message: '¿Está seguro de desactivar esta especialización?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'custom-confirm-accept',
      acceptLabel: 'ELIMINAR',
      rejectClassName: 'custom-confirm-reject',
      rejectLabel: 'Cancelar',
      accept: () => {
        const nuevasEspecializaciones = formik.values.frenteSubFrentes.map((esp) =>
          esp === rowData ? { ...esp, activo: false } : esp
        );
        formik.setFieldValue('frenteSubFrentes', nuevasEspecializaciones);
      },
    });
  };

  const handleEmpresaChange = (e) => {
    const selectedEmpresaId = e.value;
    formik.setFieldValue("idEmpresa", selectedEmpresaId);
    const empresaSeleccionada = empresa.find(emp => emp.id === selectedEmpresaId);
    if (empresaSeleccionada) {
      formik.setFieldValue("nombrePersonaResponsable", empresaSeleccionada.nombrePersonaResponsable);
      formik.setFieldValue("idUsuarioResponsableCliente", empresaSeleccionada.idPersonaResponsable);
      let selectedIds = empresaSeleccionada.idGestor ? [empresaSeleccionada.idGestor] : [];

      if (empresaSeleccionada.gestores && Array.isArray(empresaSeleccionada.gestores)) {
        const idMesaDeAyuda = parametros?.find(p => p.tipoParametro === TIPO_PARAMETRO.TipoTicket && p.codigo === CODIGOS.TipoTicket.MesaDeAyuda)?.id;

        if (idMesaDeAyuda) {
          const gestoresMesaAyuda = empresaSeleccionada.gestores
            .filter(g => g.idsTiposTicketPermitidos && g.idsTiposTicketPermitidos.includes(Number(idMesaDeAyuda)))
            .map(g => g.idGestor);

          gestoresMesaAyuda.forEach(idG => {
            if (!selectedIds.includes(idG)) {
              selectedIds.push(idG);
            }
          });
        }
      }
      formik.setFieldValue("idGestor", selectedIds);

      // Auto-load Gestor Consultoria
      if (gestorConsultoria && gestorConsultoria.length > 0) {
        formik.setFieldValue("idGestorConsultoria", gestorConsultoria[0].id);
      }
    } else {
      formik.setFieldValue("idGestor", []);
      formik.setFieldValue("idUsuarioResponsableCliente", "");
      formik.setFieldValue("idUsuarioResponsableCliente", "");
    }
  };




  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Agregar nueva fila
  const addRow = () => {
    const fechaRef = formik.values.fechaSolicitud ? new Date(formik.values.fechaSolicitud) : new Date();
    formik.setFieldValue("asignaciones", [
      ...formik.values.asignaciones,
      {
        // idUnico: crypto.randomUUID(),  // clave única
        idUnico: generateUUID(),
        Id: 0,
        IdSubFrente: 0,
        IdConsultor: 0,
        IdTipoActividad: 25,
        FechaAsignacion: fechaRef,
        FechaDesasignacion: fechaRef,
        DetalleTareasConsultor: [],
        DetallePlanificacionConsultor: [],
        Activo: true,
      },
    ]);
  };

  // Eliminar fila por idUnico
  const removeRow = (idUnico) => {
    confirmDialog({
      message: '¿Está seguro de eliminar esta asignación?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'custom-confirm-accept',
      acceptLabel: 'ELIMINAR',
      rejectClassName: 'custom-confirm-reject',
      rejectLabel: 'Cancelar',
      accept: () => {
        const asignacionAEliminar = formik.values.asignaciones.find((a) => a.idUnico === idUnico);
        if (!asignacionAEliminar) return;

        let nuevasAsignaciones = formik.values.asignaciones.map((a) =>
          a.idUnico === idUnico ? { ...a, Activo: false } : a
        );

        formik.setFieldValue("asignaciones", nuevasAsignaciones);
        setTimeout(() => {
          formik.handleSubmit();
        }, 100);
      }
    });
  };



  const footer = (
    <div className="w-full flex justify-between items-center border-t pt-3 px-3">
      {/* Total de horas (lado izquierdo) */}
      {formik.values.asignaciones[visibleIndex] && (
        <div className="text-left font-semibold text-blue-700">
          Total de horas:&nbsp;
          {
            formik.values.asignaciones[visibleIndex].DetalleTareasConsultor
              ?.filter((d) => d.Activo)
              .reduce((total, item) => total + (item.Horas || 0), 0)
          }
        </div>
      )}

      {formik.values.asignaciones[visibleIndex] && (
        <Button
          label="Registrar"
          severity="secondary"
          disabled={add && eliminar}
          onClick={() => {
            formik.handleSubmit();
            setVisibleIndex(null);
          }}
        />
      )}
      {formik.values.asignaciones[visibleIndexPlanificacion] && (
        <Button
          label="Registrar"
          severity="secondary"
          disabled={addPlanificacion && eliminarPlanificacion}
          onClick={() => {
            formik.handleSubmit();
            setVisibleIndex(null);
          }}
        />
      )}
    </div>
  );

  const obtenerCantidadPermitida = (idSubFrente) => {
    return (formik.values.frenteSubFrentes || [])
      .filter((e) => e.idSubFrente === idSubFrente && e.activo !== false)
      .reduce((sum, e) => sum + (e.cantidad ?? 0), 0);
  };
  const contarAsignaciones = (idSubFrente) => {
    return formik.values.asignaciones.filter(
      (a) => a.IdSubFrente === idSubFrente && a.Activo !== false && !a.esPlaceholder
    ).length;
  };

  return (
    <Dialog visible={visible} onHide={onHide} header="Creación Rápida de Ticket" style={{ width: '85vw' }} modal className="zv-editarUsuario" contentStyle={{ paddingTop: 12 }}>
      <ConfirmDialog />

      {ReactDOM.createPortal(
        <Toast ref={toast} position="top-center" style={{ zIndex: 2147483647 }}></Toast>,
        document.body
      )}

      {/* 🔴 Popup de alerta: Horas sin registrar */}
      <Dialog
        visible={visibleAlertHoras}
        onHide={() => setVisibleAlertHoras(false)}
        modal
        draggable={false}
        resizable={false}
        style={{ width: 'min(480px, 90vw)' }}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="pi pi-exclamation-triangle" style={{ color: '#dd4b39', fontSize: 20 }} />
            <span style={{ fontWeight: 700, fontSize: 16, color: '#dd4b39', fontFamily: 'Poppins, sans-serif' }}>
              Pendiente Registrar Horas
            </span>
          </div>
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Boton
              label="Entendido"
              color="primary"
              icon="pi pi-check"
              onClick={() => setVisibleAlertHoras(false)}
            />
          </div>
        }
      >
        <p style={{ margin: 0, fontSize: 14, color: '#4a5568', lineHeight: 1.6 }}>
          Tengo pendiente registrar mis horas trabajadas para el ticket{' '}
          <strong style={{ color: '#2e4878' }}>{persona?.codTicket}</strong>.
        </p>
      </Dialog>

      {/* 🔴 Popup de alerta: Especialidades sin registrar */}
      <Dialog
        visible={visibleAlertEspecializaciones}
        onHide={() => setVisibleAlertEspecializaciones(false)}
        modal
        draggable={false}
        resizable={false}
        style={{ width: 'min(480px, 90vw)' }}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="pi pi-exclamation-triangle" style={{ color: '#dd4b39', fontSize: 20 }} />
            <span style={{ fontWeight: 700, fontSize: 16, color: '#dd4b39', fontFamily: 'Poppins, sans-serif' }}>
              Pendiente Registrar Especialidades
            </span>
          </div>
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Boton
              label="Entendido"
              color="primary"
              icon="pi pi-check"
              onClick={() => setVisibleAlertEspecializaciones(false)}
            />
          </div>
        }
      >
        <p style={{ margin: 0, fontSize: 14, color: '#4a5568', lineHeight: 1.6 }}>
          Tengo pendiente configurar las especializaciones para el ticket{' '}
          <strong style={{ color: '#2e4878' }}>{persona?.codTicket}</strong>.
        </p>
      </Dialog>

      {/* 🔴 Popup de alerta: Planificación sin registrar */}
      <Dialog
        visible={visibleAlertPlanificacion}
        onHide={() => setVisibleAlertPlanificacion(false)}
        modal
        draggable={false}
        resizable={false}
        style={{ width: 'min(480px, 90vw)' }}
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="pi pi-exclamation-triangle" style={{ color: '#dd4b39', fontSize: 20 }} />
            <span style={{ fontWeight: 700, fontSize: 16, color: '#dd4b39', fontFamily: 'Poppins, sans-serif' }}>
              Pendiente Registrar Planificación
            </span>
          </div>
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Boton
              label="Entendido"
              color="primary"
              icon="pi pi-check"
              onClick={() => setVisibleAlertPlanificacion(false)}
            />
          </div>
        }
      >
        <p style={{ margin: 0, fontSize: 14, color: '#4a5568', lineHeight: 1.6 }}>
          Tengo pendiente registrar la planificación de horas para el ticket{' '}
          <strong style={{ color: '#2e4878' }}>{persona?.codTicket}</strong>.
        </p>
      </Dialog>

      <div className="zv-editarUsuario-body" style={{ marginTop: 8 }}>
        <form onSubmit={formik.handleSubmit}>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-12">


              {/* ===================== DATOS GENERALES (COPIAR Y PEGAR) ===================== */}

              <div className="grid">
                {/* Empresa */}
                <div className="field col-12 md:col-3">
                  <label className="label-form">Empresa</label>
                  <DropdownDefault
                    id="idEmpresa"
                    name="idEmpresa"
                    placeholder="Seleccione"
                    value={formik.values.idEmpresa}
                    onChange={handleEmpresaChange}
                    onBlur={formik.handleBlur}
                    options={empresasFiltradas}
                    optionLabel="nombreComercial"
                    optionValue="id"
                    disabled={permisosActual.controlesBloqueados.includes("cboEmpresa")}
                    pulse={true}
                  />
                  <small className="p-error">{formik.touched.idEmpresa && formik.errors.idEmpresa}</small>
                </div>

                {/* Codigo Interno */}
                <div className="field col-12 md:col-3">
                  <label className="label-form">Codigo Interno</label>
                  <InputTextDefault
                    type={"text"}
                    id="codTicketInterno"
                    name="codTicketInterno"
                    placeholder="Escribe aquí"
                    value={formik.values.codTicketInterno}
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                      formik.handleChange(e);
                      formik.setFieldValue("titulo", e.target.value);
                      formik.setFieldValue("descripcion", e.target.value);
                    }}
                    disabled={permisosActual.controlesBloqueados.includes("textCodigoInterno")}
                    pulse={true}
                  />
                  <div className="p-error">
                    {formik.touched.codTicketInterno && formik.errors.codTicketInterno}
                  </div>
                </div>

                {/* Gestor Asignado */}
                <div className="field col-12 md:col-3">
                  <label className="label-form">Gestor Asignado</label>
                  <MultiSelectDefault
                    id="idGestor"
                    name="idGestor"
                    placeholder="Seleccione"
                    value={formik.values.idGestor || []}
                    onChange={(e) => {
                      const primaryGestorId = persona?.empresa?.idGestor;
                      let selectedIds = e.value || [];
                      // Asegurar que el gestor principal siempre esté seleccionado
                      if (primaryGestorId && !selectedIds.includes(primaryGestorId)) {
                        selectedIds = [primaryGestorId, ...selectedIds];
                      }
                      formik.setFieldValue("idGestor", selectedIds);
                    }}
                    onBlur={formik.handleBlur}
                    options={gestorCuenta?.map(g => ({
                      ...g,
                      disabled: g.id === persona?.empresa?.idGestor
                    })) || []}
                    optionLabel={(option) =>
                      `${option.nombres} ${option.apellidoPaterno} ${option.apellidoMaterno}`
                    }
                    optionValue="id"
                    display="chip"
                  />
                  <small className="p-error">
                    {formik.touched.idGestor && formik.errors.idGestor}
                  </small>
                </div>

                {/* Gestor Consultoria */}
                <div className="field col-12 md:col-3">
                  <label className="label-form">Gestor Consultoria</label>
                  <DropdownDefault
                    id="idGestorConsultoria"
                    name="idGestorConsultoria"
                    placeholder="Seleccione"
                    value={formik.values.idGestorConsultoria}
                    onChange={(e) => formik.setFieldValue("idGestorConsultoria", e.value)}
                    onBlur={formik.handleBlur}
                    options={gestorConsultoria}
                    optionLabel={(option) =>
                      `${option.nombres} ${option.apellidoPaterno} ${option.apellidoMaterno}`
                    }
                    optionValue="id"
                    disabled={true}
                  />
                  <small className="p-error">
                    {formik.touched.idGestorConsultoria && formik.errors.idGestorConsultoria}
                  </small>
                </div>

                {/* Titulo */}
                <div className="field col-12 md:col-3">
                  <label className="label-form">Titulo</label>
                  <InputTextDefault
                    type={"text"}
                    id="titulo"
                    name="titulo"
                    placeholder="Escribe aquí"
                    value={formik.values.titulo}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                  />
                  <div className="p-error">{formik.touched.titulo && formik.errors.titulo}</div>
                </div>

                {/* Fecha de solicitud */}
                <div className="field col-12 md:col-3">
                  <label className="label-form">Fecha de solicitud </label>
                  <CalendarDefault
                    id="fechaSolicitud"
                    name="fechaSolicitud"
                    value={formik.values.fechaSolicitud}
                    onChange={(e) => formik.setFieldValue("fechaSolicitud", e.value)}
                    onBlur={formik.handleBlur}
                    dateFormat="dd/mm/yy"
                    placeholder="Selecciona la fecha"
                    showIcon
                  />
                  <div className="p-error">
                    {formik.touched.fechaSolicitud && formik.errors.fechaSolicitud}
                  </div>
                </div>

                {/* Tipo */}
                <div className="field col-12 md:col-3">
                  <label className="label-form">Tipo</label>
                  <DropdownDefault
                    id="idTipoTicket"
                    name="idTipoTicket"
                    placeholder="Seleccione"
                    value={formik.values.idTipoTicket}
                    options={parametros?.filter((item) => item.tipoParametro === TIPO_PARAMETRO.TipoTicket)}
                    optionLabel="nombre"
                    optionValue="id"
                    disabled={true}
                    onChange={(e) => {
                      const nuevoTipoId = Number(e.value);
                      formik.setFieldValue("idTipoTicket", nuevoTipoId);
                      formik.setFieldValue("idSubtipoTicket", null);
                    }}
                    onBlur={formik.handleBlur}
                  />

                  <small className="p-error">
                    {formik.touched.idTipoTicket && formik.errors.idTipoTicket}
                  </small>
                </div>

                {/* Subtipo */}
                <div className="field col-12 md:col-3">
                  <label className="label-form">Subtipo</label>
                  <DropdownDefault
                    id="idSubtipoTicket"
                    name="idSubtipoTicket"
                    placeholder="Seleccione"
                    value={formik.values.idSubtipoTicket}
                    options={subtiposFiltrados}
                    optionLabel="nombre"
                    optionValue="id"
                    onChange={(e) => formik.setFieldValue("idSubtipoTicket", Number(e.value))}
                    onBlur={formik.handleBlur}
                    pulse={true}
                  />
                  <small className="p-error">
                    {formik.touched.idSubtipoTicket && formik.errors.idSubtipoTicket}
                  </small>
                </div>

                <div style={{ display: "none" }}>
                  {/* Usuario Responsable del Cliente */}
                  <div className="field col-12 md:col-3">
                    <label className="label-form">Usuario Responsable del Cliente</label>
                    <InputTextDefault
                      type={"text"}
                      id="nombrePersonaResponsable"
                      name="nombrePersonaResponsable"
                      placeholder="Escribe aquí"
                      value={formik.values.nombrePersonaResponsable}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      disabled={true}
                    />
                    <div className="p-error">{formik.touched.titulo && formik.errors.titulo}</div>
                  </div>

                  {/* Prioridad */}
                  <div className="field col-12 md:col-3">
                    <label className="label-form">Prioridad</label>
                    <DropdownDefault
                      type="text"
                      id="idPrioridad"
                      name="idPrioridad"
                      placeholder="Seleccione"
                      value={formik.values.idPrioridad}
                      onChange={(e) => {
                        formik.setFieldValue("idPrioridad", "");
                        formik.handleChange(e);
                      }}
                      onBlur={formik.handleBlur}
                      options={parametros?.filter((item) => item.tipoParametro === TIPO_PARAMETRO.Prioridad)}
                      disabled={true}
                      optionLabel="nombre"
                      optionValue="id"
                    />
                    <small className="p-error">
                      {formik.touched.idPrioridad && formik.errors.idPrioridad}
                    </small>
                  </div>

                  {/* Estado */}
                  <div className="field col-12 md:col-3">
                    <label className="label-form">Estado</label>
                    <DropdownDefault
                      type="text"
                      id="idEstadoTicket"
                      name="idEstadoTicket"
                      placeholder="Seleccione"
                      value={formik.values.idEstadoTicket}
                      onChange={(e) => {
                        const nuevoEstadoId = e.value;
                        formik.setFieldValue("idEstadoTicket", nuevoEstadoId);
                      }}
                      disabled={true}
                      onBlur={formik.handleBlur}
                      options={opcionesEstadoTicket}
                      optionLabel="nombre"
                      optionValue="id"
                    />
                    <small className="p-error">
                      {formik.touched.idEstadoTicket && formik.errors.idEstadoTicket}
                    </small>
                  </div>

                  {/* Descripción */}
                  <div className="field col-12 md:col-3">
                    <label className="label-form">Descripción</label>
                    {(() => {
                      const val = formik.values.descripcion || '';
                      const isHtml = /<[a-z][\s\S]*>/i.test(val);
                      if (isHtml) {
                        return (
                          <div
                            style={{
                              width: '100%',
                              minHeight: '40px',
                              maxHeight: '150px',
                              overflowY: 'auto',
                              overflowX: 'auto',
                              border: '1px solid #cbd5e0',
                              borderRadius: '8px',
                              padding: '10px 12px',
                              backgroundColor: '#f8f9fa',
                              fontSize: '13px',
                              lineHeight: '1.6',
                              color: '#2d3748',
                            }}
                            dangerouslySetInnerHTML={{ __html: val }}
                          />
                        );
                      }

                      return (
                        <InputTextareaDefault
                          id="descripcion"
                          name="descripcion"
                          placeholder="Escribe aquí la descripción del ticket..."
                          value={val}
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          rows={3}
                          style={{ width: '100%', minHeight: '40px' }}
                        />
                      );
                    })()}
                    <div className="p-error">
                      {formik.touched.descripcion && formik.errors.descripcion}
                    </div>
                  </div>
                </div>

              </div>

              {/* ===================== FIN DATOS GENERALES ===================== */}

              <hr style={{ width: "100%", border: "1px solid #ccc", margin: "20px 0" }} />
              
              {formik.values.asignaciones && formik.values.asignaciones.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <EspecializacionesCreacionRapida
                    formik={formik}
                    frentes={frentes}
                    permisosActual={permisosActual}
                    setSubfrentesSeleccionados={setSubfrentesSeleccionados}
                    consultores={consultores}
                    parametros={parametros}
                    codFrentes={codFrentes}
                    toastRef={toast}
                  />
                  <hr style={{ width: "100%", border: "1px solid #ccc", margin: "20px 0" }} />
                </div>
              )}

              <AsignacionesCreacionRapida
                formik={formik}
                permisosActual={permisosActual}
                subfrentesSeleccionados={subfrentesSeleccionados}
                consultores={consultores}
                consultoresPorFila={consultoresPorFila}
                setConsultoresPorFila={setConsultoresPorFila}
                ObtenerConsultoresPorFrente={ObtenerConsultoresPorFrente}
                obtenerCantidadPermitida={obtenerCantidadPermitida}
                contarAsignaciones={contarAsignaciones}
                totalesFijos={totalesFijos}
                toastRef={toast}
                parametros={parametros}
                codFrentes={codFrentes}
                addRow={addRow}
                removeRow={removeRow}
                highlightZero={mostrarAlertaSinHorasEdit}
                frentes={frentes}
                esCreacionRapida={true}
              />

            </div>

          </div>
          <div className="zv-editarUsuario-footer">

            <Boton
              actionType="guardar"
              loading={formik.isSubmitting}
            />

          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default ModalCreacionRapida;
