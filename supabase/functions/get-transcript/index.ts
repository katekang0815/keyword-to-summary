import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// 🔑 import the right thing:
import { YoutubeTranscript } from "npm:youtube-transcript";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  // Log everything first
  console.log("➡️ Method:", req.method);
  console.log("➡️ Headers:", Object.fromEntries(req.headers));
  // Handle preflight early
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  // Read the raw body exactly once
  const bodyText = await req.text();
  console.log("➡️ Raw Body:", bodyText);
  // Manually JSON-parse from that text
  let videoId;
  try {
    const payload = bodyText ? JSON.parse(bodyText) : {};
    videoId = payload.videoId;
  } catch (e) {
    console.error("❌ JSON parse failed:", e);
  }
  if (!videoId) {
    return new Response(JSON.stringify({
      error: "Video ID is required"
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
  try {
    // ▶️ call the library correctly:
    const transcript = await YoutubeTranscript.fetchTranscript(videoId /*, optional config */ );
    return new Response(JSON.stringify({
      transcript,
      available: transcript.length > 0
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("Transcript fetch failed:", err);
    return new Response(JSON.stringify({
      transcript: [],
      available: false,
      error: err.message
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
