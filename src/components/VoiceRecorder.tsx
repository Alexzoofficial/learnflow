import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  className?: string;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSubmit, isLoading, className }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        processAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.current.start(100);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to use voice input.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result as string;
          const base64Data = base64Audio.split(',')[1];
          
          // Call speech-to-text API
          const response = await fetch('https://xciiktipygeiikgotwql.supabase.co/functions/v1/voice-to-text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjaWlrdGlweWdlaWlrZ290d3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzM3NzEsImV4cCI6MjA2OTA0OTc3MX0.mSBw0pvRnhYDSHcQ0SvkZQsgys2Fe25Xfib10UgotTI`,
            },
            body: JSON.stringify({
              audio: base64Data
            })
          });

          if (!response.ok) {
            throw new Error('Failed to process audio');
          }

          const result = await response.json();
          
          if (result.text && result.text.trim()) {
            onSubmit(result.text.trim());
          } else {
            onSubmit("Voice input was unclear, please try again");
          }
        } catch (error) {
          console.error('Speech-to-text error:', error);
          onSubmit("Voice processing failed, please try typing your question");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="lg"
        onClick={toggleRecording}
        disabled={isLoading || isProcessing}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          isRecording && "animate-pulse shadow-lg shadow-destructive/50",
          "w-12 h-12 sm:w-14 sm:h-14 rounded-full"
        )}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
        ) : isRecording ? (
          <Square className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
        ) : (
          <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
        )}
        
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
        )}
      </Button>
      
      {(isRecording || isProcessing) && (
        <div className="ml-3 text-xs sm:text-sm text-muted-foreground">
          {isRecording ? 'Recording... Tap to stop' : 'Processing speech...'}
        </div>
      )}
    </div>
  );
};