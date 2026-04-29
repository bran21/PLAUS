import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, context, tab } = body;

    const apiKey = process.env.QWEN_API_KEY;
    let apiUrl = process.env.QWEN_API_URL || "https://api.openai.com/v1/chat/completions";
    const model = process.env.QWEN_MODEL || "qwen-plus";

    if (!apiUrl.endsWith("/chat/completions")) {
      apiUrl = apiUrl.replace(/\/$/, "") + "/chat/completions";
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is not configured in .env.local" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are the Plaus Protocol AIAgent, an autonomous on-chain RWA investment agent operating on Solana.
The user is interacting with the '${tab}' tab.
Here is the real-time on-chain context of the RWA pools:
${JSON.stringify(context, null, 2)}

Your job is to respond appropriately based on the tab and the user's intent. 
If the user wants to TRANSACT (invest, liquidate, swap, add liquidity):
You MUST output a valid JSON block enclosed in \`\`\`json containing {"content": "your response to user", "action": {"fn": "invest_funds"|"swap"|"add_liquidity", "amount": "number", "token": "ticker", "price": number, "units": "number"}}.
If the user wants to RESEARCH or INVESTIGATE:
You MUST output a valid JSON block enclosed in \`\`\`json containing {"content": "your detailed findings and markdown response", "steps": [{"label": "action", "detail": "explanation", "done": true}]}.

Do NOT output plain text outside the JSON block. Always format the response strictly as the required JSON.`;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: apiMessages,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Qwen API Error:", err);
      return NextResponse.json(
        { 
          error: `LLM API Error: ${response.statusText}`,
          debug: {
            urlTried: apiUrl,
            model: model,
            authPrefix: apiKey ? apiKey.substring(0, 4) : "None",
            body: err
          }
        },
        { status: 400 } // use 400 so nextjs doesn't suppress the output
      );
    }

    const data = await response.json();
    const rawOutput = data.choices[0].message.content;

    // Parse the JSON block from the LLM output
    const jsonMatch = rawOutput.match(/\`\`\`json\s*(\{[\s\S]*?\})\s*\`\`\`/);
    let resultJSON = {};
    if (jsonMatch && jsonMatch[1]) {
      try {
        resultJSON = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse LLM JSON:", e);
      }
    } else {
      // Fallback: try parsing the whole output if it forgot backticks
      try {
        resultJSON = JSON.parse(rawOutput);
      } catch (e) {
        resultJSON = { content: rawOutput, steps: [] };
      }
    }

    return NextResponse.json(resultJSON);
  } catch (e: any) {
    console.error("Agent API Route Error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
