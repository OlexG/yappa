// components/EventLog.tsx
import React from "react";

interface EventLogProps {
  events: any[];
}

const EventLog: React.FC<EventLogProps> = ({ events }) => {
  return (
    <div style={{ padding: "8px", fontFamily: "monospace", fontSize: "12px" }}>
      <h2>Event Log</h2>
      <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
        {events.map((event, index) => (
          <li
            key={index}
            style={{
              marginBottom: "4px",
              borderBottom: "1px solid #ccc",
              paddingBottom: "4px",
            }}
          >
            <pre>{JSON.stringify(event, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventLog;
