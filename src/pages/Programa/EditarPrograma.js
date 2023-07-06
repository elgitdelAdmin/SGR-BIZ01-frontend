import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";

import { Toast } from 'primereact/toast';
import { InputTextarea } from "primereact/inputtextarea";

import { Field,FieldArray, Formik ,useFormik,FormikProvider} from "formik";
import * as Yup from "yup";

import { getBase64, handleSoloLetrastest } from "../../helpers/helpers";
import * as constantes from "../../constants/constantes.js";

import useUsuario from "../../hooks/useUsuario";
import { Loader } from 'rsuite';

import { BuscarProgramaID ,RegistrarPrograma,ActualizarPrograma} from "../../service/ProgramaService";

import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method

import { ListarCursos } from "../../service/CursoService";
import { InputNumber } from "primereact/inputnumber";
import { handleSoloLetrasNumeros } from "../../helpers/helpers";
import { handleSoloLetras } from "../../helpers/helpers";

import {Uploader} from "rsuite"
import {uploadFiles} from "../../service/DigitalOceansService";

const EditarPrograma = () => {
    const navigate = useNavigate();
    const [programa, setPrograma] = useState(null);
    const [cursos, setCursos] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [tituloPagina, setTituloPagina] = useState("Crear Programa");
    let { id } = useParams();
    const toast = useRef(null);
    const {isLogged} = useUsuario()

    const [fileList, setFileList] = useState([]);
    const [defaultFile, setDefaultFile] = useState([]);

    const [fileListBanner, setFileListBanner] = useState([]);
    const [defaultFileBanner, setDefaultFileBanner] = useState([]);

    useEffect(()=>{
        !isLogged && navigate("/");
    },[])

    useEffect(()=>{
        const getCursos= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            await ListarCursos({jwt}).then(data=>{
                let temp = data.filter(x=>x.idEstado==3)
                setCursos(temp)
            })
        }
        if(!cursos) getCursos()
    },[])

    useEffect(()=>{
        const getPrograma=()=>{
            let jwt = window.localStorage.getItem("jwt");
            let idPrograma = id
             BuscarProgramaID({jwt,idPrograma}).then(data=>{
                if(data.imagenProducto)
                {
                    let temp = [{
                        name: data.imagenProducto,
                        fileKey: 1,
                        url: data.imagenProducto
                    }]
                    setDefaultFile(temp)
                    setFileList(temp)
                };
                if(data.imagenBanner)
                {
                    let temp = [{
                        name: data.imagenBanner,
                        fileKey: 1,
                        url: data.imagenBanner
                    }]
                    setDefaultFileBanner(temp)
                    setFileListBanner(temp)
                };
                setPrograma(data)
                setTituloPagina("Editar Programa")
                
            })
        }

        if(id){
            setModoEdicion(true)
            getPrograma()
        }
    },[id])

    const Registrar =({jsonPrograma})=>{
        let jwt = window.localStorage.getItem("jwt");
        RegistrarPrograma({jsonPrograma,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Éxito', detail:"Programa registrado exitosamente.", life: 7000})


            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    const Actualizar =({jsonPrograma})=>{
        let jwt = window.localStorage.getItem("jwt");
        ActualizarPrograma({jsonPrograma,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Éxito', detail:"Programa actualizado exitosamente.", life: 7000})


            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    
    const schema = Yup.object().shape({
        codigoProducto: Yup.string().required("Codigo de producto es un campo obligatorio"),
        nombre: Yup.string().required("Nombre de programa es un campo obligatorio"),
        precio: Yup.string().required("Precio es un campo obligatorio"),
        descripcion: Yup.string().required("Descripción es un campo obligatorio"),
      });
    const formik = useFormik({
        enableReinitialize:true,
        initialValues: { 
            
            idPrograma: programa?programa.idPrograma:0,
            nombre: programa?programa.nombre:"",
            codigoProducto: programa?programa.codigoProducto:"",
            descripcion : programa?programa.descripcion:"",
            logros:  programa?programa.logros:"",
            imagenProducto: programa?programa.imagenProducto:"",
            imagenBase64:null,
            tipoDocumento:null,
            imagenBanner: programa?programa.imagenBanner:"",
            imagenBase64Banner:null,
            tipoDocumentoBanner:null,
            descripcionSEO : programa?programa.descripcionSEO:"",
            duracion: programa?programa.duracion:"",
            videoIntroduccion: programa?programa.videoIntroduccion:"",
            precio: programa?programa.precio:"",
            listaCursos : programa?programa.listaCursos:[{idPrograma:0,idCurso:0}]
            
        },
    validationSchema: schema,
      onSubmit: async values => {
            // let imagenBase64 = imageBase64;
            // let tipoDocumento = imagenBase64 ? fileList[0].blobFile.type :null
            // let fotoCurso = imagenBase64 ?fileList[0].blobFile.name:values.fotoCurso
            try {
                let imagenProducto="";
                if (fileList[0] != undefined) {
                    if (fileList[0].blobFile != undefined) {
                        await uploadFiles(constantes.URLCARPETACURSOS, fileList[0].blobFile).then(data => {
                            imagenProducto = constantes.cdnDigitalOcean + "/" + constantes.URLCARPETACURSOS + "/" + fileList[0].blobFile.name;
                        });
                    }
                    else{
                        imagenProducto = fileList[0].url
                    }
                }
                else{
                    imagenProducto  ="";
                }

                let imagenBanner="";
                if (fileListBanner[0] != undefined) {
                    if (fileListBanner[0].blobFile != undefined) {
                        await uploadFiles(constantes.URLCARPETACURSOS, fileListBanner[0].blobFile).then(data => {
                            imagenBanner = constantes.cdnDigitalOcean + "/" + constantes.URLCARPETACURSOS + "/" + fileListBanner[0].blobFile.name;
                        });
                    }
                    else{
                        imagenBanner = fileListBanner[0].url
                    }
                }
                else{
                    imagenBanner  ="";
                }
                
                let idPrograma = values.idPrograma
                let nombre = values.nombre
                let codigoProducto = values.codigoProducto
                let descripcion =values.descripcion
                let logros = values.logros;
                let descripcionSEO = values.descripcionSEO;
                let duracion = values.duracion
                let videoIntroduccion = values.videoIntroduccion
                let precio =values.precio
                let listaCursos = values.listaCursos
                
                const idCursosSet = new Set();
                listaCursos.forEach((curso) => {
                    if (idCursosSet.has(curso.idCurso)) {
                        throw new Error("No se pueden asignar cursos iguales a programa.");
                    }
                    idCursosSet.add(curso.idCurso);
                });

                let jsonPrograma = JSON.stringify({
                    idPrograma, nombre, codigoProducto, descripcion, descripcionSEO, logros, duracion, videoIntroduccion,
                    precio, listaCursos,imagenProducto,imagenBanner
                }, null, 2)
                console.log("guardar programa",jsonPrograma)
                formik.setSubmitting(false)
                if(listaCursos.length > 1)
                {
                    if(!modoEdicion) Registrar({jsonPrograma}) 
                    else {Actualizar({jsonPrograma})}
                }
                else{
                    toast.current.show({severity:'error', summary: 'Error', detail:"Seleccione al menos 2 cursos", life: 7000})
                    formik.setSubmitting(false)
                }
                
                
            } catch (error) {
                toast.current.show({severity:'error', summary: 'Error',detail: error.message, life: 7000})
                formik.setSubmitting(false)
            }

            
           
      },
    });
    return ( 
        <form onSubmit={formik.handleSubmit}>
            <ConfirmDialog />
            <Toast ref={toast} position="top-center"></Toast>
            {(modoEdicion && programa == null) && <Loader center size="lg" content="Cargando" />}
            
            <div className="zv-editarPrograma" style={{paddingTop:16}}>
                <div className="header" >
                    <span style={{cursor:"pointer"}} onClick={()=>navigate(-1)}><Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft></span>
                </div>
                <div className="header-titulo"  style={{marginTop:16}}>{tituloPagina}{programa && ": "+programa.nombre}</div>
                <div className="zv-editarPrograma-body" style={{marginTop:16}}>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Codigo del Producto </label><small style={{color:"#B5B5B5"}} >{"(Solo letras y números)"}</small>
                            <InputText type={"text"} 
                                id="codigoProducto"
                                name="codigoProducto"
                                placeholder="Escribe código"
                                value ={formik.values.codigoProducto} 
                                //onChange={formik.handleChange}
                                onChange={(e)=>handleSoloLetrasNumeros(e,formik,"codigoProducto")} 
                                onBlur={formik.handleBlur}
                                ></InputText>
                             <small className="p-error">
                                {formik.touched.codigoProducto && formik.errors.codigoProducto}
                            </small>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Descripción Seo</label>
                            <InputText type={"text"} 
                                id="descripcionSEO"
                                name="descripcionSEO"
                                placeholder="Escribe..."
                                value ={formik.values.descripcionSEO} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                ></InputText>
                            <small className="p-error">
                                {formik.touched.descripcionSEO && formik.errors.descripcionSEO}
                            </small>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Nombre del Programa</label>
                            <InputText type={"text"} 
                                id="nombre"
                                name="nombre"
                                placeholder="Escribe nombre..."
                                value ={formik.values.nombre} 
                                onChange={formik.handleChange}
                                //onChange={(e)=>handleSoloLetrastest(e,formik,"nombre")}
                                onKeyPress={(e) => handleSoloLetrastest(e)}
                                onBlur={formik.handleBlur}
                                ></InputText>
                            <small className="p-error">
                                {formik.touched.nombre && formik.errors.nombre}
                            </small>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Duración</label><small style={{color:"#B5B5B5"}} >{"(Solo cantidad de horas)"}</small>
                            <InputText type={"text"} 
                                id="duracion"
                                name="duracion"
                                placeholder="Escribe nombre..."
                                value ={formik.values.duracion} 
                                //onChange={formik.handleChange}
                                onChange={(e)=>handleSoloLetrasNumeros(e,formik,"duracion")} 
                                onBlur={formik.handleBlur}
                                ></InputText>
                            <small className="p-error">
                                {formik.touched.duracion && formik.errors.duracion}
                            </small>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Descripción</label>
                            <InputTextarea type={"text"} 
                                id="descripcion"
                                name="descripcion"
                                placeholder="Escribe aquí"
                                value ={formik.values.descripcion} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                autoResize 
                                ></InputTextarea>
                            <small className="p-error">
                                {formik.touched.descripcion && formik.errors.descripcion}
                            </small>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Introducción del video </label><small style={{color:"#B5B5B5"}} >{"(ID de video de Vimeo)"}</small>
                            <InputText type={"text"} 
                                id="videoIntroduccion"
                                name="videoIntroduccion"
                                placeholder="Escribe ..."
                                value ={formik.values.videoIntroduccion} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                ></InputText>
                            <small className="p-error">
                                {formik.touched.videoIntroduccion && formik.errors.videoIntroduccion}
                            </small>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Logros</label>
                            <InputText type={"text"} 
                                id="logros"
                                name="logros"
                                placeholder="Escribe ..."
                                value ={formik.values.logros} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                ></InputText>
                            <small className="p-error">
                                {formik.touched.logros && formik.errors.logros}
                            </small>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Precio</label><small style={{color:"#B5B5B5"}} >{" (Solo cantidad)"}</small>
                            {/* <InputText type={"number"} 
                                id="precio"
                                name="precio"
                                placeholder="Escribe aquí"
                                value ={formik.values.precio} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                ></InputText> */}
                                 <InputNumber 
                                id="precio"
                                name="precio"
                                placeholder="Escribe aquí"
                                value ={formik.values.precio} 
                                onValueChange={formik.handleChange}
                                //onChange={(e)=>handleSoloNumeros(e,formik,"celular")}
                                onBlur={formik.handleBlur}
                                min={0}
                                ></InputNumber>
                            <small className="p-error">
                                {formik.touched.precio && formik.errors.precio}
                            </small>
                        </div>
                        <div className="field col-12 md:col-6">
                        <Uploader  listType="picture" className="zv-fileUploader"
                            fileList={defaultFile}
                            disabled={fileList.length}
                            onChange={setFileList} 
                            autoUpload={false}
                            
                            >
                            {/* <button type="button">
                                <Iconsax.Camera></Iconsax.Camera>
                            </button> */}
                            <Boton label="Subir foto de programa" color="secondary" 
                                    type ="button" style={{fontSize:12,width:160}}></Boton>
                        </Uploader>
                        </div>
                        <div className="field col-12 md:col-6">
                        <Uploader  listType="picture" className="zv-fileUploader"
                            fileList={defaultFileBanner}
                            disabled={fileListBanner.length}
                            onChange={setFileListBanner} 
                            autoUpload={false}
                            
                            >
                            {/* <button type="button">
                                <Iconsax.Camera></Iconsax.Camera>
                            </button> */}
                            <Boton label="Subir Banner de programa" color="secondary" 
                                    type ="button" style={{fontSize:12,width:160}}></Boton>
                        </Uploader>
                        </div>
                    </div>
                </div>
                <div className="zv-editarProgramaCurso-body" style={{marginTop:16}}>
                <div className="header-titulo"  style={{marginTop:16,marginBottom:10}}>Lista de Cursos</div>
                <FormikProvider value={formik}>
                    <div className="p-fluid formgrid grid">
                    <FieldArray
                        name="listaCursos"
                        render={(arrayHelpers) => (
                            <>
                            {
                                formik.values.listaCursos &&
                                    formik.values.listaCursos.map((doumento,index)=>(
                                        <>
                                            <div className="field col-12 md:col-7" key={index}>
                                            <DropdownDefault 
                                                id={`listaCursos[${index}].idCurso`}
                                                name={`listaCursos[${index}].idCurso`}
                                                value={formik.values.listaCursos[index].idCurso}
                                                onChange={formik.handleChange }
                                                onBlur={formik.handleBlur}
                                                options={cursos} optionLabel="nombre" optionValue ="idCurso"
                                                placeholder="Seleccione curso"
                                                ></DropdownDefault>
                                            </div>
                                            <div className="field col-12 md:col-1">
                                                <Boton icon="pi pi-minus" onClick={() => arrayHelpers.remove(index)} type="button"></Boton>
                                            </div> 
                                        </>
                                        
                                    ))
                            }
                            <div className="field col-12 md:col-1">
                                <Boton icon="pi pi-plus" onClick={() => arrayHelpers.push({idPrograma:0,idCurso:0})} type="button"></Boton>
                            </div>    
                            </>
                        )}
                    >

                    </FieldArray>
                    </div>
                </FormikProvider>
                </div>
                <div className="zv-editarPrograma-footer" style={{display:"flex",gap:8}}>
                    <Boton label="Guardar cambios" style={{fontSize:12}} color="primary" type="submit" loading={formik.isSubmitting}></Boton>
                </div>
            </div>
        </form>
     );
}
 
export default EditarPrograma;