import React from "react";
import { Calendar } from "primereact/calendar";

/**
 * Calendar conectado a Formik vía setFieldValue.
 * Guarda en Formik un string local ISO-like: YYYY-MM-DDTHH:mm:ss.SSS (sin timezone)
 */
const CalendarFormik = ({
  name,
  value,
  setFieldValue,
  minDate = null,

  showTime = true,
  hourFormat = "24",
  stepMinute = 1,
  showSeconds = false,
  dateFormat = "dd/mm/yy",
  touchUI = false,
  keepInvalid = true,

  disabled = false,
  ...rest
}) => {
  const parsedValue = value ? new Date(value) : null;

  const pad = (n, z = 2) => n.toString().padStart(z, "0");

  const toLocalString = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(
      d.getMilliseconds(),
      3
    )}`;

  return (
    <Calendar
      value={parsedValue}
      onChange={(e) => {
        if (e.value instanceof Date && !isNaN(e.value)) {
          setFieldValue(name, toLocalString(e.value));
          return;
        }
        if (e.value === null) {
          setFieldValue(name, null);
        }
      }}
      showTime={showTime}
      hourFormat={hourFormat}
      stepMinute={stepMinute}
      showSeconds={showSeconds}
      minDate={minDate}
      dateFormat={dateFormat}
      touchUI={touchUI}
      keepInvalid={keepInvalid}
      disabled={disabled}
      {...rest}
    />
  );
};

export default CalendarFormik;