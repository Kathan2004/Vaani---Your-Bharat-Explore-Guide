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

    // message structur (badme modify kr skte)
    
    const journalPrompt: { role: "system" | "user"; content: string }[] = [
      {
        role: "system",
        content: `You are Manastithi, an empathetic therapy chatbot. Analyze the journal entry and provide exactly 3 key insights. Format your response as follows:

1. First key insight about emotional patterns or core feelings
2. Second key insight about potential stressors or challenges
3. Third key insight with a specific, actionable suggestion
4.Also respond in any language asked for .

Keep each insight concise (1-2 sentences). Separate insights with exactly one newline. Do not add any additional text or formatting.`,
      },
      { role: "user", content: `Here is my journal entry: \n${journalEntry}` },
    ];

    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      messages: journalPrompt, 
      max_tokens: 500,
    });

    const insights = response?.choices?.[0]?.message?.content || "No insights generated.";

    const formattedInsights = insights
      .split(/\d+\.\s+/) 
      .filter(insight => insight.trim()) 
      .map(insight => insight.trim()) 
      .slice(0, 3); 

    return NextResponse.json({ insights: formattedInsights.join('\n') });
  } catch (error) {
    console.error("Error in journal processing:", error);
    return NextResponse.json({ error: "Server error while processing journal entry." }, { status: 500 });
  }
}
