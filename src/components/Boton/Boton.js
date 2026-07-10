import React from "react";
import "./Boton.scss";
import { Button } from "primereact/button";

const Boton = ({ actionType, ...props }) => {
    let autoIcon = props.icon;
    let isIconOnly = props.isIconOnly || false;
    let finalLabel = props.label;
    let finalColor = props.color;
    let finalClass = props.className || "";
    let finalType = props.type;

    // Asignación automática de iconos, textos y estilos según el parámetro actionType
    if (actionType) {
        const type = actionType.toLowerCase();

        // Detectar si es una variante sin texto
        if (type.includes("sintexto") || type.includes("-icono")) {
            isIconOnly = true;
            finalLabel = ""; // Forzar que no haya texto
        }

        if (type.includes("crear") || type.includes("agregar") || type.includes("nuevo")) {
            autoIcon = props.icon || "pi pi-plus";
            if (!finalLabel && !isIconOnly) finalLabel = type.includes("crear") ? "Crear" : type.includes("nuevo") ? "Nuevo" : "Agregar";
            if (!finalColor) finalColor = "primary";
            if (isIconOnly) finalColor = "secondary"; // Agregar en tablas es azul claro
        } else if (type.includes("guardar")) {
            autoIcon = props.icon || "pi pi-save";
            if (!finalLabel) finalLabel = "Guardar Cambios";
            if (!finalColor) finalColor = "primary";
            if (!finalType) finalType = "submit";
        } else if (type.includes("editar") || type.includes("actualizar")) {
            autoIcon = props.icon || "pi pi-pencil";
            if (!finalLabel && !isIconOnly) finalLabel = type.includes("actualizar") ? "Actualizar" : "Editar";
            if (!finalColor) finalColor = "primary";
        } else if (type.includes("eliminar") || type.includes("borrar")) {
            autoIcon = props.icon || "pi pi-trash";
            if (!finalLabel && !isIconOnly) finalLabel = "Eliminar";
            if (isIconOnly) finalClass += " accion-eliminar"; // Reusar clase global roja
        } else if (type.includes("descargar") || type.includes("exportar")) {
            autoIcon = props.icon || "pi pi-download";
            if (!finalLabel && !isIconOnly) finalLabel = type.includes("exportar") ? "Exportar" : "Descargar";
            if (!finalColor) finalColor = "secondary";
        } else if (type.includes("buscar")) {
            autoIcon = props.icon || "pi pi-search";
            if (!finalLabel && !isIconOnly) finalLabel = "Buscar";
            if (!finalColor) finalColor = "primary";
        } else if (type.includes("ver") || type.includes("detalle")) {
            autoIcon = props.icon || "pi pi-eye";
            if (!finalLabel && !isIconOnly) finalLabel = "Ver";
            if (isIconOnly) finalColor = "secondary"; // Ver detalles en tablas es azul claro
        } else if (type.includes("cerrar") || type.includes("cancelar")) {
            autoIcon = props.icon || "pi pi-times";
            if (!finalLabel && !isIconOnly) finalLabel = type.includes("cancelar") ? "Cancelar" : "Cerrar";
            if (!finalColor) finalColor = "danger";
        }
    }

    return (
        <Button
            {...props}
            type={finalType || "button"}
            label={finalLabel}
            icon={autoIcon}
            className={`btnEd ${isIconOnly ? 'btnEd-icon-only' : ''} ${finalColor === "primary" ? "btnEd-color-primary" : ""} ${finalColor === "secondary" ? "btnEd-color-seconday" : ""} ${finalColor === "danger" ? "btnEd-color-danger" : ""} ${finalClass}`}
        >
        </Button>
    );
};

export default Boton;
