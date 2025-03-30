"use client";
import React, { useState, useRef } from 'react';

export default function Home() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // Use a ref to immediately collect audio chunks without causing re-renders
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      // Clear any previous audio chunks
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Combine all collected chunks into one Blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Clear the ref for future recordings
        audioChunksRef.current = [];

        // Skip sending if the recording is too short
        if (audioBlob.size < 1000) {
          console.warn("Audio chunk too small, skipping.");
          return;
        }

        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');

        try {
          // Call the combined API route which returns both the transcript and AI reply
          const res = await fetch('/api/combined', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.transcript) {
            setTranscript(data.transcript);
          } else {
            setTranscript('Transcription failed.');
          }
          if (data.reply) {
            setReply(data.reply);
          } else {
            setReply('No AI response.');
          }
        } catch (error) {
          console.error('Error processing audio:', error);
          setTranscript('Error processing audio');
        }
      };

      recorder.start(); // Start recording manually
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop(); // Stop recording manually
      setRecording(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>AI Therapist</h1>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <div>
        <h2>Transcript</h2>
        <p>{transcript}</p>
      </div>
      <div>
        <h2>AI Response</h2>
        <p style={{ color: 'blue' }}>{reply}</p>
      </div>
    </div>
  );
}
