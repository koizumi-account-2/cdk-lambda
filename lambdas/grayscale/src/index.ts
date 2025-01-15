import {SQSEvent, SQSHandler} from 'aws-lambda'
import * as path from "path"

import {getImageFromS3, putImageToS3} from "../../common/src"
import { S3Client } from '@aws-sdk/client-s3';
import {S3Message} from "../../common/src/types"


const PROCESS = "grayscale";

//SQSはbodyをStringで提供する

export const handler:SQSHandler = async (event:SQSEvent)=>{
    console.log(`Event: ${JSON.stringify(event, null, 2)}`)
    const s3Client = new S3Client();
    for(const record of event.Records){
        const message = record.body;
        const s3Message:S3Message = JSON.parse(message)
        const bucketName = s3Message.bucketName;
        const key = s3Message.key;
        const parsedKey = path.parse(key);
        // download
        const image = await getImageFromS3(s3Client,bucketName,key);
        // edit
        image.grayscale();
        // upload
        const uploadKey = `${PROCESS}/${parsedKey.name}-${PROCESS}${parsedKey.ext}`;
        const imageBuffer = await image.getBufferAsync(image.getMIME());
        console.log(`uploadKey:${uploadKey}, bucket:${bucketName}`);
        await putImageToS3(s3Client,bucketName,uploadKey,imageBuffer);


    }
}