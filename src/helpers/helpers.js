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