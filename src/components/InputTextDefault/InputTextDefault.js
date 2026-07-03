import React from 'react';
import { InputText } from 'primereact/inputtext';
import './InputTextDefault.scss';

const InputTextDefault = ({
    id,
    value,
    onChange,
    placeholder = '',
    className = '',
    style,
    ...props
}) => {
    return (
        <InputText
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`input-text-default-custom ${className}`}
            style={style}
            {...props}
        />
    );
};

export default InputTextDefault;
