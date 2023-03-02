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