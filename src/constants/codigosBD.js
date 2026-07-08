export const CODIGOS = {
    TipoReporte: {
        CargabilidadPorCliente: "CARGA_EMPRESA",
        CargabilidadPorTicket: "CARGA_TICKETS",
        CargabilidadPorConsultor: "CARGA_CONSULTOR",
        RankingDeConsultoresQueNoRegistranHoras: "RANK_CONS_SIN_HORAS",
        RankingDeConsultoresRegistranMayorCantidadDeHoras: "RANK_CONS_HORAS",
        DashboardCargabilidadPorConsultor: "DBD_CARGA_CONSULTOR",
        PlanificacionConsultor: "PLAN_CONSULTOR",
        CapacidadConsultores: "CAPACIDAD_CONS",
        AsignacionConsultores: "ASIGNACIONES_CONS",
        DisponibilidadConsultores: "DISPONIBILIDAD_CONS",
        SobrecargaConsultores: "SOBRECARGA_CONS",
        BajaUtilizacionConsultores: "BAJA_UTIL_CONS"
    },
    Prioridad: {
        Baja: "BAJA",
        Media: "MEDIA",
        Alta: "ALTA",
        Critica: "CRITICA"
    },
    TipoDocumento: {
        DNI: "DNI_PE",
        CarnetDeExtranjeria: "CE_PE",
        Pasaporte: "PAS_PE"
    },
    Seniority: {
        Practicante: "PRACTICANTE",
        Junior: "JUNIOR",
        Pleno: "PLENO",
        SemiSenior: "SEMISENIOR",
        Senior: "SENIOR",
        LiderTecnico: "LIDERTEC"
    },
    NivelExperiencia: {
        Basico: "BASICO",
        Intermedio: "INTERMEDIO",
        Avanzado: "AVANZADO"
    },
    ModalidadLaboral: {
        Interno: "INTERNO",
        Externo: "EXTERNO"
    },
    EstadoTicket: {
        Cerrado: "CERRADO",
        EnAtencion: "ATENDIDO",
        PendienteDeAsignacion: "PENDIENTE_ASIGNACION",
        Cancelado: "CANCELADO",
        Rechazado: "RECHAZADO",
        PendienteDelCliente: "PENDIENTE_CLIENTE",
        PendienteConsultoria: "PENDIENTE_CONSULTOR",
        Anulado: "ANULADO",
        PendienteDeAtencion: "PENDIENTE_ATENCION",
        Asignado: "ASIGNADO",
        Aprobado: "APROBADO",
        EnEjecucion: "EN_EJECUCION",
        PruebasDelCliente: "PRUEBAS_CLIENTE",
        EnRevision: "EN_REVISION",
        Observado: "OBSERVADO",
        PendienteDeEstimacion: "PENDIENTE_ESTIMACION"
    },
    TipoActividad: {
        DesarrolloProgramacion: "DESAR",
        PruebasTesting: "PRUEB",
        DespliegueImplementacion: "DESPL",
        MantenimientoSoporte: "MANTE",
        GestionDelProyecto: "GESTP",
        Documentacion: "DOCUM",
        ControlDeCalidad: "CALID",
        IntegracionContinua: "INCON",
        RevisionDeCodigo: "REVCO",
        Planificacion: "PLANF",
        CapacitacionDeUsuarios: "CAPAC",
        MonitoreoYMétricas: "MONIT",
        GestionDeCambios: "GESCA",
        AnalisisDeRequisitos: "ANREQ",
        DisenoDelSistema: "DISEN",
        Programacion: "PROGR",
        SoporteFuncional: "SOPFUN",
        SoporteTecnico: "SOPTEC",
        PruebasUnitarias: "PRUNI",
        PruebasFuncionales: "PRFUN",
        PruebasIntegrales: "PRINT",
        ReunionCliente: "REUCL",
        AnalisisFuncional: "ANFUN",
        AnalisisTecnico: "ANTEC",
        BBP: "BBPBB",
        EspecificacionFuncional: "ESPFU",
        ConfiguracionFuncional: "CONFU",
        DocumentoDePruebas: "DOCPR",
        Capacitacion: "CAPACITA",
        SoportePruebasUsuario: "SOPRU",
        ReunionInterna: "REUIN",
        DocumentoTecnico: "DOCTE",
        DocumentoConfiguracion: "DOCCO",
        ManualUsuario: "MANUS",
        SoportePostImplementacion: "SOPPO",
        Garantia: "GARAN",
        AjustesYCorreccion: "AJCOR",
        SoporteFueraDeAlcance: "SOFAL",
        PreparacionFinal: "PREFA",
        PaseAProduccion: "PASPR",
        TransferenciaInterna: "TRAIN",
        TransferenciaCliente: "TRACL"
    },
    TipoTicket: {
        Incidencia: "INC",
        Requerimiento: "REQ",
        BolsaDeHoras: "BOL",
        Staffing: "STF",
        Proyectos: "PROY",
        MesaDeAyuda: "MDA",
        PreVenta: "PREV",
        Demanda: "DEM",
        Proyecto: "PROY",
        Bolsa: "BOL"
    },
    TipoCargaMasiva: {
        TicketExcelia: "TKT_EXCELIA",
        TicketsRansa: "TKT_RANSA",
        TicketsIasa: "TKT_IASA",
        RequerimientosAlicorp: "REQ_ALICORP",
        IncidentesAlicorp: "INC_ALICORP",
        TicketAlicorp: "TKT_ALICORP"
    },
    Subtipos: {
        BolsaDeHoras: "PREV_BOL",
        Proyectos: "PREV_PROY",
        Staffing: "PREV_STF",
        Incidencia_MDA: "MDA_INC",
        Requerimiento_MDA: "MDA_REQ",
        Incidencia_BOL: "BOL_INC",
        Requerimiento_BOL: "BOL_REQ",
        Presencial: "STF_PRES",
        Remoto: "STF_REM",
        Hibrido: "STF_HIB",
        Proyecto: "PROY_PRY",
        MesaDeAyuda: "PREV_MDA",
        Mejora: "PROY_MEJ"
    }
};

export const TIPO_PARAMETRO = {
    TipoReporte: "TipoReporte",
    TipoTicket: "TipoTicket",
    Subtipos: "Subtipos",
    EstadoTicket: "EstadoTicket",
    Prioridad: "Prioridad",
    TipoDocumento: "TipoDocumento",
    Seniority: "Seniority",
    NivelExperiencia: "NivelExperiencia",
    ModalidadLaboral: "ModalidadLaboral",
    TipoActividad: "TipoActividad",
    TipoCargaMasiva: "TipoCargaMasiva"
};

export const ROLES = {
    Superadministrador: "SUPERADMIN",
    Administrador: "ADMIN",
    Consultor: "CONSULTOR",
    Empresa: "EMPRESA",
    GestorCuenta: "GESTORCUENTA",
    GestorConsultoria: "GESTORCONSULTORIA"
};
