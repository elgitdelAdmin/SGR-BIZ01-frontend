import React from 'react';
import * as Iconsax from "iconsax-react";
import './NotificationDropdown.scss';
import { useNavigate } from "react-router-dom";

// Helper: relative time label
const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000; // seconds
  if (diff < 60)   return `Hace ${Math.floor(diff)}s`;
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
};

const NotificationDropdown = ({ notifications, onClose }) => {
  const idUser = localStorage.getItem("idUser");
  const codRol = localStorage.getItem("codRol");
  const navigate = useNavigate();

  const handleClick = (idTicket) => {
    navigate(`/tickets/user/${idUser}/rol/${codRol}/Editar/${idTicket}`);
    onClose();
  };

  const unreadCount = notifications ? notifications.filter(n => !n.leido).length : 0;

  return (
    <div className="nd-panel">

      {/* ── Header ── */}
      <div className="nd-header">
        <div className="nd-header__left">
          <Iconsax.Notification size="18" color="#0e71ae" variant="Bold" />
          <span className="nd-header__title">Notificaciones</span>
          {unreadCount > 0 && (
            <span className="nd-header__badge">{unreadCount}</span>
          )}
        </div>
        <button onClick={onClose} className="nd-close-btn" title="Cerrar">
          <Iconsax.CloseSquare size="20" color="#9198a7" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="nd-body">
        {(!notifications || notifications.length === 0) ? (
          <div className="nd-empty">
            <Iconsax.Notification size="40" color="#d0e5f0" variant="Bold" />
            <p>Sin notificaciones pendientes</p>
          </div>
        ) : (
          <ul className="nd-list">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`nd-item ${n.leido ? "nd-item--read" : "nd-item--unread"}`}
                onClick={() => handleClick(n.idReferencia)}
              >
                {/* Left icon pill */}
                <div className={`nd-item__icon ${n.leido ? "" : "nd-item__icon--unread"}`}>
                  <Iconsax.TicketStar size="18" color={n.leido ? "#9198a7" : "#0e71ae"} variant="Bold" />
                </div>

                {/* Content */}
                <div className="nd-item__content">
                  <p className="nd-item__msg">{n.mensaje}</p>
                  <div className="nd-item__meta">
                    <span className="nd-item__time">
                      <Iconsax.Clock size="11" color="#9198a7" />
                      {timeAgo(n.fechaCreacion)}
                    </span>
                    {!n.leido && <span className="nd-badge">Nuevo</span>}
                  </div>
                </div>

                {/* Unread dot */}
                {!n.leido && <div className="nd-item__dot" />}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Footer ── */}
      {notifications && notifications.length > 0 && (
        <div className="nd-footer">
          <span>{notifications.length} notificacion{notifications.length !== 1 ? "es" : ""} en total</span>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
