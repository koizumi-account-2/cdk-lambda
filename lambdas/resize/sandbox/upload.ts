import 'dotenv/config'
import path from "path"
import jimp from "jimp"
import { S3Client, PutObjectCommandInput, PutObjectCommand } from '@aws-sdk/client-s3';

const BUCKET_NAME = process.env.BUCKET_NAME;
const REPOSITORY_TOP = path.resolve(__dirname,"../../../");

export async function uplaod(imageBuffer:Buffer,bucketName:string ,uploadPath:string){
    const s3Client = new S3Client();
    //const key = "original/fuji.png";
    const input:PutObjectCommandInput = {
        Bucket:bucketName,
        Key:uploadPath,
        Body:imageBuffer
    };
    const cmd = new PutObjectCommand(input);
    await s3Client.send(cmd);
}

async function main(){
    if(!BUCKET_NAME){
        throw Error("BUCKET_NAMEが空です");
    }
    const key = "fuji.png";
    const imagePath = path.join(REPOSITORY_TOP,"images",key);
    console.log(`reading an image form ${imagePath}`);
    const image = await jimp.read(imagePath);
    const mime = image.getMIME();
    const imageBuffer = await image.getBufferAsync(mime);
    await uplaod(imageBuffer,BUCKET_NAME,`temp/${key}`);
}

main();

