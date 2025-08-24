// ~/app/admin/tryouts/_components/question-builder.tsx
"use client";

import { useFieldArray } from "react-hook-form";
import { QuestionType } from "@prisma/client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { CreateTryoutInput, QuestionOptionInput } from "~/lib/schema/tryout";

interface QuestionBuilderProps {
  form: UseFormReturn<CreateTryoutInput>;
  questionIndex: number;
  onRemove: () => void;
}

export default function QuestionBuilder({
  form,
  questionIndex,
  // onRemove,
}: QuestionBuilderProps) {
  const questionType = form.watch(`questions.${questionIndex}.type`);

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: `questions.${questionIndex}.options`,
  });

  const addOption = () => {
    const newOption: QuestionOptionInput = {
      text: "",
      isCorrect: false,
      explanation: ""
    };
    appendOption(newOption);
  };

  const hasMultipleChoiceOptions =
    questionType === QuestionType.MULTIPLE_CHOICE_SINGLE ||
    questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE;

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE_SINGLE:
        return "Multiple Choice (Single)";
      case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
        return "Multiple Choice (Multiple)";
      case QuestionType.SHORT_ANSWER:
        return "Short Answer";
      case QuestionType.LONG_ANSWER:
        return "Long Answer";
      default:
        return type;
    }
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="pt-6 space-y-4">
        {/* Question Type and Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name={`questions.${questionIndex}.type`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(QuestionType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {getQuestionTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`questions.${questionIndex}.points`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`questions.${questionIndex}.required`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Required</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Question Text */}
        <FormField
          control={form.control}
          name={`questions.${questionIndex}.question`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your question here..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Options for Multiple Choice Questions */}
        {hasMultipleChoiceOptions && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Answer Options</Label>
              <Button type="button" onClick={addOption} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>

            <div className="space-y-3">
              {optionFields?.map((option, optionIndex) => (
                <div key={option.id} className="space-y-3">
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {String.fromCharCode(65 + optionIndex)}
                      </Badge>
                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.options.${optionIndex}.isCorrect`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {form.watch(`questions.${questionIndex}.options.${optionIndex}.isCorrect`) && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.options.${optionIndex}.text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch(`questions.${questionIndex}.options.${optionIndex}.isCorrect`) && (
                        <FormField
                          control={form.control}
                          name={`questions.${questionIndex}.options.${optionIndex}.explanation`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Explanation for correct answer (optional)"
                                  className="min-h-[60px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(optionIndex)}
                      className="text-destructive hover:text-destructive mt-1"
                      disabled={optionFields.length <= 2}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {questionType === QuestionType.MULTIPLE_CHOICE_SINGLE && (
              <p className="text-sm text-muted-foreground">
                ℹ️ For single choice questions, only one option should be marked as correct.
              </p>
            )}
            {questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE && (
              <p className="text-sm text-muted-foreground">
                ℹ️ For multiple choice questions, you can mark multiple options as correct.
              </p>
            )}
          </div>
        )}

        {/* Instructions for text-based questions */}
        {(questionType === QuestionType.SHORT_ANSWER || questionType === QuestionType.LONG_ANSWER) && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {questionType === QuestionType.SHORT_ANSWER
                ? "📝 This is a short answer question. Students will provide a brief text response."
                : "📄 This is a long answer question. Students will provide a detailed text response."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}