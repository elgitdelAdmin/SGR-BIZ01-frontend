import React from 'react';
import { MultiSelect } from 'primereact/multiselect';
import './MultiSelectDefault.scss';

const MultiSelectDefault = ({
    id,
    value,
    options,
    onChange,
    optionLabel = 'nombre',
    optionValue = 'id',
    placeholder = 'Seleccione...',
    filter = true,
    display = 'chip',
    className = '',
    style,
    ...props
}) => {
    return (
        <MultiSelect
            id={id}
            value={value}
            options={options}
            onChange={onChange}
            optionLabel={optionLabel}
            optionValue={optionValue}
            placeholder={placeholder}
            filter={filter}
            display={display}
            className={`ms-default-custom ${className}`}
            style={style}
            panelClassName="ms-default-panel-custom"
            {...props}
        />
    );
};

export default MultiSelectDefault;
