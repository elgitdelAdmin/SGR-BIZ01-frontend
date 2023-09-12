import { read, utils,write} from 'xlsx';
import { saveAs } from 'file-saver';
export function getBase64 (file){
    return new Promise(resolve => {
      let fileInfo;
      let baseURL = "";

      let reader = new FileReader();

      reader.readAsDataURL(file);
      const regex = /data:.*base64,/
      reader.onload = () => {
        //console.log("Called", reader);
        baseURL = reader.result;
        //console.log(baseURL);
        resolve(baseURL.replace(regex,""));
      };
      console.log(fileInfo);
    });
  };

  // export function isAuthenticated() {
  //   const token = localStorage.getItem('token');
  //   const refreshToken = localStorage.getItem('refreshToken');
  //   try {
  //     decode(token);
  //     const { exp } = decode(refreshToken);
  //     if (Date.now() >= exp * 1000) {
  //       return false;
  //     }
  //   } catch (err) {
  //     return false;
  //   }
  //   return true;
  // }

  export function excelFileToJSONSheet(file,numSheet,setField){
    return new Promise(resolve => {
      try {
        var reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = function(e) {
  
            var data = e.target.result;
            var workbook = read(data, {
                type : 'binary'
            });
            var result = {};
            var firstSheetName = workbook.SheetNames[numSheet];
            //reading only first sheet data
            var jsonData = utils.sheet_to_json(workbook.Sheets[firstSheetName]);
            setField(jsonData)
            console.log(firstSheetName,jsonData)
            resolve(jsonData)
           
            //alert(JSON.stringify(jsonData));
            //displaying the json result into HTML table
            
            }
        }catch(e){
            console.error(e);
        }
    })
    
}
export function excelFileToJSONSheetName(file,nameSheet,setField){
  return new Promise(resolve => {
    try {
      var reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = function(e) {

          var data = e.target.result;
          var workbook = read(data, {
              type : 'binary'
          });
          var result = {};
          //var firstSheetName = workbook.SheetNames[numSheet];
          //reading only first sheet data
          var jsonData = utils.sheet_to_json(workbook.Sheets[nameSheet]);
          setField(jsonData)
          console.log(nameSheet,jsonData)
          resolve(jsonData)
         
          //alert(JSON.stringify(jsonData));
          //displaying the json result into HTML table
          
          }
      }catch(e){
          console.error(e);
      }
  })
  
}

  export function excelFileToJSON(file){
    return new Promise(resolve => {
      try {
        var reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = function(e) {
  
            var data = e.target.result;
            var workbook = read(data, {
                type : 'binary'
            });
            var result = {};
            var firstSheetName = workbook.SheetNames[0];
            //reading only first sheet data
            var jsonData = utils.sheet_to_json(workbook.Sheets[firstSheetName]);
  
            resolve(jsonData)
           
            //alert(JSON.stringify(jsonData));
            //displaying the json result into HTML table
            
            }
        }catch(e){
            console.error(e);
        }
    })
    
}
export const generateExcel = (dtRef) => {
 
  const worksheet = utils.json_to_sheet(dtRef.current.props.value);
  const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
  const excelBuffer = write(workbook, {
      bookType: 'xlsx',
      type: 'array'
  });

  // Descarga el archivo Excel
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'data.xlsx');
}


export const handleCopyToClipboard = (dtRef) => {
  if (dtRef.current) {
    const tableData = dtRef.current.props.value; // Obtener los datos de la tabla
    const formattedData = formatTableData(tableData); // Formatear los datos de la tabla

    copyToClipboard(formattedData); // Copiar los datos al portapapeles
    console.log('Contenido copiado al portapapeles');
  }
};
const formatTableData = (data) => {
  // Formatear los datos de la tabla según tu necesidad
  // Puedes convertirlos a una cadena de texto en formato CSV, por ejemplo
  // Aquí tienes un ejemplo de cómo convertirlos en una cadena separada por comas:
  return data.map((item) => Object.values(item).join(',')).join('\n');
};
const copyToClipboard = (content) => {
  // Crear un elemento de texto oculto para copiar el contenido al portapapeles
  const textarea = document.createElement('textarea');
  textarea.value = content;
  document.body.appendChild(textarea);

  // Seleccionar y copiar el contenido al portapapeles
  textarea.select();
  document.execCommand('copy');

  // Remover el elemento de texto oculto
  document.body.removeChild(textarea);
};
export const handleSoloLetras = (event,formik,label) => {
  if(event.target.value != null && event.target.value != undefined)
  {
    const result = event.target.value.replace(/[^a-z]/gi, '');
    // const result = event.target.value.replace(/^[a-zA-Z\u00C0-\u017F\s]+$/gi, '');
    

    formik.setFieldValue(label,result)
  }
  
};
export const regex = new RegExp("^[a-zA-Z\u00C0-\u017F\\s]*$");
export const handleSoloLetrastest = (e) => {
  let key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
  if (!regex.test(key)) {
    e.preventDefault();
    return false;
  }
};

export const handleSoloLetrasNumeros = (event,formik,label) => {
  if(event.target.value != null && event.target.value != undefined)
  {
    const result = event.target.value.replace(/[^0-9a-zA-Z||.]+$/gi, '');

    formik.setFieldValue(label,result)
  }
  
};

export const handleSoloNumeros = (event,formik,label) => {
  if(event.target.value != null && event.target.value != undefined)
  {
    const result = event.value.toString().replace( /[^0-9]$/g, '');

    formik.setFieldValue(label,result)
  }
  else{

    formik.setFieldValue(label,null)
  }
  
};

export const validateRegex = (e,regex,formik,label) => {
  console.log("validateRegex",e.target.value)
  const inputValue = e.target.value;
  // const isValidColor = /^#([0-9A-Fa-f]{3}){1,2}$/i.test(inputValue);
  const isValidColor = regex.test(inputValue);
  
  if (isValidColor || inputValue === '') {
    formik.setFieldValue(label,inputValue)
    //setColor(inputValue);
  }
  else{
    formik.setFieldValue(label,"")
  }
};

export const formatDate = (value) => {
  if(value)
  {
    return value.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
  });
  }
  else{
    return""
  }
  
};

export const  convertirTiempoDecimal=(decimal)=> {
  const horas = Math.floor(decimal * 24);
  const minutos = Math.floor((decimal * 24 * 60) % 60);
  const segundos = Math.floor((decimal * 24 * 60 * 60) % 60);

  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

}

export const buscarConfiguracion =(lista,codigo)=>
{
  if(lista)
  {
    let resultado = lista.find(x=>x.codigo == codigo)
    if(resultado) return resultado.valor
    else return ''
  }
  else{
    return ''
  }
}
 