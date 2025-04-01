// app/chat.tsx (or pages/chat.tsx if you're using the Pages Router)
"use client";

import { useEffect, useRef, useState } from "react";
import EventLog from "./EventLog";
import SessionControls from "./SessionControls";
import ToolPanel from "./ToolPanel";

export default function Chat() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [assistantResponseInProgress, setAssistantResponseInProgress] = useState(false);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);

  // Start a new session
  async function startSession() {
    // Fetch the ephemeral token from /api/full
    const tokenResponse = await fetch("/api/full", { method: "POST" });
    const data = await tokenResponse.json();
    const EPHEMERAL_KEY = data.client_secret.value;

    // Create a new RTCPeerConnection
    const pc = new RTCPeerConnection();

    // Create a hidden audio element to play remote (assistant) audio
    const audioEl = document.createElement("audio");
    audioEl.autoplay = true;
    audioElement.current = audioEl;
    pc.ontrack = (e) => {
      if (audioElement.current) {
        audioElement.current.srcObject = e.streams[0];
      }
    };

    // Get microphone access and add local audio track
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStream.getTracks().forEach((track) => pc.addTrack(track, mediaStream));

    // Create a data channel for sending/receiving events
    const dc = pc.createDataChannel("oai-events");
    setDataChannel(dc);

    // Create an SDP offer and set it as the local description
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Send the SDP offer to OpenAI Realtime API
    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-realtime-preview-2024-12-17";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
    });

    // Set the SDP answer from the API as the remote description
    const answerSdp = await sdpResponse.text();
    await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

    // Save the peer connection reference
    peerConnection.current = pc;
  }

  // Stop session and cleanup
  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      peerConnection.current.close();
    }
    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
    if (audioElement.current) {
      audioElement.current.pause();
      audioElement.current.srcObject = null;
    }
  }

  // Send an event (as JSON) over the data channel
  function sendClientEvent(message: any) {
    if (dataChannel && dataChannel.readyState === "open") {
      message.event_id = message.event_id || crypto.randomUUID();
      if (!message.timestamp) {
        message.timestamp = new Date().toLocaleTimeString();
      }
      dataChannel.send(JSON.stringify(message));
      setEvents((prev) => [message, ...prev]);
    } else {
      console.error("Data channel not available", message);
    }
  }

  // Send a text message to the model.
  // If an assistant response is in progress, cancel it first.
  function sendTextMessage(message: string) {
    if (assistantResponseInProgress) {
      // Cancel the current response
      sendClientEvent({ type: "response.cancel" });
      if (audioElement.current) {
        audioElement.current.pause();
        audioElement.current.srcObject = null;
      }
    }

    // Now send the new user message
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: message }],
      },
    };

    sendClientEvent(event);
    // Request a new response from the assistant
    sendClientEvent({ type: "response.create" });
  }

  // Set up event listeners on the data channel when it is created.
  useEffect(() => {
    if (dataChannel) {
      dataChannel.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        if (!event.timestamp) {
          event.timestamp = new Date().toLocaleTimeString();
        }
        // Update our assistantResponseInProgress flag based on events.
        if (event.type === "response.create" || event.type === "response.text.delta") {
          setAssistantResponseInProgress(true);
        }
        if (event.type === "response.text.done") {
          setAssistantResponseInProgress(false);
        }
        setEvents((prev) => [event, ...prev]);
      });
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
        setEvents([]);
      });
    }
  }, [dataChannel]);

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 h-16 flex items-center bg-gray-100">
        <div className="flex items-center gap-4 w-full m-4 pb-2 border-b border-solid border-gray-300">
          <h1>Realtime Console</h1>
        </div>
      </nav>
      <main className="absolute top-16 left-0 right-0 bottom-0 flex">
        <section className="flex-1 p-4 overflow-y-auto">
          {/* You can display the event log here if you want to debug */}
          {/* <EventLog events={events} /> */}
          <SessionControls
            startSession={startSession}
            stopSession={stopSession}
            sendTextMessage={sendTextMessage}
            isSessionActive={isSessionActive}
          />
        </section>
        <aside className="w-80 p-4 border-l border-solid border-gray-300">
          <ToolPanel
            sendTextMessage={sendTextMessage}
            isSessionActive={isSessionActive}
          />
        </aside>
      </main>
    </>
  );
}