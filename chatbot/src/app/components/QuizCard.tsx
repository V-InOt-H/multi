import { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { QuizQuestion } from '../services/summaryService';

interface QuizCardProps {
  questions: QuizQuestion[];
  onComplete?: (score: number) => void;
}

export function QuizCard({ questions, onComplete }: QuizCardProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const hasAnswered = selectedAnswers[currentQuestionIndex] !== undefined;

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);

    // Calculate score
    if (optionIndex === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
      onComplete?.(score);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setScore(0);
  };

  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ❓ Interactive Quiz
          </CardTitle>
          <CardDescription>
            Quiz questions will be generated from the lecture
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                Quiz will be available during the lecture
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 70;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎉 Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              {passed ? (
                <CheckCircle2 className="h-20 w-20 text-success" />
              ) : (
                <XCircle className="h-20 w-20 text-destructive" />
              )}
            </div>

            <div>
              <p className="text-4xl font-bold">{percentage}%</p>
              <p className="mt-2 text-muted-foreground">
                {score} out of {questions.length} correct
              </p>
            </div>

            <Progress value={percentage} className="h-3" />

            <p className="text-sm">
              {passed
                ? '🎊 Great job! You have a solid understanding of the material.'
                : '📚 Keep studying! Review the lecture summary for better understanding.'}
            </p>

            <div className="space-y-4 pt-4">
              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <div
                    key={question.id}
                    className="rounded-lg border bg-card p-4 text-left"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="outline">Question {index + 1}</Badge>
                      {isCorrect ? (
                        <Badge variant="default" className="bg-success">
                          Correct
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Incorrect</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">{question.question}</p>
                    {!isCorrect && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Correct answer: {question.options[question.correctAnswer]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <Button onClick={resetQuiz} className="w-full">
              Retake Quiz
            </Button>
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
              ❓ Interactive Quiz
            </CardTitle>
            <CardDescription>
              Test your understanding of the lecture
            </CardDescription>
          </div>
          <Badge variant="outline">
            {currentQuestionIndex + 1} / {questions.length}
          </Badge>
        </div>
        <Progress
          value={((currentQuestionIndex + 1) / questions.length) * 100}
          className="mt-4"
        />
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Topic Badge */}
          <Badge className="mb-2">{currentQuestion.topic}</Badge>

          {/* Question */}
          <div>
            <h3 className="text-lg font-semibold leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showFeedback = hasAnswered;

              let variant: 'outline' | 'default' | 'secondary' = 'outline';
              let className = '';

              if (showFeedback) {
                if (isSelected && isCorrect) {
                  className = 'border-success bg-success/10';
                } else if (isSelected && !isCorrect) {
                  className = 'border-destructive bg-destructive/10';
                } else if (isCorrect) {
                  className = 'border-success bg-success/5';
                }
              }

              return (
                <Button
                  key={index}
                  variant={variant}
                  className={`w-full justify-start text-left h-auto py-4 ${className}`}
                  onClick={() => !hasAnswered && handleAnswer(index)}
                  disabled={hasAnswered}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-background mr-3">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showFeedback && isSelected && (
                    <>
                      {isCorrect ? (
                        <CheckCircle2 className="ml-2 h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="ml-2 h-5 w-5 text-destructive" />
                      )}
                    </>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Explanation */}
          {hasAnswered && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium mb-1">💡 Explanation</p>
              <p className="text-sm text-muted-foreground">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!hasAnswered}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
