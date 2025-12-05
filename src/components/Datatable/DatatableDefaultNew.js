import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { generateExcel, generateExcelNew, handleCopyToClipboard } from '../../helpers/helpers';

const DatatableDefaultNew = (props) => {
  // const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
  // const paginatorRight = <Button type="button" icon="pi pi-download" text />;
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
    applyFiltersWithNewValue(_filters);
  };
  
  const onColumnFilterChange = (e, field) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters[field].value = value;
    setFilters(_filters);
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
        placeholder="Buscar..."
        className="p-column-filter"
        style={{ 
          width: '100%', 
          fontSize: '11px',
          padding: '0.25rem 0.5rem',
          minHeight: '28px'
        }}
      />
    );
  };
  
  const renderHeader = () => {
    return (
      <div className="flex justify-content-between align-items-center">
        <div className="flex gap-2">
          {/* {props.export && props.export === true && (
            <div className="flex gap-1">
              <Button
                type="button"
                icon="pi pi-file-excel"
                severity="success"
                rounded
                onClick={() => generateExcelNew(filteredData)}
                data-pr-tooltip="XLS"
              />
            </div>
          )}
          {props.showSearch !== false && (
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Búsqueda global..."
                style={{ width: '300px' }}
              />
            </span>
          )} */}
        </div>
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
        filterPlaceholder: `Buscar por ${child.props.header || child.props.field}`,
        style: { 
          width: child.props.style?.width,
          minWidth: child.props.style?.minWidth || '150px',
          ...child.props.style 
        },
        headerStyle: {
          padding: '0.5rem',
          whiteSpace: 'nowrap',
          ...child.props.headerStyle
        },
        bodyStyle: {
          padding: '0.5rem',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          verticalAlign: 'top',
          ...child.props.bodyStyle
        }
      });
    }
    return child;
  });
  
  return (
    <>
      <style>{`
        /* Estilos para los filtros de columna */
        .p-datatable .p-column-filter {
          width: 100% !important;
          max-width: 100%;
        }
        
        /* Ajustar el padding de las celdas de filtro */
        .p-datatable .p-column-filter-row > td {
          padding: 0.25rem !important;
        }
        
        /* Asegurar que el input no desborde */
        .p-datatable .p-column-filter-row .p-inputtext {
          box-sizing: border-box;
        }
        
        /* Ajustar altura de las filas de filtro */
        .p-datatable .p-column-filter-row {
          height: auto;
        }
        
        /* Permitir que el texto se ajuste en múltiples líneas */
        .p-datatable .p-datatable-tbody > tr > td {
          white-space: normal !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          vertical-align: top;
          padding: 0.5rem !important;
          font-size: 11px !important;
        }
        
        /* Mantener los headers en una sola línea */
        .p-datatable .p-datatable-thead > tr > th {
          white-space: nowrap;
          vertical-align: middle;
          font-size: 11px !important;
        }
        
        /* Forzar ancho automático de columnas */
        .p-datatable table {
          table-layout: auto !important;
          width: 100%;
        }
        
        /* Asegurar que cada celda respete su contenido */
        .p-datatable .p-datatable-tbody > tr > td {
          overflow: visible !important;
          max-width: none !important;
        }
        
        .p-datatable .p-datatable-thead > tr > th {
          overflow: visible !important;
          max-width: none !important;
        }
        
        /* Tamaño de fuente para el paginador */
        .p-paginator {
          font-size: 11px !important;
        }
        
        .p-paginator .p-paginator-pages .p-paginator-page,
        .p-paginator .p-paginator-first,
        .p-paginator .p-paginator-prev,
        .p-paginator .p-paginator-next,
        .p-paginator .p-paginator-last {
          font-size: 11px !important;
        }
        
        /* Hacer que el paginador quede fijo en la parte inferior */
        .p-datatable-wrapper {
          max-height: calc(100% - 60px);
          overflow: auto;
        }
        
        .p-paginator {
          position: sticky;
          bottom: 0;
          background: white;
          z-index: 1;
          border-top: 1px solid #dee2e6;
        }
      `}</style>
      
      <DataTable
        ref={dt}
        value={filteredData}
        paginator
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
        rows={props.rows || 10}
        rowsPerPageOptions={[10, 25, 50, 100]}
        dataKey="id"
        filters={filters}
        filterDisplay="row"
        loading={props.loading}
        globalFilterFields={props.children ? 
          React.Children.toArray(props.children)
            .filter(child => child?.props?.field)
            .map(child => child.props.field) 
          : []
        }
        header={header}
        emptyMessage="No se encontraron registros."
        // paginatorLeft={paginatorLeft}
        // paginatorRight={paginatorRight}
        stripedRows
        size="small"
        responsiveLayout="scroll"
        scrollable
        // scrollHeight="600px"
         scrollHeight="100%"
      >
        {enhancedChildren}
      </DataTable>
    </>
  );
};

export default DatatableDefaultNew;