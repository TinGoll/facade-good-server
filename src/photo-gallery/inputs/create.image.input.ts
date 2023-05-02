import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateGalleryImageInput {
  @Field()
  originalname: string;

  @Field()
  filename: string;

  @Field()
  encoding: string;

  @Field()
  mimetype: string;

  @Field({ nullable: true })
  destination: string;

  @Field()
  path: string;

  @Field()
  size: number;

  @Field({ nullable: true })
  index?: number;
}
