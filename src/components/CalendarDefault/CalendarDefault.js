import React from 'react';
import { Calendar } from 'primereact/calendar';
import './CalendarDefault.scss';

const CalendarDefault = ({
    id,
    value,
    onChange,
    placeholder = 'dd/mm/aaaa',
    className = '',
    style,
    showIcon = true,
    dateFormat = 'dd/mm/yy',
    ...props
}) => {
    return (
        <Calendar
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`calendar-default-custom ${className}`}
            style={style}
            showIcon={showIcon}
            dateFormat={dateFormat}
            panelClassName="calendar-default-panel-custom"
            {...props}
        />
    );
};

export default CalendarDefault;
