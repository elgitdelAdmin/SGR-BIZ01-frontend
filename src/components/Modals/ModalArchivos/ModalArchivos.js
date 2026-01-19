import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

const ModalArchivos = ({
  visible,
  onHide,
  title,
  rows,
  columns,
  rowKey,
  emptyMessage = "No hay registros",

  // 🔹 funciones inyectadas
  onDownload,            // async (row) => void
  isDownloadDisabled,    // (row) => boolean
  getDownloadLoadingKey, // (row) => string

  downloadIcon = "pi pi-download",
  dialogStyle = { width: "60vw" },
}) => {
  const [loadingKey, setLoadingKey] = useState(null);

  const handleDownload = async (row) => {
    if (!onDownload) return;

    const key = getDownloadLoadingKey?.(row);
    setLoadingKey(key);

    try {
      await onDownload(row);
    } finally {
      setLoadingKey(null);
    }
  };

  const downloadBodyTemplate = (row) => {
    const key = getDownloadLoadingKey?.(row);
    const loading = key && loadingKey === key;

    return (
      <Button
        type="button"
        icon={downloadIcon}
        className="p-button-text p-button-sm"
        loading={loading}
        disabled={isDownloadDisabled?.(row)}
        onClick={() => handleDownload(row)}
      />
    );
  };

  return (
    <Dialog header={title} visible={visible} style={dialogStyle} modal onHide={onHide}>
      <DataTable
        value={rows}
        dataKey={typeof rowKey === "string" ? rowKey : undefined}
        emptyMessage={emptyMessage}
        responsiveLayout="scroll"
      >
        {columns.map((col, idx) => (
          <Column
            key={col.field || idx}
            field={col.field}
            header={col.header}
            style={col.style}
            body={col.body}
          />
        ))}

        {onDownload && (
          <Column
            header="Descarga"
            body={downloadBodyTemplate}
            style={{ width: "140px", textAlign: "center" }}
          />
        )}
      </DataTable>
    </Dialog>
  );
};

export default ModalArchivos;
