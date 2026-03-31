import { useState, useEffect } from 'react';
import { Languages, ArrowLeftRight, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Translation } from '../services/translateService';
import { API_CONFIG } from '../config/apiConfig';

interface TranslationPanelProps {
  originalTexts: string[];
  translations: Translation[];
  sourceLanguage: string;
  targetLanguage: string;
  onLanguageChange: (source: string, target: string) => void;
  onTranslate: () => void;
  isLoading?: boolean;
}

export function TranslationPanel({
  originalTexts,
  translations,
  sourceLanguage,
  targetLanguage,
  onLanguageChange,
  onTranslate,
  isLoading = false,
}: TranslationPanelProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'stacked'>('side-by-side');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const swapLanguages = () => {
    onLanguageChange(targetLanguage, sourceLanguage);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🌐 Real-Time Translation
            </CardTitle>
            <CardDescription>
              Translate lectures into multiple languages
            </CardDescription>
          </div>
        </div>

        {/* Language Selection */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Select value={sourceLanguage} onValueChange={(val) => onLanguageChange(val, targetLanguage)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {API_CONFIG.languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={swapLanguages}
            className="h-9 w-9"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>

          <Select value={targetLanguage} onValueChange={(val) => onLanguageChange(sourceLanguage, val)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {API_CONFIG.languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.nativeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-2">
            <Switch
              id="view-mode"
              checked={viewMode === 'side-by-side'}
              onCheckedChange={(checked) => 
                setViewMode(checked ? 'side-by-side' : 'stacked')
              }
            />
            <Label htmlFor="view-mode" className="text-xs">
              Side-by-side
            </Label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {translations.length === 0 ? (
            <div className="flex h-full min-h-[300px] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <Languages className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Start transcription to see translations
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {translations.map((translation, index) => (
                <div
                  key={translation.id}
                  className="rounded-lg border bg-card shadow-sm"
                >
                  {viewMode === 'side-by-side' ? (
                    <div className="grid gap-4 p-4 md:grid-cols-2">
                      {/* Original */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {API_CONFIG.languages.find(l => l.code === sourceLanguage)?.nativeName}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(translation.originalText, index)}
                            className="h-7 px-2"
                          >
                            {copiedIndex === index ? (
                              <Check className="h-3 w-3 text-success" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm leading-relaxed">
                          {translation.originalText}
                        </p>
                      </div>

                      {/* Translated */}
                      <div className="border-l pl-4">
                        <div className="mb-2 flex items-center justify-between">
                          <Badge variant="default" className="text-xs">
                            {API_CONFIG.languages.find(l => l.code === targetLanguage)?.nativeName}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(translation.translatedText, index + 1000)}
                            className="h-7 px-2"
                          >
                            {copiedIndex === index + 1000 ? (
                              <Check className="h-3 w-3 text-success" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm leading-relaxed font-medium">
                          {translation.translatedText}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 p-4">
                      {/* Original */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {API_CONFIG.languages.find(l => l.code === sourceLanguage)?.nativeName}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(translation.originalText, index)}
                            className="h-7 px-2"
                          >
                            {copiedIndex === index ? (
                              <Check className="h-3 w-3 text-success" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm leading-relaxed">
                          {translation.originalText}
                        </p>
                      </div>

                      <div className="border-t pt-3">
                        <div className="mb-2 flex items-center justify-between">
                          <Badge variant="default" className="text-xs">
                            {API_CONFIG.languages.find(l => l.code === targetLanguage)?.nativeName}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(translation.translatedText, index + 1000)}
                            className="h-7 px-2"
                          >
                            {copiedIndex === index + 1000 ? (
                              <Check className="h-3 w-3 text-success" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm leading-relaxed font-medium">
                          {translation.translatedText}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="border-t px-4 py-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(translation.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
