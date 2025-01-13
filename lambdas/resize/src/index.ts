import {S3Event, S3Handler} from 'aws-lambda'
import { resize } from '../sandbox/resize';
import { download } from '../sandbox/download';
import { uplaod } from '../sandbox/upload';
import jimp from 'jimp';
import path from 'path';

const DIRECTORY = "resized";

export const handler:S3Handler = async (event:S3Event)=>{
    for(const record of event.Records){
        const bucketName = record.s3.bucket.name;
        const key = record.s3.object.key;
        const body = await download(bucketName,key)
        const parsedKey = path.parse(key);
        console.log(`body ${body}`)
        const bodyBuffer= Buffer.from(body);
        const image = await jimp.read(bodyBuffer);
        const resizedImage = resize(image);
        const mime = resizedImage.getMIME();
        const imageBuffer = await image.getBufferAsync(mime);
        const uploadKey = `${DIRECTORY}/${parsedKey.name}-resize${parsedKey.ext}`;
        console.log(`uploadKey:${uploadKey}`)
        const result = await uplaod(imageBuffer,bucketName,uploadKey);
        console.log(`upload結果:${result}`);
    }
}