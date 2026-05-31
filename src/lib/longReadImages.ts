/** Pexels stock photos for Long Reads (compress + width for responsive loading). */
const pexels = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const longReadImages = {
  environment: pexels(957024),
  technology: pexels(3861969),
  humanInterest: pexels(3184292),
  culture: pexels(1190298),
  science: pexels(356040),
  politics: pexels(290595),
} as const;
