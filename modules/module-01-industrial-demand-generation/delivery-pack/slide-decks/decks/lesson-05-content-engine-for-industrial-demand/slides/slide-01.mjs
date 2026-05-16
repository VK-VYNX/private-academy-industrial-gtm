import { renderSlide } from "../../../src/deck-runtime.mjs";
import { lessons } from "../../../src/lesson-data.mjs";

const lesson = lessons.find((item) => item.id === "05");

export async function slide01(presentation, ctx) {
  return renderSlide(presentation, ctx, lesson, 1);
}
