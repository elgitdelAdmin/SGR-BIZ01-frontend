import React, { useEffect, useState, useRef } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import useUsuario from "../../hooks/useUsuario";
import ObtenerListaEmpresas from "../../service/EmpresaService";
import {
  excelFileToJSON,
  excelFileToJSONSheetName,
} from "../../helpers/helpers";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import { CargaUsuarios } from "../../service/UsuarioService";

const ImportarUsuarios = () => {
  const navigate = useNavigate();
  const { isLogged } = useUsuario();
  const toast = useRef(null);
  const [tituloPagina, setTituloPagina] = useState("Importar Usuarios");
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  const [listaEmpresa, setListaEmpresa] = useState(null);

  const [listaUsuario, setListaUsuario] = useState(null);
  useEffect(() => {
    const GetEmpresa = async () => {
      let jwt = window.localStorage.getItem("jwt");

      await ObtenerListaEmpresas({ jwt }).then((data) => {
        setListaEmpresa(data);
      });
    };
    if (!listaEmpresa) GetEmpresa();
  }, []);

  const handleUpload = (e) => {
    excelFileToJSONSheetName(e.files[0], "Usuarios", setListaUsuario);
    // excelFileToJSON(e.files[0]).then((result) => {
    //   //console.log(result)
    //   setListaUsuario(result);
    // });
    // var json = excelFileToJSON(e.files[0])
    // console.log(json)
  };

  const validateDocumento = (idTipoDocumento, documento) => {
    if (idTipoDocumento === 1) {
      const regex = /^\d+$/;
      if (!regex.test(documento) || !(documento.toString().length == 8)) {
        throw new Error(
          `Error de validación para el documento ${documento}: No cumple con el formato del tipo de documento.`
        );
      }
    } else if (idTipoDocumento === 2 || idTipoDocumento === 3) {
      const regex = /^[0-9a-zA-Z|-]+$/gi;
      if (!regex.test(documento) || !(documento.toString().length == 12)) {
        throw new Error(
          `Error de validación para el documento ${documento}: No cumple con el formato del tipo de documento.`
        );

      }
    }
    return true; // Si no hay reglas de validación específicas, se considera válido
  };

  const validateCorreo = (correo) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    
    if (!regex.test(correo)) {
      if (correo.trim() !== correo) {
        throw new Error(`Error de validación para el correo "${correo}": No debe contener espacios al principio o al final.`);
      }
      throw new Error(`Error de validación para el correo electrónico ${correo}: No es una dirección de correo válida.`);
    }
    return true;
  };
  const validateNombre = (nombre) => {
    const regex = /^[A-Za-z\s]+$/;
  
    if (!regex.test(nombre)) {
      throw new Error(`Error de validación para el nombre "${nombre}": Debe contener solo letras y espacios.`);
    }
    if (nombre.trim() !== nombre) {
      throw new Error(`Error de validación para el nombre "${nombre}": No debe contener espacios al principio o al final.`);
    }  
    return true; // Si no hay reglas de validación específicas, se considera válido
  };
  const validateTelefono = (telefono) => {
    const regex = /^(\+)?\d+$/;
  
    if (!regex.test(telefono)) {
      throw new Error(`Error de validación para el teléfono "${telefono}": Debe contener solo números o un signo + al inicio.`);
    }
    if (telefono.trim() !== telefono) {
      throw new Error(`Error de validación para el nombre "${telefono}": No debe contener espacios al principio o al final.`);
    }
    return true; // Si no hay reglas de validación específicas, se considera válido
  };
  const handleCargar = () => {
    if (empresaSeleccionada) {
      let json = [];
      try {
        if (listaUsuario && listaUsuario.length >0) {
          listaUsuario.forEach((obj, index) => {
           
            if (!obj.Tipo_documento) throw new Error(`Linea ${index +1}: Tipo_documento, cabecera incorrecta.`);
            if (!obj.Documento) throw new Error(`Linea ${index +1}: Documento, cabecera incorrecta.`);
            if (!obj.Nombres) throw new Error(`Linea ${index +1}: Nombres, cabecera incorrecta.`);
            validateNombre(obj.Nombres);
            if (!obj.Primer_apellido) throw new Error(`Linea ${index +1}: Primer_apellido, cabecera incorrecta.`);
            validateNombre(obj.Primer_apellido);
            if (!obj.Segundo_apellido) throw new Error(`Linea ${index +1}: Segundo_apellido, cabecera incorrecta.`);
            validateNombre(obj.Segundo_apellido);
            if (!obj.Correo) throw new Error(`Linea ${index +1}: Correo, cabecera incorrecta.`);
            validateCorreo(obj.Correo);
            if (!obj.Curso_ID) throw new Error(`Linea ${index +1}: Curso_ID, cabecera incorrecta.`);
            if (!obj.Telefono) throw new Error(`Linea ${index +1}: Telefono, cabecera incorrecta.`);
            validateDocumento(obj.Tipo_documento, obj.Documento);
            validateTelefono(obj.Telefono);
            if (isNaN(obj.Tipo_documento)) throw new Error(`Linea ${obj.Tipo_documento}: incorrecto, solo admite valores enteros.`);
            if (isNaN(obj.Curso_ID)) throw new Error(`Linea ${obj.Curso_ID}: incorrecto, solo admite valores enteros.`);

          });
          listaUsuario.map((item, i) => {
            json.push({
              Nombres: item.Nombres ? item.Nombres : "",
              PrimerApellido: item.Primer_apellido ? item.Primer_apellido : "",
              SegundoApellido: item.Segundo_apellido
                ? item.Segundo_apellido
                : "",
              Correo: item.Correo ? item.Correo : "",
              TipoDocumento: item.Tipo_documento ? item.Tipo_documento : null,
              Documento: item.Documento ? item.Documento : "",
              IDCurso: item.Curso_ID,
              Telefono: item.Telefono ? item.Telefono : "",
              IdEmpresa: empresaSeleccionada,
            });
          });
          console.log(JSON.stringify(json));
          let jsonCarga = JSON.stringify(json, null, 2);
          Cargar({ jsonCarga });
        }else{
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "No se existe lista de usuarios a importar",
            life: 17000,
          });
        }
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: error.message,
          life: 17000,
        });
      }
    } else {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Seleccione Empresa",
        life: 17000,
      });
      //formik.setSubmitting(false)
    }
  };

  const Cargar = ({ jsonCarga }) => {
    let jwt = window.localStorage.getItem("jwt");

    CargaUsuarios({ jsonCarga, jwt })
      .then((data) => {
        //formik.setSubmitting(false)
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Registro exitoso.",
          life: 7000,
        });

        setTimeout(() => {
          navigate("../Usuario");
        }, 3000);
      })
      .catch((errors) => {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: errors.message,
          life: 7000,
        });
        //alert(errors.message)
        //formik.setSubmitting(false)
      });
  };

  const handleClickDownload = (url, nombreArchivo) => {
    fetch(url).then((response) => {
      response.blob().then((blob) => {
        // Creating new object of PDF file
        const fileURL = window.URL.createObjectURL(blob);
        // Setting various property values
        let alink = document.createElement("a");
        alink.href = fileURL;
        alink.download = nombreArchivo;
        alink.click();
      });
    });
  };

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
        <div style={{ marginTop: 16, cursor: "pointer" }}>
          {/* <a href="#" onClick={()=>handleClickDownload("https://grplataformavirtual9128.blob.core.windows.net/adjuntos/PlantillasZegel/plantilla_carga_usuarios.xlsx","plantilla_carga_usuarios")}>Descargar plantilla</a> */}
          <a href="https://grplataformavirtual9128.blob.core.windows.net/adjuntos/PlantillasZegel/plantilla_carga_usuarios.xlsx">
            Descargar plantilla
          </a>
        </div>

        <div style={{ marginTop: 16 }}>
          <FileUpload
            name="excelUsuario"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            maxFileSize={1000000}
            emptyTemplate={
              <p className="m-0">Arrastra y suelta el archivo aquí.</p>
            }
            cancelLabel="Cancelar"
            chooseLabel="Seleccionar"
            uploadLabel="Cargar"
            customUpload={true}
            uploadHandler={() => handleCargar()}
            onSelect={(e) => handleUpload(e)}
            onRemove={() => setListaUsuario(false)}
            onClear={() => setListaUsuario(false)}
          />
        </div>
        {listaUsuario && (
          <DatatableDefault value={listaUsuario}>
            {/* <Column field="idPersona" header="ID" sortable></Column> */}
            <Column field="Nombres" header="Nombres" sortable></Column>
            <Column field="Primer_apellido" header="Primer apellido" sortable>
              {" "}
            </Column>
            <Column field="Segundo_apellido" header="Segundo apellido" sortable>
              {" "}
            </Column>
            <Column field="Correo" header="Correo" sortable>
              {" "}
            </Column>
            <Column field="Tipo_documento" header="Tipo documento" sortable>
              {" "}
            </Column>
            <Column field="Documento" header="Documento" sortable></Column>
            <Column field="Telefono" header="Telefono" sortable></Column>
            <Column field="Curso_ID" header="Curso ID" sortable></Column>
          </DatatableDefault>
        )}
      </div>
    </div>
  );
};

export default ImportarUsuarios;
