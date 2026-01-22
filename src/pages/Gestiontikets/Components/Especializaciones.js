// src/pages/Gestiontikets/Components/Especializaciones.js

import { useMemo, useState } from "react";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { confirmDialog } from "primereact/confirmdialog";
import * as Iconsax from "iconsax-react";

import DropdownDefault from "../../../components/Dropdown/DropdownDefault";
import DatatableDefault from "../../../components/Datatable/DatatableDefault";
import Boton from "../../../components/Boton/Boton";

const Especializaciones = ({
  formik,
  frentes,
  permisosActual,
  setSubfrentesSeleccionados,
}) => {
  const [subfrentes, setSubfrentes] = useState([]);
  const [visibleDescripcion, setVisibleDescripcion] = useState(false);
  const [rowSeleccionada, setRowSeleccionada] = useState(null);

  const frentesById = useMemo(() => {
    const map = new Map();
    (frentes || []).forEach((f) => map.set(f.id, f));
    return map;
  }, [frentes]);

  const handleFrenteChange = (e) => {
    const idFrenteSeleccionado = e.value;

    formik.setFieldValue("nuevaEspecializacion.idFrente", idFrenteSeleccionado);
    formik.setFieldValue("nuevaEspecializacion.idSubFrente", "");

    const frenteSeleccionado = frentesById.get(idFrenteSeleccionado);

    if (frenteSeleccionado) {
      const subfrentesOrdenados = [...(frenteSeleccionado.subFrente || [])].sort(
        (a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      );
      setSubfrentes(subfrentesOrdenados);
    } else {
      setSubfrentes([]);
    }
  };

  const verDescripcion = (rowData) => {
    setRowSeleccionada(rowData);
    setVisibleDescripcion(true);
  };

  const confirmarEliminacion = (rowData) => {
    confirmDialog({
      message: "¿Está seguro de desactivar esta especialización?",
      header: "Confirmación",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      acceptLabel: "Desactivar",
      rejectLabel: "Cancelar",
      accept: () => {
        const nuevas = (formik.values.frenteSubFrentes || []).map((esp) =>
          esp === rowData ? { ...esp, activo: false } : esp
        );
        formik.setFieldValue("frenteSubFrentes", nuevas);
      },
    });
  };

  const accion = (rowData) => (
    <div className="profesor-datatable-accion">
      <div className="accion-eliminar" onClick={() => confirmarEliminacion(rowData)}>
        <span>
          <Iconsax.Trash color="#ffffff" />
        </span>
      </div>
    </div>
  );

  const agregarEspecializacion = () => {
    const nueva = formik.values.nuevaEspecializacion;

    if (!nueva.idFrente || !nueva.idSubFrente) {
      alert("Completa todos los campos de la especialización");
      return;
    }

    const especializacionesActuales = Array.isArray(formik.values.frenteSubFrentes)
      ? formik.values.frenteSubFrentes
      : [];

    formik.setFieldValue("frenteSubFrentes", [
      ...especializacionesActuales,
      {
        id: Number(nueva.id || 0),
        idFrente: Number(nueva.idFrente),
        idSubFrente: Number(nueva.idSubFrente),
        cantidad: Number(nueva.cantidad || 0),
        fechaInicio: nueva.fechaInicio ? new Date(nueva.fechaInicio).toISOString() : null,
        fechaFin: nueva.fechaFin ? new Date(nueva.fechaFin).toISOString() : null,
        activo: true,
        descripcion: nueva.descripcion || "",
      },
    ]);

    setSubfrentesSeleccionados((prev) => {
      const yaEsta = prev.some((sf) => String(sf.idSubFrente) === String(nueva.idSubFrente));
      if (yaEsta) return prev;

      const subfrenteSeleccionado = subfrentes.find(
        (s) => String(s.id) === String(nueva.idSubFrente)
      );
      if (!subfrenteSeleccionado) return prev;

      return [
        ...prev,
        {
          idSubFrente: subfrenteSeleccionado.id,
          idFrente: subfrenteSeleccionado.idFrente,
          nombre: subfrenteSeleccionado.nombre,
        },
      ];
    });

    formik.setFieldValue("nuevaEspecializacion", {
      id: "",
      idFrente: "",
      idSubFrente: "",
      cantidad: "",
      fechaInicio: "",
      fechaFin: "",
      activo: true,
      descripcion: "",
    });

    setSubfrentes([]);
  };

  const puedeAgregar =
    Boolean(formik.values.nuevaEspecializacion?.idFrente) &&
    Boolean(formik.values.nuevaEspecializacion?.idSubFrente);

  // Estilo botón como tu imagen (cuadrado azul + blanco)
  const btnPlusStyle = {
    width: 44,
    height: 44,
    minWidth: 44,
    borderRadius: 6,
    backgroundColor: "#4F46E5",
    border: "none",
  };

  const btnPlusIconStyle = { color: "#fff", fontSize: 16 };

  return (
    <>
      <div className="field col-12">
        <label style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10, display: "block" }}>
          Especializaciones
        </label>
      </div>

      {/* ✅ UNA SOLA FILA */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
  }}
>
  {/* Frente (fijo) */}
  <div style={{ width: 180 }}>
    <DropdownDefault
      value={formik.values.nuevaEspecializacion.idFrente}
      options={frentes}
      optionLabel="nombre"
      optionValue="id"
      onChange={handleFrenteChange}
      placeholder="Frente"
    />
  </div>

  {/* Subfrente (fijo) */}
  <div style={{ width: 180 }}>
    <DropdownDefault
      value={formik.values.nuevaEspecializacion.idSubFrente}
      options={subfrentes}
      optionLabel="nombre"
      optionValue="id"
      onChange={(e) => formik.setFieldValue("nuevaEspecializacion.idSubFrente", e.value)}
      placeholder="Subfrente"
    />
  </div>

  {/* Cantidad (fijo) */}
  <div style={{ width: 90 }}>
    <InputText
      type="number"
      name="nuevaEspecializacion.cantidad"
      placeholder="Cant."
      value={formik.values.nuevaEspecializacion.cantidad}
      onBlur={formik.handleBlur}
      onChange={formik.handleChange}
      style={{ width: "100%" }}
    />
  </div>

  {/* Inicio (fijo) */}
  <div style={{ width: 170 }}>
    <Calendar
      value={formik.values.nuevaEspecializacion.fechaInicio}
      onChange={(e) => formik.setFieldValue("nuevaEspecializacion.fechaInicio", e.value)}
      placeholder="Inicio"
      dateFormat="yy-mm-dd"
      showIcon
      style={{ width: "100%" }}
      minDate={formik.values.fechaSolicitud ? new Date(formik.values.fechaSolicitud) : undefined}
    />
  </div>

  {/* Fin (fijo) */}
  <div style={{ width: 170 }}>
    <Calendar
      value={formik.values.nuevaEspecializacion.fechaFin}
      onChange={(e) => formik.setFieldValue("nuevaEspecializacion.fechaFin", e.value)}
      placeholder="Fin"
      dateFormat="yy-mm-dd"
      showIcon
      style={{ width: "100%" }}
      minDate={
        formik.values.nuevaEspecializacion.fechaInicio
          ? new Date(formik.values.nuevaEspecializacion.fechaInicio)
          : new Date()
      }
    />
  </div>

  {/* ✅ Descripción (todo lo restante) + botón */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexGrow: 1,
      minWidth: 0,
    }}
  >
    <InputText
      type="text"
      name="nuevaEspecializacion.descripcion"
      placeholder="Descripción"
      value={formik.values.nuevaEspecializacion.descripcion}
      onBlur={formik.handleBlur}
      onChange={formik.handleChange}
      style={{
        width: "100%",
        flexGrow: 1,
        minWidth: 0,
        maxWidth: 800
      }}
    />

<Boton
  icon="pi pi-plus"
  label="Agregar"
  color="primary"
  type="button"
  onClick={agregarEspecializacion}
  disabled={!puedeAgregar}
  style={{
    height: 42,
    padding: "0 18px",        // 👈 más aire horizontal
    marginLeft: 12,           // 👈 separación del input
    marginRight: 8,           // 👈 margen derecho
    minWidth: "auto",
    width: "fit-content",
    whiteSpace: "nowrap",
    borderRadius: 20,         // 👈 curva más suave
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  }}
/>
  </div>
</div>


      {/* Tabla */}
      <div className="field col-12" style={{ marginTop: 8 }}>
        {!frentes || frentes.length === 0 ? (
          <p>Cargando frentes...</p>
        ) : (
          <>
            <DatatableDefault
              showSearch={false}
              paginator={false}
              value={(formik.values.frenteSubFrentes || []).filter((item) => item.activo)}
            >
              <Column
                field="idFrente"
                header="Frente"
                body={(rowData) => frentesById.get(rowData.idFrente)?.nombre || "—"}
              />

              <Column
                field="idSubFrente"
                header="Subfrente"
                body={(rowData) => {
                  const frente = frentesById.get(rowData.idFrente);
                  const sub = (frente?.subFrente || []).find((sf) => sf.id === rowData.idSubFrente);
                  return sub?.nombre || "—";
                }}
              />

              <Column field="cantidad" header="Cantidad" body={(rowData) => rowData.cantidad ?? "—"} />

              <Column
                header="Fecha Inicio"
                body={(row) => (row.fechaInicio ? new Date(row.fechaInicio).toLocaleDateString() : "")}
              />

              <Column
                header="Fecha Fin"
                body={(row) => (row.fechaFin ? new Date(row.fechaFin).toLocaleDateString() : "")}
              />

              <Column
                header="Descripción"
                body={(rowData) => (
                  <Button
                    type="button"
                    icon="pi pi-eye"
                    className="p-button-text p-button-sm"
                    onClick={() => verDescripcion(rowData)}
                    tooltip="Ver descripción"
                  />
                )}
              />

              <Column header="Acciones" body={accion} />
            </DatatableDefault>

            <Dialog
              header="Descripción"
              visible={visibleDescripcion}
              style={{ width: 450 }}
              modal
              onHide={() => setVisibleDescripcion(false)}
            >
              <p>{rowSeleccionada?.descripcion || "Sin descripción"}</p>
            </Dialog>
          </>
        )}
      </div>
    </>
  );
};

export default Especializaciones;