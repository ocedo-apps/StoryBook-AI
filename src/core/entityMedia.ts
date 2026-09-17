import { z } from "zod";

/**
 * Pictures attached to a Story Bible entity for later Sandbox export.
 * Draft, extract, and brainstorm never read these.
 */
export const EntityPictureSchema = z.object({
  thumbDataUrl: z.string().min(1),
  imageDataUrl: z.string().min(1)
});
export type EntityPicture = z.infer<typeof EntityPictureSchema>;

export const EntityMediaSchema = z.object({
  entity_ref: z.string().min(1),
  pictures: z.array(EntityPictureSchema)
});
export type EntityMedia = z.infer<typeof EntityMediaSchema>;

export const MAX_ENTITY_PICTURES = 4;

export function picturesFor(media: EntityMedia[], entity_ref: string): EntityPicture[] {
  return media.find((row) => row.entity_ref === entity_ref)?.pictures ?? [];
}

export function addEntityPicture(media: EntityMedia[], entity_ref: string, picture: EntityPicture): EntityMedia[] {
  const existing = media.find((row) => row.entity_ref === entity_ref);
  if (!existing) return [...media, { entity_ref, pictures: [picture] }];
  if (existing.pictures.length >= MAX_ENTITY_PICTURES) return media;
  return media.map((row) =>
    row.entity_ref === entity_ref ? { ...row, pictures: [...row.pictures, picture] } : row
  );
}

export function removeEntityPicture(media: EntityMedia[], entity_ref: string, index: number): EntityMedia[] {
  return media
    .map((row) => {
      if (row.entity_ref !== entity_ref) return row;
      return { ...row, pictures: row.pictures.filter((_, item) => item !== index) };
    })
    .filter((row) => row.pictures.length > 0);
}
