import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import useUsuario from "../../hooks/useUsuario";
import ObtenerListaEmpresas from "../../service/EmpresaService";
import { excelFileToJSON } from "../../helpers/helpers";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";


const ImportarUsuarios = () => {
    const navigate = useNavigate();
    const {isLogged} = useUsuario()
    const toast = useRef(null);
    const [tituloPagina, setTituloPagina] = useState("Importar Usuarios");
    const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
    const [listaEmpresa, setListaEmpresa] = useState(null);


    const [listaUsuario, setListaUsuario] = useState(null);
    useEffect(()=>{
        const GetEmpresa = async ()=>
        {
            let jwt = window.localStorage.getItem("jwt");

            await ObtenerListaEmpresas({jwt}).then(data=>{
                setListaEmpresa(data);
            })
        }
        if(!listaEmpresa)GetEmpresa();
        
    },[])

    const handleUpload = (e)=>{
      excelFileToJSON(e.files[0]).then((result) => {
        //console.log(result)
        setListaUsuario(result)
    });
      // var json = excelFileToJSON(e.files[0])
      // console.log(json)
    }
    return (
      <div className="zv-importarUsuario" style={{ paddingTop: 16 }}>
        <Toast ref={toast} position="top-center"></Toast>
        <div className="header-titulo" style={{ marginTop: 16 }}>
          {tituloPagina}
        </div>
        <div className="zv-importarUsuario-body" style={{ marginTop: 16 }}>
          <DropdownDefault
            value={empresaSeleccionada}
            onChange={(e) => {
              setEmpresaSeleccionada(e.value);
            }}
            options={listaEmpresa}
            optionLabel="razonSocial"
            optionValue="idEmpresa"
            placeholder="Seleccione empresa"
            style={{ width: "50%" }}
          ></DropdownDefault>
            <div style={{ marginTop: 16 }}>
              <FileUpload name="excelUsuario" 
                  
                  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  maxFileSize={1000000} 
                  emptyTemplate={<p className="m-0">Arrastra y suelta el archivo aquí.</p>} 
                  cancelLabel="Cancelar"
                  chooseLabel="Seleccionar"
                  uploadLabel="Cargar"
                  customUpload={true}
                  // uploadHandler={(e)=>handleUpload(e)}
                  onSelect={(e)=>handleUpload(e)}
                  onRemove={()=>setListaUsuario(false)}
                  onClear={()=>setListaUsuario(false)}
              />
            </div>
            {
              listaUsuario && 
              <DatatableDefault value={listaUsuario} 
              >
                  <Column field="idPersona" header="ID" sortable></Column>
                  <Column field="Nombres" header="Nombres" sortable></Column>
                  <Column field="Apellidos" header="Apellidos"sortable> </Column>
                  <Column field="Correo" header="Correo"sortable> </Column>
                  <Column field="DNI" header="DNI" sortable></Column>
                  <Column field="Curso ID" header="Curso ID" sortable></Column>
                  
              </DatatableDefault>
            }
            
        </div>
      </div>
    );
}
 
export default ImportarUsuarios;