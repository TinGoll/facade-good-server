import { Args, Query, Resolver } from '@nestjs/graphql';
import { GalleryService } from '../services/gallery.service';
import { GalleryItem } from '../entities/gallery-item.entity';



@Resolver('Gallery')
export class GalleryResolver {
  constructor(private readonly galleryService: GalleryService) {}

  @Query(() => [GalleryItem])
  findAll(
    @Args('tag', { nullable: true }) tag: string,
    @Args('category', { nullable: true }) category: string,
  ) {

    return this.galleryService.find({
        tag,
        category
    })
  }
}
