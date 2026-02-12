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
    ...rest
}) => {
    // ── Estado de paginación ──────────────────────────────────────────
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(rowsProp);

    // ── Filtros ───────────────────────────────────────────────────────
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [columnFilters, setColumnFilters] = useState({});
    const [filteredData, setFilteredData] = useState(value);

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
            }));
        }
        // Extraer de children
        if (children) {
            return React.Children.toArray(children)
                .filter((c) => c?.props?.field)
                .map((c) => ({
                    field: c.props.field,
                    header: c.props.header,
                    body: c.props.body || null,
                    sortable: c.props.sortable !== false,
                    width: c.props.style?.width || c.props.style?.minWidth || null,
                    headerStyle: c.props.headerStyle,
                    bodyStyle: c.props.bodyStyle,
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

    // ── Obtener valor anidado (soporta "empresa.razonSocial") ─────────
    const getFieldValue = useCallback((obj, field) => {
        return field.split('.').reduce((acc, part) => acc && acc[part], obj);
    }, []);

    // ── Aplicar filtros locales ───────────────────────────────────────
    useEffect(() => {
        if (serverSide) {
            setFilteredData(value);
            return;
        }

        let data = [...value];

        // Filtro global
        if (globalFilterValue) {
            const gv = globalFilterValue.toLowerCase();
            data = data.filter((item) =>
                Object.values(item).some((val) => val && val.toString().toLowerCase().includes(gv))
            );
        }

        // Filtros por columna
        Object.entries(columnFilters).forEach(([field, val]) => {
            if (val) {
                const fv = val.toLowerCase();
                data = data.filter((item) => {
                    const fieldVal = getFieldValue(item, field);
                    return fieldVal != null && fieldVal.toString().toLowerCase().includes(fv);
                });
            }
        });

        setFilteredData(data);
        setFirst(0);
    }, [value, globalFilterValue, columnFilters, serverSide, getFieldValue]);

    // ── Eventos de paginación ─────────────────────────────────────────
    const handlePage = (e) => {
        setFirst(e.first);
        setRows(e.rows);
        if (serverSide && onPageChange) {
            onPageChange(Math.floor(e.first / e.rows), e.rows);
        }
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
    }, [filteredData]);

    // ── Handlers de filtros ───────────────────────────────────────────
    const onGlobalChange = (e) => setGlobalFilterValue(e.target.value);

    const onColumnFilterChange = (field, val) => {
        setColumnFilters((prev) => ({ ...prev, [field]: val }));
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
        generateExcelNew(serverSide ? value : filteredData, colsInfo);
    };

    // ── Header ────────────────────────────────────────────────────────
    const renderHeader = () => (
        <div className="flex justify-content-between flex-wrap">
            <div className="flex flex-wrap justify-content-center" style={{ gap: 8 }}>
                {exportable && (
                    <Button
                        type="button"
                        label="Descargar"
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
    const totalRecords = serverSide ? (totalRecordsProp || 0) : filteredData.length;

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
      `}</style>

            <div className="dt-dinamic-container">
                <div className="dt-dinamic-content" ref={tableWrapperRef}>
                    <DataTable
                        ref={dt}
                        value={serverSide ? value : filteredData}
                        lazy={serverSide}
                        paginator
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                        first={first}
                        rows={rows}
                        totalRecords={totalRecords}
                        rowsPerPageOptions={[10, 25, 50, 100]}
                        onPage={handlePage}
                        dataKey={dataKey}
                        filters={primeFilters}
                        filterDisplay="row"
                        loading={loading}
                        globalFilterFields={resolvedColumns.map((c) => c.field)}
                        header={renderHeader()}
                        emptyMessage={emptyMessage}
                        stripedRows
                        size="small"
                        responsiveLayout="scroll"
                        scrollable
                        scrollHeight="100%"
                        {...rest}
                    >
                        {resolvedColumns.map((col, idx) => (
                            <Column
                                key={col.field || idx}
                                field={col.field}
                                header={col.header}
                                body={col.body}
                                sortable={col.sortable}
                                filter
                                filterElement={columnFilterTemplate(col.field)}
                                showFilterMenu={false}
                                filterPlaceholder={`Buscar por ${col.header || col.field}`}
                                style={{
                                    width: col.width || undefined,
                                    minWidth: col.width || '120px',
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
                                    verticalAlign: 'top',
                                    ...(col.bodyStyle || {}),
                                }}
                            />
                        ))}
                    </DataTable>
                </div>

                <div className="dt-dinamic-scroll" ref={scrollSyncRef}>
                    <div></div>
                </div>
            </div>
        </>
    );
};

export default DatatableDinamic;
