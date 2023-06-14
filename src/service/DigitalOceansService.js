import AWS from "aws-sdk";
import { accessKeyId ,secretAccessKey,endpoint,bucketZegel} from "../constants/constantes";

const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
  endpoint,
});

export const fetchDirectoriesAll = async (directorio,setField) => {
  try {
    const response = await s3
      .listObjectsV2({
        Bucket: bucketZegel,
        Delimiter: directorio,
      })
      .promise();

   
    const directoryKeys = response.CommonPrefixes.map((prefix) =>
      prefix.Prefix.replace("/", "")
    );
    console.log("directoryKey", directoryKeys)
    const directoriosOrdenados = directoryKeys.sort((a, b) => {
      // Excluir strings que comienzan con "_"
      if (a.startsWith("_") && !b.startsWith("_")) {
        return 1; // Mover "a" al final
      } else if (!a.startsWith("_") && b.startsWith("_")) {
        return -1; // Mover "b" al final
      } else {
        return a.localeCompare(b); // Ordenamiento alfabético normal
      }
    });
    
    const jsonDirectorios = directoriosOrdenados.map((nombre) => ({ nombre }));
    
    setField(jsonDirectorios);
  } catch (error) {
    console.error("Error fetching directories:", error);
  }
};

export const fetchDirectoriesName = async (nombreDirectorio,delimitador,setField) => {
    try {
      const response = await s3
        .listObjectsV2({
          Bucket: bucketZegel,
          Delimiter: delimitador,
          Prefix:nombreDirectorio+"/"
        })
        .promise();
       console.log("response: ",response);
       //Para mapear archivos
        const directoryKeys = response.Contents.map((prefix) =>
            ({nombre:prefix.Key.split('/')[prefix.Key.split('/').length -1],tipo:prefix.Size > 0 ?"archivo":"carpeta"})
            
        );
        let tempFiles = directoryKeys.filter(x=>x.nombre != "")

        console.log("files por nombre;",directoryKeys)
        //para mapear carpetas 
          const directorys= response.CommonPrefixes.map((prefix) =>
          ({nombre:prefix.Prefix.split('/')[prefix.Prefix.split('/').length -2],tipo:"carpeta"})
        );
        console.log("carpetas por nombre;",directorys)
        
        let contenidoTotal = tempFiles.concat(directorys)
        console.log("contenido total",contenidoTotal);

    
      const directoriosOrdenados = contenidoTotal.sort((a, b) => {
        const nombreA = a.nombre;
        const nombreB = b.nombre;
        // Excluir strings que comienzan con "_"
        if (nombreA.startsWith("_") && !nombreB.startsWith("_")) {
          return 1; // Mover "a" al final
        } else if (!nombreA.startsWith("_") && nombreB.startsWith("_")) {
          return -1; // Mover "b" al final
        } else {
          return nombreA.localeCompare(nombreB); // Ordenamiento alfabético normal
        }
      });
      
    
      
      setField(directoriosOrdenados);
    } catch (error) {
      console.error("Error fetching directories:", error);
    }
  };
  
  export const uploadFiles = async (directorio, file) => {

    try {
      const params = {
        Bucket: bucketZegel,
        Key: directorio+"/" + file.name,
        Body: file,
        ACL: 'public-read',
        ContentType: file.type
      };
      const response = await s3.upload(params).promise();

      console.log("response upload:",response)
      
    } catch (error) {
      new Error(error)
    }
  }

  export const CreateDirectory = async (ruta, Nombre) => {

    try {
      const params = {
        Bucket: bucketZegel,
        Key: ruta+ Nombre+"/",
        
      };
      const response = await s3.putObject(params).promise();

      console.log("response upload:",response)
      
    } catch (error) {
      new Error(error)
    }
  }

  export const ChangeNameFile = async (rutaAnterior, nombreNuevo) => {

    try {
      const params = {
        Bucket: bucketZegel,
        CopySource:bucketZegel + '/' + rutaAnterior,
        Key: nombreNuevo,
        ACL: 'public-read'
      };
      const response = await s3.copyObject(params).promise();
      // Elimina el archivo original
      const deleteParams = {
        Bucket: bucketZegel,
        Key: rutaAnterior,
      };
      await s3.deleteObject(deleteParams).promise();
      console.log("response change:",response)
      
    } catch (error) {
      new Error(error)
    }
  }

  export const DeleteFile = async (path) => {

    try {
      const params = {
        Bucket: bucketZegel,
        Key: path,
        
      };
      const response = await s3.deleteObject(params).promise();

      console.log("response delete:",response)
      
    } catch (error) {
      new Error(error)
    }
  }