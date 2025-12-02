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
import { ListarParametros} from "../../service/TiketService";
import { RegistrarCargaMasiva} from "../../service/CargaMasiva";



import * as XLSX from "xlsx";
const CargaMasiva = () => {
  const navigate = useNavigate();
  const [persona] = useState(null);
  const idUser = localStorage.getItem("idUser");
  const codRol = localStorage.getItem("codRol");
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
      TipoCarga: Yup.number().required("Tipo de varga es obligatorio"),
      excelFile: Yup.mixed(),
  });

    const formik = useFormik({
      enableReinitialize: true,
      initialValues: {
        TipoCarga: persona ? persona.TipoCarga : null,
        excelFile: null,
      },
      validationSchema: schema,
      onSubmit: (values) => {
        const formData = new FormData();

        const tipoSeleccionado = parametros.find(
          (p) => p.id === values.TipoCarga
        );

        if (!tipoSeleccionado) {
          toast.current.show({
            severity: "warn",
            summary: "Atención",
            detail: "Debe seleccionar un tipo de carga válido.",
            life: 7000,
          });
          return;
        }

        formData.append("TipoCarga", tipoSeleccionado.codigo);

        if (values.excelFile) {
              console.log("values.excelFile",values.excelFile)
          formData.append("excel", values.excelFile, values.excelFile.name);
        }

        console.log("📦 Datos a enviar:");
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
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
    RegistrarCargaMasiva({ formData})
      .then((res) => {
        formik.setSubmitting(false);
        toast.current.show({
          severity: "success",
          summary: "Éxito",
          detail: "Registro exitoso.",
          life: 7000,
        });
           console.log("res",res)
        formik.resetForm(); 
         document.getElementById("excelFile").value = ""; 
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
                id="TipoCarga"
                name="TipoCarga"
                placeholder="Seleccione"
                value={formik.values.TipoCarga}
                onChange={(e) => {
                  formik.setFieldValue("TipoCarga", "");
                  formik.handleChange(e);
                }}
                onBlur={formik.handleBlur}
                // options={tipotiket}
                 options={parametros?.filter((item) => 
                     item.tipoParametro === "TipoCargaMasiva" &&
                     (codRol==="ADMIN" ||item.valor2.split(',').includes(String(idUser)))
                    //  (codRol==="ADMIN" || Number(item.valor2) === Number(idUser))

                    )}
                optionLabel="nombre"
                optionValue="id"

              />
              <small className="p-error">
                {formik.touched.TipoCarga && formik.errors.TipoCarga}
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
                 
                    {/* <input
                      type="file"
                      id="excelFile"
                      name="excelFile"
                      accept=".xls,.xlsx"
                      onChange={async (event) => {
                        const file = event.currentTarget.files[0];
                        if (!file) {
                          formik.setFieldValue("excelFile", null);
                          return;
                        }

                        try {
                          const data = await file.arrayBuffer();
                          const workbook = XLSX.read(data, { type: "array" });
                          const sheetName = workbook.SheetNames[0];
                          const sheet = workbook.Sheets[sheetName];

                          // Obtener la primera fila (encabezados)
                          const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] || [];

                          //  Parsear el valor1 del parámetro seleccionado
                          const tipoSeleccionado = parametros.find(
                            (p) => p.id === formik.values.TipoCarga
                          );
                          const columnasRequeridas = tipoSeleccionado
                            ? JSON.parse(tipoSeleccionado.valor1)
                            : [];
                            const normalizar = (texto) =>
                                    texto
                                      ?.toString()
                                      .normalize("NFD") // separa tildes
                                      .replace(/[\u0300-\u036f]/g, "") // elimina tildes
                                      .replace(/\s+/g, "") // quita espacios
                                      .toLowerCase(); // convierte a minúsculas
                             // 🔹 Normalizar encabezados y columnas requeridas
                            const headersNormalizados = headers.map(normalizar);
                            const requeridasNormalizadas = columnasRequeridas.map(normalizar);

                            // 🔹 Verificar columnas faltantes sin importar tildes, espacios o mayúsculas
                            const faltantes = columnasRequeridas.filter(
                              (col) => !headersNormalizados.includes(normalizar(col))
                            );


                          if (faltantes.length > 0) {
                            toast.current.show({
                              severity: "warn",
                              summary: "Campos faltantes",
                              detail: `El archivo Excel no contiene las siguientes columnas requeridas: ${faltantes.join(
                                ", "
                              )}`,
                              life: 9000,
                            });
                            formik.setFieldValue("excelFile", null); // No guardar archivo si no pasa validación
                          } else {
                            formik.setFieldValue("excelFile", file);
                            toast.current.show({
                              severity: "success",
                              summary: "Archivo válido",
                              detail: "El archivo contiene todas las columnas requeridas.",
                              life: 4000,
                            });
                          }
                        } catch (error) {
                          console.error("Error al leer el archivo Excel:", error);
                          toast.current.show({
                            severity: "error",
                            summary: "Error",
                            detail: "No se pudo leer el archivo Excel.",
                            life: 7000,
                          });
                        }
                      }}
                      disabled={permisosActual.controlesBloqueados.includes("fileArchivo")}
                      onBlur={formik.handleBlur}
                      className="hidden-input"
                    /> */}
                    <input
                      type="file"
                      id="excelFile"
                      name="excelFile"
                      accept=".xls,.xlsx"
                      onChange={async (event) => {
                        const file = event.currentTarget.files[0];
                        if (!file) {
                          formik.setFieldValue("excelFile", null);
                          return;
                        }

                        try {
                          const data = await file.arrayBuffer();
                          const workbook = XLSX.read(data, { type: "array" });
                          const sheetName = workbook.SheetNames[0];
                          const sheet = workbook.Sheets[sheetName];

                          // 🔹 Leer encabezados y filas
                          const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

                          if (rows.length === 0) {
                            toast.current.show({
                              severity: "warn",
                              summary: "Archivo vacío",
                              detail: "El archivo Excel no contiene datos.",
                              life: 6000,
                            });
                            formik.setFieldValue("excelFile", null);
                            return;
                          }

                          // 🔹 Determinar la cantidad real de filas según la columna más completa
                          const conteoPorColumna = {};
                          Object.keys(rows[0]).forEach((col) => (conteoPorColumna[col] = 0));

                          rows.forEach((row) => {
                            Object.entries(row).forEach(([col, valor]) => {
                              if (String(valor).trim() !== "") conteoPorColumna[col]++;
                            });
                          });

                          // Encontrar la columna con más datos
                          const columnaPrincipal = Object.entries(conteoPorColumna).reduce(
                            (a, b) => (b[1] > a[1] ? b : a),
                            ["", 0]
                          );

                          const totalFilasValidas = columnaPrincipal[1];

                          // 🔹 Cortar filas que estén después del último dato válido
                          const filasLimpias = rows.slice(0, totalFilasValidas);

                          const headers = Object.keys(filasLimpias[0] || {});

                          // 🔹 Obtener columnas requeridas según tipo de carga
                          const tipoSeleccionado = parametros.find(
                            (p) => p.id === formik.values.TipoCarga
                          );
                          const columnasRequeridas = tipoSeleccionado
                            ? JSON.parse(tipoSeleccionado.valor1)
                            : [];

                          // 🔹 Normalizar texto
                          const normalizar = (texto) =>
                            texto
                              ?.toString()
                              .normalize("NFD")
                              .replace(/[\u0300-\u036f]/g, "")
                              .replace(/\s+/g, "")
                              .toLowerCase();

                          const headersNormalizados = headers.map(normalizar);

                          // 🔹 Verificar columnas faltantes
                          const faltantes = columnasRequeridas.filter(
                            (col) => !headersNormalizados.includes(normalizar(col))
                          );

                          if (faltantes.length > 0) {
                            toast.current.show({
                              severity: "warn",
                              summary: "Campos faltantes",
                              detail: `El archivo Excel no contiene las siguientes columnas requeridas: ${faltantes.join(
                                ", "
                              )}`,
                              life: 9000,
                            });
                            formik.setFieldValue("excelFile", null);
                            return;
                          }

                          // 🔹 Verificar celdas vacías en columnas requeridas
                          const errores = [];
                          filasLimpias.forEach((row, index) => {
                            columnasRequeridas.forEach((col) => {
                              const valor = row[col];
                              if (String(valor).trim() === "") {
                                errores.push(`Fila ${index + 2}: Falta completar "${col}"`);
                              }
                            });
                          });

                          if (errores.length > 0) {
                            toast.current.show({
                              severity: "error",
                              summary: "Campos vacíos",
                              detail: `Se encontraron celdas vacías:\n${errores
                                .slice(0, 10)
                                .join("\n")} ${
                                errores.length > 10
                                  ? `\n... y ${errores.length - 10} más`
                                  : ""
                              }`,
                              life: 12000,
                            });
                            formik.setFieldValue("excelFile", null);
                            return;
                          }

                          // ✅ Todo correcto
                          formik.setFieldValue("excelFile", file);
                          toast.current.show({
                            severity: "success",
                            summary: "Archivo válido",
                            detail: `Archivo correcto — ${totalFilasValidas} filas válidas detectadas.`,
                            life: 4000,
                          });
                        } catch (error) {
                          console.error("Error al leer el archivo Excel:", error);
                          toast.current.show({
                            severity: "error",
                            summary: "Error",
                            detail: "No se pudo leer el archivo Excel.",
                            life: 7000,
                          });
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
           {/* <Boton
              label="Cargar"
              style={{ fontSize: 12 }}
              color="primary"
              type="submit"
              loading={formik.isSubmitting}
            ></Boton> */}
            <Boton
              label="Cargar"
              style={{ fontSize: 12 }}
              color="primary"
              type="submit"
              loading={formik.isSubmitting}
              disabled={
                !formik.values.TipoCarga || 
                !formik.values.excelFile    
              }
            />

           </div> 
        </form>
      </div>
    </div>
  );
};

export default CargaMasiva;
