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
import { CreateDirectory, fetchDirectoriesAll } from "../../service/DigitalOceansService";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
const DirectorioArchivos = () => {
  const toast = useRef(null);
    const navigate = useNavigate();
    const [listairectorios, setListairectorios] = useState(null);
    const [visibleDialogCrearCarpeta, setVisibleDialogCrearCarpeta] = useState(false);
    const [nombreCarpetaNueva, setNombreCarpetaNueva] = useState(null);
    const [buttonDisableCrearCarpeta,setbuttonDisableCrearCarpeta] = useState(false);

  const listarDirectoriosPrincipales = ()=>{
    fetchDirectoriesAll("/",setListairectorios);
  }

  useEffect(() => {
    listarDirectoriosPrincipales()
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
  const handleCrearDirectorio=()=>{
    setbuttonDisableCrearCarpeta(true);
    if(nombreCarpetaNueva)
    {
      CreateDirectory("",nombreCarpetaNueva).then(data =>{
        setbuttonDisableCrearCarpeta(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail:`Carpeta ${nombreCarpetaNueva} creada exitosamente.`,
          life: 7000,
        });
        setVisibleDialogCrearCarpeta(false)
        setNombreCarpetaNueva(null)
        listarDirectoriosPrincipales();
      }).catch(res=>{
        setbuttonDisableCrearCarpeta(false);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: res,
          life: 7000,
        });
      })
    }
    else{
      setbuttonDisableCrearCarpeta(false);
    }
  }
  const footerContentCrear = (
    <div>
        <Boton label="cancelar" color="secondary" onClick={() => setVisibleDialogCrearCarpeta(false)}/>
        <Boton label="Crear"  color="primary" disabled = {buttonDisableCrearCarpeta} onClick={handleCrearDirectorio}/>
    </div>
  );
  return (
    <div className="zv-carga_archivos" style={{ paddingTop: 16 }}>
  <Toast ref={toast} position="top-center"></Toast>
      <div className="header-titulo">Directorios</div>
      <div className="zv-carga-archivos-body">
        <div style={{ display: "flex", justifyContent: "end" }}>
          <Boton
            label="Nueva carpeta"
            style={{ fontSize: 12 }}
            color="primary"
            type="submit"
            onClick={()=>setVisibleDialogCrearCarpeta(true)}
          ></Boton>
        </div>
        <div>
          <DatatableDefault
            value={listairectorios}
            //loading={loading}
          >
            <Column field="nombre" header="Nombre" body={bodyNombre} sortable></Column>

            {/* <Column
              body={acciones}
              style={{ display: "flex", justifyContent: "center" }}
              header="Acciones"
            ></Column> */}
          </DatatableDefault>
        </div>
      </div>
      <Dialog header="Crear directorio" footer={footerContentCrear} visible={visibleDialogCrearCarpeta} style={{ width: '40vw',height:'40vh' }} onHide={() => setVisibleDialogCrearCarpeta(false)}>
        <div className="flex flex-column gap-2">
        <label htmlFor="nombreCarpeta">Nombre</label>
        <InputText id="nombreCarpeta"value={nombreCarpetaNueva} onChange={(e)=>setNombreCarpetaNueva(e.target.value)}></InputText>
        </div>
        
      </Dialog>
    </div>
  );
};

export default DirectorioArchivos;
