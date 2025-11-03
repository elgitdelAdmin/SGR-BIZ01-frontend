import React, { useState,useRef,forwardRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import classNames from "classnames";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { generateExcel, handleCopyToClipboard } from '../../helpers/helpers';
const DatatableDefault = (props) => {
    const paginatorLeft = <button type="button" icon="pi pi-refresh" className="p-button-text" />;
    const paginatorRight = <button type="button" icon="pi pi-cloud" className="p-button-text" />;    
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const dt = useRef(null);
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
        <div className='flex justify-content-between flex-wrap'>
            {
                props.export && 
                props.export == true && 
                <div  className='flex  flex-wrapjustify-content-center' style={{gap:8}}>
                    <div className="flex">
                        <Button type="button" label='Copiar' icon="pi pi-copy" severity="success" onClick={()=>handleCopyToClipboard(dt)}/>
                    </div>
                    <div className="flex ">
                        <Button type="button" label='Descargar'icon="pi pi-file-excel"  severity="success" onClick={()=>generateExcel(dt)} data-pr-tooltip="XLS" />
                    </div>
                </div>
            }
            {props.showSearch !== false && (
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
//         <DataTable
//         ref={dt}
//             header={header}
//             {...props}
//             filters={filters}
            
//             size="small"
//             stripedRows 
//             paginator={props.paginator !== false}
//             paginatorLeft={paginatorLeft}
//             paginatorRight={paginatorRight}
//             responsiveLayout="scroll"
//             paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
//             currentPageReportTemplate="Desde {first} a {last} of {totalRecords}"
//             rows={10}
//         >
// {/* 
// <DataTable
//   ref={dt}
//   header={header}
//   {...props}
//   scrollable
//   scrollHeight="600px"
//   style={{ width: '100%', minWidth: '1200px' }}
//   filters={filters}
//   size="small"
//   stripedRows
//   paginator={props.paginator !== false}
//   paginatorLeft={paginatorLeft}
//   paginatorRight={paginatorRight}
//   responsiveLayout="scroll"
//   paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
//   currentPageReportTemplate="Desde {first} a {last} of {totalRecords}"
//   rows={10}
// > */}
//         </DataTable>

 <>
            <style>
                {`
                .p-datatable {
                    font-size: 12px !important; /* 🔸 Fuente más pequeña */
                }

                /* 🔹 Mantener visible el scroll horizontal */
                .p-datatable-wrapper {
                    overflow-x: auto !important;
                    position: sticky;
                    bottom: 0;
                    background: white;
                    z-index: 10;
                }
                `}
            </style>

            <DataTable
                ref={dt}
                header={header}
                {...props}
                filters={filters}
                size="small"
                stripedRows
                paginator={props.paginator !== false}
                paginatorLeft={paginatorLeft}
                paginatorRight={paginatorRight}
                responsiveLayout="scroll"
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="Desde {first} a {last} de {totalRecords}"
                rows={10}
            ></DataTable>
        </>
     );
}
 
export default DatatableDefault;