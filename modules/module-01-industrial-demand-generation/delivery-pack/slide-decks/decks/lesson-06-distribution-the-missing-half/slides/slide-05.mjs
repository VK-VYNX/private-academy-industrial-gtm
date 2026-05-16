import { renderSlide } from "../../../src/deck-runtime.mjs";
import { lessons } from "../../../src/lesson-data.mjs";

const lesson = lessons.find((item) => item.id === "06");

export async function slide05(presentation, ctx) {
  return renderSlide(presentation, ctx, lesson, 5);
}
