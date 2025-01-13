import 'dotenv/config'
import { S3Client,GetObjectCommand,GetObjectCommandInput } from '@aws-sdk/client-s3';

const BUCKET_NAME = process.env.BUCKET_NAME;

export async function download(s3Client:S3Client, bucketName:string,filePath:string):Promise<Uint8Array>{
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
    const s3Client = new S3Client();
    if(!BUCKET_NAME){
        throw Error("BUCKET_NAMEが空です");
    }
    const key = "original/fuji.png";
    const body = await download(s3Client,BUCKET_NAME,key);
    console.log(body);
}

//main();

