import { renderSlide } from "../../../src/deck-runtime.mjs";
import { lessons } from "../../../src/lesson-data.mjs";

const lesson = lessons.find((item) => item.id === "01");

export async function slide14(presentation, ctx) {
  return renderSlide(presentation, ctx, lesson, 14);
}
