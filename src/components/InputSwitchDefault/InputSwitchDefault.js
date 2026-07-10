import React from 'react';
import { InputSwitch } from 'primereact/inputswitch';

const InputSwitchDefault = ({
    id,
    name,
    checked,
    onChange,
    disabled = false,
    labelOn = 'Habilitado',
    labelOff = 'Deshabilitado',
    style,
    className = '',
    ...props
}) => {
    return (
        <div 
            className={`input-switch-default-custom ${className}`} 
            style={{ display: "flex", alignItems: "center", height: "42px", ...style }}
        >
            <InputSwitch
                id={id}
                name={name}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                {...props}
            />
            <span style={{ marginLeft: "10px", fontWeight: 500 }}>
                {checked ? labelOn : labelOff}
            </span>
        </div>
    );
};

export default InputSwitchDefault;
