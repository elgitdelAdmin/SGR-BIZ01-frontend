  const agregarDetallePlanificacion = () => {
    console.log("agregarDenuevoDetalletallePlanificacion",nuevoDetallePlanificacion)
    if (visibleIndexPlanificacion === null) return;
    
    const { FechaInicio, Horas, Descripcion ,IdTipoActividad} = nuevoDetallePlanificacion;

    if (!FechaInicio || !Horas || !Descripcion || !IdTipoActividad) {
      toast.current.show({
        severity: "warn",
        summary: "Campos incompletos",
        detail: "Debes completar Fecha de inicio, Horas ,Tipo Actividad y Descripción antes de agregar el detalle.",
        life: 5000,
      });
      return;
    }
          const current = formik.values.asignaciones[visibleIndexPlanificacion].DetallePlanificacionConsultor || [];

          const fechaInicioDia = new Date(nuevoDetallePlanificacion.FechaInicio);
          fechaInicioDia.setHours(0, 0, 0, 0);

          const horasEnDia = current.reduce((total, det) => {
            const detDia = new Date(det.FechaInicio);
            detDia.setHours(0, 0, 0, 0);

            if (detDia.getTime() === fechaInicioDia.getTime()) {
              return total + det.Horas;
            }
            return total;
          }, 0);

          if (horasEnDia + nuevoDetallePlanificacion.Horas > 24) {
              toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "No puedes asignar más de 24 horas en un mismo día",
                life: 7000,
              });
            return;
          }

          const updated = [
          ...current,
          { 
            ...nuevoDetallePlanificacion, 
            Activo: true,
            IdTicketConsultorAsignacion: formik.values.asignaciones[visibleIndexPlanificacion].Id 
          }
        ];
        console.log("updated",updated)

        formik.setFieldValue(`asignaciones[${visibleIndexPlanificacion}].DetalleTareasConsultor`, updated);
        console.log("FORMIK",formik.values.asignaciones[visibleIndexPlanificacion].DetalleTareasConsultor)
        setDetallesPlanificacion(updated);
        setNuevoDetallePlanificacion({ FechaInicio: null, FechaFin: null, Horas: null, Descripcion: "",Activo:true,IdTicketConsultorAsignacion:formik.values.asignaciones[visibleIndexPlanificacion].Id,Id:0 });
    //}
  };
