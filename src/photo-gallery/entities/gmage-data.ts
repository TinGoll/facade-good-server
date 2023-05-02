import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
class FallbackImage {
  @Field(() => String, { nullable: true })
  src: string;

  @Field(() => String, { nullable: true })
  srcSet: string;

  @Field(() => String, { nullable: true })
  sizes: string;
}

@ObjectType()
class Images {
  @Field(() => FallbackImage)
  fallback: FallbackImage;
}

@ObjectType()
export class ImageData {
  @Field(() => Images)
  images: Images;

  @Field(() => String)
  layout: 'constrained';

  @Field(() => Float)
  aspectRatio: number;
}