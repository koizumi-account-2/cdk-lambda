import * as jimp from 'jimp'
import * as path from 'path'

const REPOSITORY_TOP = path.resolve(__dirname, '../../../')

async function main() {
  const imagePath = path.join(REPOSITORY_TOP, 'images/fuji.png')
  console.log(`reading an image from: ${imagePath}`)

  const image = await jimp.read(imagePath)

  image.grayscale()

  image.write('glayscalefuji.png')
}

main()