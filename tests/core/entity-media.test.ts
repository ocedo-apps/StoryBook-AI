import { describe, expect, it } from "vitest";
import { addEntityPicture, picturesFor, removeEntityPicture } from "@core/entityMedia";

const shot = { thumbDataUrl: "data:image/jpeg;base64,thumb", imageDataUrl: "data:image/jpeg;base64,full" };

describe("entity media", () => {
  it("adds pictures under an entity and drops the row when the last one is removed", () => {
    const once = addEntityPicture([], "emma", shot);
    expect(picturesFor(once, "emma")).toHaveLength(1);
    expect(picturesFor(once, "stranger")).toEqual([]);
    const gone = removeEntityPicture(once, "emma", 0);
    expect(gone).toEqual([]);
  });

  it("caps an entity at four pictures", () => {
    let media = addEntityPicture([], "emma", shot);
    for (let i = 0; i < 10; i += 1) {
      media = addEntityPicture(media, "emma", shot);
    }
    expect(picturesFor(media, "emma")).toHaveLength(4);
  });
});
