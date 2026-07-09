import React from "react";
import { Dialog } from "primereact/dialog";
import Boton from "../Boton/Boton";
import "./AlertaTicketsSinHoras.scss";

const AlertaTicketsSinHoras = ({ 
    visible, 
    onHide, 
    title = "Alerta", 
    icon = "pi pi-exclamation-triangle", 
    message, 
    items = [], 
    renderItem,
    children,
    draggable = true,
    modal = false,
    position = "center",
    style = { width: '35vw', minWidth: '480px' }
}) => {
    
    const defaultRenderItem = (item) => {
        if (typeof item === "string" || typeof item === "number") {
            return item;
        }
        if (item && item.codTicket) {
            return (
                <>
                    <strong>{item.codTicket}</strong>
                    {item.codTicketInterno ? ` (${item.codTicketInterno})` : ''}
                </>
            );
        }
        return item ? (item.label || item.nombre || JSON.stringify(item)) : '';
    };

    return (
        <Dialog
            header={
                <>
                    {icon && <i className={icon} style={{ fontSize: '1.4rem' }} />}
                    <span>{title}</span>
                </>
            }
            visible={visible}
            onHide={onHide}
            style={style}
            className="alerta-tickets-dialog"
            draggable={draggable}
            resizable={false}
            closable={true}
            modal={modal}
            position={position}
        >
            <div className="alerta-tickets-dialog__body">
                {message && <p className="alerta-tickets-dialog__message">{message}</p>}
                
                {children ? children : (
                    items.length > 0 && (
                        <div className="alerta-tickets-dialog__list-container">
                            <ul className="alerta-tickets-dialog__list">
                                {items.map((item, index) => (
                                    <li key={item?.id || index} className="alerta-tickets-dialog__item">
                                        {renderItem ? renderItem(item) : defaultRenderItem(item)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                )}
                
                <div className="alerta-tickets-dialog__footer">
                    <Boton
                        label="Entendido"
                        color="primary"
                        onClick={onHide}
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default AlertaTicketsSinHoras;
