import {S3Event, S3Handler} from 'aws-lambda'
import * as path from "path"

import {getImageFromS3, putImageToS3} from "../../common/src"
import { S3Client } from '@aws-sdk/client-s3';
import { S3Message } from "../../common/src/types";
import { SendMessageCommand, SendMessageCommandInput, SQSClient } from '@aws-sdk/client-sqs';


const DEIRECTORY = "resized";
const QUEUE_URL = process.env.QUEUE_URL;


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

        // send message sqs
        const s3Message:S3Message = {
            bucketName,
            key:uploadKey,
        };
        const sqsClient = new SQSClient();
        const sendCmdInput:SendMessageCommandInput = {
            QueueUrl:QUEUE_URL,
            MessageBody:JSON.stringify(s3Message)
        }; 
        const sqsCmd:SendMessageCommand  = new SendMessageCommand(sendCmdInput);

        await sqsClient.send(sqsCmd);
        console.log(`sent message to SQS, message: ${JSON.stringify(s3Message)}`);
    }
}