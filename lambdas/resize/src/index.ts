import { GetObjectCommand, GetObjectCommandInput, PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import {S3Event, S3Handler} from 'aws-lambda'
import * as jimp from "jimp"
import * as path from "path"

const DEIRECTORY = "resized";

export const handler:S3Handler = async (event:S3Event)=>{
    const s3Client = new S3Client();
    for(const record of event.Records){
        const bucketName = record.s3.bucket.name;
        const key = record.s3.object.key;

        const parsedKey = path.parse(key);
        // download
        const input:GetObjectCommandInput = {
            Bucket:bucketName,
            Key:key
        };
        console.log(`downloading from s3://${bucketName}/${key}`)
        const cmd = new GetObjectCommand(input);
        const result = await s3Client.send(cmd);
        if(!result.Body){
            throw Error("result.Body is undefined");
        }
        const body = await result.Body.transformToByteArray();
        console.log(body);

        // edit
        const bodyBuffer = Buffer.from(body);
        const image = await jimp.read(bodyBuffer);
        const width = image.getWidth();
        const height = image.getHeight();

        console.log(`original size: ${width} ,${height}`);
        const resizedWidth = Math.floor(width/2);
        const resizedHeight = Math.floor(height/2);
        console.log(`resized size: ${resizedWidth} ,${resizedHeight}`);

        image.resize(resizedWidth,resizedHeight);
        image.write('resized_fuji.png');

        // upload
        const uploadKey = `${DEIRECTORY}/${parsedKey.name}-resize${parsedKey.ext}`;
        const imageBuffer = await image.getBufferAsync(image.getMIME());
        console.log(`uploadKey:${uploadKey}, bucket:${bucketName}`);
        const putInput:PutObjectCommandInput = {
            Bucket:bucketName,
            Key:uploadKey,
            Body:imageBuffer
        } 

        const putObjectCommand = new PutObjectCommand(putInput);
        const uploadResult = await s3Client.send(putObjectCommand);
        console.log(uploadResult);



    }
}