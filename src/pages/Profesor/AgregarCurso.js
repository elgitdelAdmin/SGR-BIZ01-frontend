import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";
import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import Boton from "../../components/Boton/Boton";
import * as Yup from "yup";
import { Field,FieldArray, Formik ,useFormik,FormikProvider} from "formik";
import { Toast } from 'primereact/toast';
import useUsuario from "../../hooks/useUsuario";
import { ListarCursos} from "../../service/CursoService";

const AgregarCurso = () => {
    return ( 
        <></>
     );
}
 
export default AgregarCurso;