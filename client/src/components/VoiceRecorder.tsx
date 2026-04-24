import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Play, Pause, Trash2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, transcription?: string) => void;
  className?: string;
}

export function VoiceRecorder({ onRecordingComplete, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [transcription, setTranscription] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Simulate transcription (in real app, this would call a speech-to-text API)
        const mockTranscription = "Audio recorded successfully. This would contain the transcribed text from the voice note.";
        setTranscription(mockTranscription);
        
        if (onRecordingComplete) {
          onRecordingComplete(blob, mockTranscription);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription('');
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-note-${new Date().toISOString().slice(0, 19)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Voice Notes</h3>
          <div className="text-sm text-gray-500">
            {isRecording ? (
              <span className="flex items-center animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                Recording: {formatTime(duration)}
              </span>
            ) : audioBlob ? (
              <span>Duration: {formatTime(duration)}</span>
            ) : (
              <span>No recording</span>
            )}
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center space-x-4">
          {!isRecording && !audioBlob && (
            <Button
              onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full"
              size="lg"
            >
              <Mic className="h-6 w-6" />
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={stopRecording}
              className="bg-gray-500 hover:bg-gray-600 text-white p-4 rounded-full"
              size="lg"
            >
              <Square className="h-6 w-6" />
            </Button>
          )}

          {audioBlob && !isRecording && (
            <div className="flex space-x-2">
              <Button
                onClick={isPlaying ? pauseAudio : playAudio}
                variant="outline"
                size="sm"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              
              <Button
                onClick={downloadRecording}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={deleteRecording}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white"
                size="sm"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div>
            <audio
              ref={audioRef}
              src={audioUrl}
              onLoadedMetadata={() => {
                if (audioRef.current) {
                  setDuration(Math.floor(audioRef.current.duration));
                }
              }}
              onTimeUpdate={() => {
                if (audioRef.current) {
                  setCurrentTime(Math.floor(audioRef.current.currentTime));
                }
              }}
              onEnded={() => setIsPlaying(false)}
              className="w-full"
              controls
            />
          </div>
        )}

        {/* Transcription */}
        {transcription && (
          <div className="border-t pt-4">
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Transcription (AI-Generated)
            </label>
            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
              {transcription}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Review and edit the transcription as needed before submitting.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}