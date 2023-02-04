import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import "./InputDefault.scss"
import classNames from "classnames";

const InputDefault = ({id,type,placeholder,value,name,onChange,onBlur,className,errorClass,onclick,height,disabled})=>{
    const inputClassName = classNames("p-eva-inputDefault", {
        "white":className === "white" ? true:false,
        "grey" : className === "grey" ? true:false,
        "p-eva-error" : errorClass === "error" ? true:false,
        "p-eva-success" : errorClass === "success" ? true:false,
    });
    return (
        <InputText 
            id={id}
            type={type} 
            placeholder={placeholder} 
            className = {inputClassName}
            value = {value}
            name = {name}
            onChange = {onChange}
            onBlur = {onBlur}
            onClick = {onclick}
            style={{width:"100%",height:height}}
            disabled={disabled}
            />
        
    )
}
export default InputDefault;