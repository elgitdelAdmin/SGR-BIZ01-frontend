import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { generateExcel,generateExcelNew, handleCopyToClipboard } from '../../helpers/helpers';

const DatatableDefault = (props) => {
    const paginatorLeft = <button type="button" icon="pi pi-refresh" className="p-button-text" />;
    const paginatorRight = <button type="button" icon="pi pi-cloud" className="p-button-text" />;    
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filteredData, setFilteredData] = useState(props.value || []);
    
    // Inicializar filtros para búsqueda global y por columna
    const [filters, setFilters] = useState(() => {
        const initialFilters = {
            global: { value: null, matchMode: FilterMatchMode.CONTAINS }
        };
        
        // Agregar filtros para cada columna
        if (props.children) {
            const columns = Array.isArray(props.children) ? props.children : [props.children];
            columns.forEach(col => {
                if (col?.props?.field) {
                    initialFilters[col.props.field] = { 
                        value: null, 
                        matchMode: FilterMatchMode.CONTAINS 
                    };
                }
            });
        }
        
        return initialFilters;
    });
    
    const dt = useRef(null);

    // Actualizar filteredData cuando cambian los datos originales
    useEffect(() => {
        applyFilters(props.value || []);
    }, [props.value]);

    // Función para aplicar filtros manualmente
    const applyFilters = (data) => {
        let filtered = [...data];

        // Aplicar filtro global
        if (filters.global.value) {
            const globalValue = filters.global.value.toLowerCase();
            filtered = filtered.filter(item => {
                return Object.values(item).some(val => 
                    val && val.toString().toLowerCase().includes(globalValue)
                );
            });
        }

        // Aplicar filtros por columna
        Object.keys(filters).forEach(field => {
            if (field !== 'global' && filters[field].value) {
                const filterValue = filters[field].value.toLowerCase();
                filtered = filtered.filter(item => {
                    const fieldValue = item[field];
                    return fieldValue && fieldValue.toString().toLowerCase().includes(filterValue);
                });
            }
        });

        setFilteredData(filtered);
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
        
        // Aplicar filtros inmediatamente
        applyFiltersWithNewValue(_filters);
    };

    const onColumnFilterChange = (e, field) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters[field].value = value;
        setFilters(_filters);
        
        // Aplicar filtros inmediatamente
        applyFiltersWithNewValue(_filters);
    };

    const applyFiltersWithNewValue = (newFilters) => {
        let filtered = [...(props.value || [])];

        // Aplicar filtro global
        if (newFilters.global.value) {
            const globalValue = newFilters.global.value.toLowerCase();
            filtered = filtered.filter(item => {
                return Object.values(item).some(val => 
                    val && val.toString().toLowerCase().includes(globalValue)
                );
            });
        }

        // Aplicar filtros por columna
        Object.keys(newFilters).forEach(field => {
            if (field !== 'global' && newFilters[field].value) {
                const filterValue = newFilters[field].value.toLowerCase();
                filtered = filtered.filter(item => {
                    const fieldValue = item[field];
                    return fieldValue && fieldValue.toString().toLowerCase().includes(filterValue);
                });
            }
        });

        setFilteredData(filtered);
    };

    // Template para el filtro de cada columna
    const columnFilterTemplate = (field) => {
        return (
            <InputText
                value={filters[field]?.value || ''}
                onChange={(e) => onColumnFilterChange(e, field)}
                placeholder={`Buscar...`}
                className="p-column-filter"
                style={{ width: '100%', fontSize: '11px' }}
            />
        );
    };

    const renderHeader = () => {
        return (
            <div className='flex justify-content-between flex-wrap'>
                {
                    props.export && 
                    props.export == true && 
                    <div className='flex flex-wrap justify-content-center' style={{gap:8}}>
                        {/* <div className="flex">
                            <Button 
                                type="button" 
                                label='Copiar' 
                                icon="pi pi-copy" 
                                severity="success" 
                                onClick={()=>handleCopyToClipboard(dt)}
                            />
                        </div> */}
                        <div className="flex">
                            <Button 
                                type="button" 
                                label='Descargar'
                                icon="pi pi-file-excel"  
                                severity="success" 
                                // onClick={()=>generateExcel(dt)} 
                                onClick={() => generateExcelNew(filteredData)}

                                data-pr-tooltip="XLS" 
                            />
                        </div>
                    </div>
                }
                {props.showSearch !== false && (
                    <div className="flex justify-content-end">
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText 
                                value={globalFilterValue} 
                                onChange={onGlobalFilterChange} 
                                placeholder="Buscar en todo..." 
                            />
                        </span>
                    </div>
                )}
            </div>
        );
    };

    const header = renderHeader();

    // Clonar children (columnas) y agregar filtros
    const enhancedChildren = React.Children.map(props.children, (child) => {
        if (child && child.props && child.props.field) {
            return React.cloneElement(child, {
                filter: true,
                filterElement: columnFilterTemplate(child.props.field),
                showFilterMenu: false,
                filterPlaceholder: `Buscar por ${child.props.header || child.props.field}`
            });
        }
        return child;
    });

    return (
        <>
            <style>
                {`
                    /* Reducir tamaño de fuente */
                    .p-datatable {
                        font-size: 11px !important;
                    }

                    /* Limitar altura y permitir solo scroll vertical */
                    .p-datatable-scrollable-body {
                        max-height: 500px !important;
                        overflow-y: auto !important;
                        overflow-x: hidden !important;
                    }

                    /* Fijar el paginador en la parte inferior */
                    .p-paginator {
                        position: sticky;
                        bottom: 0;
                        background: white;
                        z-index: 20;
                        border-top: 1px solid #ddd;
                        box-shadow: 0 -2px 3px rgba(0,0,0,0.05);
                    }

                    /* Fijar el encabezado de la tabla */
                    .p-datatable-scrollable-header {
                        position: sticky;
                        top: 0;
                        z-index: 10;
                        background: white;
                    }

                    /* Estilo para los filtros de columna */
                    .p-column-filter {
                        padding: 0.3rem !important;
                        font-size: 11px !important;
                    }

                    /* Ajustar el header de filtros */
                    .p-datatable .p-datatable-thead > tr > th {
                        padding: 0.5rem !important;
                    }

                    .p-datatable .p-datatable-thead > tr:last-child > th {
                        padding: 0.3rem !important;
                    }
                `}
            </style>

            <DataTable
                ref={dt}
                header={header}
                value={filteredData}
                loading={props.loading}
                filterDisplay="row"
                size="small"
                stripedRows
                scrollable
                style={{ width: '100%', minWidth: '900px' }}
                paginator={props.paginator !== false}
                paginatorLeft={paginatorLeft}
                paginatorRight={paginatorRight}
                responsiveLayout="scroll"
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Desde {first} a {last} de {totalRecords}"
                rows={props.rows || 10}
                rowsPerPageOptions={[10, 25, 50, 100, 500]}
                totalRecords={filteredData.length}
            >
                {enhancedChildren}
            </DataTable>
        </>
    );
}
 
export default DatatableDefault;