export async function analyzeImage(base64: string | undefined, apiKey: string) {
  if (base64 === undefined) throw new Error("base64 is undefined!");
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: 'image/jpeg', data: base64 } },
          { text: 'What is the name of the trading card? Answer only with the name.' }
        ]
      }]
    })
  });
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text;
}
