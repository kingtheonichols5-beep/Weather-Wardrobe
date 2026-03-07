import { streamText, Output } from "ai"
import { z } from "zod"

export async function POST(req: Request) {
  const { weather, location, wardrobe, gender } = await req.json()

  const wardrobeList = wardrobe.join(", ")

  const result = streamText({
    model: "openai/gpt-5-mini",
    system: `You are a stylish fashion consultant who gives practical, weather-appropriate outfit recommendations.

IMPORTANT: You can ONLY recommend items from the user's wardrobe. Do not suggest any clothing items they don't own.
The user is ${gender === "male" ? "male" : "female"}.

Be specific about which items to wear together. Consider the temperature, conditions, and time of day.
Keep recommendations practical and easy to follow. If the user's wardrobe doesn't have ideal items for the weather, do your best with what they have and explain any limitations in the tips.`,
    prompt: `Based on the following weather conditions, suggest a complete outfit using ONLY items from the user's wardrobe:

Location: ${location}
Temperature: ${weather.temp}°F (${Math.round((weather.temp - 32) * 5 / 9)}°C)
Conditions: ${weather.description}
Humidity: ${weather.humidity}%
Wind Speed: ${weather.windSpeed} mph
Feels Like: ${weather.feelsLike}°F

USER'S WARDROBE (only use items from this list):
${wardrobeList}

Please provide an outfit recommendation using ONLY the items listed above.`,
    output: Output.object({
      schema: z.object({
        summary: z.string().describe("A brief 1-sentence summary of the outfit vibe"),
        top: z.string().describe("Recommended top/shirt from their wardrobe"),
        bottom: z.string().describe("Recommended pants/shorts/skirt from their wardrobe"),
        footwear: z.string().describe("Recommended shoes from their wardrobe"),
        outerwear: z.string().nullable().describe("Jacket or coat from their wardrobe if needed, null if not needed or not available"),
        accessories: z.array(z.string()).describe("List of recommended accessories from their wardrobe"),
        tips: z.string().describe("Weather-specific styling tips and any notes about wardrobe limitations"),
        colorPalette: z.array(z.string()).describe("3-4 suggested colors that work well together for this outfit"),
      }),
    }),
  })

  return result.toTextStreamResponse()
}
