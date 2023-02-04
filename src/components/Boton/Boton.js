import React from "react";
import "./Boton.scss";
import { Button } from "primereact/button";

const Boton = ({ nombre, color = "primary", widths = "10%", heights = "40px", metodoClick, type = "button" ,disabled,displayButton="",loading=false,icon ="",margin=8}) => {
    return (
        <Button
            onClick={(e) => {
                metodoClick && metodoClick(e);
            }}
            style={{ width: widths, height: heights ,display:displayButton,margin:margin}}
            type={type}
            className={`btnEd ${color == "primary" && "btnEd-color-primary"} ${color == "secondary" && "btnEd-color-seconday"}`}
            disabled = {disabled}
            loading = {loading}
            label={nombre}
            icon = {icon}
            iconPos = "right"
            
        >
        
        </Button>
    );
};

export default Boton;
