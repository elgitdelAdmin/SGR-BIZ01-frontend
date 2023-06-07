import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import AWS from "aws-sdk";
import Boton from "../../components/Boton/Boton";
import * as Iconsax from "iconsax-react";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "rsuite-table";

import { useNavigate } from "react-router-dom";
import {
  accessKeyId,
  secretAccessKey,
  endpoint,
  bucketZegel,
} from "../../constants/constantes";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { fetchDirectoriesAll } from "../../service/DigitalOceansService";
const DirectorioArchivos = () => {
    const navigate = useNavigate();
    const [listairectorios, setListairectorios] = useState(null);
  
  useEffect(() => {
    fetchDirectoriesAll("/",setListairectorios);
  }, []);
 
  const acciones = (rowData) => {
    return (
      <div className="profesor-datatable-accion">
        <div className="accion-editar">
          <span>
            <Iconsax.Edit color="#ffffff" />
          </span>
        </div>
        <div
          className="accion-eliminar"
          onClick={() => {
            //confirmCurso(rowData.idCurso)
          }}
        >
          <span>
            <Iconsax.Trash color="#ffffff" />
          </span>
        </div>
      </div>
    );
  };

  const bodyNombre = (rowData) => {
    return(
        <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div>
                <FontAwesomeIcon icon={faFolderOpen} size="x"/>
            </div>
            <div>
                <a href={window.location.href+"/"+rowData.nombre}> {rowData.nombre}</a>
                {/* <span>{rowData.nombre}</span> */}
            </div>
        </div>
    )
  }

  return (
    <div className="zv-carga_archivos" style={{ paddingTop: 16 }}>
      <div className="header-titulo">Directorios</div>
      <div className="zv-carga-archivos-body">
        <div style={{ display: "flex", justifyContent: "end" }}>
          <Boton
            label="Nueva carpeta"
            style={{ fontSize: 12 }}
            color="primary"
            type="submit"
          ></Boton>
        </div>
        <div>
          <DatatableDefault
            value={listairectorios}
            //loading={loading}
          >
            <Column field="nombre" header="Nombre" body={bodyNombre} sortable></Column>

            <Column
              body={acciones}
              style={{ display: "flex", justifyContent: "center" }}
              header="Acciones"
            ></Column>
          </DatatableDefault>
        </div>
      </div>
    </div>
  );
};

export default DirectorioArchivos;
