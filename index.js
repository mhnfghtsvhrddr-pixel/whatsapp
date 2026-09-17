const express = require("express");
const bodyParser = require("body-parser");
const twilio = require("twilio");
const Anthropic = require("@anthropic-ai/sdk");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const AGENT_NAME = process.env.AGENT_NAME || "سامي";
const SYSTEM_PROMPT = `اسمك ${AGENT_NAME}. انت مساعد شخصي ذكي على واتساب، شخصيتك ودودة ومباشرة وذكية. تحكي بالعامية اللبنانية. مهمتك مساعدة صاحبك بحياته اليومية.`;

app.post("/whatsapp", async (req, res) => {
  const incomingMsg = req.body.Body;
  const from = req.body.From;

  console.log("رسالة واردة من", from, ":", incomingMsg);

  let replyText = "صار في خطأ، جرب كمان مرة.";
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: incomingMsg }],
    });
    replyText = response.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n");
  } catch (err) {
    console.error(err);
  }

  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(replyText);
  res.type("text/xml").send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("السيرفر شغال على بورت " + PORT));
