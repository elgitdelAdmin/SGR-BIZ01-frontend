import React from 'react';
import { InputText } from 'primereact/inputtext';
import './InputHorasDefault.scss';

const InputHorasDefault = ({
    id,
    value,
    onChange,
    placeholder = 'Ej: 2.50 (2h 50m)',
    className = '',
    style,
    ...props
}) => {
    const handleChange = (e) => {
        const val = e.target.value;
        // Permite vacío, hasta 3 dígitos enteros, opcionalmente un punto decimal y hasta 2 decimales con minutos entre 00 y 59 (max 999.59)
        const regex = /^(?:\d{0,3}|\d{1,3}\.|\d{1,3}\.[0-5]|\d{1,3}\.[0-5]\d)$/;
        if (regex.test(val)) {
            if (onChange) {
                onChange(e);
            }
        }
    };

    return (
        <InputText
            id={id}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={`input-horas-default-custom ${className}`}
            style={style}
            {...props}
        />
    );
};

export default InputHorasDefault;
