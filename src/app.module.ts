import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhotoGalleryModule } from './photo-gallery/photo-gallery.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';
import { FileSystemModule } from './file-system/file-system.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${
        process.env.NODE_ENV === 'development'
          ? '.env.development'
          : '.env.production'
      }`,
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve(process.env.MULTER_DEST || 'assets'),
      renderPath: '/',
      serveStaticOptions: {},
      exclude: ['/api/*'],
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      playground: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: config.get<'postgres'>('TYPEORM_CONNECTION'),
        host: config.get<string>('TYPEORM_HOST'),
        username: config.get<string>('TYPEORM_USERNAME'),
        password: config.get<string>('TYPEORM_PASSWORD'),
        database: config.get<string>('TYPEORM_DATABASE'),
        port: config.get<number>('TYPEORM_PORT'),
        entities: [__dirname + 'dist/**/*.entity{.ts,.js}'],
        migrations: [__dirname + 'src/migrations/*{.js,.ts}'],
        migrationsTableName: 'migrations',
        synchronize: true,
        autoLoadEntities: true,
        logging: ['error', 'migration',],
      }),
    }),
    PhotoGalleryModule,
    FileSystemModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
