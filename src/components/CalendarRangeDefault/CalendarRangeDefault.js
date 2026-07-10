import React from 'react';
import CalendarDefault from '../CalendarDefault/CalendarDefault';

const CalendarRangeDefault = ({
    value,
    onChange,
    placeholder = 'Seleccione fechas...',
    className = '',
    ...props
}) => {
    return (
        <CalendarDefault
            value={value}
            onChange={onChange}
            selectionMode="range"
            readOnlyInput
            placeholder={placeholder}
            showIcon
            className={className}
            {...props}
        />
    );
};

export default CalendarRangeDefault;
