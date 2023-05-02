import { Injectable, PipeTransform } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as sharp from 'sharp';
import { CreateGalleryImageInput } from '../inputs/create.image.input';
import nanoid from 'src/cammon/nanoid';

@Injectable()
export class SharpPipe
  implements
    PipeTransform<Express.Multer.File[], Promise<CreateGalleryImageInput[]>>
{
  private size = 800; // Размер наименьшей стороны
  private quality = 100; // Качество картинок

  constructor(private readonly configService: ConfigService) {}

  async transform(
    images: Express.Multer.File[],
  ): Promise<CreateGalleryImageInput[]> {
    const assetsPath: string =
      this.configService.get('MULTER_DEST') || 'assets';
    const imagesFolder = this.configService.get('IMAGES_FOLDER') || 'images';

    const inputs = await Promise.all(
      images.map(async (image) => {
        const filename = `image-${nanoid()}`;
        const { buffer, ...inputData } = image;

        const { width, height } = await sharp(buffer).metadata();

        let newWidth = this.size;
        let newHeight = Math.round((newWidth / width) * height);

        if (height < width) {
          newHeight = this.size;
          newWidth = Math.round((newHeight / height) * width);
        }

        const webp = sharp(buffer)
          .resize(newWidth, newHeight)
          .webp({ quality: this.quality, effort: 3 });
        await webp.toFile(
          path.resolve(assetsPath, imagesFolder, `${filename}.webp`),
        );
        const jpeg = sharp(buffer)
          .resize(newWidth, newHeight)
          .jpeg({ quality: this.quality, progressive: true });
        await jpeg.toFile(
          path.resolve(assetsPath, imagesFolder, `${filename}.jpeg`),
        );
        return {
          ...inputData,
          filename,
          path: path.resolve(assetsPath, imagesFolder),
        };
      }),
    );

    return inputs;
  }

}
