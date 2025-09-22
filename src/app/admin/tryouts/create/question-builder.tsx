"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
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
import { Plus, Trash2, CheckCircle, Image as ImageIcon } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { CreateTryoutInput, QuestionOptionInput } from "~/lib/schema/tryout";
import { toast } from 'sonner';

interface QuestionBuilderProps {
  form: UseFormReturn<CreateTryoutInput>;
  questionIndex: number;
}

export default function QuestionBuilder({ form, questionIndex }: QuestionBuilderProps) {
  const questionType = form.watch(`questions.${questionIndex}.type`);
  const questionImages = form.watch(`questions.${questionIndex}.images`);
  const [isUploading, setIsUploading] = useState(false);

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: `questions.${questionIndex}.options`,
  });

  // Effect to manage default options when the component loads or type changes
  useEffect(() => {
    if (
      (questionType === QuestionType.MULTIPLE_CHOICE_SINGLE || questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE) &&
      optionFields.length === 0
    ) {
      appendOption({ text: "", isCorrect: false, explanation: "" });
      appendOption({ text: "", isCorrect: false, explanation: "" });
    }
  }, [questionType, optionFields.length, appendOption]);


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

  const handleTypeChange = (newType: QuestionType) => {
    // 1. Set the new type value for the question
    form.setValue(`questions.${questionIndex}.type`, newType, { shouldValidate: true });

    // 2. Clean up fields from other question types to prevent validation errors
    if (newType === QuestionType.SHORT_ANSWER) {
      // If switching TO short answer, clear any existing options
      form.setValue(`questions.${questionIndex}.options`, []);
    } else if (newType === QuestionType.MULTIPLE_CHOICE_SINGLE || newType === QuestionType.MULTIPLE_CHOICE_MULTIPLE) {
      // If switching TO multiple choice, clear the short answer field
      form.setValue(`questions.${questionIndex}.shortAnswer`, "");
      // Also, ensure there are at least two default options if none exist
      const currentOptions = form.getValues(`questions.${questionIndex}.options`);
      if (!currentOptions || currentOptions.length === 0) {
        form.setValue(`questions.${questionIndex}.options`, [
          { text: "", isCorrect: false, explanation: "" },
          { text: "", isCorrect: false, explanation: "" },
        ]);
      }
    } else if (newType === QuestionType.LONG_ANSWER) {
      // If switching to long answer, clear both options and short answer
      form.setValue(`questions.${questionIndex}.options`, []);
      form.setValue(`questions.${questionIndex}.shortAnswer`, "");
    }
  };


  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }
        return response.json() as Promise<{ CDNun: string; CDNurl: string }>;
      });
      const results = await Promise.all(uploadPromises);
      const newImageUrls = results.map(result => result.CDNurl);
      const currentImages = form.getValues(`questions.${questionIndex}.images`) ?? [];
      form.setValue(`questions.${questionIndex}.images`, [...currentImages, ...newImageUrls]);
      toast.success(`${results.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload one or more images.");
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    const updatedImages = questionImages?.filter(img => img !== imageUrl);
    form.setValue(`questions.${questionIndex}.images`, updatedImages);
    toast.success("Image removed.");
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
                <Select onValueChange={(value) => handleTypeChange(value as QuestionType)} defaultValue={field.value}>
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

        {/* Image Upload and Display */}
        <div className="space-y-2">
          <Label>Images (Optional)</Label>
          <div className="flex flex-wrap gap-3">
            {questionImages?.map((imageUrl) => (
              <div key={imageUrl} className="relative w-24 h-24 rounded-md overflow-hidden group">
                <Image
                  src={imageUrl}
                  alt="Question image"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-200 group-hover:scale-105"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(imageUrl)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="relative w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                multiple
              />
              {isUploading ? (
                <span className="animate-pulse">Uploading...</span>
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-xs mt-1">Add Images</span>
                </div>
              )}
            </div>
          </div>
        </div>

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
                <div key={option.id} className="flex items-start gap-3 p-4 border rounded-lg">
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
                                value={field.value ?? ''}
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

        {/* Short Answer with Auto-Grading */}
        {questionType === QuestionType.SHORT_ANSWER && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-4">
            <p className="text-sm text-muted-foreground">
              📝 For auto-grading, the student&apos;s answer must exactly match the text you provide below (case-insensitive).
            </p>
            <FormField
              control={form.control}
              name={`questions.${questionIndex}.shortAnswer`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correct Answer</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the exact correct answer..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Long Answer (Manual Grading) */}
        {questionType === QuestionType.LONG_ANSWER && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              📄 This is a long answer question. Students will provide a detailed text response that requires manual grading.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}