import { useEffect, useState, useRef, useMemo, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CalendarDefault from "../../components/CalendarDefault/CalendarDefault";
import DropdownDefault from "../../components/DropdownDefault/DropdownDefault";
import ModalArchivos from "../../components/Modals/ModalArchivos/ModalArchivos";
import * as Iconsax from "iconsax-react";
import "./Gestiontikets.scss"
import InputTextDefault from "../../components/InputTextDefault/InputTextDefault";
import InputTextareaDefault from "../../components/InputTextareaDefault/InputTextareaDefault";
import Boton from "../../components/Boton/Boton";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Toast } from "primereact/toast";
import useUsuario from "../../hooks/useUsuario";
import { ListarConsultores, ListarConsultoresPorSocio, ObtenerConsultor } from "../../service/ConsultorService";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog"; // For confirmDialog method
import { formatDate } from "../../helpers/helpers";
import { Divider } from "primereact/divider";
import { ListarParametros, ListarPais, ListarFrentes, RegistrarTiket, ObtenerTicket, ActualizarTicket, ListarGestorConsultoria, ListarGestorCuenta, DescargarArchivoTicket } from "../../service/TiketService";
import { ListarGestores, ListarGestoresPorRolSocio } from "../../service/GestorService";
import { ListarEmpresasporRol } from "../../service/EmpresaService";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Accordion, AccordionTab } from 'primereact/accordion';
import Asignaciones from "./Components/Asignaciones";
import Especializaciones from "./Components/Especializaciones";
import ModalRepositorios from "./Components/ModalRepositorios";
import { CODIGOS } from "../../constants/codigosBD";
import Context from "../../context/usuarioContext";

const Editar = () => {
  const navigate = useNavigate();
  const { isLogged } = useUsuario();
  const { setAlertas } = useContext(Context) || {};
  const [persona, setTicket] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  //OK
  const [tituloPagina, setTituloPagina] = useState("Crear Tickets");
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
  const [activeIndex, setActiveIndex] = useState(modoEdicion ? null : 0);
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





  const [visible, setVisible] = useState(false);
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



  const descargarArchivo = async (row) => {
    try {
      const blob = await DescargarArchivoTicket({
        idTicket: persona?.id ?? id,
        orden: row.Orden,
      });

      const filename = row?.Url
        ? row.Url.split("/").pop()
        : `archivo_${row.Orden}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err.message || "No se pudo descargar el archivo",
        life: 6000,
      });
    }
  };

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

  useEffect(() => {
    const getParametro = async () => {
      await ListarParametros().then(data => { setParametro(data) })
    };
    getParametro();
  }, []);


  let { id } = useParams();
  const toast = useRef(null);
  const descripcionRef = useRef(null);


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
    if (!id || frentes.length === 0) return;
    const getTicket = async () => {
      await ObtenerTicket({ id }).then((data) => {
        setTituloPagina(`Datos del Ticket:  ${data.codTicket}`);

        // Asegurar que existan filas de asignaciones (incluso vacías) para cada especialización activa
        // Vincular por IdTicketFrenteSubFrente (el Id único de cada TicketFrenteSubFrente)
        const existingAsignaciones = [...(data.consultorAsignaciones || [])];
        (data.frenteSubFrentes || []).forEach((fsf) => {
          if (fsf.activo !== false) {
            // Buscar asignación vinculada por IdTicketFrenteSubFrente (id de la especialización)
            const tieneAsig = existingAsignaciones.some(
              (a) => a.activo !== false && Number(a.idTicketFrenteSubFrente) === Number(fsf.id)
            );
            if (!tieneAsig) {
              existingAsignaciones.push({
                id: 0,
                idTicket: data.id,
                idSubFrente: fsf.idSubFrente,
                idFrente: fsf.idFrente,
                idTicketFrenteSubFrente: fsf.id, // Vínculo directo a la especialización
                idConsultor: 0, // Placeholder
                idTipoActividad: 25,
                fechaAsignacion: fsf.fechaInicio,
                fechaDesasignacion: fsf.fechaFin,
                activo: true,
                detalleTareasConsultor: [],
                detallePlanificacionConsultor: [],
                esPlaceholder: true,
              });
            }
          }
        });
        data.consultorAsignaciones = existingAsignaciones;

        setTicket(data);
        setModoEdicion(true);
        if (!frentes || frentes.length === 0) return;

        const subfrentes = (data.frenteSubFrentes || [])
          .filter((f) => f.activo !== false)
          .map((f) => {
            const frenteEncontrado = frentes.find((fr) => fr.id === f.idFrente);
            const subfrenteEncontrado = frenteEncontrado?.subFrente?.find(
              (sf) => sf.id === f.idSubFrente
            );

            return {
              idFrente: f.idFrente,
              idSubFrente: f.idSubFrente,
              nombre: subfrenteEncontrado ? subfrenteEncontrado.nombre : "",
            };
          });
        setSubfrentesSeleccionados(subfrentes);
        const totalHorasPorConsultor = data.consultorAsignaciones.map(asig => {
          const total = (asig.detalleTareasConsultor || [])
            .filter(t => t.activo)
            .reduce((suma, tarea) => suma + (tarea.horas || 0), 0);

          return {
            idConsultor: asig.idConsultor,
            totalHoras: total
          };

        });

        setTotalesFijos(totalHorasPorConsultor)

      });
    };
    if (id) getTicket();
  }, [id, frentes]);

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
      const fetchFunction = codRol === "SUPERADMIN" ? ListarConsultores : ListarConsultoresPorSocio;
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
    titulo: Yup.string().required("Título es obligatorio"),
    fechaSolicitud: Yup.date().required("Fecha de solicitud es obligatoria"),
    idTipoTicket: Yup.number().required("Tipo de ticket es obligatorio"),
    idSubtipoTicket: Yup.number().required("Subtipo es obligatorio"),
    idEstadoTicket: Yup.number().required("Estado del ticket es obligatorio"),
    idEmpresa: Yup.number().required("Empresa es obligatoria"),
    // idUsuarioResponsableCliente: Yup.number().required("Responsable del cliente es obligatorio"),
    // idPais: Yup.number().required("País es obligatorio"),
    idPrioridad: Yup.number().required("Prioridad es obligatoria"),
    descripcion: Yup.string().required("Descripción es obligatoria"),
    urlArchivos: Yup.string().nullable(),
    // urlArchivos: Yup.string(),
    idGestor: Yup.number().nullable(),
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

    idGestorConsultoria: Yup.number().required("Gestor Consultoria es obligatorio"),


  });

  const initialValues = useMemo(() => {
    return {
      codTicketInterno: persona ? persona.codTicketInterno : "",
      titulo: persona ? persona.titulo : "",
      fechaSolicitud: persona ? new Date(persona.fechaSolicitud) : null,
      idTipoTicket: persona ? Number(persona.idTipoTicket) : null,
      idSubtipoTicket: persona ? Number(persona.idSubTipoTicket ?? persona.idSubtipoTicket) : null,
      idEstadoTicket: (persona && persona.idEstadoTicket) ? persona.idEstadoTicket : 0,
      idEmpresa: persona ? persona.idEmpresa : null,
      idUsuarioResponsableCliente: persona ? persona.idUsuarioResponsableCliente : null,
      idPrioridad: persona ? persona.idPrioridad : null,
      descripcion: persona ? persona.descripcion : "",
      urlArchivos: persona ? persona.urlArchivos : "",
      idGestor: persona ? persona.empresa?.idGestor : null,
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
      frenteSubFrentes: persona ? persona.frenteSubFrentes.map((fsf) => ({
        ...fsf,
        _uid: fsf.id > 0 ? `db_${fsf.id}` : generateUUID(),
        DetallePlanificacionConsultor: (fsf.detallePlanificacionConsultor || []).map((d) => ({
          FechaInicio: d.fechaInicio ? new Date(d.fechaInicio) : null,
          FechaFin: d.fechaFin ? new Date(d.fechaFin) : null,
          Horas: d.horas,
          Descripcion: d.descripcion,
          Activo: d.activo,
          IdTicketFrenteSubFrente: d.idTicketFrenteSubFrente,
          Id: d.id,
          IdTipoActividad: d.idTipoActividad
        }))
      })) : [],
      asignaciones: persona ? (persona.consultorAsignaciones.map((a) => {
        // Vincular la asignación a su especialización por IdTicketFrenteSubFrente
        const fsfId = a.idTicketFrenteSubFrente || 0;
        let linkedFsf = fsfId > 0
          ? (persona.frenteSubFrentes || []).find((f) => f.id === fsfId)
          : null;
        if (!linkedFsf && a.idSubFrente) {
          linkedFsf = (persona.frenteSubFrentes || []).find(
            (f) => f.activo !== false && Number(f.idSubFrente) === Number(a.idSubFrente)
          );
        }
        const frenteSubFrenteUid = linkedFsf ? (linkedFsf.id > 0 ? `db_${linkedFsf.id}` : linkedFsf._uid) : (a._frenteSubFrenteUid || null);

        return {
          idUnico: a.id > 0 ? a.id.toString() : (a.idUnico || generateUUID()),
          Id: a.id,
          IdSubFrente: a.idSubFrente,
          IdConsultor: a.idConsultor,
          IdTipoActividad: a.idTipoActividad,
          IdTicketFrenteSubFrente: fsfId > 0 ? fsfId : (linkedFsf ? linkedFsf.id : 0),
          _frenteSubFrenteUid: frenteSubFrenteUid,
          FechaAsignacion: a.fechaAsignacion,
          FechaDesasignacion: a.fechaDesasignacion,
          Activo: a.activo,
          DetalleTareasConsultor: (a.detalleTareasConsultor || []).map((d) => ({
            FechaInicio: d.fechaInicio,
            FechaFin: d.fechaFin,
            Horas: d.horas,
            Descripcion: d.descripcion,
            Activo: d.activo,
            IdTicketConsultorAsignacion: d.idTicketConsultorAsignacion ?? 0,
            Id: d.id,
            IdTipoActividad: d.idTipoActividad
          })),
          esPlaceholder: a.esPlaceholder !== undefined ? a.esPlaceholder : (Number(a.idConsultor) === 0)
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
  }, [persona]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: schema,

    onSubmit: (values) => {
      // Validación: Si el estado es "EN_ATENCION", verificar que exista al menos una planificación
      /*const estadoSeleccionado = parametros.find(
        (p) => p.tipoParametro === "EstadoTicket" && Number(p.id) === Number(values.idEstadoTicket)
      );
      if (estadoSeleccionado) {
        if (estadoSeleccionado.codigo === CODIGOS.EstadoTicket.EnAtencion) {
          let tienePlanificacion = false;
          if (values.frenteSubFrentes && values.frenteSubFrentes.length > 0) {
            tienePlanificacion = values.frenteSubFrentes.some(fsf =>
              fsf.activo !== false && fsf.DetallePlanificacionConsultor && fsf.DetallePlanificacionConsultor.some(p => p.Activo)
            );
          }
          if (!tienePlanificacion) {
            toast.current?.show({
              severity: "warn",
              summary: "Advertencia",
              detail: "Debe llenar la planificación para pasar el ticket a estado En Atención.",
              life: 5000,
            });
            return; // Prevenir submit
          }
        }
        if (estadoSeleccionado.codigo === CODIGOS.EstadoTicket.Cerrado) {
          let tieneHoras = false;
          if (values.asignaciones && values.asignaciones.length > 0) {
            tieneHoras = values.asignaciones.some(a =>
              a.DetalleTareasConsultor && a.DetalleTareasConsultor.some(t => t.Activo)
            );
          }
          if (!tieneHoras) {
            toast.current?.show({
              severity: "warn",
              summary: "Advertencia",
              detail: "Debe llenar las tareas realizadas (horas) para pasar el ticket a estado Cerrado.",
              life: 5000,
            });
            return; // Prevenir submit
          }
        }
      }*/

      const reposPayload = (values.reposLinks || []).map(r => ({
        Link: (r.Url ?? r.Link ?? "").trim(),
      })).filter(x => x.Link);

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

          const { _frenteSubFrenteUid, esPlaceholder, idUnico, DetallePlanificacionConsultor, ...rest } = a;
          return {
            ...rest,
            IdTicketFrenteSubFrente: resolvedFrenteSubFrenteId,
            // Normaliza fechas a string ISO local (por si vienen como Date)
            FechaAsignacion: a.FechaAsignacion ? toLocalISOString(a.FechaAsignacion) : null,
            FechaDesasignacion: a.FechaDesasignacion ? toLocalISOString(a.FechaDesasignacion) : null,
          };
        });

      const frenteSubFrentesPayload = values.frenteSubFrentes.map(e => ({
        Id: Number(e.id),
        IdFrente: Number(e.idFrente),
        IdSubFrente: Number(e.idSubFrente),
        Cantidad: e.cantidad,
        FechaInicio: e.fechaInicio ? toLocalISOString(e.fechaInicio) : null,
        FechaFin: e.fechaFin ? toLocalISOString(e.fechaFin) : null,
        Activo: e.activo,
        Descripcion: e.descripcion,
        UsuarioActualizacion: window.localStorage.getItem("username"),
        DetallePlanificacionConsultor: (e.DetallePlanificacionConsultor || []).map(p => ({
          Id: p.Id,
          IdTicketFrenteSubFrente: p.IdTicketFrenteSubFrente,
          IdTipoActividad: p.IdTipoActividad,
          FechaInicio: p.FechaInicio ? toLocalISOString(p.FechaInicio) : null,
          FechaFin: p.FechaFin ? toLocalISOString(p.FechaFin) : null,
          Horas: p.Horas,
          Descripcion: p.Descripcion,
          Activo: p.Activo
        }))
      }));

      const ticketData = {
        CodTicketInterno: values.codTicketInterno,
        Titulo: values.titulo,
        FechaSolicitud: values.fechaSolicitud ? toLocalISOString(values.fechaSolicitud) : null,
        IdTipoTicket: values.idTipoTicket,
        IdSubtipoTicket: values.idSubtipoTicket,
        IdEstadoTicket: values.idEstadoTicket,
        IdEmpresa: values.idEmpresa,
        IdUsuarioResponsableCliente: values.idUsuarioResponsableCliente,
        IdPrioridad: values.idPrioridad,
        Descripcion: values.descripcion,
        UrlArchivos: "",
        CodReqSgrCsti: "",
        IdReqSgrCsti: null,
        IdGestorConsultoria: values.idGestorConsultoria,
        Repositorios: reposPayload.length > 0 ? JSON.stringify(reposPayload) : null,
        ConsultorAsignaciones: asignacionesPayload,
        FrenteSubFrentes: frenteSubFrentesPayload,
      };

      if (modoEdicion) {
        ticketData.UsuarioActualizacion = window.localStorage.getItem("username");
      } else {
        ticketData.UsuarioCreacion = values.usuarioCreacion;
      }

      if (modoEdicion) {
        const idTicket = persona?.id;
        Actualizar({ ticketData, idTicket });
      } else {
        Registrar({ ticketData });
      }
    },


  });

  const idConsultorLogged = window.localStorage.getItem("idConsultor");
  const isConsultor = codRol === "CONSULTOR";
  const isGestorCuenta = codRol === "GESTORCUENTA";

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
      (p) => p.tipoParametro === "TipoTicket" && Number(p.id) === Number(idTipoTicket)
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

    const esEdicionReal = Boolean(id) || Boolean(persona); // ✅ detecta edición real

    if (!existe && !esEdicionReal) {
      formik.setFieldValue("idSubtipoTicket", null);
    }

  };


  useEffect(() => {
    if (!parametros?.length) return;

    if (!modoEdicion && formik.values.idEstadoTicket === 0) {
      const estadoPendiente = parametros.find(
        (item) => item.tipoParametro === "EstadoTicket" && item.codigo === "PENDIENTE_ATENCION"
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
          item.tipoParametro === "EstadoTicket"
          && codigosPermitidos.includes(item.codigo)
      );
      const yaIncluido = opciones.some(item => item.id === estadoActual?.id);
      if (!yaIncluido) {
        opciones = [estadoActual, ...opciones];
      }
    } else {
      // Si no hay estado actual (es 0 o null), mostrar todos los estados para que el usuario pueda corregirlo
      opciones = parametros.filter((item) => item.tipoParametro === "EstadoTicket");
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
    if (formik.submitCount > 0 && Object.keys(formik.errors).length > 0) {
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
        detail: errorMsgs.length > 0 ? errorMsgs.join(", ") : "Revisa los datos ingresados.",
        life: 7000,
      });
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

  const Registrar = ({ formData }) => {
    RegistrarTiket({ formData })
      .then((res) => {
        formik.setSubmitting(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Registro exitoso.",
          life: 7000,
        });
        setTimeout(() => {
          navigate(`/tickets/user/${idUser}/rol/${codRol}/Editar/${res.id}`);
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

  const Actualizar = ({ ticketData, idTicket }) => {
    ActualizarTicket({ ticketData, idTicket })
      .then((data) => {
        formik.setSubmitting(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Registro actualizado exitosamente.",
          life: 7000,
        });
        setTimeout(() => {
          window.location.reload(); // 🔄 Recarga la página completa
        }, 1000);

      })
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
      acceptClassName: 'p-button-danger',
      acceptLabel: 'Desactivar',
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
      formik.setFieldValue("idGestor", empresaSeleccionada.idGestor);
      formik.setFieldValue("nombrePersonaResponsable", empresaSeleccionada?.nombrePersonaResponsable);
      formik.setFieldValue("idUsuarioResponsableCliente", empresaSeleccionada?.idPersonaResponsable);


    } else {
      formik.setFieldValue("idGestor", "");
      formik.setFieldValue("nombrePersonaResponsable", "");
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
    formik.setFieldValue("asignaciones", [
      ...formik.values.asignaciones,
      {
        // idUnico: crypto.randomUUID(),  // clave única
        idUnico: generateUUID(),
        Id: 0,
        IdSubFrente: 0,
        IdConsultor: 0,
        IdTipoActividad: 25,
        FechaAsignacion: null,
        FechaDesasignacion: null,
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
      }
    });
  };

  useEffect(() => {
    // Cuando cambia modoEdicion, actualiza el acordeón
    setActiveIndex(modoEdicion ? null : 0);
  }, [modoEdicion]);

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

    <div className="zv-editarUsuario" style={{ paddingTop: 16 }}>
      <ConfirmDialog />
      <Toast ref={toast} position="top-center"></Toast>

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
      <div className="header">
        <span style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
          <Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft>
        </span>
      </div>
      <div className="header-titulo" style={{ marginTop: 16 }}>
        {tituloPagina}
      </div>
      <div className="zv-editarUsuario-body" style={{ marginTop: 16 }}>
        <form onSubmit={formik.handleSubmit}>
          <div className="p-fluid formgrid grid">
            <div className="field col-12 md:col-12">


              {/* ===================== DATOS GENERALES (COPIAR Y PEGAR) ===================== */}
              <Accordion activeIndex={isOpen ? 0 : null}>
                <AccordionTab header={<span className="font-h3">Datos Generales</span>} style={{ width: "100%" }}>
                  <div className="grid">
                    {/* Titulo */}
                    <div className="field col-12 md:col-6">
                      <label className="label-form">Titulo</label>
                      <InputTextDefault
                        type={"text"}
                        id="titulo"
                        name="titulo"
                        placeholder="Escribe aquí"
                        value={formik.values.titulo}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        disabled={permisosActual.controlesBloqueados.includes("txtTitulo")}
                      />
                      <div className="p-error">{formik.touched.titulo && formik.errors.titulo}</div>
                    </div>

                    {/* Fecha de solicitud */}
                    <div className="field col-12 md:col-6">
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
                        disabled={permisosActual.controlesBloqueados.includes("dateFechaSolicitud")}
                      />
                      <div className="p-error">
                        {formik.touched.fechaSolicitud && formik.errors.fechaSolicitud}
                      </div>
                    </div>

                    {/* Tipo */}
                    <div className="field col-12 md:col-6">
                      <label className="label-form">Tipo</label>
                      <DropdownDefault
                        id="idTipoTicket"
                        name="idTipoTicket"
                        placeholder="Seleccione"
                        value={formik.values.idTipoTicket}
                        options={parametros?.filter((item) => item.tipoParametro === "TipoTicket")}
                        optionLabel="nombre"
                        optionValue="id"
                        //disabled={permisosActual.controlesBloqueados.includes("cboTipo")}
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
                    <div className="field col-12 md:col-6">
                      <label className="label-form">Subtipo</label>
                      <DropdownDefault
                        id="idSubtipoTicket"
                        name="idSubtipoTicket"
                        placeholder="Seleccione"
                        value={formik.values.idSubtipoTicket}
                        options={subtiposFiltrados}
                        optionLabel="nombre"
                        optionValue="id"
                        disabled={
                          permisosActual.controlesBloqueados.includes("cboSubtipo") ||
                          !formik.values.idTipoTicket
                        }
                        onChange={(e) => formik.setFieldValue("idSubtipoTicket", Number(e.value))}
                        onBlur={formik.handleBlur}
                      />
                      <small className="p-error">
                        {formik.touched.idSubtipoTicket && formik.errors.idSubtipoTicket}
                      </small>
                    </div>

                    {/* Empresa */}
                    <div className="field col-12 md:col-6">
                      <label className="label-form">Empresa</label>
                      <DropdownDefault
                        id="idEmpresa"
                        name="idEmpresa"
                        placeholder="Seleccione"
                        value={formik.values.idEmpresa}
                        onChange={handleEmpresaChange}
                        onBlur={formik.handleBlur}
                        options={empresa}
                        optionLabel="nombreComercial"
                        optionValue="id"
                        disabled={permisosActual.controlesBloqueados.includes("cboEmpresa")}
                      />
                      <small className="p-error">{formik.touched.idEmpresa && formik.errors.idEmpresa}</small>
                    </div>

                    {/* Usuario Responsable del Cliente */}
                    <div className="field col-12 md:col-6">
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
                    <div className="field col-12 md:col-6">
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
                        options={parametros?.filter((item) => item.tipoParametro === "Prioridad")}
                        disabled={permisosActual.controlesBloqueados.includes("cboPrioridad")}
                        optionLabel="nombre"
                        optionValue="id"
                      />
                      <small className="p-error">
                        {formik.touched.idPrioridad && formik.errors.idPrioridad}
                      </small>
                    </div>

                    {/* Codigo Interno */}
                    <div className="field col-12 md:col-6">
                      <label className="label-form">Codigo Interno</label>
                      <InputTextDefault
                        type={"text"}
                        id="codTicketInterno"
                        name="codTicketInterno"
                        placeholder="Escribe aquí"
                        value={formik.values.codTicketInterno}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        disabled={permisosActual.controlesBloqueados.includes("textCodigoInterno")}
                      />
                      <div className="p-error">
                        {formik.touched.codTicketInterno && formik.errors.codTicketInterno}
                      </div>
                    </div>

                    {/* ===================== CAMBIO: ESTADO + GESTOR CONSULTORIA JUNTOS ===================== */}

                    {/* Estado */}
                    <div className="field col-12 md:col-6">
                      <label className="label-form">Estado</label>
                      <DropdownDefault
                        type="text"
                        id="idEstadoTicket"
                        name="idEstadoTicket"
                        placeholder="Seleccione"
                        value={formik.values.idEstadoTicket}
                        onChange={(e) => {
                          const nuevoEstadoId = e.value;
                          const estadoSeleccionado = parametros.find(
                            (p) => p.tipoParametro === "EstadoTicket" && Number(p.id) === Number(nuevoEstadoId)
                          );

                          if (estadoSeleccionado) {
                            // Validar En Atención
                            /*    if (estadoSeleccionado.codigo === CODIGOS.EstadoTicket.EnAtencion) {
                                  let tienePlanificacion = false;
                                  if (formik.values.frenteSubFrentes && formik.values.frenteSubFrentes.length > 0) {
                                    tienePlanificacion = formik.values.frenteSubFrentes.some(fsf =>
                                      fsf.activo !== false && fsf.DetallePlanificacionConsultor && fsf.DetallePlanificacionConsultor.some(p => p.Activo)
                                    );
                                  }
                                  if (!tienePlanificacion) {
                                    toast.current?.show({
                                      severity: "warn",
                                      summary: "Advertencia",
                                      detail: "Debe llenar la planificación para pasar el ticket a estado En Atención.",
                                      life: 5000,
                                    });
                                    return; // Evitar que cambie el valor
                                  }
                                }*/

                            // Validar Cerrado
                            /* if (estadoSeleccionado.codigo === CODIGOS.EstadoTicket.Cerrado) {
                               let tieneHoras = false;
                               if (formik.values.asignaciones && formik.values.asignaciones.length > 0) {
                                 tieneHoras = formik.values.asignaciones.some(a =>
                                   a.DetalleTareasConsultor && a.DetalleTareasConsultor.some(t => t.Activo && t.Horas > 0)
                                 );
                               }
                               if (!tieneHoras) {
                                 toast.current?.show({
                                   severity: "warn",
                                   summary: "Advertencia",
                                   detail: "Debe llenar las tareas realizadas (horas) para pasar el ticket a estado Cerrado.",
                                   life: 5000,
                                 });
                                 return; // Evitar que cambie el valor
                               }
                             }*/
                          }

                          formik.setFieldValue("idEstadoTicket", nuevoEstadoId);
                        }}
                        disabled={!modoEdicion || (bloquearDropdown && formik.values.idEstadoTicket !== 0)}
                        onBlur={formik.handleBlur}
                        options={opcionesEstadoTicket}
                        optionLabel="nombre"
                        optionValue="id"
                      />
                      <small className="p-error">
                        {formik.touched.idEstadoTicket && formik.errors.idEstadoTicket}
                      </small>
                    </div>

                    {/* Gestor Consultoria */}
                    <div className="field col-12 md:col-6">
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
                        disabled={permisosActual.controlesBloqueados.includes("cboGestorConsultoria")}
                      />
                      <small className="p-error">
                        {formik.touched.idGestorConsultoria && formik.errors.idGestorConsultoria}
                      </small>
                    </div>

                    {/* ===================== DESCRIPCION + ZIP (IGUAL) ===================== */}

                    {/* Descripción */}
                    <div className="field col-12 md:col-6">
                      <label className="label-form">Descripción</label>
                      {(() => {
                        const val = formik.values.descripcion || '';
                        const isHtml = /<[a-z][\s\S]*>/i.test(val);
                        const isDisabled = permisosActual.controlesBloqueados.includes("cboDescripcion");

                        if (isHtml) {
                          return (
                            <div
                              style={{
                                width: '100%',
                                minHeight: '150px',
                                maxHeight: '350px',
                                overflowY: 'auto',
                                overflowX: 'auto',
                                border: '1px solid #cbd5e0',
                                borderRadius: '8px',
                                padding: '10px 12px',
                                backgroundColor: isDisabled ? '#f8f9fa' : '#fff',
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
                            disabled={isDisabled}
                            rows={6}
                            style={{ width: '100%', minHeight: '150px' }}
                          />
                        );
                      })()}
                      <div className="p-error">
                        {formik.touched.descripcion && formik.errors.descripcion}
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: ZIP + GESTOR ASIGNADO (MÁS ARRIBA) */}
                    <div className="field col-12 md:col-6">
                      <div className="grid">

                        {/* <ModalArchivos
                      visible={visibleArchivos}
                      onHide={() => setVisibleArchivos(false)}
                      title="Archivos adjuntos"
                      rows={archivosRows}
                      columns={columnasArchivos}
                      rowKey={(r) => `${r.Orden}-${r.Url}`}
                      onDownload={descargarArchivo}
                    />*/}
                        <div className="field col-12">
                          <label className="label-form">Repositorios</label>

                          <Boton
                            type="button"
                            className="w-full"
                            style={{ height: 46, justifyContent: "center" }}
                            label="Repositorios"
                            icon="pi pi-link"
                            color="secondary"
                            onClick={() => setVisibleRepos(true)}
                            disabled={permisosActual.controlesBloqueados.includes("btnRepositorios")}
                          />
                        </div>
                        <ModalRepositorios
                          visible={visibleRepos}
                          onHide={() => setVisibleRepos(false)}
                          title="Repositorios (Links)"
                          rows={formik.values.reposLinks}
                          onChangeLinks={(linksSinFecha) => {
                            // Aquí guardas lo que se enviará al backend (SIN fecha)
                            formik.setFieldValue("reposLinks", linksSinFecha);
                          }}
                        />




                        {/* Gestor Asignado (queda arriba, justo debajo del ZIP) */}
                        <div className="field col-12" style={{ marginTop: -6 }}>
                          <label className="label-form">Gestor Asignado</label>
                          <DropdownDefault
                            id="idGestor"
                            name="idGestor"
                            placeholder="Seleccione"
                            value={formik.values.idGestor}
                            onChange={(e) => formik.setFieldValue("idGestor", e.value)}
                            onBlur={formik.handleBlur}
                            options={gestorCuenta}
                            optionLabel={(option) =>
                              `${option.nombres} ${option.apellidoPaterno} ${option.apellidoMaterno}`
                            }
                            optionValue="id"
                          />
                        </div>
                      </div>
                    </div>


                  </div>
                </AccordionTab>
              </Accordion>
              {/* ===================== FIN DATOS GENERALES ===================== */}


            </div>
            {modoEdicion && (
              <>
                {!permisosActual.divsOcultos.includes("divFrentes") && (
                  <>
                    <hr style={{ width: "100%", border: "1px solid #ccc", margin: "20px 0" }} />

                    <Especializaciones
                      formik={formik}
                      frentes={frentes}
                      permisosActual={permisosActual}
                      setSubfrentesSeleccionados={setSubfrentesSeleccionados}
                      toastRef={toast}
                      consultores={consultores}
                      parametros={parametros}
                      codFrentes={codFrentes}
                      highlightWarning={mostrarAlertaSinEspecializaciones || mostrarAlertaSinPlanificacion}
                    />
                  </>
                )}


                {!permisosActual.divsOcultos.includes("divAsignacionConsultor") && (
                  <>
                    <hr style={{ width: "100%", border: "1px solid #ccc", margin: "20px 0" }} />
                    <Asignaciones
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
                    />
                  </>
                )}

                <div className="field col-12 md:col-12">
                </div>
              </>)}
          </div>
          <div className="zv-editarUsuario-footer">

            <Boton
              icon="pi pi-save"
              label="Guardar cambios"
              color="primary"
              type="submit"
              loading={formik.isSubmitting}
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
        </form>
      </div>
    </div>
  );
};

export default Editar;
