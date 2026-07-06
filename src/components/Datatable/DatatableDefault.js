import React, { useState,useRef,forwardRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import classNames from "classnames";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { generateExcel, handleCopyToClipboard } from '../../helpers/helpers';
const DatatableDefault = ({ export: exportProp, showSearch, paginator, ...restProps }) => {
    const paginatorLeft = <button type="button" icon="pi pi-refresh" className="p-button-text" />;
    const paginatorRight = <button type="button" icon="pi pi-cloud" className="p-button-text" />;    
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const dt = useRef(null);
    const onGlobalFilterChange = (e) => {
      console.log("e.target.value")
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        if (!exportProp && showSearch === false) return null;
        return (
        <div className='flex justify-content-between flex-wrap'>
            {
                exportProp && 
                exportProp == true && 
                <div  className='flex  flex-wrapjustify-content-center' style={{gap:8}}>
                    <div className="flex">
                        <Button type="button" label='Copiar' icon="pi pi-copy" severity="success" onClick={()=>handleCopyToClipboard(dt)}/>
                    </div>
                    <div className="flex ">
                        <Button type="button" label='Descargar'icon="pi pi-file-excel"  severity="success" onClick={()=>generateExcel(dt)} data-pr-tooltip="XLS" />
                    </div>
                </div>
            }
            {showSearch !== false && (
                <div className="flex justify-content-end">
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Buscar..." />
                    </span>
                </div>
            )}
             
        </div>
        );
    };
    const header = renderHeader();

    return ( 
<>
  <style>
    {`
      /* 🔹 Reducir tamaño de fuente */
      .p-datatable {
        font-size: 11px !important;
      }

      /* 🔹 Limitar altura y permitir solo scroll vertical */
      .p-datatable-scrollable-body {
        max-height: 500px !important; /* ajusta si quieres más alto */
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }

      /* 🔹 Fijar el paginador (parte inferior) en pantalla */
      .p-paginator {
        position: sticky;
        bottom: 0;
        background: white;
        z-index: 20;
        border-top: 1px solid #ddd;
        box-shadow: 0 -2px 3px rgba(0,0,0,0.05);
      }

      /* 🔹 Fijar el encabezado de la tabla (opcional, queda bonito) */
      .p-datatable-scrollable-header {
        position: sticky;
        top: 0;
        z-index: 10;
        background: white;
      }
    `}
  </style>

  <DataTable
    ref={dt}
    header={header}
    {...restProps}
    filters={filters}
    size="small"
    stripedRows
    scrollable
    // scrollHeight="500px"     // ← Scroll vertical
    style={{ width: '100%', minWidth: '900px' }}
    paginator={paginator !== false}
    paginatorLeft={paginatorLeft}
    paginatorRight={paginatorRight}
    responsiveLayout="scroll"
    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
    currentPageReportTemplate="Desde {first} a {last} de {totalRecords}"
    rows={10}
  />
</>

     );
}
 
export default DatatableDefault;
