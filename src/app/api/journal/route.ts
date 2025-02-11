import { NextResponse } from "next/server";
import Together from "together-ai";

const API_KEY = process.env.TOGETHER_API_KEY;
if (!API_KEY) {
  throw new Error("TOGETHER_API_KEY is missing in environment variables.");
}

const together = new Together({ apiKey: API_KEY });

export async function POST(req: Request) {
  try {
    const { journalEntry } = await req.json();

    if (!journalEntry) {
      return NextResponse.json({ error: "Journal entry is required" }, { status: 400 });
    }

    // AI processing
    const journalPrompt: { role: "system" | "user"; content: string }[] = [
        {
          role: "system",
          content: `You are Manastithi, an empathetic therapy chatbot that provides mental health support.
          - Analyze the provided journal entry.
          - Identify key emotions, stressors, and patterns.
          - Offer constructive insights and encouragement.
          - Suggest mindfulness exercises or coping strategies.`,
        },
        { role: "user", content: `Here is my journal entry: \n${journalEntry}` },
      ];
    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      messages: journalPrompt,
    });

    const insights = response?.choices?.[0]?.message?.content || "No insights generated.";

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Error in journal processing:", error);
    return NextResponse.json({ error: "Server error while processing journal entry." }, { status: 500 });
  }
}