import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GalleryItem } from '../entities/gallery-item.entity';
import { GalleryImage } from '../entities/gallery-image.entity';
import {
  Observable,
  catchError,
  concatMap,
  forkJoin,
  from,
  mergeMap,
  of,
  switchMap,
  tap,
  throwError,
  toArray,
} from 'rxjs';
import { CreateGalleryItemInput } from '../inputs/create.item.input';
import { CreateGalleryImageInput } from '../inputs/create.image.input';
import { FileSystemService } from 'src/file-system/file-system.service';
import { ConfigService } from '@nestjs/config';

import * as sharp from 'sharp';
import * as path from 'path';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(GalleryItem)
    private readonly itemRepository: Repository<GalleryItem>,
    @InjectRepository(GalleryImage)
    private readonly imageRepository: Repository<GalleryImage>,
    private readonly fileSystemService: FileSystemService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Создание элемента галереи
   * @param input набор полей элемента галереи
   * @param images массив из полей для создания изображени.
   * @returns Observable<GalleryItem>
   */
  create(input: CreateGalleryItemInput): Observable<GalleryItem> {
    const entity = this.itemRepository.create(input);
    return from(this.itemRepository.save(entity));
  }

  addImage(
    id: number,
    input: CreateGalleryImageInput[],
  ): Observable<GalleryImage[]> {
    return from(input).pipe(
      mergeMap((singleInput) => {
        return this.findOne(id).pipe(
          switchMap((item: GalleryItem) => {
            if (!item) {
              throw new Error('Элемент галереи не найден.');
            }
            const entity = this.imageRepository.create(singleInput);
            entity.item = item;
            return this.imageRepository.save(entity);
          }),
          catchError((err) => {
            return throwError(() => new Error(err.message));
          }),
        );
      }),
      toArray(),
    );
  }

  /**
   * Метод удаления элемента галереи.
   * @param id элемента галереи
   * @returns
   */
  removeItem(id: number) {
    return from(this.findOne(id)).pipe(
      switchMap((item) => {
        if (!item) {
          return throwError(() => new Error('Элемент галереи не найден.'));
        }
        const images = item.images;
        return from(this.itemRepository.delete(item)).pipe(
          concatMap(() => {
            return from(images).pipe(
              concatMap((image) =>
                this.deleteImage(image).pipe(
                  catchError((error) => {
                    console.error(`Error deleting image: ${error}`);
                    return of(null);
                  }),
                ),
              ),
            );
          }),
        );
      }),
    );
  }

  /**
   * Метод удаления изображения
   * @param id изображения
   * @returns
   */
  removeImage(id: number) {
    return from(this.imageRepository.findOne({ where: { id } })).pipe(
      switchMap((entity) => {
        if (!entity) {
          return throwError(() => new Error('Элемент галереи не найден.'));
        }
        return this.deleteImage(entity);
      }),
    );
  }

  /**
   * Приватный метод, удаления картинки из базы данных и вактического удаления файла из папки
   * @param image сущность изображения.
   * @returns
   */
  private deleteImage(image: GalleryImage): Observable<unknown> {
    const imageFolder = this.configService.get<string>('IMAGES_FOLDER');

    return from(this.imageRepository.delete({ id: image.id })).pipe(
      tap((result) =>
        console.log(`Deleted image ${image.id} from DB. Result:`, result),
      ),
      switchMap(() =>
        forkJoin([
          from(
            this.fileSystemService.deleteFile(
              `${image.filename}.jpeg`,
              imageFolder,
            ),
          ).pipe(
            catchError((error) => {
              console.error(`Error deleting JPEG file: ${error}`);
              return of(null);
            }),
          ),
          from(
            this.fileSystemService.deleteFile(
              `${image.filename}.webp`,
              imageFolder,
            ),
          ).pipe(
            catchError((error) => {
              console.error(`Error deleting WEBP file: ${error}`);
              return of(null);
            }),
          ),
        ]),
      ),
      mergeMap(() => {
        console.log('Files deleted successfully');
        return of(image.id);
      }),
      catchError((error) => {
        console.error(`Error deleting image: ${error}`);
        throw error;
      }),
    );
  }

  /** Поиск одного элемента галереи по id */
  findOne(id: number): Observable<GalleryItem> {
    return from(this.itemRepository.findOne({ where: { id } }));
  }

  /** Поиск нескольких элементов галереи, используя в качестве фильтра объект из полей */
  find({ tag, category }: { tag?: string; category?: string }) {
    return from(
      this.itemRepository.find({
        where: {
          tag,
          category,
        },
      }),
    );
  }

  async convertImageToData(imageName: string): Promise<ImageData> {
    const assetFolder = this.configService.get('MULTER_DEST');
    const folder = this.configService.get('IMAGES_FOLDER');
    const imagePath = path.resolve(assetFolder, folder, imageName);
    const imageBuffer = await sharp(imagePath)
      .resize({ width: 800 })
      .toBuffer();
    const metadata = await sharp(imageBuffer).metadata();
    const src = `data:image/${metadata.format};base64,${imageBuffer.toString(
      'base64',
    )}`;
    const srcSet = `${src} 1x, ${src} 2x`;
    const sizes = '(min-width: 800px) 800px, 100vw';
    const aspectRatio = metadata.width / metadata.height;
    return {
      images: {
        fallback: {
          src,
          srcSet,
          sizes,
        },
      },
      layout: 'constrained',
      aspectRatio,
    };
  }
}

interface ImageData {
  images: {
    fallback: {
      src: string;
      srcSet: string;
      sizes: string;
    };
  };
  layout: 'constrained';
  aspectRatio: number;
}
