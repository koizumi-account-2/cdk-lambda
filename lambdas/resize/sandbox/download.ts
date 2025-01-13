import 'dotenv/config'
import { S3Client,GetObjectCommand,GetObjectCommandInput } from '@aws-sdk/client-s3';

const BUCKET_NAME = process.env.BUCKET_NAME;

export async function download(bucketName:string | undefined,filePath:string):Promise<Uint8Array>{
    const s3Client = new S3Client();
    //const key = "original/fuji.png";

    const input:GetObjectCommandInput = {
        Bucket:bucketName,
        Key:filePath
    };
    const cmd = new GetObjectCommand(input);
    const result = await s3Client.send(cmd);
    if(!result.Body){
        throw Error("result.Body is undefined");
    }
    return await result.Body.transformToByteArray();
}

async function main(){
    const key = "original/fuji.png";
    const body = await download(BUCKET_NAME,key);
    console.log(body);
}

main();

