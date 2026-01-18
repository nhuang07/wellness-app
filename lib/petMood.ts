export const clampMood = (value: number) =>
  Math.max(0, Math.min(100, value));

export const decayMoodTest = (
  mood: number,
  lastTaskAt: string
) => {
  const now = Date.now();
  const last = new Date(lastTaskAt).getTime();

  const secondsPassed = Math.floor((now - last) / 1000);
  const decaySteps = Math.floor(secondsPassed / 10);

  if (decaySteps <= 0) return mood;

  return clampMood(mood - decaySteps * 10);
};

export const increaseMoodTest = (mood: number) =>
  clampMood(mood + 20);
