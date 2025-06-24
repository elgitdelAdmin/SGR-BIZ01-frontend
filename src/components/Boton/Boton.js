import React from "react";
import "./Boton.scss";
import { Button } from "primereact/button";

const Boton = (props) => {
    return (
        <Button
            {...props}
            
            className={`btnEd ${props.color == "primary" && "btnEd-color-primary"} ${props.color == "secondary" && "btnEd-color-seconday"}`}
            
        >
        
        </Button>
    );
};

export default Boton;
