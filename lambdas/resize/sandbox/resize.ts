import path from "path"
import jimp from "jimp"

const REPOSITORY_TOP = path.resolve(__dirname,"../../../");

async function main(){
    const imagePath = path.join(REPOSITORY_TOP,"images/fuji.png");
    console.log(`reading an image form ${imagePath}`);

    const image = await jimp.read(imagePath);
    image.resize(100,100);
    image.write('resized_fuji.png');
}

main();