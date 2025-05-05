export const rotationConfig: Record<number, Record<number, number[]>> = {
  1: { 0: [0] },
  2: { 0: [0, 180], 1: [180, 0] },
  3: { 0: [0, 0, 180], 1: [0, 0, 180], 2: [180, 180, 0] },
  4: { 0: [0, 0, 180, 180], 1: [0, 0, 180, 180], 2: [180, 180, 0, 0], 3: [180, 180, 0, 0] },
};

export const getRotationForPlayer = (players: number, targetIndex: number, viewerIndex: number): number => {
  return rotationConfig[players]?.[viewerIndex]?.[targetIndex] || 0;
};
