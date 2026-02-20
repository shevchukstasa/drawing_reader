export const maxDuration = 60; // Allow up to 60s for large PDFs
export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `You are an expert drawing/blueprint analyzer for a lava stone product manufacturing company. Your job is to extract product specifications from architectural drawings, blueprints, sketches, and technical documents.

REFERENCE DATA (our standard catalog):
- Product Types: Tile, Countertop, Sink, 3D
- Product Shapes: Square / Rectangular, Round, Freeform, Triangular
- Standard Sizes (cm): 10x10, 10x20, 10x40, 5x20, 20x20, 20x40
- Glaze Placements: Face only, Face + 1-2 edges, Face + 3-4 edges, Face with back
- Applications: SS (Spray-Spray), BS (Brush-Spray), S (Spray glaze only), SB (Spray-Brush), Stencil, Silkscreen, Raku, Splashing, Gold
- Finishing Types: Mix, Minimal character, Middle character, Full character, Honed
- Our Color Palette: Burgundy, Lava Core, Raw Turmeric, Wild Honey, Mocha Nude, Rose Dust, Wabi Beige, Wild Olive, Basalt Green, Moss Glaze, Jade Dream, Matcha Leaf, Turquoise Depth, Lagoon Spark, Frost Blue, Frosted White, Milk Crackle, Soft Graphite, Lavender Ash, Velvet Fig, Raw Indigo, Black Rock, Raku Turquoise, Raku Green, Gold

RULES:
1. Extract ALL distinct product positions/items from the drawing
2. ALWAYS convert dimensions to centimeters (drawings are usually in mm unless marked otherwise)
3. If dimension unit not specified: numbers > 50 are likely mm, numbers < 10 with decimals are likely cm
4. If finishing/texture is NOT specified, default to "Honed"
5. Check if colors match our palette. If not, mark as Custom Color = true
6. Check if sizes match our standard sizes
7. For each field, assign confidence: "high", "medium", or "low"
8. If you cannot determine a value, set it to null and add a question for the manager
9. Extract project name, contractor codes (like ADD-804A-SG, TL-501, SP-504), and any other metadata
10. Detect the language of the drawing
11. If areas/quantities are already calculated on the drawing, extract them too
12. For 3D products (profiles, curved tiles, corner tiles, list tiles), still classify as Product Type "3D"
13. RAL codes, Dulux color names, or any non-standard color references → Custom Color = true
14. Look for handwritten notes on color samples if present

Respond ONLY with valid JSON (no markdown, no backticks, no preamble) in this exact structure:
{
  "project": {
    "name": "project name or null",
    "language": "detected language",
    "contractor_codes": ["list of codes found"],
    "notes": "any general notes"
  },
  "positions": [
    {
      "position_number": 1,
      "zone_or_area": "zone name if applicable",
      "product_type": { "value": "Tile|Countertop|Sink|3D", "confidence": "high|medium|low" },
      "product_shape": { "value": "shape", "confidence": "high|medium|low" },
      "length_cm": { "value": 0, "confidence": "high|medium|low", "original_value": "original from drawing", "original_unit": "mm|cm|inch" },
      "width_cm": { "value": 0, "confidence": "high|medium|low", "original_value": "original from drawing", "original_unit": "mm|cm|inch" },
      "thickness_cm": { "value": 0, "confidence": "high|medium|low", "original_value": "original from drawing", "original_unit": "mm|cm|inch" },
      "is_standard_size": true,
      "glaze_placement": { "value": "placement", "confidence": "high|medium|low" },
      "glaze_color": { "value": "color name", "confidence": "high|medium|low" },
      "is_custom_color": true,
      "application": { "value": "application type", "confidence": "high|medium|low" },
      "finishing": { "value": "Honed", "confidence": "high|medium|low" },
      "quantity_pcs": { "value": 0, "confidence": "high|medium|low" },
      "quantity_m2": { "value": 0, "confidence": "high|medium|low" },
      "num_glaze_colors": 1,
      "edge_profile": "edge type or null",
      "cutouts": "description or null",
      "surface_texture": "sawn cut / honed or null",
      "questions_for_manager": ["list of things that need clarification"]
    }
  ],
  "summary": {
    "total_positions": 0,
    "total_questions": 0,
    "warnings": ["list of warnings"]
  }
}`;

const USER_PROMPT = "Проанализируй этот чертёж/документ и извлеки все позиции изделий из лавового камня. Верни результат ТОЛЬКО в формате JSON без каких-либо обёрток.";

async function callAnthropic(base64Data, mimeType) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const isPDF = mimeType === "application/pdf";
  const contentBlock = isPDF
    ? { type: "document", source: { type: "base64", media_type: mimeType, data: base64Data } }
    : { type: "image", source: { type: "base64", media_type: mimeType, data: base64Data } };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: [contentBlock, { type: "text", text: USER_PROMPT }]
      }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content.map(i => i.text || "").join("\n");
}

async function callOpenAI(base64Data, mimeType) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 8000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: USER_PROMPT },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}`, detail: "high" } }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { base64, mimeType, provider } = body;

    if (!base64 || !mimeType) {
      return Response.json({ error: "Missing base64 or mimeType" }, { status: 400 });
    }

    const chosenProvider = provider || process.env.DEFAULT_PROVIDER || "anthropic";

    let rawText;
    if (chosenProvider === "openai") {
      rawText = await callOpenAI(base64, mimeType);
    } else {
      rawText = await callAnthropic(base64, mimeType);
    }

    // Parse JSON from response
    const clean = rawText.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      else throw new Error("Failed to parse AI response as JSON");
    }

    return Response.json({ result: parsed, provider: chosenProvider });

  } catch (err) {
    console.error("Analyze error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
