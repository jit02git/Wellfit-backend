import Booking from "../models/Booking.js";
import Slot from "../models/Slot.js";
import User from "../models/User.js";
import { ai } from "../config/gemini.js";

export const handleChat = async (req, res) => {
  const { message, history } = req.body;

  // Validate that a message was provided
  if (!message) {
    return res.status(400).json({
      message: "Please provide a message",
    });
  }

  // Ensure the GEMINI_API_KEY environment variable is defined
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return res.json({
      reply:
        "Gemini API key is missing. Please configure GEMINI_API_KEY in your .env file.",
    });
  }

  try {
    // Retrieve the authenticated user from the database
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let bookings = [];
    let availableSlots = [];

    // Dynamically retrieve user bookings/slots depending on their role
    if (user.role === "member") {
      bookings = await Booking.find({
        memberId: req.user._id,
      })
        .populate({
          path: "slotId",
          populate: {
            path: "trainerId",
            select: "name email",
          },
        })
        .sort({ createdAt: -1 });

      availableSlots = await Slot.find({
        isBooked: false,
        startTime: { $gt: new Date() },
      })
        .populate("trainerId", "name email")
        .sort({ startTime: 1 })
        .limit(10);
    } else {
      const trainerSlots = await Slot.find({
        trainerId: req.user._id,
      });

      const slotIds = trainerSlots.map((slot) => slot._id);

      bookings = await Booking.find({
        slotId: { $in: slotIds },
      })
        .populate("memberId", "name email")
        .populate("slotId")
        .sort({ createdAt: -1 });
    }

    const dateStr = new Date().toLocaleString();

    // Construct the context-rich system prompt dynamically
    let systemPrompt = `
You are "Wellfit AI Assistant".

Current Date: ${dateStr}

User Details:
- Name: ${user.name}
- Email: ${user.email}
- Role: ${user.role}
`;

    if (user.role === "member") {
      systemPrompt += `
Wallet Balance: ₹${(user.walletBalance || 0).toFixed(2)}

Booked Sessions:
`;

      if (bookings.length === 0) {
        systemPrompt += "- No bookings.\n";
      } else {
        bookings.forEach((b, index) => {
          systemPrompt += `
${index + 1}.
Trainer: ${b.slotId?.trainerId?.name || "Unknown"}
Time: ${b.slotId?.startTime
              ? new Date(b.slotId.startTime).toLocaleString()
              : "N/A"
            }
Amount: ₹${b.amountPaid || 200}
`;
        });
      }

      systemPrompt += `

Available Slots:
`;

      if (availableSlots.length === 0) {
        systemPrompt += "- No available slots.\n";
      } else {
        availableSlots.forEach((slot, index) => {
          systemPrompt += `
${index + 1}.
Trainer: ${slot.trainerId?.name}
Time: ${new Date(slot.startTime).toLocaleString()}
Price: ₹200
`;
        });
      }
    } else {
      systemPrompt += "\nTrainer Bookings:\n";

      if (bookings.length === 0) {
        systemPrompt += "- No bookings.\n";
      } else {
        bookings.forEach((booking, index) => {
          systemPrompt += `
${index + 1}.
Member: ${booking.memberId?.name}
Time: ${booking.slotId?.startTime
              ? new Date(booking.slotId.startTime).toLocaleString()
              : "N/A"
            }
`;
        });
      }
    }

    systemPrompt += `

Instructions:

- Answer using only the information above.
- Be friendly.
- Use markdown formatting.
- Never invent information.
- If asked to book, cancel, top-up wallet or publish slot, explain that you cannot perform actions directly and guide the user to use the Wellfit UI.
`;

    // Map conversation history to the format expected by the Google GenAI SDK
    const contents = [];

    if (history?.length) {
      history.forEach((msg) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [
            {
              text: msg.text,
            },
          ],
        });
      });
    }

    // Append the current message
    contents.push({
      role: "user",
      parts: [
        {
          text: message,
        },
      ],
    });

    // Call the official Google GenAI SDK to generate content
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    // Extract reply text from the SDK response
    const reply = response.text || "Sorry, I couldn't generate a response.";

    // Return the response back to the frontend
    return res.json({
      reply,
    });
  } catch (err) {
    console.error("Chat Controller Error:", err);

    return res.status(500).json({
      message: "Server error during chat handling",
      error: err.message,
    });
  }
};