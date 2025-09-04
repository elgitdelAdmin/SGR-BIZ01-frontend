import React from 'react';
import * as Iconsax from "iconsax-react";
import './NotificationDropdown.scss';

const NotificationDropdown = ({ notifications, onClose }) => {
  return (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <h4>Notificaciones</h4>
        <button onClick={onClose} className="close-btn">
          <Iconsax.CloseCircle />
        </button>
      </div>

      {(!notifications || notifications.length === 0) ? (
        <div className="no-notifications">No hay notificaciones</div>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li 
              key={notification.id} 
              className={`notification-item ${notification.leido ? "read" : "unread"}`}
            >
              <div className="notification-message">{notification.mensaje}</div>
              <div className="notification-meta">
                <span className="notification-date">
                  {new Date(notification.fechaCreacion).toLocaleString()}
                </span>
                {!notification.leido && <span className="badge">Nuevo</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationDropdown;

