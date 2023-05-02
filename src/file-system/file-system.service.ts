import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class FileSystemService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Генерирует путь к статической папке.
   * @returns string
   */
  getAssetPath(): string {
    const assetFolder = this.configService.get('MULTER_DEST');
    const assetPath = path.resolve(assetFolder);
    return assetPath;
  }

  /**
   * Удаление файлов из статической папки.
   * @param fileName название файла с расширением
   * @param folder подпапка
   * @returns void
   */
  deleteFile(fileName: string, folder: string = ''): Promise<void> {
    const staticFolder = this.getAssetPath();

    return new Promise((res, rej) => {
      fs.unlink(path.join(staticFolder, folder, fileName), (err) => {
        if (err)
          rej(new HttpException(`Не удалось удалить файл ${fileName}.`, 500));
        return res();
      });
    });
  }

  async getImageData(
    fileName: string,
    width: number = 800,
    quality: number = 90,
  ): Promise<any> {
    const staticFolder = this.getAssetPath();
    const folder = this.configService.get('IMAGES_FOLDER');
    const imagePath = path.join(staticFolder, folder, fileName);
    const pipeline = sharp(imagePath);

    // Определить формат изображения
    const metadata = await pipeline.metadata();
    const { format } = metadata;

    // Преобразовать изображение
    const buffer = await pipeline
      .resize({ width })
      .toFormat('jpeg', { quality })
      .toBuffer();

    // Вернуть данные для использования в Gatsby Image
    const imageData = {
      width,
      height: metadata.height,
      images: {
        fallback: {
          src: `data:image/${format};base64,${buffer.toString('base64')}`,
          srcSet: `data:image/${format};base64,${buffer.toString(
            'base64',
          )} ${width}w`,
          sizes: `${width}px`,
        },
      },
      placeholder: {
        fallback: `data:image/${format};base64,${buffer.toString('base64')}`,
      },
    };

    return imageData;
  }
}

type GalleryImageType = {
  id: string;
  index: number;
  filename: string;
  size: number;
  originalname: string;
  encoding: string;
  mimetype: string;
  imageData: {
    src: string;
    aspectRatio: number;
    // добавляем поля, связанные с компонентом Gatsby Image
    width: number;
    height: number;
    layout: 'fixed' | 'fullWidth' | 'constrained';
    placeholder: string;
    blurred: string;
  };
};
