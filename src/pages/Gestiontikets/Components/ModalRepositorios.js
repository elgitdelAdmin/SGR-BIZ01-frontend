import { useEffect, useMemo, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import * as Yup from "yup";
import Boton from "../../../components/Boton/Boton";

const urlSchema = Yup.string()
  .trim()
  .required("Ingrese un link")
  .url("Link inválido (debe ser URL)");

const ModalRepositorios = ({
  visible,
  onHide,
  title = "Repositorios",
  rows = [],                 // registros desde backend (pueden traer FechaInsert)
  onChangeLinks,             // callback al padre: (linksSinFecha) => void
}) => {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [localRows, setLocalRows] = useState([]);

  // cada vez que abres/cambian rows, “clona” a estado local para editar
  useEffect(() => {
    if (!visible) return;
    const safe = Array.isArray(rows) ? rows : [];
    // normaliza a: { Orden, Link, FechaInsert? }
    const normalized = safe.map((r) => ({
    Orden: r.Orden ?? null,
    Url: r.Url ?? r.Link ?? r.link ?? "",
    FechaInsert: r.FechaInsert ?? r.FechaHora ?? r.fechaInsert ?? null,
    }));
    setLocalRows(normalized);
    setLink("");
    setError("");
  }, [visible, rows]);

    const emitirAlPadre = (arr) => {
    onChangeLinks?.(arr);
    };
const handleAdd = async () => {
  try {
    setError("");
    const cleaned = (link || "").trim();
    await urlSchema.validate(cleaned);

    const yaExiste = localRows.some(
      (r) => (r.Url || "").trim().toLowerCase() === cleaned.toLowerCase()
    );
    if (yaExiste) {
      setError("Ese link ya fue agregado.");
      return;
    }

    const maxOrden = localRows.reduce((max, r) => {
      const o = Number(r.Orden);
      return Number.isFinite(o) ? Math.max(max, o) : max;
    }, 0);

    const nuevo = [
      ...localRows,
      { Orden: maxOrden + 1, Url: cleaned, FechaInsert: null }, // Fecha la pondrá backend
    ];

    setLocalRows(nuevo);
    setLink("");
    emitirAlPadre(nuevo);
  } catch (e) {
    setError(e.message || "Link inválido");
  }
};


  const handleRemove = (row) => {
    const filtrado = localRows.filter((r) => r !== row);
    setLocalRows(filtrado);
    emitirAlPadre(filtrado);
  };

  const fechaBody = (row) => {
    if (!row?.FechaInsert) return "—";
    const d = new Date(row.FechaInsert);
    return isNaN(d.getTime()) ? String(row.FechaInsert) : d.toLocaleString();
  };

  const linkBody = (row) => {
    const value = row?.Url || "—";
    if (!row?.Url) return value;
    return (
    <a href={row.Url} target="_blank" rel="noreferrer">
        {value}
    </a>
    );
  };

  const actionsBody = (row) => (
    <Button
      type="button"
      icon="pi pi-trash"
      className="accion-eliminar"
      onClick={() => handleRemove(row)}
      tooltip="Quitar"
      tooltipOptions={{ position: "top" }}
      style={{ width: "32px", height: "32px", padding: 0 }}
    />
  );

  const footer = useMemo(
    () => (
      <div className="flex justify-content-end gap-2">
        <Boton label="Cerrar" icon="pi pi-times" color="secondary" onClick={onHide} />
      </div>
    ),
    [onHide]
  );

  return (
    <Dialog
      header={title}
      visible={visible}
      onHide={onHide}
      style={{ width: "min(900px, 95vw)" }}
      footer={footer}
      modal
      draggable={false}
      resizable={false}
    >
      <div className="grid">
        <div className="col-12">
          <label className="label-form">Link</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <InputText
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              style={{ flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
            />
            <Boton
              label="Agregar"
              icon="pi pi-plus"
              onClick={handleAdd}
              color="primary"
              style={{ height: "40px" }}
            />
          </div>
          {error ? <small className="p-error">{error}</small> : null}
        </div>

        <div className="col-12">
          <DataTable value={localRows} emptyMessage="Sin repositorios">
            <Column field="Orden" header="Orden" style={{ width: "90px" }} />
            <Column field="Url" header="Link" body={linkBody} />
            <Column header="Fecha y Hora" body={fechaBody} style={{ width: "200px" }} />
            <Column header="" body={actionsBody} style={{ width: "80px" }} />
          </DataTable>

          <small style={{ display: "block", marginTop: 8, opacity: 0.8 }}>
            * La fecha y hora se muestran solo si el backend las devuelve.
          </small>
        </div>
      </div>
    </Dialog>
  );
};

export default ModalRepositorios;