export const generateImageUrl = (prompt: string): string => {
  const encodedPrompt = encodeURIComponent(prompt);
  const randomSeed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?nologo=true&seed=${randomSeed}`;
};
