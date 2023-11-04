import React, { useEffect, useState, useRef } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import * as Iconsax from "iconsax-react";
import { TabView, TabPanel } from "primereact/tabview";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import {ObtenerIntentosEvaluacionPersonaCurso} from "../../service/CursoService.js"
import { formatDate } from "../../helpers/helpers";

const UsuarioIntentos = () => {
    const navigate = useNavigate();
    let { IdPersonaCurso } = useParams();
    const [listaCursos, setListaCursos] = useState(null);
    const [loadingCurso, setLoadingCurso] = useState(true);
    const [IntentosEvaluacionPersonaCurso,setIntentosEvaluacionPersonaCurso]=useState(null);

    useEffect(() => {
        const getIntentosEvaluacionPersonaCurso = async () => {
          let jwt = window.localStorage.getItem("jwt");
          let id=IdPersonaCurso
          await ObtenerIntentosEvaluacionPersonaCurso({ jwt,id }).then((data) => {
            setIntentosEvaluacionPersonaCurso(data);
            setLoadingCurso(false)
          });
        };
        getIntentosEvaluacionPersonaCurso();
      }, [IdPersonaCurso]);


      const dateBodyTemplate = (rowData) => {
        return rowData.fechaNotaIntento1 ? formatDate(new Date(rowData.fechaNotaIntento1)) : "";
      };
      const dateBodyTemplate2 = (rowData) => {
        return rowData.fechaNotaIntento2 ? formatDate(new Date(rowData.fechaNotaIntento2)) : "";
      };
      
    return (<div className="zv-editarUsuario" style={{ paddingTop: 16 }}>

        <div className="header">
            <span style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
                <Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft>
            </span>
        </div>
        <div className="header-titulo" style={{ marginTop: 16 }}>
            Intentos de evaluación
        </div>
        <div className="zv-cursoPrograma" style={{ marginTop: 24 }}>
            <DatatableDefault value={IntentosEvaluacionPersonaCurso} loading={loadingCurso}>
                <Column
                    field="idUnidad"
                    header="ID"
                    sortable
                ></Column>
                <Column
                    field="descripcion"
                    header="Unidad"
                    sortable
                ></Column>
                <Column
                    field="notaIntento1"
                    header="Nota 1° intento"
                    sortable
                ></Column>
                <Column
                    field="fechaNotaIntento1"
                    header="Fecha 1° intento"
                    body={dateBodyTemplate}
                    sortable
                ></Column>
                <Column
                    field="notaIntento2"
                    header="Nota 2° intento"
                    sortable
                ></Column>
                <Column
                    field="fechaNotaIntento2"
                    header="Fecha 2° intento"
                    body={dateBodyTemplate2}
                    sortable
                ></Column>
            </DatatableDefault>
        </div>
    </div>);

};


export default UsuarioIntentos;
