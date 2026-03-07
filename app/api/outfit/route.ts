import { streamText, Output } from "ai"
import { z } from "zod"

export async function POST(req: Request) {
  const { weather, location } = await req.json()

  const result = streamText({
    model: "openai/gpt-5-mini",
    system: `You are a stylish fashion consultant who gives practical, weather-appropriate outfit recommendations. 
Be specific about clothing items, colors, and materials. Consider the temperature, conditions, and time of day.
Keep recommendations modern, practical, and easy to follow.`,
    prompt: `Based on the following weather conditions, suggest a complete outfit:

Location: ${location}
Temperature: ${weather.temp}°F (${Math.round((weather.temp - 32) * 5 / 9)}°C)
Conditions: ${weather.description}
Humidity: ${weather.humidity}%
Wind Speed: ${weather.windSpeed} mph
Feels Like: ${weather.feelsLike}°F

Please provide:
1. A main outfit recommendation (top, bottom, footwear)
2. Outerwear if needed
3. Accessories to consider
4. Any tips for the specific weather conditions`,
    output: Output.object({
      schema: z.object({
        summary: z.string().describe("A brief 1-sentence summary of the outfit vibe"),
        top: z.string().describe("Recommended top/shirt"),
        bottom: z.string().describe("Recommended pants/shorts/skirt"),
        footwear: z.string().describe("Recommended shoes"),
        outerwear: z.string().nullable().describe("Jacket or coat if needed, null if not needed"),
        accessories: z.array(z.string()).describe("List of recommended accessories"),
        tips: z.string().describe("Weather-specific styling tips"),
        colorPalette: z.array(z.string()).describe("3-4 suggested colors that work well together"),
      }),
    }),
  })

  return result.toTextStreamResponse()
}
