import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GalleryItem } from './gallery-item.entity';
import { ImageData } from './gmage-data';

@ObjectType()
@Entity('gallery_images')
export class GalleryImage {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 512 })
  filename: string;

  @Field()
  @Column({ type: 'varchar', length: 512 })
  originalname: string;

  @Field()
  @Column({ type: 'varchar', length: 256 })
  encoding: string;

  @Field()
  @Column({ type: 'varchar', length: 256 })
  mimetype: string;

  @Field()
  @Column({ type: 'varchar', length: 256, nullable: true })
  destination: string;

  @Field()
  @Column({ type: 'varchar', length: 512 })
  path: string;

  @Field()
  @Column({ type: 'numeric', default: 0 })
  size: number;

  @Field()
  @Column({ type: 'numeric', default: 0 })
  index: number;

  @ManyToOne(() => GalleryItem, (item) => item.images, {
    onDelete: 'CASCADE',
  })
  item: GalleryItem;
}
