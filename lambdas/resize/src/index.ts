import {S3Event, S3Handler} from 'aws-lambda'
import * as path from "path"

import {getImageFromS3, putImageToS3} from "../../common/src"
import { S3Client } from '@aws-sdk/client-s3';

const DEIRECTORY = "resized";

export const handler:S3Handler = async (event:S3Event)=>{
    const s3Client = new S3Client();
    for(const record of event.Records){
        const bucketName = record.s3.bucket.name;
        const key = record.s3.object.key;

        const parsedKey = path.parse(key);
        // download
        const image = await getImageFromS3(s3Client,bucketName,key);
        // edit

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
        await putImageToS3(s3Client,bucketName,uploadKey,imageBuffer);
    }
}