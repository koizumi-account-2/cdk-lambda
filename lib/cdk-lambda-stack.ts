import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from "aws-cdk-lib/aws-s3"
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import * as sqs from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

const REPOSITORY_TOP=path.join(__dirname,"../");
const PREFIX = "cdk-lambda-koizumi-test"



export class CdkLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const bucket = new s3.Bucket(this,`${PREFIX}-bucket`,{
      bucketName: PREFIX,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    //sqs
    //DSQ
    const dlqGrayscle = new sqs.Queue(this,`${PREFIX}-dlq-grayscale`,{
      queueName: `${PREFIX}-dlq-grayscale`,
    })
    const queueGrayScale = new sqs.Queue(this,`${PREFIX}-queue-grayscale`,{
      queueName:`${PREFIX}-queue-grayscale`,
      deadLetterQueue:{
        queue : dlqGrayscle,
        maxReceiveCount: 1 //１回失敗すると、DQLに送信される
      }
    });

    console.log(`queueGrayScale.queueUrl : ${queueGrayScale.queueUrl}`);
    // lambda : resize
    const resizeLambda = new NodejsFunction(this,`${PREFIX}-lambda-resize`,{
      functionName: `${PREFIX}-resize`,
      entry: path.join(REPOSITORY_TOP,"lambdas/resize/src/index.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(30),
      environment:{
        QUEUE_URL:queueGrayScale.queueUrl
      }
    })

    bucket.grantPut(resizeLambda)
    bucket.grantReadWrite(resizeLambda)
    queueGrayScale.grantSendMessages(resizeLambda); //queueGrayScaleはresizeLambdaにメッセージを送ることができる



    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new LambdaDestination(resizeLambda),
      {
        prefix: "original/"
      }
    );

    // lambda : grayscale
    const grayscaleLambda = new NodejsFunction(this,`${PREFIX}-lambda-grayscale`,{
      functionName: `${PREFIX}-grayscale`,
      entry: path.join(REPOSITORY_TOP,"lambdas/grayscale/src/index.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(30)
    })

    bucket.grantPut(grayscaleLambda);
    bucket.grantReadWrite(grayscaleLambda);
    grayscaleLambda.addEventSource(new SqsEventSource(queueGrayScale)); //QUEUEに入ってきたものが、grayscaleLambdaに流れてくる
  }
}
