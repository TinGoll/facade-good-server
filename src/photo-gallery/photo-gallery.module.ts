import { Module } from '@nestjs/common';
import { GalleryController } from './controllers/gallery.controller';
import { GalleryResolver } from './resolvers/gallery.resolver';
import { GalleryService } from './services/gallery.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryImage } from './entities/gallery-image.entity';
import { GalleryItem } from './entities/gallery-item.entity';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage, memoryStorage } from 'multer';
import { resolve } from 'path';
import nanoid from 'src/cammon/nanoid';
import { FileSystemModule } from 'src/file-system/file-system.module';
import { SharpPipe } from './pipes/sharp.pipe';

@Module({
  imports: [
    FileSystemModule,
    TypeOrmModule.forFeature([GalleryImage, GalleryItem]),
    MulterModule.register({
      storage: memoryStorage()
    })
  ],
  controllers: [GalleryController],
  providers: [GalleryService, GalleryResolver, SharpPipe],
})
export class PhotoGalleryModule {}
