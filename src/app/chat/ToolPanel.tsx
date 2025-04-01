// components/ToolPanel.tsx
import React from "react";

interface ToolPanelProps {
  sendTextMessage: (message: string) => void;
  isSessionActive: boolean;
}

const ToolPanel: React.FC<ToolPanelProps> = ({
  sendTextMessage,
  isSessionActive,
}) => {
  return (
    <div style={{ padding: "16px", border: "1px solid #ccc" }}>
      <h2>Tool Panel</h2>
      <p>Status: {isSessionActive ? "Active" : "Inactive"}</p>
      <button onClick={() => sendTextMessage("Test message from ToolPanel")}>
        Send Test Message
      </button>
    </div>
  );
};

export default ToolPanel;
