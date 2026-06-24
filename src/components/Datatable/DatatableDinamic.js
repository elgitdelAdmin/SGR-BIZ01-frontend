import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
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
    onFilterChange,
    onSortChange,
    initialGlobalFilter = '',
    initialColumnFilters = {},
    ...rest
}) => {
    // ── Estado de paginación ──────────────────────────────────────────
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(rowsProp);

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
    const onGlobalChange = (e) => {
        const val = e.target.value;
        setGlobalFilterValue(val);
        if (serverSide && onFilterChange) {
            onFilterChange({ global: val, columns: columnFilters });
        }
    };

    const onColumnFilterChange = (field, val) => {
        const newFilters = { ...columnFilters, [field]: val };
        setColumnFilters(newFilters);
        if (serverSide && onFilterChange) {
            onFilterChange({ global: globalFilterValue, columns: newFilters });
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
      `}</style>

            <div className="dt-dinamic-container">
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
                        {actionBody && (
                            <Column
                                body={actionBody}
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

                            return (
                                <Column
                                    key={col.field || idx}
                                    field={col.field}
                                    header={col.header}
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

