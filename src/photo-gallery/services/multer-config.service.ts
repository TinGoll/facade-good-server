import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, resolve } from 'path';
import * as sharp from 'sharp';
import nanoid from 'src/cammon/nanoid';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMulterOptions(): MulterModuleOptions {
    const path: string = this.configService.get('MULTER_DEST') || 'assets';
    const imagesFolder: string =
      this.configService.get('IMAGES_FOLDER') || 'images';

    return {
      storage: diskStorage({
        destination: async (req, file, cb) => {
          return cb(null, join(path, imagesFolder));
        },
        filename: (req, file, cb) => {

            console.log("filename >>>>>>>>>>>>>>>>", file);
            
            const filename = nanoid();
            const extension = file.mimetype.split('/').pop();
     
          // Use Sharp.js to resize and save image in jpeg format
          sharp(file.buffer)
            .resize(800)
            .jpeg()
            .toFile(resolve(path, imagesFolder, `${filename}.jpeg`), (err) => {
              if (err) {
                console.error(err);
              }
            });

          // Use Sharp.js to resize and save image in WEBP format
          sharp(file.buffer)
            .resize(800)
            .webp()
            .toFile(resolve(path, imagesFolder, `${filename}.webp`), (err) => {
              if (err) {
                console.error(err);
              }
            });

          return cb(null, `${filename}.${extension}`);
        },
      }),
    };
  }
}
