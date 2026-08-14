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
    pulse = false,
    ...props
}) => {
    return (
        <InputText
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`input-text-default-custom ${pulse ? 'pulse-combo' : ''} ${className}`}
            style={style}
            {...props}
        />
    );
};

export default InputTextDefault;
