import React from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import './InputTextareaDefault.scss';

const InputTextareaDefault = ({
    id,
    value,
    onChange,
    placeholder = '',
    className = '',
    style,
    rows = 5,
    autoResize = true,
    ...props
}) => {
    return (
        <InputTextarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`input-textarea-default-custom ${className}`}
            style={style}
            rows={rows}
            autoResize={autoResize}
            {...props}
        />
    );
};

export default InputTextareaDefault;
