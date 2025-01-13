import path from "path"
import jimp from "jimp"

const REPOSITORY_TOP = path.resolve(__dirname,"../../../");

async function main(){
    const imagePath = path.join(REPOSITORY_TOP,"images/fuji.png");
    console.log(`reading an image form ${imagePath}`);

    const image = await jimp.read(imagePath);
    const width = image.getWidth();
    const height = image.getHeight();

    console.log(`original size: ${width} ,${height}`);
    const resizedWidth = Math.floor(width/2);
    const resizedHeight = Math.floor(height/2);
    console.log(`resized size: ${resizedWidth} ,${resizedHeight}`);

    image.resize(resizedWidth,resizedHeight);
    image.write('resized_fuji.png');
}

main();