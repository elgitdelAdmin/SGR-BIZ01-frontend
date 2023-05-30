
import { S3 } from "@aws-sdk/client-s3";
const s3Client = new S3({
    forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    endpoint: "https://zegelvirtual.nyc3.cdn.digitaloceanspaces.com",
    region: "us-east-1",
    credentials: {
      accessKeyId: "DO00QKV4CKN9X3LVBW2C",
      secretAccessKey: "bq6cVk/A5Mtdm0K3ULCCsY8CZYEncEU55ACT4SxuaBg"
    }
});


export { s3Client };