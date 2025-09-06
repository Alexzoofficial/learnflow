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
  const recognition = useRef<any>(null);

  const startRecording = async () => {
    try {
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream after permission check
      
      // Check if browser supports speech recognition
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      
      recognition.current.lang = 'en-US'; // English language
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.maxAlternatives = 1;

      recognition.current.onstart = () => {
        setIsRecording(true);
        console.log('Voice recording started');
      };

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('Voice transcript:', transcript);
        if (transcript && transcript.trim()) {
          onSubmit(transcript.trim());
        } else {
          onSubmit("Voice input was unclear, please try again");
        }
      };

      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = "Voice processing failed, please try typing your question";
        
        if (event.error === 'no-speech') {
          errorMessage = "No speech detected, please try again";
        } else if (event.error === 'audio-capture') {
          errorMessage = "Microphone not accessible, please check permissions";
        } else if (event.error === 'not-allowed') {
          errorMessage = "Microphone permission denied, please enable it";
        }
        
        onSubmit(errorMessage);
        setIsRecording(false);
      };

      recognition.current.onend = () => {
        setIsRecording(false);
        console.log('Voice recording ended');
      };

      recognition.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      alert('Please allow microphone access to use voice input.');
    }
  };

  const stopRecording = () => {
    if (recognition.current && isRecording) {
      recognition.current.stop();
      setIsRecording(false);
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