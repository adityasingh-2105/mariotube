'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mic, MicOff, Volume2 } from "lucide-react";

interface VoiceSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoiceSearchModal({ open, onOpenChange }: VoiceSearchModalProps) {
  const router = useRouter();
  const [text, setText] = useState("Listening...");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recognitionObj, setRecognitionObj] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        setText("Voice search is not supported by your browser.");
        return;
      }

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setText("Listening...");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText(`Searching for: "${transcript}"`);
        setTimeout(() => {
          onOpenChange(false);
          router.push(`/search?q=${encodeURIComponent(transcript)}`);
        }, 1000);
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === "not-allowed") {
          setText("Microphone permission denied.");
        } else {
          setText("Didn't catch that. Please try again.");
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognitionObj(rec);
    }
  }, [router, onOpenChange]);

  useEffect(() => {
    if (open && recognitionObj) {
      try {
        recognitionObj.start();
      } catch (e) {
        console.error(e);
      }
    } else if (!open && recognitionObj) {
      try {
        recognitionObj.stop();
      } catch (e) {
        console.error(e);
      }
    }
  }, [open, recognitionObj]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl border border-border/40 bg-card/90 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-center font-display font-bold text-lg">
            Search with your voice
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="relative">
            {/* Pulsing ring animation if listening */}
            {isListening && (
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping [animation-duration:1.5s]" />
            )}
            
            <button
              onClick={() => {
                if (isListening) {
                  recognitionObj?.stop();
                } else {
                  recognitionObj?.start();
                }
              }}
              className={`relative h-20 w-20 rounded-full flex items-center justify-center border-2 shadow-lg transition-all duration-300 ${
                isListening
                  ? "bg-primary border-primary text-primary-foreground scale-110"
                  : "bg-muted border-border text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {isSupported ? (
                isListening ? (
                  <Volume2 className="h-8 w-8 animate-pulse" />
                ) : (
                  <Mic className="h-8 w-8" />
                )
              ) : (
                <MicOff className="h-8 w-8" />
              )}
            </button>
          </div>
          
          <p className="text-center text-sm font-medium leading-relaxed max-w-[280px]">
            {text}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
