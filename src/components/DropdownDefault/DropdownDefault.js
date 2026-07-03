import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import './DropdownDefault.scss';

const DropdownDefault = ({
    id,
    value,
    options,
    onChange,
    optionLabel = 'nombre',
    optionValue = 'id',
    placeholder = 'Seleccione...',
    className = '',
    style,
    ...props
}) => {
    return (
        <Dropdown
            id={id}
            value={value}
            options={options}
            onChange={onChange}
            optionLabel={optionLabel}
            optionValue={optionValue}
            placeholder={placeholder}
            className={`dropdown-default-custom ${className}`}
            style={style}
            panelClassName="dropdown-default-panel-custom"
            {...props}
        />
    );
};

export default DropdownDefault;
