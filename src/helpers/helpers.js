import { read, utils } from 'xlsx';

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

export const handleSoloLetras = (event,formik,label) => {
  if(event.target.value != null && event.target.value != undefined)
  {
    const result = event.target.value.replace(/[^a-z]/gi, '');

    formik.setFieldValue(label,result)
  }
  
};

export const handleSoloLetrasNumeros = (event,formik,label) => {
  if(event.target.value != null && event.target.value != undefined)
  {
    const result = event.target.value.replace(/[^0-9a-zA-Z]+$/gi, '');

    formik.setFieldValue(label,result)
  }
  
};

export const handleSoloNumeros = (event,formik,label) => {
  if(event.value)
  {
    const result = event.value.toString().replace( /^\d*$/g, '');

    formik.setFieldValue(label,result)
  }
  else{

    formik.setFieldValue(label,null)
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