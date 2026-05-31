const pexels = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const worldImages = {
  hero: pexels(3184460),
  climate: pexels(957024),
  asia: pexels(53621),
  europe: pexels(290595),
  middleEast: pexels(4065153),
  americas: pexels(2159),
  africa: pexels(159397),
} as const;
