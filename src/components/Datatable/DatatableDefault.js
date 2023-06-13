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
           
             
            <div className="flex justify-content-end">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Buscar..." />
                </span>
            </div>
        </div>
           
        
            
        );
    };
    const header = renderHeader();

    return ( 
        <DataTable
        ref={dt}
            {...props}
            filters={filters}
            header={header}
            size="small"
            stripedRows 
            paginator
            paginatorLeft={paginatorLeft}
            paginatorRight={paginatorRight}
            responsiveLayout="scroll"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Desde {first} a {last} of {totalRecords}"
            rows={10}
        ></DataTable>
     );
}
 
export default DatatableDefault;