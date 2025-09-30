import React, { useEffect, useState, useRef } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./CargaMasiva.scss"
import Boton from "../../components/Boton/Boton";

import * as Yup from "yup";
import { useFormik} from "formik";

import { Toast } from "primereact/toast";
import useUsuario from "../../hooks/useUsuario";
import { ConfirmDialog } from "primereact/confirmdialog"; 
import { ListarParametros,RegistrarTiket} from "../../service/TiketService";
const CargaMasiva = () => {
  const navigate = useNavigate();
  const [persona] = useState(null);

  const [tituloPagina] = useState("Carga Masiva");

  const [parametros, setParametro] = useState([]);
   const {permisos} = useUsuario();
    const permisosActual = permisos["/tickets"] || {
    divsOcultos: [],
    controlesBloqueados: [],
    divsBloqueados:[],
    controlesOcultos: []
    };

 useEffect(() => {
    const getParametro = async () => {
      await ListarParametros().then(data=>{setParametro(data)})
      };
    getParametro();
  }, []);


  const toast = useRef(null);

  const schema = Yup.object().shape({
      idTipoTicket: Yup.number().required("Tipo de ticket es obligatorio"),
      excelFile: Yup.mixed(),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      idTipoTicket: persona ? persona.idTipoTicket : null,
      excelFile: null,
    },
    validationSchema: schema,
        onSubmit: (values) => {
            const formData = new FormData();
            formData.append("idTipoTicket", values.idTipoTicket);
            console.log("values.excelFile",values.excelFile)
            if (values.excelFile) {
                formData.append("excelFile", values.excelFile, values.excelFile.name);
            }
            Registrar({ formData });
        },
  });
  useEffect(() => {
    if (formik.submitCount > 0) {
        console.log("Errores actuales:", formik.errors);
    }
    }, [formik.submitCount]);



  const Registrar = ({ formData }) => {
    RegistrarTiket({ formData})
      .then((res) => {
        formik.setSubmitting(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Registro exitoso.",
          life: 7000,
        });
           console.log("res",res)
       })
      .catch((errors) => {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: errors.message,
          life: 7000,
        });
        formik.setSubmitting(false);
      });
  };

  return (
    <div className="zv-editarUsuario" style={{ paddingTop: 16 }}>
      <ConfirmDialog />
      <Toast ref={toast} position="top-center"></Toast>
      <div className="header">
        <span style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
          <Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft>
        </span>
      </div>
      <div className="header-titulo" style={{ marginTop: 16 }}>
        {tituloPagina}
      </div>
      <div className="zv-editarUsuario-body" style={{ marginTop: 16 }}>
        <form onSubmit={formik.handleSubmit}>
          <div className="p-fluid formgrid grid">   
              <div className="field col-12 md:col-6">
              <label className="label-form">Tipo</label>
               <DropdownDefault
                type="text"
                id="idTipoTicket"
                name="idTipoTicket"
                placeholder="Seleccione"
                value={formik.values.idTipoTicket}
                onChange={(e) => {
                  formik.setFieldValue("idTipoTicket", "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                // options={tipotiket}
                 options={parametros?.filter((item) => item.tipoParametro === "TipoCargaMasiva")}
                optionLabel="nombre"
                optionValue="id"
                disabled={permisosActual.controlesBloqueados.includes("cboTipo")}

              />
              <small className="p-error">
                {formik.touched.idTipoTicket && formik.errors.idTipoTicket}
              </small>
              </div>
            

              <div className="field col-12 md:col-6">
                <label className="label-form">Subir archivo Excel</label>
                <div className="custom-file-upload">
                    <label htmlFor="excelFile" className="upload-label">
                    {formik.values.excelFile
                        ? "Archivo cargado correctamente"
                        : "Seleccionar archivo Excel"}
                    </label>
                    <input
                    type="file"
                    id="excelFile"
                    name="excelFile"
                    accept=".xls,.xlsx"
                    onChange={(event) => {
                        const file = event.currentTarget.files[0];
                        if (file) {
                        formik.setFieldValue("excelFile", file);
                        } else {
                        formik.setFieldValue("excelFile", null);
                        }
                    }}
                    disabled={permisosActual.controlesBloqueados.includes("fileArchivo")}
                    onBlur={formik.handleBlur}
                    className="hidden-input"
                    />
                </div>
                <small className="p-error">
                    {formik.touched.excelFile && formik.errors.excelFile}
                </small>
              </div>

             
            </div>
           <div className="zv-editarUsuario-footer">
           <Boton
              label="Cargar"
              style={{ fontSize: 12 }}
              color="primary"
              type="submit"
              loading={formik.isSubmitting}
            ></Boton>
           </div> 
        </form>
      </div>
    </div>
  );
};

export default CargaMasiva;
