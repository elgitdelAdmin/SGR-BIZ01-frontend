import React, { useMemo } from "react";
import { Dialog } from "primereact/dialog";
import MultiSelectDefault from "../../../components/MultiSelectDefault/MultiSelectDefault";
import CheckboxDefault from "../../../components/CheckboxDefault/CheckboxDefault";
import Boton from "../../../components/Boton/Boton";

const ModalConfiguracionGestores = ({
  visible,
  onHide,
  formik,
  gestor,
  parametros
}) => {
  const footer = useMemo(
    () => (
      <div className="flex justify-content-end gap-2">
        <Boton label="Cerrar" icon="pi pi-times" color="secondary" onClick={onHide} />
      </div>
    ),
    [onHide]
  );

  const idsGestores = formik.values.idsGestores || [];

  const gestoresSeleccionados = idsGestores
    .map((id) => (gestor || []).find((g) => g.id === id || g.id === Number(id)))
    .filter(Boolean);

  const tiposTicket = (parametros || []).filter((p) => p.tipoParametro === "TipoTicket");

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Configuración de Gestores Asignados"
      style={{ width: "min(1100px, 95vw)" }}
      footer={footer}
      modal
      draggable={true}
      resizable={false}
    >
      <div style={{ width: "100%" }}>
        {gestoresSeleccionados.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Inter', system-ui, sans-serif" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                <th style={{ padding: "10px 12px", textAlign: "center", fontSize: "13px", fontWeight: 600, color: "#2e4878", width: "90px" }}>
                  Principal
                </th>
                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#2e4878" }}>
                  Gestor
                </th>
                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#2e4878", width: "550px" }}>
                  Tipos de Ticket Permitidos
                </th>
              </tr>
            </thead>
            <tbody>
              {gestoresSeleccionados.map((g, idx) => {
                const currentConfig = formik.values.gestoresConfig?.find(
                  (cfg) => cfg.idGestor === g.id
                );
                return (
                  <tr
                    key={g.id}
                    style={{
                      borderBottom: "1px solid #dee2e6",
                      backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8f9fa"
                    }}
                  >
                    {/* Principal */}
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <CheckboxDefault
                        inputId={`principal_${g.id}`}
                        name="idGestorPrincipal"
                        checked={formik.values.idGestorPrincipal === g.id}
                        onChange={(e) => {
                          if (e.checked) {
                            formik.setFieldValue("idGestorPrincipal", g.id);
                            formik.setFieldValue("idGestor", g.id);
                          }
                        }}
                      />
                    </td>

                    {/* Nombre del gestor */}
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontWeight: 600, color: "#2e4878", fontSize: "14px" }}>
                        {`${g.nombres} ${g.apellidoPaterno} ${g.apellidoMaterno}`}
                      </span>
                    </td>

                    {/* Tipos de ticket */}
                    <td style={{ padding: "8px 12px" }}>
                      <MultiSelectDefault
                        id={`gestor_config_${g.id}`}
                        name={`gestor_config_${g.id}`}
                        options={tiposTicket}
                        optionLabel="nombre"
                        optionValue="id"
                        placeholder="Todos (sin restricción)"
                        value={currentConfig ? currentConfig.idsTiposTicket : []}
                        onChange={(e) => {
                          const prevConfig = formik.values.gestoresConfig || [];
                          const idxCfg = prevConfig.findIndex((cfg) => cfg.idGestor === g.id);
                          let newConfig;
                          if (idxCfg >= 0) {
                            // Immutable update: replace the object, don't mutate it
                            newConfig = prevConfig.map((cfg, i) =>
                              i === idxCfg
                                ? { ...cfg, idsTiposTicket: e.value || [] }
                                : cfg
                            );
                          } else {
                            newConfig = [...prevConfig, { idGestor: g.id, idsTiposTicket: e.value || [] }];
                          }
                          formik.setFieldValue("gestoresConfig", newConfig);
                        }}
                        style={{ width: "100%" }}
                        appendTo={document.body}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "#9198a7", padding: "12px 0" }}>
            {gestor ? "No hay gestores seleccionados." : "Cargando gestores..."}
          </p>
        )}
      </div>
    </Dialog>
  );
};

export default ModalConfiguracionGestores;
