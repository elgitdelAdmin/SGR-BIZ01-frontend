import React from 'react';
import * as Iconsax from "iconsax-react";
import './AlertsDropdown.scss';

const AlertsDropdown = ({ alerts = [], onClose }) => {
  const handleItemClick = (alert) => {
    if (alert.onClick) {
      alert.onClick();
    }
    onClose();
  };

  return (
    <div className="ad-panel">
      {/* ── Header ── */}
      <div className="ad-header">
        <div className="ad-header__left">
          <Iconsax.Warning2 size="18" color="#dd4b39" variant="Bold" />
          <span className="ad-header__title">Alertas</span>
          {alerts.length > 0 && (
            <span className="ad-header__badge">{alerts.length}</span>
          )}
        </div>
        <button onClick={onClose} className="ad-close-btn" title="Cerrar">
          <Iconsax.CloseSquare size="20" color="#9198a7" />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="ad-body">
        {alerts.length === 0 ? (
          <div className="ad-empty">
            <Iconsax.TickCircle size="40" color="#d0e5f0" variant="Bold" />
            <p>Sin alertas pendientes</p>
          </div>
        ) : (
          <ul className="ad-list">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="ad-item"
                onClick={() => handleItemClick(a)}
              >
                {/* Left icon pill */}
                <div className="ad-item__icon">
                  <i className={a.icon || "pi pi-exclamation-triangle"} style={{ fontSize: '18px', color: '#dd4b39' }} />
                </div>

                {/* Content */}
                <div className="ad-item__content">
                  <p className="ad-item__title">{a.title}</p>
                  <p className="ad-item__msg">{a.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Footer ── */}
      {alerts.length > 0 && (
        <div className="ad-footer">
          <span>Resuelva las alertas pendientes</span>
        </div>
      )}
    </div>
  );
};

export default AlertsDropdown;
