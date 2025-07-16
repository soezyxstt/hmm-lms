"use client"

import { useState } from "react"
// import { useParams, useRouter } from "next/navigation"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Checkbox } from "~/components/ui/checkbox"
import { Textarea } from "~/components/ui/textarea"
import { Label } from "~/components/ui/label"
import { Progress } from "~/components/ui/progress"
import { Clock, ChevronLeft, ChevronRight } from "lucide-react"
// import { api } from "~/trpc/react"

export default function TakeExamPage() {
  // const params = useParams()
  // const router = useRouter()
  // const tryoutId = params.id as string
  // const userId = "user-1" // Replace with actual user ID from auth

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft] = useState<number | null>(null)
  const [attemptId] = useState<string | null>(null)

  // const { data: tryout, isLoading } = api.tryout.getById.useQuery({ id: tryoutId })

  const tryout = dummyTryout;

  // const startAttempt = api.tryout.startAttempt.useMutation({
  //   onSuccess: (attempt) => {
  //     setAttemptId(attempt.id)
  //     if (tryout?.duration) {
  //       setTimeLeft(tryout.duration * 60) // Convert to seconds
  //     }
  //   },
  // })

  // const submitAnswer = api.tryout.submitAnswer.useMutation()
  // const completeAttempt = api.tryout.completeAttempt.useMutation({
  //   onSuccess: (attempt) => {
  //     router.push(`/tryouts/${tryoutId}/result/${attempt.id}`)
  //   },
  // })

  // useEffect(() => {
  //   if (tryout && !attemptId) {
  //     startAttempt.mutate({ tryoutId, userId })
  //   }
  // }, [tryout])

  // useEffect(() => {
  //   if (timeLeft === null || timeLeft <= 0) return

  //   const timer = setInterval(() => {
  //     setTimeLeft((prev) => {
  //       if (prev === null || prev <= 1) {
  //         handleSubmitExam()
  //         return 0
  //       }
  //       return prev - 1
  //     })
  //   }, 1000)

  //   return () => clearInterval(timer)
  // }, [timeLeft])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))

    // if (attemptId) {
    //   submitAnswer.mutate({
    //     attemptId,
    //     questionId,
    //     answer,
    //   })
    // }
  }

  // const handleMultipleChoiceChange = (questionId: string, optionId: string, checked: boolean) => {
    // const currentAnswer = answers[questionId] ? JSON.parse(answers[questionId]) : []
    // let newAnswer: string[]

    // if (checked) {
    //   newAnswer = [...currentAnswer, optionId]
    // } else {
    //   newAnswer = currentAnswer.filter((id: string) => id !== optionId)
    // }

    // handleAnswerChange(questionId, JSON.stringify(newAnswer))
  // }

  const handleSubmitExam = () => {
    if (!attemptId) return

    // completeAttempt.mutate({ attemptId })
  }

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < (tryout?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // if (isLoading) {
  //   return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  // }

  if (!tryout) {
    return <div className="flex justify-center items-center min-h-screen">Tryout not found</div>
  }

  const currentQuestion = tryout.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / tryout.questions.length) * 100

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{tryout.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {tryout.questions.length}
              </p>
            </div>
            {timeLeft !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className={timeLeft < 300 ? "text-red-600 font-semibold" : ""}>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
          <Progress value={progress} className="mt-2" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="grid grid-cols-5 lg:grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    <style jsx>{`
                      div::-webkit-scrollbar {
                      display: none;
                      }
                    `}</style>
                    {tryout.questions.map((_, index) => (
                      <Button
                        key={index}
                        variant={index === currentQuestionIndex ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToQuestion(index)}
                        className={`w-full ${answers[tryout.questions[index]?.id ?? ""] ? "bg-green-100 border-green-300" : ""}`}
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Question */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {currentQuestionIndex + 1}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({currentQuestion?.points} points)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg font-medium">{currentQuestion?.question}</p>

                  {currentQuestion?.type === "MULTIPLE_CHOICE_SINGLE" && (
                    <RadioGroup
                      value={answers[currentQuestion.id] ?? ""}
                      onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    >
                      {currentQuestion.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-md">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {currentQuestion?.type === "MULTIPLE_CHOICE_MULTIPLE" && (
                    <div className="space-y-2">
                      {currentQuestion.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2 p-3 border rounded-md">
                          <Checkbox
                            id={option.id}
                            // checked={(answers[currentQuestion.id]
                            //   ? JSON.parse(answers[currentQuestion.id])
                            //   : []
                            // ).includes(option.id)}
                            // onCheckedChange={(checked) =>
                            //   handleMultipleChoiceChange(currentQuestion.id, option.id, !!checked)
                            // }
                          />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {(currentQuestion?.type === "SHORT_ANSWER" || currentQuestion?.type === "LONG_ANSWER") && (
                    <Textarea
                      placeholder="Type your answer here..."
                      value={answers[currentQuestion.id] ?? ""}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      rows={currentQuestion.type === "SHORT_ANSWER" ? 3 : 6}
                    />
                  )}

                  <div className="flex justify-between mt-6">
                    <Button onClick={prevQuestion} disabled={currentQuestionIndex === 0}>
                      <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                    </Button>
                    {currentQuestionIndex === tryout.questions.length - 1 ? (
                      <Button onClick={handleSubmitExam} disabled={true}>
                        {true ? "Submitting..." : "Submit Exam"}
                      </Button>
                    ) : (
                      <Button onClick={nextQuestion}>
                        Next <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const dummyTryout = {
  id: "tryout-1",
  title: "General Knowledge Challenge",
  description: "A fun quiz to test your general knowledge on various topics.",
  duration: 15, // in minutes
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  questions: [
    {
      id: "q-1",
      tryoutId: "tryout-1",
      question: "What is the capital city of Australia?",
      type: "MULTIPLE_CHOICE_SINGLE" as const,
      points: 10,
      order: 1,
      required: true,
      options: [
        { id: "q1-opt1", questionId: "q-1", text: "Sydney", isCorrect: false, order: 1 },
        { id: "q1-opt2", questionId: "q-1", text: "Melbourne", isCorrect: false, order: 2 },
        { id: "q1-opt3", questionId: "q-1", text: "Canberra", isCorrect: true, order: 3 },
        { id: "q1-opt4", questionId: "q-1", text: "Perth", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "q-2",
      tryoutId: "tryout-1",
      question: "Which of the following are planets in our Solar System? (Select all that apply)",
      type: "MULTIPLE_CHOICE_MULTIPLE" as const,
      points: 15,
      order: 2,
      required: true,
      options: [
        { id: "q2-opt1", questionId: "q-2", text: "Mars", isCorrect: true, order: 1 },
        { id: "q2-opt2", questionId: "q-2", text: "Titan (a moon)", isCorrect: false, order: 2 },
        { id: "q2-opt3", questionId: "q-2", text: "Jupiter", isCorrect: true, order: 3 },
        { id: "q2-opt4", questionId: "q-2", text: "Alpha Centauri (a star)", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "q-3",
      tryoutId: "tryout-1",
      question: "Who wrote the play 'Romeo and Juliet'?",
      type: "SHORT_ANSWER" as const,
      points: 10,
      order: 3,
      required: true,
      options: [], // No options for this type
    },
    {
      id: "q-4",
      tryoutId: "tryout-1",
      question: "In simple terms, explain the concept of photosynthesis.",
      type: "LONG_ANSWER" as const,
      points: 20,
      order: 4,
      required: true,
      options: [], // No options for this type
    },
    {
      id: "q-5",
      tryoutId: "tryout-1",
      question: "Which element has the chemical symbol 'O'?",
      type: "MULTIPLE_CHOICE_SINGLE" as const,
      points: 5,
      order: 5,
      required: true,
      options: [
        { id: "q5-opt1", questionId: "q-5", text: "Gold", isCorrect: false, order: 1 },
        { id: "q5-opt2", questionId: "q-5", text: "Oxygen", isCorrect: true, order: 2 },
        { id: "q5-opt3", questionId: "q-5", text: "Osmium", isCorrect: false, order: 3 },
        { id: "q5-opt4", questionId: "q-5", text: "Silver", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "q-6",
      tryoutId: "tryout-1",
      question: "What is the capital city of Australia?",
      type: "MULTIPLE_CHOICE_SINGLE" as const,
      points: 10,
      order: 1,
      required: true,
      options: [
        { id: "q1-opt1", questionId: "q-1", text: "Sydney", isCorrect: false, order: 1 },
        { id: "q1-opt2", questionId: "q-1", text: "Melbourne", isCorrect: false, order: 2 },
        { id: "q1-opt3", questionId: "q-1", text: "Canberra", isCorrect: true, order: 3 },
        { id: "q1-opt4", questionId: "q-1", text: "Perth", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "q-7",
      tryoutId: "tryout-1",
      question: "Which of the following are planets in our Solar System? (Select all that apply)",
      type: "MULTIPLE_CHOICE_MULTIPLE" as const,
      points: 15,
      order: 2,
      required: true,
      options: [
        { id: "q2-opt1", questionId: "q-2", text: "Mars", isCorrect: true, order: 1 },
        { id: "q2-opt2", questionId: "q-2", text: "Titan (a moon)", isCorrect: false, order: 2 },
        { id: "q2-opt3", questionId: "q-2", text: "Jupiter", isCorrect: true, order: 3 },
        { id: "q2-opt4", questionId: "q-2", text: "Alpha Centauri (a star)", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "q-8",
      tryoutId: "tryout-1",
      question: "Who wrote the play 'Romeo and Juliet'?",
      type: "SHORT_ANSWER" as const,
      points: 10,
      order: 3,
      required: true,
      options: [], // No options for this type
    },
    {
      id: "q-9",
      tryoutId: "tryout-1",
      question: "In simple terms, explain the concept of photosynthesis.",
      type: "LONG_ANSWER" as const,
      points: 20,
      order: 4,
      required: true,
      options: [], // No options for this type
    },
    {
      id: "q-10",
      tryoutId: "tryout-1",
      question: "Which element has the chemical symbol 'O'?",
      type: "MULTIPLE_CHOICE_SINGLE" as const,
      points: 5,
      order: 5,
      required: true,
      options: [
        { id: "q5-opt1", questionId: "q-5", text: "Gold", isCorrect: false, order: 1 },
        { id: "q5-opt2", questionId: "q-5", text: "Oxygen", isCorrect: true, order: 2 },
        { id: "q5-opt3", questionId: "q-5", text: "Osmium", isCorrect: false, order: 3 },
        { id: "q5-opt4", questionId: "q-5", text: "Silver", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "q-1",
      tryoutId: "tryout-1",
      question: "What is the capital city of Australia?",
      type: "MULTIPLE_CHOICE_SINGLE" as const,
      points: 10,
      order: 1,
      required: true,
      options: [
        { id: "q1-opt1", questionId: "q-1", text: "Sydney", isCorrect: false, order: 1 },
        { id: "q1-opt2", questionId: "q-1", text: "Melbourne", isCorrect: false, order: 2 },
        { id: "q1-opt3", questionId: "q-1", text: "Canberra", isCorrect: true, order: 3 },
        { id: "q1-opt4", questionId: "q-1", text: "Perth", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "q-2",
      tryoutId: "tryout-1",
      question: "Which of the following are planets in our Solar System? (Select all that apply)",
      type: "MULTIPLE_CHOICE_MULTIPLE" as const,
      points: 15,
      order: 2,
      required: true,
      options: [
        { id: "q2-opt1", questionId: "q-2", text: "Mars", isCorrect: true, order: 1 },
        { id: "q2-opt2", questionId: "q-2", text: "Titan (a moon)", isCorrect: false, order: 2 },
        { id: "q2-opt3", questionId: "q-2", text: "Jupiter", isCorrect: true, order: 3 },
        { id: "q2-opt4", questionId: "q-2", text: "Alpha Centauri (a star)", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "q-3",
      tryoutId: "tryout-1",
      question: "Who wrote the play 'Romeo and Juliet'?",
      type: "SHORT_ANSWER" as const,
      points: 10,
      order: 3,
      required: true,
      options: [], // No options for this type
    },
    {
      id: "q-4",
      tryoutId: "tryout-1",
      question: "In simple terms, explain the concept of photosynthesis.",
      type: "LONG_ANSWER" as const,
      points: 20,
      order: 4,
      required: true,
      options: [], // No options for this type
    },
    {
      id: "q-5",
      tryoutId: "tryout-1",
      question: "Which element has the chemical symbol 'O'?",
      type: "MULTIPLE_CHOICE_SINGLE" as const,
      points: 5,
      order: 5,
      required: true,
      options: [
        { id: "q5-opt1", questionId: "q-5", text: "Gold", isCorrect: false, order: 1 },
        { id: "q5-opt2", questionId: "q-5", text: "Oxygen", isCorrect: true, order: 2 },
        { id: "q5-opt3", questionId: "q-5", text: "Osmium", isCorrect: false, order: 3 },
        { id: "q5-opt4", questionId: "q-5", text: "Silver", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "q-6",
      tryoutId: "tryout-1",
      question: "What is the capital city of Australia?",
      type: "MULTIPLE_CHOICE_SINGLE" as const,
      points: 10,
      order: 1,
      required: true,
      options: [
        { id: "q1-opt1", questionId: "q-1", text: "Sydney", isCorrect: false, order: 1 },
        { id: "q1-opt2", questionId: "q-1", text: "Melbourne", isCorrect: false, order: 2 },
        { id: "q1-opt3", questionId: "q-1", text: "Canberra", isCorrect: true, order: 3 },
        { id: "q1-opt4", questionId: "q-1", text: "Perth", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "q-7",
      tryoutId: "tryout-1",
      question: "Which of the following are planets in our Solar System? (Select all that apply)",
      type: "MULTIPLE_CHOICE_MULTIPLE" as const,
      points: 15,
      order: 2,
      required: true,
      options: [
        { id: "q2-opt1", questionId: "q-2", text: "Mars", isCorrect: true, order: 1 },
        { id: "q2-opt2", questionId: "q-2", text: "Titan (a moon)", isCorrect: false, order: 2 },
        { id: "q2-opt3", questionId: "q-2", text: "Jupiter", isCorrect: true, order: 3 },
        { id: "q2-opt4", questionId: "q-2", text: "Alpha Centauri (a star)", isCorrect: false, order: 4 },
      ],
    },
    {
      id: "q-8",
      tryoutId: "tryout-1",
      question: "Who wrote the play 'Romeo and Juliet'?",
      type: "SHORT_ANSWER" as const,
      points: 10,
      order: 3,
      required: true,
      options: [], // No options for this type
    },
    {
      id: "q-9",
      tryoutId: "tryout-1",
      question: "In simple terms, explain the concept of photosynthesis.",
      type: "LONG_ANSWER" as const,
      points: 20,
      order: 4,
      required: true,
      options: [], // No options for this type
    },
    {
      id: "q-10",
      tryoutId: "tryout-1",
      question: "Which element has the chemical symbol 'O'?",
      type: "MULTIPLE_CHOICE_SINGLE" as const,
      points: 5,
      order: 5,
      required: true,
      options: [
        { id: "q5-opt1", questionId: "q-5", text: "Gold", isCorrect: false, order: 1 },
        { id: "q5-opt2", questionId: "q-5", text: "Oxygen", isCorrect: true, order: 2 },
        { id: "q5-opt3", questionId: "q-5", text: "Osmium", isCorrect: false, order: 3 },
        { id: "q5-opt4", questionId: "q-5", text: "Silver", isCorrect: false, order: 4 },
      ],
    },
  ],
};