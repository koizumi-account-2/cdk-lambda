import path from "path"
import jimp from "jimp"
import Jimp from "jimp";

const REPOSITORY_TOP = path.resolve(__dirname,"../../../");

export function resize(image:Jimp):Jimp{

    const width = image.getWidth();
    const height = image.getHeight();

    console.log(`original size: ${width} ,${height}`);
    const resizedWidth = Math.floor(width/2);
    const resizedHeight = Math.floor(height/2);
    console.log(`resized size: ${resizedWidth} ,${resizedHeight}`);

    image.resize(resizedWidth,resizedHeight);
    return image;
}

async function main(){
    const key = "images/fuji.png";
    const imagePath = path.join(REPOSITORY_TOP,key);
    console.log(`reading an image form ${imagePath}`);
    const image = await jimp.read(imagePath);
    const resizedImage:Jimp = resize(image);
    resizedImage.write("resized_fuji.png");

}

//main();