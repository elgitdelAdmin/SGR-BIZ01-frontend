import React from 'react';
import { InputText } from 'primereact/inputtext';
import './InputHorasDefault.scss';

const InputHorasDefault = ({
    id,
    value,
    onChange,
    placeholder = 'Ej: 2:30 (2h 30m)',
    className = '',
    style,
    ...props
}) => {
    const handleChange = (e) => {
        let val = e.target.value;
        // Reemplazar punto por dos puntos para facilidad del usuario
        val = val.replace('.', ':');
        
        // Expresión regular que valida formato HH:MM con minutos entre 00 y 59
        const regex = /^(?:\d{0,3}|\d{1,3}:|\d{1,3}:[0-5]|\d{1,3}:[0-5]\d)$/;
        if (regex.test(val)) {
            e.target.value = val;
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
