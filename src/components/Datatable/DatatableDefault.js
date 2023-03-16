import React, { useState,useRef,forwardRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import classNames from "classnames";
import { InputText } from 'primereact/inputtext';
const DatatableDefault = (props) => {
    const paginatorLeft = <button type="button" icon="pi pi-refresh" className="p-button-text" />;
    const paginatorRight = <button type="button" icon="pi pi-cloud" className="p-button-text" />;    
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-end">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Buscar..." />
                </span>
            </div>
        );
    };
    const header = renderHeader();

    return ( 
        <DataTable
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