import path from "path"
import jimp from "jimp"
import 'dotenv/config'
import { S3Client,PutObjectCommand,PutObjectCommandInput, PutObjectAclCommand } from '@aws-sdk/client-s3';

const BUCKET_NAME = process.env.BUCKET_NAME;
const REPOSITORY_TOP = path.resolve(__dirname,"../../../");

async function main(){
    const s3Client = new S3Client();
    const imagePath = path.join(REPOSITORY_TOP,"images/fuji.png");
    console.log(`reading an image form ${imagePath}`);
    const image = await jimp.read(imagePath);

    const imageBuffer = await image.getBufferAsync(image.getMIME());
    const putInput:PutObjectCommandInput = {
        Bucket:BUCKET_NAME,
        Key:"temp/fuji.png",
        Body:imageBuffer
    } 

    const putObjectCommand = new PutObjectCommand(putInput);
    const result = await s3Client.send(putObjectCommand);
    console.log(result);
}

main();