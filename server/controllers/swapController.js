const { GoogleGenAI } = require("@google/genai");

const REQUIRED_MODEL = "gemini-3-pro-image-preview";
const history = [];

function validateInputs(req) {
  const files = req.files || {};
  const thumbnail = files.thumbnail?.[0];
  const portrait = files.portrait?.[0];

  if (!thumbnail || !portrait) {
    return "Both thumbnail and portrait images are required.";
  }

  return null;
}

function buildPrompt(userInstructions = "") {
  const baseInstruction =
    "Swap the face from the portrait image into the thumbnail image. Ensure realism with matching lighting, shadows, orientation, skin tones, facial proportions, and natural blending. Keep the thumbnail composition intact.";

  if (!userInstructions || !userInstructions.trim()) {
    return baseInstruction;
  }

  return `${baseInstruction}\n\nAdditional user instructions: ${userInstructions.trim()}`;
}

function extractImageFromResponse(response) {
  const parts = response?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part.inlineData?.data);

  if (!imagePart) {
    return null;
  }

  return {
    mimeType: imagePart.inlineData.mimeType || "image/png",
    base64: imagePart.inlineData.data,
  };
}

async function generateFaceSwap(req, res) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment variables." });
    }

    const validationError = validateInputs(req);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const thumbnail = req.files.thumbnail[0];
    const portrait = req.files.portrait[0];
    const instructions = req.body.instructions || "";

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: REQUIRED_MODEL,
      contents: [
        { text: buildPrompt(instructions) },
        {
          inlineData: {
            mimeType: thumbnail.mimetype,
            data: thumbnail.buffer.toString("base64"),
          },
        },
        {
          inlineData: {
            mimeType: portrait.mimetype,
            data: portrait.buffer.toString("base64"),
          },
        },
      ],
    });

    const image = extractImageFromResponse(response);

    if (!image) {
      return res.status(502).json({
        error: "Gemini returned no image output. Try adjusting instructions or source images.",
      });
    }

    const dataUrl = `data:${image.mimeType};base64,${image.base64}`;
    history.unshift({
      createdAt: new Date().toISOString(),
      instructions,
      image: dataUrl,
    });

    if (history.length > 10) {
      history.length = 10;
    }

    return res.json({ image: dataUrl, history });
  } catch (error) {
    console.error("Face swap generation failed:", error);
    return res.status(500).json({
      error: error?.message || "Face swap generation failed",
    });
  }
}

function getHistory(_req, res) {
  res.json({ history });
}

module.exports = {
  generateFaceSwap,
  getHistory,
};
