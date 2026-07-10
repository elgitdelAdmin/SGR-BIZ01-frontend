import React from 'react';
import { Checkbox } from 'primereact/checkbox';
import './CheckboxDefault.scss';

const CheckboxDefault = ({
    id,
    inputId,
    name,
    checked,
    onChange,
    disabled = false,
    label = '',
    className = '',
    style,
    ...props
}) => {
    return (
        <div 
            className={`checkbox-default-custom flex align-items-center ${className}`}
            style={{ display: 'flex', alignItems: 'center', ...style }}
        >
            <Checkbox
                id={id}
                inputId={inputId || id}
                name={name}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                {...props}
            />
            {label && (
                <label 
                    htmlFor={inputId || id} 
                    className="checkbox-default-label"
                    style={{ 
                        marginLeft: '8px', 
                        cursor: 'pointer', 
                        userSelect: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#2e4878' // Navy de marca
                    }}
                >
                    {label}
                </label>
            )}
        </div>
    );
};

export default CheckboxDefault;
