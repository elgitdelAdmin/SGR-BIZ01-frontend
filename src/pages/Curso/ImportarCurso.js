import React, { useEffect, useState, useRef } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import useUsuario from "../../hooks/useUsuario";
import {
  convertirTiempoDecimal,
  excelFileToJSON,
  excelFileToJSONSheet,
  excelFileToJSONSheetName,
} from "../../helpers/helpers";
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import { TabPanel, TabView } from "primereact/tabview";
import ImportarUsuarios from "../Usuario/ImportarUsuarios";
import { ImportarCursos } from "../../service/CursoService";
import { Loader } from "rsuite";

const ImportarCurso = () => {
  const navigate = useNavigate();
  const { isLogged } = useUsuario();
  const toast = useRef(null);
  const [tituloPagina, setTituloPagina] = useState("Importar cursos");
  const [listaCurso, setListaCurso] = useState();
  const [listaDiseñador, setListaDiseñador] = useState();
  const [listaBibliografia, setListaBibliografia] = useState();
  const [listaUnidad, setListaUnidad] = useState();
  const [listaLeccion, setListaLeccion] = useState();
  const [listaMaterial, setListaMaterial] = useState();
  const [listaEvaluacion, setListaEvaluacion] = useState();

  const [loading, setLoading] = useState(false);

  const handleUpload = (e) => {
    excelFileToJSONSheetName(e.files[0], "Curso", setListaCurso);
    excelFileToJSONSheetName(e.files[0], "Diseñador", setListaDiseñador);
    excelFileToJSONSheetName(e.files[0], "Bibliografía", setListaBibliografia);
    excelFileToJSONSheetName(e.files[0], "Unidades", setListaUnidad);
    excelFileToJSONSheetName(e.files[0], "Lecciones", setListaLeccion);
    excelFileToJSONSheetName(e.files[0], "Materiales", setListaMaterial);
    excelFileToJSONSheetName(e.files[0], "Evaluaciones", setListaEvaluacion);
  };

  const Importar = ({ jsonImportar }) => {
    let jwt = window.localStorage.getItem("jwt");
    ImportarCursos({ jsonImportar, jwt })
      .then((data) => {
        setLoading(false);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Curso importado exitosamente.",
          life: 7000,
        });
        setTimeout(() => {
          navigate(-1);
        }, 3000);
      })
      .catch((errors) => {
        setLoading(false);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: errors.message,
          life: 7000,
        });
      });
  };

  const handleCargar = () => {
    setLoading(true);
    try {
      let ListaCurso = [];
      let ListaBibliografia = [];
      let ListaCategoria = [];
      let ListaDiseñador = [];
      let ListaEvaluacion = [];
      let ListaLeccion = [];
      let ListaMaterial = [];
      let ListaPregunta = [];
      let ListaUnidad = [];

      if (listaCurso.length == 0) {
        throw new Error("No existen datos de cursos");
        return;
      }
      if (listaDiseñador.length == 0) {
        throw new Error("No existen datos de Diseñador");
        return;
      }
      if (listaUnidad.length == 0) {
        throw new Error("No existen datos de unidades");
        return;
      }
      if (listaLeccion.length == 0) {
        throw new Error("No existen datos de lección");
        return;
      }
      if (listaMaterial.length == 0) {
        throw new Error("No existen datos de materiales");
        return;
      }
      if (listaEvaluacion.length == 0) {
        throw new Error("No existen datos de evaluaciones");
        return;
      }
      listaCurso.map((item, index) => {
        ListaCurso.push({
          Tipo: item.TIPO_CURSO,
          Nombre: item.NOMBRE,
          Descripcion: item.DESCRIPCION,
          Logros: item.LOGRO,
          Duracion: item.DURACION,
          VideoIntroduccion: item.VIDEO_INTRODUCCION,
          IntroduccionDuracion: item.DURACION_INTRODUCCION,
        });
      });

      listaDiseñador.map((item, index) => {
        ListaDiseñador.push({
          Nombre: item.NOMBRE,
          Ocupacion: item.CARRERA,
          Descripcion: item.DESCRIPCION,
          Avatar: item.AVATAR,
        });
      });

      listaBibliografia.map((item, index) => {
        ListaBibliografia.push({
          Categoria: item.CATEGORIA,
          Nombre: item.NOMBRE,
          Link: item.LINK,
        });
      });

      listaUnidad.map((item, index) => {
        ListaUnidad.push({
          Numero: item.NUMERO,
          Nombre: item.NOMBRE,
          Duracion: item.DURACION,
          Logro: item.LOGRO,
          ArchivosDescargables: item.ARCHIVOS_DESCARGABLES,
        });
      });

      listaLeccion.map((item, index) => {
        ListaLeccion.push({
          NroUnidad: item.NUMERO_UNIDAD,
          NroLeccion: item.NUMERO_LECCION,
          Nombre: item.NOMBRE,
          URLVideo: item.VIDEO_AUD,
          Duracion: item.DURACION_TOTAL_LECCION,
        });
      });
      listaMaterial.map((item, index) => {
        ListaMaterial.push({
          NroUnidad: item.NUMERO_UNIDAD,
          NroLeccion: item.NUMERO_LECCION,
          Nombre: item.NOMBRE,
          Url: item.URL_TED,
        });
      });
      listaEvaluacion.map((item, index) => {
        ListaEvaluacion.push({
          NroUnidad: item.NUMERO_UNIDAD,
          NroPregunta: item.NUMERO_PREGUNTA,
          Pregunta: item.PREGUNTA,
          RecursoPregunta: item.RECURSO_REGUNTA,
          TipoRecursoPregunta: item.TIPO_RECURSO_PREGUNTA,
          TipoPregunta: item.TIPO_PREGUNTA,
          Respuesta: item.RESPUESTA,
          Opcion1: item.OPCION_1,
          Opcion2: item.OPCION_2,
          Opcion3: item.OPCION_3,
          Opcion4: item.OPCION_4,
          Opcion5: item.OPCION_5,
          OpcionCorrecta: item.OPCION_CORRECTA,
          ImagenOpcion1: item.IMAGEN_OPCION_1,
          ImagenOpcion2: item.IMAGEN_OPCION_2,
          ImagenOpcion3: item.IMAGEN_OPCION_3,
          ImagenOpcion4: item.IMAGEN_OPCION_4,
          ImagenOpcion5: item.IMAGEN_OPCION_5,
          Fuente: item.FUENTE,
          LinkMaterial: item.LINK_MATERIAL,
        });
      });

      let jsonImportar = JSON.stringify(
        {
          ListaCurso,
          ListaDiseñador,
          ListaBibliografia,
          ListaUnidad,
          ListaLeccion,
          ListaMaterial,
          ListaEvaluacion,
        },
        null,
        2
      );
      Importar({ jsonImportar });
    } catch (errors) {
      setLoading(false);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: errors.message,
        life: 7000,
      });
    }
  };

  const horaTemplate = (rowData) => {
    return rowData.DURACION_INTRODUCCION
      ? convertirTiempoDecimal(rowData.DURACION_INTRODUCCION)
      : "";
  };
  const DuracionTotalTemplate = (rowData) => {
    return rowData.DURACION_TOTAL_LECCION
      ? convertirTiempoDecimal(rowData.DURACION_TOTAL_LECCION)
      : "";
  };

  const handleLimpiar = () => {
    setListaCurso(null);
    setListaDiseñador(null);
    setListaBibliografia(null);
    setListaUnidad(null);
    setListaLeccion(null);
    setListaMaterial(null);
    setListaEvaluacion(null);
  };
  return (
    <div className="zv-importarCursos" style={{ paddingTop: 16 }}>
      {loading && <Loader center size="lg" content="Cargando" />}
      <Toast ref={toast} position="top-center"></Toast>

      <div className="header-titulo" style={{ marginTop: 16 }}>
        {tituloPagina}
      </div>
      <div className="zv-importarCursos-body" style={{ marginTop: 16 }}>
        <div style={{ marginTop: 16, cursor: "pointer" }}>
          {/* <a href="#" onClick={()=>handleClickDownload("https://grplataformavirtual9128.blob.core.windows.net/adjuntos/PlantillasZegel/plantilla_carga_usuarios.xlsx","plantilla_carga_usuarios")}>Descargar plantilla</a> */}
          <a href="https://grplataformavirtual9128.blob.core.windows.net/adjuntos/PlantillasZegel/FORMATO_IMPORTAR_CURSOS.xlsx">
            Descargar plantilla
          </a>
        </div>
        <div style={{ marginTop: 16 }}>
          <FileUpload
            name="excelCurso"
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
            onRemove={handleLimpiar}
            onClear={handleLimpiar}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <TabView>
            <TabPanel header="Curso">
              <DatatableDefault value={listaCurso}>
                <Column field="TIPO_CURSO" header="Tipo Curso"></Column>
                <Column field="NOMBRE" header="Nombre"></Column>
                <Column field="DESCRIPCION" header="Descripción"></Column>
                <Column field="LOGRO" header="Logro"></Column>
                <Column field="DURACION" header="Duración Horas"></Column>
                <Column
                  field="VIDEO_INTRODUCCION"
                  header="Video Introducción"
                ></Column>
                <Column
                  field="DURACION_INTRODUCCION"
                  header="Duración Introducción min."
                  dataType="date"
                  body={horaTemplate}
                ></Column>
              </DatatableDefault>
            </TabPanel>
            <TabPanel header="Diseñador">
              <DatatableDefault value={listaDiseñador}>
                <Column field="NOMBRE" header="Nombre"></Column>
                <Column field="CARRERA" header="Carrera"></Column>
                <Column field="DESCRIPCION" header="Descripción"></Column>
                <Column field="AVATAR" header="Avatar(opcional)"></Column>
              </DatatableDefault>
            </TabPanel>
            <TabPanel header="Bibliografía">
              <DatatableDefault value={listaBibliografia}>
                <Column field="CATEGORIA" header="Categoría"></Column>
                <Column field="NOMBRE" header="Nombre"></Column>
                <Column field="LINK" header="Link"></Column>
              </DatatableDefault>
            </TabPanel>
            <TabPanel header="Unidades">
              <DatatableDefault value={listaUnidad}>
                <Column field="NUMERO" header="Número"></Column>
                <Column field="NOMBRE" header="Nombre"></Column>
                <Column field="DURACION" header="Duración"></Column>
                <Column
                  field="LOGRO"
                  header="Logro (DC + COMERCIAL - SEO)"
                ></Column>
                <Column
                  field="ARCHIVOS_DESCARGABLES"
                  header="Archivos Descargables"
                ></Column>
              </DatatableDefault>
            </TabPanel>
            <TabPanel header="Lecciones">
              <DatatableDefault value={listaLeccion}>
                <Column field="NUMERO_UNIDAD" header="Número Unidad"></Column>
                <Column field="NUMERO_LECCION" header="Número Lección"></Column>
                <Column field="NOMBRE" header="Nombre"></Column>
                <Column field="VIDEO_AUD" header="Video (AUD)"></Column>
                <Column
                  field="DURACION_TOTAL_LECCION"
                  header="Duracion total de lección EN MINUTOS (aud + DC)"
                  dataType="date"
                  body={DuracionTotalTemplate}
                ></Column>
              </DatatableDefault>
            </TabPanel>
            <TabPanel header="Materiales">
              <DatatableDefault value={listaMaterial}>
                <Column field="NUMERO_UNIDAD" header="Número Unidad"></Column>
                <Column field="NUMERO_LECCION" header="Número Lección"></Column>
                <Column field="NOMBRE" header="Nombre"></Column>
                <Column field="URL_TED" header="url (TED)"></Column>
              </DatatableDefault>
            </TabPanel>
            <TabPanel header="Evaluaciones">
              <DatatableDefault value={listaEvaluacion}>
                <Column field="NUMERO_UNIDAD" header="Número unidad"></Column>
                <Column
                  field="NUMERO_PREGUNTA"
                  header="Número pregunta"
                ></Column>
                <Column
                  field="PREGUNTA"
                  header="Pregunta"
                  style={{ width: 150 }}
                ></Column>
                <Column
                  field="RECURSO_REGUNTA"
                  header="Recurso pregunta"
                ></Column>
                <Column
                  field="TIPO_RECURSO_PREGUNTA"
                  header="Tipo recurso pregunta"
                ></Column>
                <Column field="TIPO_PREGUNTA" header="Tipo pregunta"></Column>
                <Column field="RESPUESTA" header="Respuesta"></Column>
                <Column field="OPCION_1" header="Opción 1"></Column>
                <Column field="OPCION_2" header="Opción 2"></Column>
                <Column field="OPCION_3" header="Opción 3"></Column>
                <Column field="OPCION_4" header="Opción 4"></Column>
                <Column field="OPCION_5" header="Opción 5"></Column>
                <Column
                  field="OPCION_CORRECTA"
                  header="Opción correcta"
                ></Column>
                <Column
                  field="IMAGEN_OPCION_1"
                  header="Imagen opción 1"
                ></Column>
                <Column
                  field="IMAGEN_OPCION_2"
                  header="Imagen opción 2"
                ></Column>
                <Column
                  field="IMAGEN_OPCION_3"
                  header="Imagen opción 3"
                ></Column>
                <Column
                  field="IMAGEN_OPCION_4"
                  header="Imagen opción 4"
                ></Column>
                <Column
                  field="IMAGEN_OPCION_5"
                  header="Imagen opción 5"
                ></Column>
                <Column
                  field="FUENTE"
                  header="Fuente"
                  style={{ width: 250 }}
                ></Column>
                <Column
                  field="LINK_MATERIAL"
                  header="Link"
                  style={{ width: 250 }}
                ></Column>
              </DatatableDefault>
            </TabPanel>
          </TabView>
        </div>
      </div>
    </div>
  );
};

export default ImportarCurso;
