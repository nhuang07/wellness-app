import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY!);
export const gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateTasksForUser(
  userPrompt: string,
): Promise<string[]> {
  const systemPrompt = `You are a supportive wellness coach. Based on what the user shares, generate 3-4 specific, actionable tasks they can complete this week to address their situation.

Rules:
- Tasks should be concrete and achievable (something they can take a photo of as proof)
- Each task should be completable in a single session
- Be encouraging but practical
- If the user says nothing is wrong or wants random tasks, give general wellness tasks (exercise, hydration, sleep, social connection, etc.)

User's input: "${userPrompt}"

Return ONLY a JSON array of task strings, nothing else:
["task1", "task2", "task3", "task4"]`;

  const result = await gemini.generateContent(systemPrompt);
  const text = result.response.text();

  // Extract JSON array from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Failed to parse tasks");

  return JSON.parse(jsonMatch[0]);
}

// For when user has no problems / wants random tasks
export async function generateRandomWellnessTasks(): Promise<string[]> {
  return generateTasksForUser(
    "I don't have any specific problems, just give me some general wellness tasks to improve my week",
  );
}
