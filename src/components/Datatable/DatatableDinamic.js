import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Paginator } from 'primereact/paginator';
import { generateExcelNew } from '../../helpers/helpers';

/**
 * DatatableDinamic — Componente reutilizable de tabla con:
 *   • Paginación server-side (lazy) preparada  (serverSide prop)
 *   • Filtros de texto por columna
 *   • Búsqueda global
 *   • Exportación a Excel
 *
 * @param {Array}    value          - Datos a mostrar
 * @param {Array}    columns        - [{field, header, body?, width?, sortable?}]  (alternativa a children)
 * @param {boolean}  loading        - Spinner de carga
 * @param {boolean}  serverSide     - Activa paginación lazy / server-side
 * @param {number}   totalRecords   - Total de registros (requerido en serverSide)
 * @param {Function} onPageChange   - Callback (page, rows) para server-side
 * @param {number}   rows           - Filas por página (default 10)
 * @param {boolean}  exportable     - Muestra botón de descarga Excel
 * @param {string}   emptyMessage   - Mensaje cuando no hay datos
 * @param {boolean}  showSearch     - Muestra buscador global (default true)
 * @param {string}   dataKey        - Campo clave único de cada fila (default "id")
 * @param {React.ReactNode} headerExtra - Contenido extra para inyectar en la cabecera
 */
const DatatableDinamic = ({
    value = [],
    columns,
    children,
    loading = false,
    serverSide = false,
    totalRecords: totalRecordsProp,
    onPageChange,
    rows: rowsProp = 10,
    exportable = false,
    emptyMessage = 'No se encontraron registros.',
    showSearch = true,
    dataKey = 'id',
    headerExtra,
    actionBody,
    actionHeader = 'Acciones',
    actionWidth = '80px',
    onEdit,
    onDelete,
    onFilterChange,
    onSortChange,
    initialGlobalFilter = '',
    initialColumnFilters = {},
    mobileConfig,
    ...rest
}) => {
    // ── Estado de paginación ──────────────────────────────────────────
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(rowsProp);

    // ── Estado responsivo móvil ───────────────────────────────────────
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth <= (mobileConfig?.breakpoint || 768) : false
    );

    // ── Acción por Defecto ────────────────────────────────────────────
    const defaultActionBody = useCallback((rowData) => {
        return (
            <div className="datatable-accion" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {onEdit && (
                    <Button
                        type="button"
                        icon="pi pi-pencil"
                        className="accion-editar"
                        onClick={() => onEdit(rowData)}
                        tooltip="Editar"
                        style={{ width: "32px", height: "32px", padding: 0 }}
                    />
                )}
                {onDelete && (
                    <Button
                        type="button"
                        icon="pi pi-trash"
                        className="accion-eliminar"
                        onClick={() => onDelete(rowData)}
                        tooltip="Eliminar"
                        style={{ width: "32px", height: "32px", padding: 0 }}
                    />
                )}
            </div>
        );
    }, [onEdit, onDelete]);

    const finalActionBody = actionBody || (onEdit || onDelete ? defaultActionBody : null);

    useEffect(() => {
        const bp = mobileConfig?.breakpoint || 768;
        const onResize = () => {
            setIsMobile(window.innerWidth <= bp);
        };
        window.addEventListener('resize', onResize);
        onResize(); // Asegurar estado correcto en montaje
        return () => window.removeEventListener('resize', onResize);
    }, [mobileConfig?.breakpoint]);

    // ── Filtros ───────────────────────────────────────────────────────
    const [globalFilterValue, setGlobalFilterValue] = useState(initialGlobalFilter);
    const [columnFilters, setColumnFilters] = useState(initialColumnFilters);

    // ── Para Excel export: datos visibles después de filtrar ──────────
    const [visibleData, setVisibleData] = useState(value || []);

    // ── Tooltip personalizado diseñado por nosotros ─────────────────
    const [customTooltip, setCustomTooltip] = useState({ text: "", x: 0, y: 0, visible: false });

    const handleMouseEnter = (e, text) => {
        if (!text) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const tooltipMaxWidth = 320;
        const halfWidth = tooltipMaxWidth / 2;
        let x = rect.left + rect.width / 2;
        x = Math.max(halfWidth + 10, Math.min(x, window.innerWidth - halfWidth - 10));

        setCustomTooltip({
            text,
            x,
            y: rect.top,
            visible: true
        });
    };

    const handleMouseLeave = () => {
        setCustomTooltip(prev => ({ ...prev, visible: false }));
    };

    // ── Refs ──────────────────────────────────────────────────────────
    const dt = useRef(null);
    const scrollSyncRef = useRef(null);
    const tableWrapperRef = useRef(null);

    // ── Resolver columnas: props.columns ó children ───────────────────
    const resolvedColumns = React.useMemo(() => {
        if (columns && columns.length > 0) {
            return columns.map((col) => ({
                field: col.field,
                header: col.header,
                body: col.body || null,
                sortable: col.sortable !== false,
                width: col.width || null,
                headerStyle: col.headerStyle,
                bodyStyle: col.bodyStyle,
                className: col.className,
                headerClassName: col.headerClassName,
            }));
        }
        // Extraer de children
        if (children) {
            return React.Children.toArray(children)
                .filter(Boolean)
                .map((c) => ({
                    field: c.props.field,
                    header: c.props.header,
                    body: c.props.body || null,
                    sortable: c.props.field ? (c.props.sortable !== false) : false,
                    width: c.props.style?.width || c.props.style?.minWidth || null,
                    headerStyle: c.props.headerStyle,
                    bodyStyle: c.props.bodyStyle,
                    className: c.props.className,
                    headerClassName: c.props.headerClassName,
                }));
        }
        return [];
    }, [columns, children]);

    // ── Helper para badge de estado móvil ──────────────────────────────
    const getMobileBadgeStyle = (valStr) => {
        const val = String(valStr || '').toLowerCase().trim();
        if (val.includes('pendiente'))  return { bg: '#fff3cd', color: '#856404', border: '#ffc107' };
        if (val.includes('asignado'))   return { bg: '#d0e5f0', color: '#0e71ae', border: '#0e71ae' };
        if (val.includes('proceso') || val.includes('progreso') || val.includes('curso')) return { bg: '#d1ecf1', color: '#0c5460', border: '#17a2b8' };
        if (val.includes('cerrado') || val.includes('completado') || val.includes('finalizado') || val.includes('activo'))    return { bg: '#d4edda', color: '#155724', border: '#1d9e75' };
        if (val.includes('anulado') || val.includes('cancelado') || val.includes('inactivo'))    return { bg: '#f8d7da', color: '#721c24', border: '#dd4b39' };
        return { bg: '#f0f4f8', color: '#2e4878', border: '#9198a7' };
    };

    // ── Filtrado local en móvil para client-side pagination ───────────
    const getFilteredData = useCallback(() => {
        if (serverSide) return value || [];
        let data = value || [];

        const getFieldValue = (obj, fieldPath) => {
            if (!fieldPath) return undefined;
            if (obj && obj[fieldPath] !== undefined) return obj[fieldPath];
            return fieldPath.split('.').reduce((acc, part) => acc && acc[part], obj);
        };

        if (globalFilterValue && showSearch) {
            const query = String(globalFilterValue).toLowerCase().trim();
            if (query !== '') {
                data = data.filter((item) => {
                    return resolvedColumns.some((col) => {
                        if (!col.field) return false;
                        const raw = getFieldValue(item, col.field);
                        if (raw == null) return false;
                        return String(raw).toLowerCase().includes(query);
                    });
                });
            }
        }

        const activeFilters = Object.entries(columnFilters).filter(([_, val]) => val && String(val).trim() !== '');
        if (activeFilters.length > 0) {
            data = data.filter((item) => {
                return activeFilters.every(([field, filterVal]) => {
                    const query = String(filterVal).toLowerCase().trim();
                    const raw = getFieldValue(item, field);
                    if (raw == null) return false;
                    return String(raw).toLowerCase().includes(query);
                });
            });
        }

        return data;
    }, [value, globalFilterValue, columnFilters, resolvedColumns, serverSide, showSearch]);

    // ── Clasificación de columnas para tarjetas móviles ──────────────────
    const mobileLayout = useMemo(() => {
        if (!isMobile) return null;

        const actionCols = [];
        const dataCols = [];

        if (finalActionBody) {
            actionCols.push({
                header: actionHeader || 'Acciones',
                body: finalActionBody
            });
        }

        resolvedColumns.forEach((c) => {
            const isActionHeader = /accion|acción|action/i.test(c.header || '');
            if (isActionHeader && c.body) {
                actionCols.push(c);
            } else {
                dataCols.push(c);
            }
        });

        let idCol = null;
        if (mobileConfig?.idField) {
            idCol = dataCols.find(c => c.field === mobileConfig.idField) || null;
        }
        if (!idCol) {
            idCol = dataCols.find(c => c.field && /id|codigo|cód|nro|documento/i.test(c.field)) ||
                    dataCols.find(c => c.header && /id|codigo|cód|nro|documento/i.test(c.header)) ||
                    dataCols.find(c => c.field) || 
                    null;
        }

        let badgeCol = null;
        if (mobileConfig?.badgeField) {
            badgeCol = dataCols.find(c => c.field === mobileConfig.badgeField) || null;
        }
        if (!badgeCol) {
            badgeCol = dataCols.find(c => c.field && /estado/i.test(c.field)) ||
                       dataCols.find(c => c.header && /estado/i.test(c.header)) ||
                       null;
        }

        let titleCol = null;
        if (mobileConfig?.titleField) {
            titleCol = dataCols.find(c => c.field === mobileConfig.titleField) || null;
        }
        if (!titleCol) {
            titleCol = dataCols.find(c => c.field && /^titulo$/i.test(c.field)) ||
                       dataCols.find(c => c.field && /titulo/i.test(c.field)) ||
                       dataCols.find(c => c.header && /titulo/i.test(c.header)) ||
                       dataCols.find(c => c.field && /nombre/i.test(c.field)) ||
                       dataCols.find(c => c.header && /nombre/i.test(c.header)) ||
                       dataCols.find(c => c.field && /razon|descripcion/i.test(c.field)) ||
                       null;
        }

        const hidden = new Set(mobileConfig?.hiddenFields || []);

        const metaCols = dataCols.filter((c) => {
            if (c === idCol && idCol) return false;
            if (c === badgeCol && badgeCol) return false;
            if (c === titleCol && titleCol) return false;
            if (c.field && hidden.has(c.field)) return false;
            return true;
        });

        return { idCol, badgeCol, titleCol, metaCols, actionCols };
    }, [isMobile, resolvedColumns, mobileConfig, actionBody, actionHeader]);

    const getCardCellValue = (rowData, col, idx) => {
        if (col.body) {
            return col.body(rowData, { rowIndex: idx, props: { value }, field: col.field, column: col });
        }
        const getFieldValue = (obj, fieldPath) => {
            if (!fieldPath) return undefined;
            if (obj && obj[fieldPath] !== undefined) return obj[fieldPath];
            return fieldPath.split('.').reduce((acc, part) => acc && acc[part], obj);
        };
        return getFieldValue(rowData, col.field);
    };

    const renderCardValue = (val) => {
        if (val == null) return '-';
        if (React.isValidElement(val)) return val;
        if (typeof val === 'boolean') return val ? 'Sí' : 'No';
        return String(val);
    };

    const renderMobileCard = (rowData, idx) => {
        const { idCol, badgeCol, titleCol, metaCols, actionCols } = mobileLayout;

        return (
            <div className="dt-mobile-card" key={rowData[dataKey] || idx}>
                {(idCol || badgeCol) && (
                    <div className="dt-mobile-card__header">
                        {idCol && (
                            <span className="dt-mobile-card__id">
                                {renderCardValue(getCardCellValue(rowData, idCol, idx))}
                            </span>
                        )}
                        {badgeCol && (() => {
                            const displayVal = renderCardValue(getCardCellValue(rowData, badgeCol, idx));
                            const badgeStyle = getMobileBadgeStyle(displayVal);
                            return (
                                <span 
                                    className="dt-mobile-card__badge" 
                                    style={{ 
                                        background: badgeStyle.bg, 
                                        color: badgeStyle.color, 
                                        border: `1px solid ${badgeStyle.border}` 
                                    }}
                                >
                                    {displayVal}
                                </span>
                            );
                        })()}
                    </div>
                )}

                {titleCol && (
                    <p className="dt-mobile-card__title">
                        {renderCardValue(getCardCellValue(rowData, titleCol, idx))}
                    </p>
                )}

                {metaCols.length > 0 && (
                    <div className="dt-mobile-card__meta">
                        {metaCols.map((col, cIdx) => {
                            const val = getCardCellValue(rowData, col, idx);
                            const displayVal = renderCardValue(val);
                            
                            if (React.isValidElement(val)) {
                                return (
                                    <div key={col.field || cIdx} className="dt-mobile-card__meta-item dt-mobile-card__meta-item--jsx">
                                        <span className="dt-mobile-card__meta-label">{col.header}</span>
                                        <span className="dt-mobile-card__meta-value">{val}</span>
                                    </div>
                                );
                            }
                            
                            return (
                                <div key={col.field || cIdx} className="dt-mobile-card__meta-item">
                                    <span className="dt-mobile-card__meta-label">{col.header}</span>
                                    <span className="dt-mobile-card__meta-value">{displayVal}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {actionCols.length > 0 && (
                    <div className="dt-mobile-card__actions">
                        {actionCols.map((col, aIdx) => (
                            <div key={aIdx} className="dt-mobile-card__action-btn-wrapper">
                                {col.body(rowData, { rowIndex: idx, props: { value }, field: col.field, column: col })}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderMobileView = () => {
        const processedData = getFilteredData();
        const displayedValue = serverSide ? value : processedData.slice(first, first + rows);
        
        return (
            <div className="dt-mobile-cards-container" style={{ position: 'relative' }}>
                {loading && (
                    <div className="p-datatable-loading-overlay p-component-overlay" style={{ zIndex: 100, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16 }}>
                    </div>
                )}
                
                {displayedValue.length === 0 ? (
                    <div className="dt-mobile-card-empty">
                        <i className="pi pi-inbox" style={{ fontSize: '32px' }}></i>
                        <span>{emptyMessage}</span>
                    </div>
                ) : (
                    displayedValue.map((item, idx) => renderMobileCard(item, first + idx))
                )}

                {totalRecords > rows && (
                    <div className="dt-mobile-paginator">
                        <Paginator
                            first={first}
                            rows={rows}
                            totalRecords={totalRecords}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            onPageChange={handlePage}
                            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                        />
                    </div>
                )}
            </div>
        );
    };

    // ── Construir objeto de filtros de PrimeReact ─────────────────────
    const primeFilters = React.useMemo(() => {
        const f = { global: { value: globalFilterValue || null, matchMode: FilterMatchMode.CONTAINS } };
        resolvedColumns.forEach((col) => {
            f[col.field] = { value: columnFilters[col.field] || null, matchMode: FilterMatchMode.CONTAINS };
        });
        return f;
    }, [globalFilterValue, columnFilters, resolvedColumns]);

    // ── Resetear paginación cuando cambian filtros ────────────────────
    useEffect(() => {
        setFirst(0);
    }, [globalFilterValue, columnFilters]);

    // ── Sincronizar visibleData con value cuando no hay filtros ────
    useEffect(() => {
        setVisibleData(value || []);
    }, [value]);

    // ── Eventos de paginación ─────────────────────────────────────────
    const handlePage = (e) => {
        setFirst(e.first);
        setRows(e.rows);
        if (serverSide && onPageChange) {
            onPageChange(Math.floor(e.first / e.rows), e.rows);
        }
    };

    // ── Capturar datos filtrados por PrimeReact ───────────────────────
    const handleValueChange = (filteredValue) => {
        setVisibleData(filteredValue);
    };

    // ── Scroll sincronizado ────────────────────────────────────────────
    useEffect(() => {
        const tableWrapper = tableWrapperRef.current?.querySelector('.p-datatable-wrapper');
        const scrollSync = scrollSyncRef.current;
        if (!tableWrapper || !scrollSync) return;

        const syncScroll = () => { scrollSync.scrollLeft = tableWrapper.scrollLeft; };
        const syncBack = () => { tableWrapper.scrollLeft = scrollSync.scrollLeft; };

        tableWrapper.addEventListener('scroll', syncScroll);
        scrollSync.addEventListener('scroll', syncBack);

        const updateWidth = () => {
            const table = tableWrapper.querySelector('table');
            if (table && scrollSync.firstChild) {
                scrollSync.firstChild.style.width = `${table.offsetWidth}px`;
            }
        };
        updateWidth();
        const ro = new ResizeObserver(updateWidth);
        const tableEl = tableWrapper.querySelector('table');
        if (tableEl) ro.observe(tableEl);

        return () => {
            tableWrapper.removeEventListener('scroll', syncScroll);
            scrollSync.removeEventListener('scroll', syncBack);
            ro.disconnect();
        };
    }, [value]);

    // ── Handlers de filtros ───────────────────────────────────────────
    const filterTimeoutRef = useRef(null);

    const onGlobalChange = (e) => {
        const val = e.target.value;
        setGlobalFilterValue(val);
        if (serverSide && onFilterChange) {
            if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
            filterTimeoutRef.current = setTimeout(() => {
                onFilterChange({ global: val, columns: columnFilters });
            }, 600);
        }
    };

    const onColumnFilterChange = (field, val) => {
        const newFilters = { ...columnFilters, [field]: val };
        setColumnFilters(newFilters);
        if (serverSide && onFilterChange) {
            if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
            filterTimeoutRef.current = setTimeout(() => {
                onFilterChange({ global: globalFilterValue, columns: newFilters });
            }, 600);
        }
    };

    // ── Template de filtro por columna ────────────────────────────────
    const columnFilterTemplate = (field) => (
        <InputText
            value={columnFilters[field] || ''}
            onChange={(e) => onColumnFilterChange(field, e.target.value)}
            placeholder="Buscar..."
            className="p-column-filter"
            style={{ width: '100%', fontSize: '11px', padding: '0.25rem 0.5rem', minHeight: '28px' }}
        />
    );

    // ── Excel export ──────────────────────────────────────────────────
    const handleExcel = () => {
        const colsInfo = resolvedColumns.map((c) => ({
            field: c.field,
            header: c.header,
            body: c.body,
        }));
        generateExcelNew(visibleData, colsInfo);
    };

    // ── Header ────────────────────────────────────────────────────────
    const renderHeader = () => (
        <div className="flex justify-content-between flex-wrap">
            <div className="flex flex-wrap justify-content-center" style={{ gap: 8 }}>
                {exportable && (
                    <Button
                        type="button"
                        label="Descargar"
                        className="p-button-success"
                        icon="pi pi-file-excel"
                        severity="success"
                        onClick={handleExcel}
                        data-pr-tooltip="XLS"
                    />
                )}
                {headerExtra}
            </div>
            {showSearch && (
                <div className="flex justify-content-end">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText value={globalFilterValue} onChange={onGlobalChange} placeholder="Buscar..." />
                    </span>
                </div>
            )}
        </div>
    );

    // ── Total de registros ────────────────────────────────────────────
    const totalRecords = serverSide ? (totalRecordsProp || 0) : (visibleData || []).length;

    // ── Render ────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
        .dt-dinamic-container {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .dt-dinamic-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .dt-dinamic-scroll {
          position: sticky;
          bottom: 0;
          height: 17px;
          overflow-x: auto;
          overflow-y: hidden;
          background: white;
          border-top: 1px solid #dee2e6;
          z-index: 11;
        }
        .dt-dinamic-scroll > div { height: 1px; }
        .dt-dinamic-scroll::-webkit-scrollbar { height: 12px; }
        .dt-dinamic-scroll::-webkit-scrollbar-track { background: #f1f1f1; }
        .dt-dinamic-scroll::-webkit-scrollbar-thumb { background: #888; border-radius: 6px; }
        .dt-dinamic-scroll::-webkit-scrollbar-thumb:hover { background: #555; }

        /* Columnas y celdas compactas */
        .dt-dinamic-content .p-datatable .p-column-filter { width: 100% !important; max-width: 100%; }
        .dt-dinamic-content .p-datatable .p-column-filter-row > td { padding: 0.25rem !important; }
        .dt-dinamic-content .p-datatable .p-column-filter-row .p-inputtext { box-sizing: border-box; }
        .dt-dinamic-content .p-datatable .p-column-filter-row { height: auto; }

        .dt-dinamic-content .p-datatable .p-datatable-tbody > tr > td {
          white-space: normal !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          vertical-align: top;
          padding: 0.5rem !important;
          font-size: 11px !important;
          overflow: visible !important;
          max-width: none !important;
        }
        .dt-dinamic-content .p-datatable .p-datatable-thead > tr > th {
          white-space: nowrap;
          vertical-align: middle;
          font-size: 11px !important;
          overflow: visible !important;
          max-width: none !important;
        }
        .dt-dinamic-content .p-datatable table {
          table-layout: auto !important;
          width: 100%;
        }
        .dt-dinamic-content .p-datatable-table {
          width: max-content;
          min-width: 100%;
        }
        .dt-dinamic-content .p-paginator {
          font-size: 11px !important;
          position: sticky;
          bottom: 0;
          background: white;
          z-index: 10;
          border-top: 1px solid #dee2e6;
        }
        .dt-dinamic-content .p-paginator .p-paginator-pages .p-paginator-page,
        .dt-dinamic-content .p-paginator .p-paginator-first,
        .dt-dinamic-content .p-paginator .p-paginator-prev,
        .dt-dinamic-content .p-paginator .p-paginator-next,
        .dt-dinamic-content .p-paginator .p-paginator-last {
          font-size: 11px !important;
        }
        .dt-dinamic-content .p-datatable-wrapper {
          overflow-x: hidden !important;
          overflow-y: auto;
        }
        .dt-dinamic-content .p-datatable {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .dt-dinamic-content .p-datatable .p-datatable-wrapper {
          flex: 1;
          min-height: 0;
        }

        /* Custom loading overlay styled with modern aesthetics */
        .dt-dinamic-content .p-datatable-loading-overlay {
          background: rgba(255, 255, 255, 0.4) !important;
          backdrop-filter: blur(5px) !important;
          -webkit-backdrop-filter: blur(5px) !important;
          transition: all 0.3s ease;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 100 !important;
        }

        .dt-dinamic-content .p-datatable-loading-icon {
          display: none !important; /* Hide the default tiny spinner */
        }

        /* Beautiful modern spinner matching brand colors */
        .dt-dinamic-content .p-datatable-loading-overlay::after {
          content: "";
          width: 50px;
          height: 50px;
          border: 4px solid #e3f0f8;
          border-top: 4px solid #0e71ae;
          border-radius: 50%;
          animation: spin-loader 0.8s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
          box-shadow: 0 0 15px rgba(14, 113, 174, 0.2);
        }

        @keyframes spin-loader {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Estilos premium y amigables para el globo (tooltip) */
        .custom-self-designed-tooltip {
          width: max-content;
          min-width: 60px;
          max-width: 320px;
          background: linear-gradient(135deg, #0e71ae 0%, #09507c 100%);
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.5;
          padding: 10px 16px;
          border-radius: 12px;
          box-shadow: 0 12px 30px rgba(14, 113, 174, 0.35), 0 4px 10px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          white-space: normal;
          word-break: break-word;
          text-align: left;
          animation: customTooltipFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          position: fixed;
          z-index: 99999;
          pointer-events: none;
        }

        .custom-self-designed-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 8px;
          border-style: solid;
          border-color: #09507c transparent transparent transparent;
        }

        @keyframes customTooltipFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -100%) translateY(0px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -100%) translateY(-8px) scale(1);
          }
        }

        /* Estilos móviles para DatatableDinamic */
        .dt-mobile-cards-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px 8px;
          min-height: 200px;
          background: #f8fafc;
        }

        .dt-mobile-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(46, 72, 120, 0.06);
          border: 1px solid rgba(145, 152, 167, 0.15);
          padding: 16px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: cardFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .dt-mobile-card:active {
          transform: scale(0.98);
        }

        @keyframes cardFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dt-mobile-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 8px;
        }

        .dt-mobile-card__id {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: #0e71ae;
          background: #e3f0f8;
          padding: 4px 10px;
          border-radius: 20px;
          letter-spacing: 0.5px;
        }

        .dt-mobile-card__badge {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dt-mobile-card__title {
          font-family: 'Poppins', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #2e4878;
          line-height: 1.4;
          margin: 0 0 12px 0;
        }

        .dt-mobile-card__meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px 16px;
        }

        .dt-mobile-card__meta-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .dt-mobile-card__meta-item--jsx {
          grid-column: span 2;
          border-top: 1px dashed #e9ecef;
          padding-top: 8px;
        }

        .dt-mobile-card__meta-label {
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          color: #9198a7;
          letter-spacing: 0.5px;
        }

        .dt-mobile-card__meta-value {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #2e4878;
          font-weight: 500;
          word-break: break-word;
        }

        .dt-mobile-card__actions {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          border-top: 1px dashed #e9ecef;
          padding-top: 12px;
          justify-content: flex-end;
        }

        .dt-mobile-card__actions .profesor-datatable-accion {
          display: flex !important;
          gap: 12px !important;
          justify-content: flex-end !important;
          width: 100% !important;
        }

        .dt-mobile-card__actions .profesor-datatable-accion > div,
        .dt-mobile-card__actions .profesor-datatable-accion > button,
        .dt-mobile-card__actions .accion-editar,
        .dt-mobile-card__actions .profesor-accion-editar,
        .dt-mobile-card__actions .profesor-accion-eliminar {
          padding: 8px 16px !important;
          font-size: 13px !important;
          border-radius: 8px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          min-height: 38px !important;
          cursor: pointer !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
          color: white !important;
        }

        .dt-mobile-card__actions .profesor-datatable-accion svg {
          width: 16px !important;
          height: 16px !important;
        }

        .dt-mobile-card-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 16px;
          text-align: center;
          color: #9198a7;
          gap: 12px;
          background: white;
          border-radius: 16px;
          border: 1px dashed rgba(145, 152, 167, 0.3);
        }

        .dt-mobile-card-empty span {
          font-size: 14px;
          font-weight: 500;
        }

        /* PrimeReact Paginator overrides for mobile */
        .dt-mobile-paginator {
          border-radius: 12px;
          margin-top: 16px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(145, 152, 167, 0.15);
          overflow: hidden;
          background: white;
        }
        
        .dt-mobile-paginator .p-paginator {
          padding: 8px !important;
          justify-content: center !important;
          flex-wrap: wrap !important;
          gap: 4px !important;
        }

        .dt-mobile-paginator .p-paginator .p-paginator-pages .p-paginator-page,
        .dt-mobile-paginator .p-paginator .p-paginator-first,
        .dt-mobile-paginator .p-paginator .p-paginator-prev,
        .dt-mobile-paginator .p-paginator .p-paginator-next,
        .dt-mobile-paginator .p-paginator .p-paginator-last {
          min-width: 32px !important;
          height: 32px !important;
          border-radius: 6px !important;
          font-size: 12px !important;
        }
      `}</style>

            <div className="dt-dinamic-container">
                {isMobile ? (
                    <div className="dt-dinamic-content">
                        {renderHeader()}
                        {renderMobileView()}
                    </div>
                ) : (
                    <>
                        <div className="dt-dinamic-content" ref={tableWrapperRef}>
                            <DataTable
                                ref={dt}
                                value={value}
                                lazy={serverSide}
                                paginator
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                                first={first}
                                rows={rows}
                                totalRecords={serverSide ? (totalRecordsProp || 0) : undefined}
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                onPage={handlePage}
                                onSort={(e) => {
                                    if (serverSide && onSortChange) onSortChange(e);
                                }}
                                dataKey={dataKey}
                                filters={primeFilters}
                                filterDisplay="row"
                                globalFilterFields={resolvedColumns.map((c) => c.field)}
                                onValueChange={handleValueChange}
                                loading={loading}
                                header={renderHeader()}
                                emptyMessage={emptyMessage}
                                stripedRows
                                size="small"
                                responsiveLayout="scroll"
                                scrollable
                                scrollHeight="100%"
                                {...rest}
                            >
                                {finalActionBody && (
                                    <Column
                                        body={finalActionBody}
                                        header={actionHeader}
                                        style={{ width: actionWidth, minWidth: actionWidth }}
                                        headerStyle={{ padding: '0.5rem', whiteSpace: 'nowrap' }}
                                        bodyStyle={{ padding: '0.5rem', textAlign: 'center' }}
                                    />
                                )}
                                {resolvedColumns.map((col, idx) => {
                                    const defaultBody = col.body;
                                    const cellBody = (rowData, options) => {
                                        const getFieldValue = (obj, fieldPath) => {
                                            if (!fieldPath) return undefined;
                                            if (obj && obj[fieldPath] !== undefined) return obj[fieldPath];
                                            return fieldPath.split('.').reduce((acc, part) => acc && acc[part], obj);
                                        };
                                        let val = defaultBody ? defaultBody(rowData, options) : getFieldValue(rowData, col.field);
                                        if (typeof val === 'string' || typeof val === 'number') {
                                            const text = String(val);
                                            if (!text.trim()) return '';
                                            return (
                                                <div
                                                    className="title-tooltip-target"
                                                    onMouseEnter={(e) => handleMouseEnter(e, text)}
                                                    onMouseLeave={handleMouseLeave}
                                                    style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'normal',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {val}
                                                </div>
                                            );
                                        }
                                        return val;
                                    };

                                    const headerTemplate = (headerText) => {
                                        if (!headerText) return null;
                                        return (
                                            <span
                                                onMouseEnter={(e) => handleMouseEnter(e, headerText)}
                                                onMouseLeave={handleMouseLeave}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {headerText}
                                            </span>
                                        );
                                    };

                                    return (
                                        <Column
                                            key={col.field || idx}
                                            field={col.field}
                                            header={headerTemplate(col.header)}
                                            body={cellBody}
                                            sortable={col.sortable}
                                            filter={col.field ? true : false}
                                            filterElement={col.field ? columnFilterTemplate(col.field) : null}
                                            showFilterMenu={false}
                                            filterPlaceholder={col.field ? `Buscar por ${col.header || col.field}` : ''}
                                            className={col.className}
                                            headerClassName={col.headerClassName}
                                            style={{
                                                width: col.width || undefined,
                                                minWidth: col.width || (col.field ? '120px' : '80px'),
                                                padding: '0.5rem',
                                                whiteSpace: 'normal',
                                                wordWrap: 'break-word',
                                                verticalAlign: col.field ? 'top' : 'middle',
                                                textAlign: col.field ? 'left' : 'center',
                                                ...(col.bodyStyle || {}),
                                            }}
                                            headerStyle={{
                                                padding: '0.5rem',
                                                whiteSpace: 'nowrap',
                                                ...(col.headerStyle || {}),
                                            }}
                                            bodyStyle={{
                                                padding: '0.5rem',
                                                whiteSpace: 'normal',
                                                wordWrap: 'break-word',
                                                verticalAlign: col.field ? 'top' : 'middle',
                                                textAlign: col.field ? 'left' : 'center',
                                                ...(col.bodyStyle || {}),
                                            }}
                                        />
                                    );
                                })}
                            </DataTable>
                        </div>

                        <div className="dt-dinamic-scroll" ref={scrollSyncRef}>
                            <div></div>
                        </div>
                    </>
                )}

                {customTooltip.visible && (
                    <div
                        className="custom-self-designed-tooltip"
                        style={{
                            left: `${customTooltip.x}px`,
                            top: `${customTooltip.y}px`,
                        }}
                    >
                        {customTooltip.text}
                    </div>
                )}
            </div>
        </>
    );
};

export default DatatableDinamic;

