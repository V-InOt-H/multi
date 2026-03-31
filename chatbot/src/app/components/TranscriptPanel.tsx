import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { TranscriptSegment } from '../services/sttService';

interface TranscriptPanelProps {
  transcripts: TranscriptSegment[];
  isRecording: boolean;
  onToggleRecording: () => void;
  language: string;
}

export function TranscriptPanel({
  transcripts,
  isRecording,
  onToggleRecording,
  language,
}: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Auto-scroll to bottom when new transcript arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  const highlightKeywords = (text: string, keywords?: string[]) => {
    if (!keywords || keywords.length === 0) return text;

    let highlightedText = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        '<span class="bg-accent/30 px-1 rounded font-medium">$1</span>'
      );
    });

    return highlightedText;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🎤 Live Transcript
              {isRecording && (
                <div className="flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive"></span>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Real-time speech-to-text transcription
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              {language === 'en' ? '🇬🇧 English' : '🇮🇳 தமிழ்'}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="h-8 w-8"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Button
              variant={isRecording ? 'destructive' : 'default'}
              size="sm"
              onClick={onToggleRecording}
              className="gap-2"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {transcripts.length === 0 ? (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-lg border border-dashed">
                <div className="text-center">
                  <Mic className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    {isRecording
                      ? 'Listening... Speak to start transcription'
                      : 'Click Start to begin transcription'}
                  </p>
                </div>
              </div>
            ) : (
              transcripts.map((segment, index) => (
                <div
                  key={segment.id}
                  className="group rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(segment.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="flex items-center gap-2">
                      {segment.confidence && (
                        <Badge
                          variant="secondary"
                          className="text-xs"
                        >
                          {Math.round(segment.confidence * 100)}% confidence
                        </Badge>
                      )}
                      {!segment.isFinal && (
                        <Badge variant="outline" className="text-xs">
                          Processing...
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p
                    className="leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: highlightKeywords(segment.text, segment.keywords),
                    }}
                  />
                  {segment.keywords && segment.keywords.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {segment.keywords.map((keyword, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
