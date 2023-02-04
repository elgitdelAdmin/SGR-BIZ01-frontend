import React, { useState,useRef,useEffect } from 'react';
import 'primeicons/primeicons.css';
import { InputText } from 'primereact/inputtext';

import "./InputIcon.scss"
import classNames from "classnames";
import * as Iconsax from "iconsax-react";
const InputIcon = ({id,type,display,placeholder,value,name,onChange,onBlur,accept,onClickIcon,OnClickDelete,icon,className,errorClass,width,modo="default",reset=false,onkeyDown,height,disabled})=>{
    const aref = useRef(null)
    useEffect(()=>{
        aref.current.value = null;
    },[reset])
    const inputClassName = classNames("p-eva-inputIcon", {
        "white":className === "white" ? true:false,
        "grey" : className === "grey" ? true:false,
        "p-eva-inputIcon-error" : errorClass === "error" ? true:false,
        "p-eva-inputIcon-success" : errorClass === "success" ? true:false,
        "p-eva-inputSearch" : className ==="type-search" ? true:false
    });
    return (
        <span className="p-input-icon-right p-eva-input-icon-right" style={{width:"100%",display:display}}>
            <InputText 
                ref={aref}
                id={id}
                
                type={type} 
                placeholder={placeholder} 
                className = {inputClassName}
                value = {value}
                name = {name}
                onChange = {onChange}
                onBlur = {onBlur}
                accept = {accept}
                style={{width:width,boxShadow:"none",paddingRight:0,height:height}}
                onKeyDown={onkeyDown}
                disabled={disabled}
                // hidden = {hidden}
            />
            {/* {
                modo==="delete" ? 
                <i onClick={OnClickDelete} className="p-eva-input-iconDelete"><Iconsax.Add></Iconsax.Add></i>
                :
                // <i onClick={onClickIcon}>{icon}</i>
                // <i onClick={onClickIcon} className="pi pi-eye"></i>
            } */}
            
            
        </span>
        
        
    )
}
export default InputIcon;