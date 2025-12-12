import React, { useState, useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { generateExcel, generateExcelNew, handleCopyToClipboard } from '../../helpers/helpers';

const DatatableDefaultNew = (props) => {
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filteredData, setFilteredData] = useState(props.value || []);
  const scrollSyncRef = useRef(null);
  const tableWrapperRef = useRef(null);
  
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
  
  // Sincronizar scroll horizontal
  useEffect(() => {
    const tableWrapper = tableWrapperRef.current?.querySelector('.p-datatable-wrapper');
    const scrollSync = scrollSyncRef.current;
    
    if (!tableWrapper || !scrollSync) return;
    
    const syncScroll = () => {
      scrollSync.scrollLeft = tableWrapper.scrollLeft;
    };
    
    const syncScrollBack = () => {
      tableWrapper.scrollLeft = scrollSync.scrollLeft;
    };
    
    tableWrapper.addEventListener('scroll', syncScroll);
    scrollSync.addEventListener('scroll', syncScrollBack);
    
    // Ajustar ancho del contenido del scroll
    const updateScrollWidth = () => {
      const table = tableWrapper.querySelector('table');
      if (table && scrollSync.firstChild) {
        scrollSync.firstChild.style.width = `${table.offsetWidth}px`;
      }
    };
    
    updateScrollWidth();
    const resizeObserver = new ResizeObserver(updateScrollWidth);
    if (tableWrapper.querySelector('table')) {
      resizeObserver.observe(tableWrapper.querySelector('table'));
    }
    
    return () => {
      tableWrapper.removeEventListener('scroll', syncScroll);
      scrollSync.removeEventListener('scroll', syncScrollBack);
      resizeObserver.disconnect();
    };
  }, [filteredData]);
  
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
        .datatable-container-with-fixed-scroll {
          position: relative;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .datatable-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        
        .fixed-horizontal-scroll {
          position: sticky;
          bottom: 0;
          left: 0;
          right: 0;
          height: 17px;
          overflow-x: auto;
          overflow-y: hidden;
          background: white;
          border-top: 1px solid #dee2e6;
          z-index: 11;
        }
        
        .fixed-horizontal-scroll > div {
          height: 1px;
        }
        
        .fixed-horizontal-scroll::-webkit-scrollbar {
          height: 12px;
        }
        
        .fixed-horizontal-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        .fixed-horizontal-scroll::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 6px;
        }
        
        .fixed-horizontal-scroll::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        /* Estilos para los filtros de columna */
        .p-datatable .p-column-filter {
          width: 100% !important;
          max-width: 100%;
        }
        
        .p-datatable .p-column-filter-row > td {
          padding: 0.25rem !important;
        }
        
        .p-datatable .p-column-filter-row .p-inputtext {
          box-sizing: border-box;
        }
        
        .p-datatable .p-column-filter-row {
          height: auto;
        }
        
        .p-datatable .p-datatable-tbody > tr > td {
          white-space: normal !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          word-break: break-word !important;
          vertical-align: top;
          padding: 0.5rem !important;
          font-size: 11px !important;
        }
        
        .p-datatable .p-datatable-thead > tr > th {
          white-space: nowrap;
          vertical-align: middle;
          font-size: 11px !important;
        }
        
        .p-datatable table {
          table-layout: auto !important;
          width: 100%;
        }
        
        .p-datatable .p-datatable-tbody > tr > td {
          overflow: visible !important;
          max-width: none !important;
        }
        
        .p-datatable .p-datatable-thead > tr > th {
          overflow: visible !important;
          max-width: none !important;
        }
        
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
        
        .p-datatable-wrapper {
          overflow-x: hidden !important;
          overflow-y: auto;
        }
        
        .p-paginator {
          position: sticky;
          bottom: 0;
          background: white;
          z-index: 10;
          border-top: 1px solid #dee2e6;
        }
        
        .p-datatable {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .p-datatable .p-datatable-wrapper {
          flex: 1;
          min-height: 0;
        }
        
        .p-datatable-table {
          width: max-content;
          min-width: 100%;
        }
      `}</style>
      
      <div className="datatable-container-with-fixed-scroll">
        <div className="datatable-content" ref={tableWrapperRef}>
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
            stripedRows
            size="small"
            responsiveLayout="scroll"
            scrollable
            scrollHeight="100%"
          >
            {enhancedChildren}
          </DataTable>
        </div>
        
        <div className="fixed-horizontal-scroll" ref={scrollSyncRef}>
          <div></div>
        </div>
      </div>
    </>
  );
};

export default DatatableDefaultNew;
// import React, { useState, useRef, useEffect } from 'react';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { FilterMatchMode, FilterOperator } from 'primereact/api';
// import { InputText } from 'primereact/inputtext';
// import { Button } from 'primereact/button';
// import { generateExcel, generateExcelNew, handleCopyToClipboard } from '../../helpers/helpers';

// const DatatableDefaultNew = (props) => {
//   // const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
//   // const paginatorRight = <Button type="button" icon="pi pi-download" text />;
//   const [globalFilterValue, setGlobalFilterValue] = useState('');
//   const [filteredData, setFilteredData] = useState(props.value || []);
  
//   // Inicializar filtros para búsqueda global y por columna
//   const [filters, setFilters] = useState(() => {
//     const initialFilters = {
//       global: { value: null, matchMode: FilterMatchMode.CONTAINS }
//     };
    
//     // Agregar filtros para cada columna
//     if (props.children) {
//       const columns = Array.isArray(props.children) ? props.children : [props.children];
//       columns.forEach(col => {
//         if (col?.props?.field) {
//           initialFilters[col.props.field] = {
//             value: null,
//             matchMode: FilterMatchMode.CONTAINS
//           };
//         }
//       });
//     }
    
//     return initialFilters;
//   });
  
//   const dt = useRef(null);
  
//   // Actualizar filteredData cuando cambian los datos originales
//   useEffect(() => {
//     applyFilters(props.value || []);
//   }, [props.value]);
  
//   // Función para aplicar filtros manualmente
//   const applyFilters = (data) => {
//     let filtered = [...data];
    
//     // Aplicar filtro global
//     if (filters.global.value) {
//       const globalValue = filters.global.value.toLowerCase();
//       filtered = filtered.filter(item => {
//         return Object.values(item).some(val => 
//           val && val.toString().toLowerCase().includes(globalValue)
//         );
//       });
//     }
    
//     // Aplicar filtros por columna
//     Object.keys(filters).forEach(field => {
//       if (field !== 'global' && filters[field].value) {
//         const filterValue = filters[field].value.toLowerCase();
//         filtered = filtered.filter(item => {
//           const fieldValue = item[field];
//           return fieldValue && fieldValue.toString().toLowerCase().includes(filterValue);
//         });
//       }
//     });
    
//     setFilteredData(filtered);
//   };
  
//   const onGlobalFilterChange = (e) => {
//     const value = e.target.value;
//     let _filters = { ...filters };
//     _filters['global'].value = value;
//     setFilters(_filters);
//     setGlobalFilterValue(value);
//     applyFiltersWithNewValue(_filters);
//   };
  
//   const onColumnFilterChange = (e, field) => {
//     const value = e.target.value;
//     let _filters = { ...filters };
//     _filters[field].value = value;
//     setFilters(_filters);
//     applyFiltersWithNewValue(_filters);
//   };
  
//   const applyFiltersWithNewValue = (newFilters) => {
//     let filtered = [...(props.value || [])];
    
//     // Aplicar filtro global
//     if (newFilters.global.value) {
//       const globalValue = newFilters.global.value.toLowerCase();
//       filtered = filtered.filter(item => {
//         return Object.values(item).some(val => 
//           val && val.toString().toLowerCase().includes(globalValue)
//         );
//       });
//     }
    
//     // Aplicar filtros por columna
//     Object.keys(newFilters).forEach(field => {
//       if (field !== 'global' && newFilters[field].value) {
//         const filterValue = newFilters[field].value.toLowerCase();
//         filtered = filtered.filter(item => {
//           const fieldValue = item[field];
//           return fieldValue && fieldValue.toString().toLowerCase().includes(filterValue);
//         });
//       }
//     });
    
//     setFilteredData(filtered);
//   };
  
//   // Template para el filtro de cada columna
//   const columnFilterTemplate = (field) => {
//     return (
//       <InputText
//         value={filters[field]?.value || ''}
//         onChange={(e) => onColumnFilterChange(e, field)}
//         placeholder="Buscar..."
//         className="p-column-filter"
//         style={{ 
//           width: '100%', 
//           fontSize: '11px',
//           padding: '0.25rem 0.5rem',
//           minHeight: '28px'
//         }}
//       />
//     );
//   };
  
//   const renderHeader = () => {
//     return (
//       <div className="flex justify-content-between align-items-center">
//         <div className="flex gap-2">
//           {/* {props.export && props.export === true && (
//             <div className="flex gap-1">
//               <Button
//                 type="button"
//                 icon="pi pi-file-excel"
//                 severity="success"
//                 rounded
//                 onClick={() => generateExcelNew(filteredData)}
//                 data-pr-tooltip="XLS"
//               />
//             </div>
//           )}
//           {props.showSearch !== false && (
//             <span className="p-input-icon-left">
//               <i className="pi pi-search" />
//               <InputText
//                 value={globalFilterValue}
//                 onChange={onGlobalFilterChange}
//                 placeholder="Búsqueda global..."
//                 style={{ width: '300px' }}
//               />
//             </span>
//           )} */}
//         </div>
//       </div>
//     );
//   };
  
//   const header = renderHeader();
  
//   // Clonar children (columnas) y agregar filtros
//   const enhancedChildren = React.Children.map(props.children, (child) => {
//     if (child && child.props && child.props.field) {
//       return React.cloneElement(child, {
//         filter: true,
//         filterElement: columnFilterTemplate(child.props.field),
//         showFilterMenu: false,
//         filterPlaceholder: `Buscar por ${child.props.header || child.props.field}`,
//         style: { 
//           width: child.props.style?.width,
//           minWidth: child.props.style?.minWidth || '150px',
//           ...child.props.style 
//         },
//         headerStyle: {
//           padding: '0.5rem',
//           whiteSpace: 'nowrap',
//           ...child.props.headerStyle
//         },
//         bodyStyle: {
//           padding: '0.5rem',
//           whiteSpace: 'normal',
//           wordWrap: 'break-word',
//           verticalAlign: 'top',
//           ...child.props.bodyStyle
//         }
//       });
//     }
//     return child;
//   });
  
//   return (
//     <>
//       <style>{`
//         /* Estilos para los filtros de columna */
//         .p-datatable .p-column-filter {
//           width: 100% !important;
//           max-width: 100%;
//         }
        
//         /* Ajustar el padding de las celdas de filtro */
//         .p-datatable .p-column-filter-row > td {
//           padding: 0.25rem !important;
//         }
        
//         /* Asegurar que el input no desborde */
//         .p-datatable .p-column-filter-row .p-inputtext {
//           box-sizing: border-box;
//         }
        
//         /* Ajustar altura de las filas de filtro */
//         .p-datatable .p-column-filter-row {
//           height: auto;
//         }
        
//         /* Permitir que el texto se ajuste en múltiples líneas */
//         .p-datatable .p-datatable-tbody > tr > td {
//           white-space: normal !important;
//           word-wrap: break-word !important;
//           overflow-wrap: break-word !important;
//           word-break: break-word !important;
//           vertical-align: top;
//           padding: 0.5rem !important;
//           font-size: 11px !important;
//         }
        
//         /* Mantener los headers en una sola línea */
//         .p-datatable .p-datatable-thead > tr > th {
//           white-space: nowrap;
//           vertical-align: middle;
//           font-size: 11px !important;
//         }
        
//         /* Forzar ancho automático de columnas */
//         .p-datatable table {
//           table-layout: auto !important;
//           width: 100%;
//         }
        
//         /* Asegurar que cada celda respete su contenido */
//         .p-datatable .p-datatable-tbody > tr > td {
//           overflow: visible !important;
//           max-width: none !important;
//         }
        
//         .p-datatable .p-datatable-thead > tr > th {
//           overflow: visible !important;
//           max-width: none !important;
//         }
        
//         /* Tamaño de fuente para el paginador */
//         .p-paginator {
//           font-size: 11px !important;
//         }
        
//         .p-paginator .p-paginator-pages .p-paginator-page,
//         .p-paginator .p-paginator-first,
//         .p-paginator .p-paginator-prev,
//         .p-paginator .p-paginator-next,
//         .p-paginator .p-paginator-last {
//           font-size: 11px !important;
//         }
        
//         /* Hacer que el paginador quede fijo en la parte inferior */
//         .p-datatable-wrapper {
//           max-height: calc(100% - 60px);
//           overflow: auto;
//         }
        
//         .p-paginator {
//           position: sticky;
//           bottom: 0;
//           background: white;
//           z-index: 1;
//           border-top: 1px solid #dee2e6;
//         }
//       `}</style>
      
//       <DataTable
//         ref={dt}
//         value={filteredData}
//         paginator
//         paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
//         currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
//         rows={props.rows || 10}
//         rowsPerPageOptions={[10, 25, 50, 100]}
//         dataKey="id"
//         filters={filters}
//         filterDisplay="row"
//         loading={props.loading}
//         globalFilterFields={props.children ? 
//           React.Children.toArray(props.children)
//             .filter(child => child?.props?.field)
//             .map(child => child.props.field) 
//           : []
//         }
//         header={header}
//         emptyMessage="No se encontraron registros."
//         // paginatorLeft={paginatorLeft}
//         // paginatorRight={paginatorRight}
//         stripedRows
//         size="small"
//         responsiveLayout="scroll"
//         scrollable
//         // scrollHeight="600px"
//          scrollHeight="100%"
//       >
//         {enhancedChildren}
//       </DataTable>
//     </>
//   );
// };

// export default DatatableDefaultNew;