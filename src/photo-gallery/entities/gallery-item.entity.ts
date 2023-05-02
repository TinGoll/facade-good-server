import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GalleryImage } from './gallery-image.entity';

@ObjectType()
@Entity('gallery_items')
export class GalleryItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @CreateDateColumn()
  createdAt: string;

  @Field()
  @UpdateDateColumn()
  updatedAt: string;

  @Field()
  @Column({ type: 'varchar', length: 128, nullable: true })
  title: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 256, nullable: true })
  subtitle: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 1024, nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 256, nullable: true, default: '' })
  params: string;

  @Field({ nullable: true })
  @Column({ type: 'varchar', length: 128, nullable: true })
  tag: string;

  @Field()
  @Column({ type: 'varchar', length: 128, nullable: true })
  category: string;

  @Field()
  @Column({ type: 'numeric', default: 0 })
  index: number;

  @Field((type) => [GalleryImage], { nullable: true })
  @OneToMany(() => GalleryImage, (image) => image.item, {
    eager: true,
  })
  images: GalleryImage[];
}
