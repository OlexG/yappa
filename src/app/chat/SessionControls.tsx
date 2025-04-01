// components/SessionControls.tsx
import React, { useState } from "react";

interface SessionControlsProps {
  startSession: () => Promise<void>;
  stopSession: () => void;
  sendTextMessage: (message: string) => void;
  isSessionActive: boolean;
}

const SessionControls: React.FC<SessionControlsProps> = ({
  startSession,
  stopSession,
  sendTextMessage,
  isSessionActive,
}) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() !== "") {
      sendTextMessage(text);
      setText("");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div>
        {isSessionActive ? (
          <button onClick={stopSession} style={{ padding: "8px 16px" }}>
            Stop Session
          </button>
        ) : (
          <button onClick={startSession} style={{ padding: "8px 16px" }}>
            Start Session
          </button>
        )}
      </div>
      <div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your message"
          style={{ width: "70%", padding: "8px" }}
        />
        <button
          onClick={handleSend}
          style={{ padding: "8px 16px", marginLeft: "8px" }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default SessionControls;
