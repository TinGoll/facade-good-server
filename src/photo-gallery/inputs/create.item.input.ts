import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateGalleryItemInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  subtitle?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  params?: string;

  @Field({ nullable: true })
  tag: string;

  @Field({ nullable: true })
  category: string;

  @Field({ nullable: true })
  index?: number;
}
