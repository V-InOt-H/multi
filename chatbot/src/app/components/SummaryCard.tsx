import { FileText, Download, Share2, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Summary } from '../services/summaryService';

interface SummaryCardProps {
  summary: Summary | null;
  isLoading?: boolean;
  onDownload?: () => void;
  onShare?: () => void;
}

export function SummaryCard({
  summary,
  isLoading = false,
  onDownload,
  onShare,
}: SummaryCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 Lecture Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-sm text-muted-foreground">
                Generating AI summary...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 Lecture Summary
          </CardTitle>
          <CardDescription>
            AI-generated summary will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                Start the lecture to generate summary
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              📝 Lecture Summary
            </CardTitle>
            <CardDescription>
              AI-generated summary • {summary.wordCount} words
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {onDownload && (
              <Button variant="outline" size="sm" onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {/* Main Summary */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <BookOpen className="h-4 w-4" />
                Overview
              </h3>
              <p className="leading-relaxed text-sm">
                {summary.text}
              </p>
            </div>

            <Separator />

            {/* Key Points */}
            <div>
              <h3 className="mb-3 font-semibold">🎯 Key Points</h3>
              <ul className="space-y-2">
                {summary.keyPoints.map((point, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Keywords */}
            {summary.keywords.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-3 font-semibold">🔑 Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {summary.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Formulas */}
            {summary.formulas.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="mb-3 font-semibold">📐 Mathematical Formulas</h3>
                  <div className="space-y-3">
                    {summary.formulas.map((formula, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-muted p-4 font-mono text-sm"
                      >
                        {formula}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Metadata */}
            <Separator />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Generated: {new Date(summary.timestamp).toLocaleString()}</span>
              <span>ID: {summary.id}</span>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
