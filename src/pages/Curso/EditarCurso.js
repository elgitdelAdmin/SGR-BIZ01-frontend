import React, { useEffect, useState,useRef } from "react";
import { Navigate, useLocation,useNavigate,useParams } from "react-router-dom";

import DropdownDefault from "../../components/Dropdown/DropdownDefault";
import * as Iconsax from "iconsax-react";
import "./Curso.scss"
import { InputText } from "primereact/inputtext";
import Boton from "../../components/Boton/Boton";
import { BuscarCursoID,RegistrarCurso,ActualizarCurso } from "../../service/CursoService";
import { ListarUnidadesPorCurso,EliminarUnidad } from "../../service/UnidadService";
import { ListarBibliotecasPorCurso,EliminarBiblioteca } from "../../service/BlibliotecaService";
import { ListarDiseñadorPorCurso,EliminarDisenador } from "../../service/DisenadorService";

import { Field,FieldArray, Formik ,useFormik,FormikProvider} from "formik";
import * as Yup from "yup";
import { Toast } from 'primereact/toast';
import { InputTextarea } from "primereact/inputtextarea";
import { TabView, TabPanel } from 'primereact/tabview';
import DatatableDefault from "../../components/Datatable/DatatableDefault";
import { Column } from "primereact/column";
import {Uploader} from "rsuite"
import { getBase64 } from "../../helpers/helpers";
import * as constantes from "../../constants/constantes.js";
import { ObtenerListaCategorias } from "../../service/EmpresaService";
import useUsuario from "../../hooks/useUsuario";
import { Loader } from 'rsuite';
import 'bootstrap-colorpicker/dist/css/bootstrap-colorpicker.min.css';
import 'bootstrap-colorpicker';
import { ConfirmDialog,confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method
import $ from 'jquery'; // Importar jQuery
import { InputNumber } from "primereact/inputnumber";
import { handleSoloNumeros } from "../../helpers/helpers";
import { handleSoloLetrasNumeros } from "../../helpers/helpers";
const EditarCurso = () => {
    const navigate = useNavigate();
    const [curso, setCurso] = useState(null);    
    const [listaUnidades, setListaUnidades] = useState(null);
    const [listaBiblioteca, setListaBiblioteca] = useState(null);
    const [listaDisenador, setListaDisenador] = useState(null);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [tituloTab, setTituloTab] = useState("");
    const [tituloPagina, setTituloPagina] = useState("Crear curso");
    let { id } = useParams();
    const toast = useRef(null);
    const inputColor = useRef();
    // const [deshabilitarFoto, setDeshabilitarFoto] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [defaultFile, setDefaultFile] = useState([]);
    const [imageBase64, setImageBase64] = useState(null);
    const [tipoDocumento, setTipoDocumento] = useState(null);
    const [listaCategorias, setListaCategorias] = useState(null);
    const {isLogged} = useUsuario()
    useEffect(()=>{
        !isLogged && navigate("/");
    },[])

    const [loadingUnidad, setLoadingUnidad] = useState(true);
    const [loadingBiblioteca, setLoadingBiblioteca] = useState(true);
    const [loadingDiseñador, setLoadingDiseñador] = useState(true);
    const fileListTest = [
        {
          name: 'grupoDefault.jpg',
          fileKey: 1,
          url: 'https://grplataformavirtual9128.blob.core.windows.net/adjuntos/Cursos/grupoDefault.jpg'
        },
       
      ];

    const comboEstado = [{label:"Activado",value :true},{label:"Desactivado",value :false}]
    const tempDatatable = [
        {idUnidad:1,descripcion:"Idea de planes de negocio",duracion:"2h",secuencia:1},
        {idUnidad:2,descripcion:"Modelo de negocios",duracion:"2.5h",secuencia:2},
        {idUnidad:3,descripcion:"Sostenibilidad de negocios",duracion:"2.5h",secuencia:3},
        {idUnidad:4,descripcion:"Alcance de negocio",duracion:"2.5",secuencia:4}

    ]
    const tempTableBiblioteca =[
        {idBiblioteca:1,nombre:"Nobles, T. (2016). Contabilidad de Horngren. 10a ed. Bogotá: Pearson Educación.",tipo:"Pearson Educación",linkZegel:"9789586993067",linkIdat:""}
        ,{idBiblioteca:2,nombre:"Celaya, R. (2013). Contabilidad básica. un enfoque basado en competencias. México, D.F.: Cengage Learning.",tipo:"Cengage Learning",linkZegel:"9786075190273",linkIdat:""}
        ,{idBiblioteca:3,nombre:"Label, W. A., León, L. J. D., & Ramos, A. R. A. (2016). Contabilidad para no contadores : una forma rápida y sencilla de entender la contabilidad (2a. ed.). Bogotá: Ecoe Ediciones.",tipo:"Ebook Centra",linkZegel:"https://elibro.net/es/ereader/ipae/70462?collection=ELC004",linkIdat:""}
        ,{idBiblioteca:4,nombre:"Ramírez, M. (2018). Cómo entender contabilidad sin ser contador. México, D.F.: Instituto Mexicano de Contadores Públicos.",tipo:"Ebook Central",linkZegel:"https://elibro.net/es/ereader/ipae/116943?collection=ELC004",linkIdat:""}
        ,{idBiblioteca:5,nombre:"Guerrero, J. C. y Galindo, J. F. (2015). Contabilidad para administradores. México D.F, Mexico: Grupo Editorial Patria.",tipo:"Ebook Central",linkZegel:"https://elibro.net/es/ereader/ipae/39381?page=1",linkIdat:""}
        ,{idBiblioteca:6,nombre:"León, J. D. y Ramos, R. A. (2016). Contabilidad para no contadores: una forma rápida y sencilla de entender la contabilidad (2a. ed.). Bogotá, Colombia: Ecoe Ediciones.",tipo:"Ebook Central",linkZegel:"https://elibro.net/es/ereader/ipae/70462?page=1",linkIdat:""}
    ]

    const [blockPickerColor, setBlockPickerColor] = useState("#37d67a");


    useEffect(()=>{
        const GetCategorias = async ()=>
        {
            let jwt = window.localStorage.getItem("jwt");

            await ObtenerListaCategorias({jwt}).then(data=>{
                setListaCategorias(data);
            })
        }
        if(!listaCategorias)GetCategorias();
        
    },[])
    const accionEditar =(rowData)=>{
        return <div className="datatable-accion">
            <div className="accion-editar" onClick={()=>navigate("../Curso/Editar/"+curso.idCurso+"/Unidad/Editar/"+rowData.idUnidad)}>
                <span><Iconsax.Eye color="#ffffff"/></span>
            </div>
            <div className="accion-eliminar" onClick={()=>{
               
               confirm2(rowData.idUnidad)
               
            }}>
               <span><Iconsax.Trash color="#ffffff"/></span>
           </div> 
        </div>
             
       
    }

    const accionEditarBiblioteca =(rowData)=>{
        return <div className="datatable-accion">
            <div className="accion-editar" onClick={()=>navigate("../Curso/Editar/"+curso.idCurso+"/Biblioteca/Editar/"+rowData.idBiblioteca)}>
                <span><Iconsax.Eye color="#ffffff"/></span>
            </div>
            <div className="accion-eliminar" onClick={()=>{
               
               confirmLibro(rowData.idBiblioteca)
               
            }}>
               <span><Iconsax.Trash color="#ffffff"/></span>
           </div> 
        </div>
             
       
    }

    const accionEditarDisenador =(rowData)=>{
        return <div className="datatable-accion">
            <div className="accion-editar" onClick={()=>navigate("../Curso/Editar/"+curso.idCurso+"/Disenador/Editar/"+rowData.idDisenador)}>
                <span><Iconsax.Eye color="#ffffff"/></span>
            </div>
            <div className="accion-eliminar" onClick={()=>{
               
               confirmDisenador(rowData.idDisenador)
               
            }}>
               <span><Iconsax.Trash color="#ffffff"/></span>
           </div> 
        </div>
             
       
    }

    const paginatorLeft = <button type="button" icon="pi pi-refresh" className="p-button-text" />;
    const paginatorRight = <button type="button" icon="pi pi-cloud" className="p-button-text" />;     

    useEffect(()=>{
        const GetCurso=()=>{
            let jwt = window.localStorage.getItem("jwt");
            let idCurso = id
             BuscarCursoID({jwt,idCurso}).then(data=>{
                if(data.fotoCurso)
                {
                    let temp = [{name: data.fotoCurso,
                                fileKey: 1,
                                    url: constantes.URLBLOB_CURSOS+"/"+data.fotoCurso}]
                                    setDefaultFile(temp)
                                    setFileList(temp)
                }
                setCurso(data)
                
                setTituloPagina("Editar Curso")
                
            })
        }

        if(id){
            setModoEdicion(true)
            GetCurso()
        }
    },[id])

    useEffect(()=>{
        const GetUnidades= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            let idCurso = id
            await ListarUnidadesPorCurso({jwt,idCurso}).then(data=>{
                setListaUnidades(data)
                setLoadingUnidad(false)
            })
        }

        if(id)GetUnidades()
    },[id])

    useEffect(()=>{
        const getBibliteca= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            let idCurso = id
            await ListarBibliotecasPorCurso({jwt,idCurso}).then(data=>{
                setListaBiblioteca(data)
                setLoadingBiblioteca(false)
            })
        }

        if(id)getBibliteca()
    },[id])

    useEffect(()=>{
        const getDisenador= async()=>{
            let jwt = window.localStorage.getItem("jwt");
            let idCurso = id
            await ListarDiseñadorPorCurso({jwt,idCurso}).then(data=>{
                setListaDisenador(data)
                setLoadingDiseñador(false)
            })
        }

        if(id)getDisenador()
    },[id])

    useEffect(()=>{
        if(fileList.length >0) {
            if(fileList[0].blobFile)
            {
                getBase64(fileList[0].blobFile).then((result) => {
                    setImageBase64(result)
                });
            }
           
        }
    },[fileList])

    const formik = useFormik({
        enableReinitialize:true,
        initialValues: { 
            
            idCurso: curso?curso.idCurso:0,
            idCategoria: curso?curso.idCategoria:0,
            nombre: curso?curso.nombre:"",
            descripcion : curso?curso.descripcion:"",
            logros:  curso?curso.logros:"",
            descripcionSEO: curso?curso.descripcionSEO:"",
            duracion: curso?curso.duracion:"",
            color: curso?curso.color:"",
            videoIniciacion: curso?curso.videoIniciacion:"",
            videoIntroduccion: curso?curso.videoIntroduccion:"",
            descripcionMeta: curso?curso.descripcionMeta:"",
            introduccionDuracion: curso?curso.introduccionDuracion:"",
            precio: curso?curso.precio:"",
            codigoProducto: curso?curso.codigoProducto:"",
            idEstado: curso?curso.activo:"",
            fotoCurso: curso?curso.fotoCurso:null,
            listaDefecto :curso&& curso.fotoCurso?[{name: curso.fotoCurso,
                fileKey: 1,
                    url: constantes.URLBLOB_CURSOS+"/"+curso.fotoCurso}] :[]
            
        },
    //   validationSchema: schema,
      onSubmit: values => {
            let imagenBase64 = imageBase64;
            let tipoDocumento = imagenBase64 ? fileList[0].blobFile.type :null
            let fotoCurso = imagenBase64 ?fileList[0].blobFile.name:values.fotoCurso
            let idCurso = values.idCurso
            let idCategoria = values.idCategoria
            let nombre = values.nombre
            let descripcion =values.descripcion
            let logros = values.logros;
            let descripcionSEO = values.descripcionSEO;
            let duracion = values.duracion
            let color = values.color
            let videoIniciacion = values.videoIniciacion
            let videoIntroduccion = values.videoIntroduccion
            let descripcionMeta = values.descripcionMeta
            let introduccionDuracion =values.introduccionDuracion
            let precio =values.precio
            let codigoProducto = values.codigoProducto
            let idEstado = values.idEstado

            let jsonCurso = JSON.stringify({fotoCurso,tipoDocumento,imagenBase64,idCurso,idCategoria,nombre,descripcion,descripcionSEO,logros,duracion,color,videoIniciacion,videoIntroduccion,
                descripcionMeta,introduccionDuracion,precio,codigoProducto,idEstado},null,2)
            // alert(jsonCurso)
            // formik.setSubmitting(false)
            if(!modoEdicion) Registrar({jsonCurso}) 
            else {Actualizar({jsonCurso})}
      },
    });

    const Registrar =({jsonCurso})=>{
        let jwt = window.localStorage.getItem("jwt");
        RegistrarCurso({jsonCurso,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Success', detail:"Curso registrado exitosamente.", life: 7000})


            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    const Actualizar =({jsonCurso})=>{
        let jwt = window.localStorage.getItem("jwt");
        ActualizarCurso({jsonCurso,jwt}).then(data=>{
            formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Success', detail:"Curso actualizado exitosamente.", life: 7000})


            setTimeout(() => {
                navigate(-1);
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            formik.setSubmitting(false)
        })
    }

    const Eliminar =({id})=>{
        let jwt = window.localStorage.getItem("jwt");
        let idUnidad = id
        EliminarUnidad({jwt,idUnidad}).then(data=>{
            //formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Success', detail:"Registro eliminado.", life: 7000})
  
  
            setTimeout(() => {
                window.location.reload();
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            //formik.setSubmitting(false)
        })
    }

    const EliminarLibro =(idBiblioteca)=>{
        let jwt = window.localStorage.getItem("jwt");
        let id = idBiblioteca
        EliminarBiblioteca({jwt,id}).then(data=>{
            //formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Success', detail:"Registro eliminado.", life: 7000})
  
  
            setTimeout(() => {
                window.location.reload();
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            //formik.setSubmitting(false)
        })
    }

    const EliminarDiseñador =(idDisenador)=>{
        let jwt = window.localStorage.getItem("jwt");
        let id = idDisenador
        EliminarDisenador({jwt,id}).then(data=>{
            //formik.setSubmitting(false)
            toast.current.show({severity:'success', summary: 'Success', detail:"Registro eliminado.", life: 7000})
  
  
            setTimeout(() => {
                window.location.reload();
            }, 3000)
        })
        .catch(errors => {
            toast.current.show({severity:'error', summary: 'Error', detail:errors.message, life: 7000})
            //formik.setSubmitting(false)
        })
    }

    const confirm2 = (id) => {
        confirmDialog({
            message: 'Seguro de eliminar unidad?',
            header: 'Eliminar',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel:"Aceptar",
            accept:()=>Eliminar({id})
        });
    };

    const confirmLibro = (id) => {
        confirmDialog({
            message: 'Seguro de eliminar libro?',
            header: 'Eliminar',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel:"Aceptar",
            accept:()=>EliminarLibro(id)
        });
    };

    const confirmDisenador = (id) => {
        confirmDialog({
            message: 'Seguro de eliminar diseñador?',
            header: 'Eliminar',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel:"Aceptar",
            accept:()=>EliminarDiseñador(id)
        });
    };
    
    return ( 
        <form onSubmit={formik.handleSubmit}>
            <ConfirmDialog />
            <div className="zv-editarCurso" style={{paddingTop:16}}>
                <Toast ref={toast} position="top-center"></Toast>
                {(modoEdicion && curso == null) && <Loader center size="lg" content="Cargando" />}
                <div className="header" >
                    <span style={{cursor:"pointer"}} onClick={()=>navigate(-1)}><Iconsax.ArrowCircleLeft size={30}></Iconsax.ArrowCircleLeft></span>
                </div>
                <div className="header-titulo"  style={{marginTop:16}}>{tituloPagina}{curso && ": "+curso.nombre}</div>
                <div className="zv-editarCurso-body" style={{marginTop:16}}>
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Categoria</label>
                            <DropdownDefault type={"text"} 
                                id="idCategoria"
                                name="idCategoria"
                                placeholder="Seleccione"
                                value ={formik.values.idCategoria} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                options={listaCategorias} optionLabel="descripcionCategoria" optionValue ="idCategoria"
                                ></DropdownDefault>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Color </label><small style={{color:"#B5B5B5"}} >{"(Ejemplo: #3e3e3 ó rgba(0,0,0,1))"}</small>
                            <InputText 
                                ref={inputColor}
                                type={"text"} 
                                id="color"
                                name="color"
                                placeholder="Escribe aquí"
                                value ={formik.values.color} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                ></InputText>
                        </div>
                        
                        <div className="field col-12 md:col-6" >
                            <label className="label-form">Nombre</label>
                            <InputText type={"text"} 

                                id="nombre"
                                name="nombre"
                                placeholder="Escribe aquí"
                                value ={formik.values.nombre} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                
                                ></InputText>
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="label-form">Video de iniciación</label><small style={{color:"#B5B5B5"}} >{" (ID de video de Vimeo)"}</small>
                            <InputText type={"text"} 
                                id="videoIniciacion"
                                name="videoIniciacion"
                                placeholder="Escribe aquí"
                                value ={formik.values.videoIniciacion} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                ></InputText>
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
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="label-form">Video de introducción</label><small style={{color:"#B5B5B5"}} >{" (ID de video de Vimeo)"}</small>
                            <InputText type={"text"} 
                                id="videoIntroduccion"
                                name="videoIntroduccion"
                                placeholder="Escribe aquí"
                                value ={formik.values.videoIntroduccion} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                ></InputText>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Logros</label>
                            <InputTextarea type={"text"} 
                                id="logros"
                                name="logros"
                                placeholder="Escribe aquí"
                                value ={formik.values.logros} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                autoResize 
                                ></InputTextarea>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Descripción Meta</label>
                            <InputTextarea type={"text"} 
                                id="descripcionMeta"
                                name="descripcionMeta"
                                placeholder="Escribe aquí"
                                value ={formik.values.descripcionMeta} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                autoResize 
                                ></InputTextarea>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Descripción SEO</label><small style={{color:"#B5B5B5"}} >{" (Ejemplo: Lorem-Ipsum)"}</small>
                            <InputText type={"text"} 
                                id="descripcionSEO"
                                name="descripcionSEO"
                                placeholder="Escribe aquí"
                                value ={formik.values.descripcionSEO} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                ></InputText>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Introducción duración</label><small style={{color:"#B5B5B5"}} >{" (Tiempo de duración)"}</small>
                            <InputText type={"text"} 
                                id="introduccionDuracion"
                                name="introduccionDuracion"
                                placeholder="Escribe aquí"
                                value ={formik.values.introduccionDuracion} 
                                //onChange={formik.handleChange}
                                onChange={(e)=>handleSoloLetrasNumeros(e,formik,"introduccionDuracion")}
                                onBlur={formik.handleBlur}
                                ></InputText>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Duración</label><small style={{color:"#B5B5B5"}} >{" (Ejemplo: 1.7h)"}</small>
                            <InputText type={"text"} 
                                id="duracion"
                                name="duracion"
                                placeholder="Escribe aquí"
                                value ={formik.values.duracion} 
                               //onChange={formik.handleChange}
                               onChange={(e)=>handleSoloLetrasNumeros(e,formik,"duracion")} 
                               onBlur={formik.handleBlur}
                                ></InputText>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Precio</label><small style={{color:"#B5B5B5"}} >{" (Solo cantidad)"}</small>
                            <InputNumber 
                                id="precio"
                                name="precio"
                                placeholder="Escribe aquí"
                                value ={formik.values.precio} 
                                onChange={formik.handleChange}
                                //onChange={(e)=>handleSoloNumeros(e,formik,"celular")}
                                onBlur={formik.handleBlur}
                                min={0}
                                ></InputNumber>
                        </div>

                        <div className="field col-12 md:col-6">
                            <label className="label-form">Código de producto</label><small style={{color:"#B5B5B5"}} >{" (Solo letras y números)"}</small>
                            <InputText type={"text"} 
                                id="codigoProducto"
                                name="codigoProducto"
                                placeholder="Escribe aquí"
                                value ={formik.values.codigoProducto} 
                                //onChange={formik.handleChange}
                                onChange={(e)=>handleSoloLetrasNumeros(e,formik,"codigoProducto")}
                                onBlur={formik.handleBlur}
                                ></InputText>
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="label-form">Estado</label>
                            <DropdownDefault type={"text"} 
                                id="idEstado"
                                name="idEstado"
                                placeholder="Escribe aquí"
                                value ={formik.values.idEstado} 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                options={comboEstado} optionLabel="label" optionValue ="value"
                                ></DropdownDefault>
                        </div>
                        <div className="field col-12 md:col-12">
                        <Uploader  listType="picture" className="zv-fileUploader"
                            fileList={defaultFile}
                            disabled={fileList.length}
                            onChange={setFileList} 
                            autoUpload={false}
                            
                            >
                            {/* <button type="button">
                                <Iconsax.Camera></Iconsax.Camera>
                            </button> */}
                            <Boton label="Subir foto de curso" color="secondary" 
                                    type ="button" style={{fontSize:12,width:160}}></Boton>
                        </Uploader>
                        </div>
                    </div>
                </div>
                <div className="zv-editarCurso-footer" style={{display:"flex",gap:8}}>
                        <Boton label="Guardar cambios" style={{fontSize:12}} color="primary" type="submit" loading={formik.isSubmitting}></Boton>
                        {modoEdicion && <>
                            <Boton label="Crear unidad" style={{fontSize:12}} color="secondary" type ="button"
                        onClick={()=>navigate("../Curso/Editar/"+curso.idCurso+"/Unidad/Crear")}></Boton>
                        <Boton label="Crear biblioteca" style={{fontSize:12}} color="secondary" type ="button"
                        onClick={()=>navigate("../Curso/Editar/"+curso.idCurso+"/Biblioteca/Crear")}></Boton>
                        <Boton label="Crear requisito" style={{fontSize:12}} color="secondary" type ="button"
                        onClick={()=>navigate("../Curso/Editar/"+curso.idCurso+"/Requisito/Crear")}></Boton>
                        <Boton label="Crear beneficio" style={{fontSize:12}} color="secondary" type ="button"
                        onClick={()=>navigate("../Curso/Editar/"+curso.idCurso+"/Beneficio/Crear")}></Boton>
                        <Boton label="Crear diseñador" style={{fontSize:12}} color="secondary" type ="button"
                        onClick={()=>navigate("../Curso/Editar/"+curso.idCurso+"/Disenador/Crear")}></Boton>
                        </>
                        
                        }
                    </div>
                
            </div>
            {modoEdicion &&
                <div className="zv-listado-unidad" style={{marginTop:16 }}>
                <TabView>
                    <TabPanel header="Unidad">
                        <div className="header-subTitulo">Listado de Unidades</div>   
                        <DatatableDefault
                            value={listaUnidades}
                            loading={loadingUnidad}
                            >
                            <Column field="idUnidad" header="ID" sortable></Column>
                            <Column field="descripcion" header="Descripción" sortable ></Column>
                            <Column field="duracion" header="Duración" sortable></Column>
                            <Column field="secuencia" header="Secuencia" sortable></Column>
                            <Column 
                                body={accionEditar}
                                style={{ display: "flex", justifyContent: "center" }}
                                header="Acciones"
                            ></Column>
                        
                        </DatatableDefault>
                    </TabPanel>
                    <TabPanel header="Biblioteca">
                        <div className="header-subTitulo">Lista de Librerías</div>   
                        <DatatableDefault
                            value={listaBiblioteca}
                            loading={loadingBiblioteca}
                            >
                            <Column field="idBiblioteca" header="ID" ></Column>
                            <Column field="nombre" header="Nombre"  ></Column>
                            <Column field="libroTipo.tipo" header="Tipo"  ></Column>
                            <Column field="linkZegel" header="Link Zegel" ></Column>
                            <Column field="linkIdat" header="Link Idat" ></Column>
                            <Column 
                                body={accionEditarBiblioteca}
                                style={{ display: "flex", justifyContent: "center" }}
                                header="Acciones"
                            ></Column>
                        
                        </DatatableDefault>
                    </TabPanel>
                    <TabPanel header="Diseñador">
                        <div className="header-subTitulo">Lista de Diseñador</div>   
                        <DatatableDefault
                            value={listaDisenador}
                            loading={loadingDiseñador}
                            >
                            <Column field="idDisenador" header="ID" ></Column>
                            <Column field="nombre" header="Nombre" ></Column>
                            <Column field="ocupacion" header="Ocupación"  ></Column>
                            <Column field="descripcion" header="Descripción"  ></Column>
                            <Column 
                                body={accionEditarDisenador}
                                style={{ display: "flex", justifyContent: "center" }}
                                header="Acciones"
                            ></Column>
                        
                        </DatatableDefault>
                    </TabPanel>
                </TabView>
            </div>
            }
            
            
        </form>
     );
}
 
export default EditarCurso;