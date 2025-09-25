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
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Plus, Trash2, Image as ImageIcon, AlertCircle } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { CreateTryoutInput } from "~/lib/schema/tryout";
import { toast } from 'sonner';
import { cn } from "~/lib/utils";

// Reusable ImageUploader component
const ImageUploader = ({
  onUpload,
  isUploading,
}: {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isUploading: boolean;
}) => (
  <div className="relative w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground hover:border-primary transition-colors">
    <input
      type="file"
      accept="image/*"
      onChange={onUpload}
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
);

interface QuestionBuilderProps {
  form: UseFormReturn<CreateTryoutInput>;
  questionIndex: number;
}

export default function QuestionBuilder({ form, questionIndex }: QuestionBuilderProps) {
  const { formState: { errors } } = form;

  // Get errors for this specific question object
  const questionErrors = errors.questions?.[questionIndex];

  const questionType = form.watch(`questions.${questionIndex}.type`);
  const questionImages = form.watch(`questions.${questionIndex}.images`);
  const [isUploadingQuestionImage, setIsUploadingQuestionImage] = useState(false);
  const [uploadingOptionImage, setUploadingOptionImage] = useState<number | null>(null);

  const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
    control: form.control,
    name: `questions.${questionIndex}.options`,
  });

  const { fields: shortAnswerFields, append: appendShortAnswer, remove: removeShortAnswer } = useFieldArray({
    control: form.control,
    name: `questions.${questionIndex}.shortAnswers`,
  });

  const uploadImages = async (files: FileList) => {
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/documents/upload", { method: "POST", body: formData });
      if (!response.ok) throw new Error(`Upload failed for ${file.name}`);
      return response.json() as Promise<{ CDNurl: string }>;
    });
    return Promise.all(uploadPromises);
  };

  const handleQuestionImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    setIsUploadingQuestionImage(true);
    try {
      const results = await uploadImages(files);
      const newImageUrls = results.map(result => result.CDNurl);
      const currentImages = form.getValues(`questions.${questionIndex}.images`) ?? [];
      form.setValue(`questions.${questionIndex}.images`, [...currentImages, ...newImageUrls]);
      toast.success(`${results.length} image(s) uploaded!`);
    } catch {
      toast.error("Failed to upload one or more images.");
    } finally {
      setIsUploadingQuestionImage(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleOptionImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, optionIndex: number) => {
    const files = event.target.files;
    if (!files?.length) return;
    setUploadingOptionImage(optionIndex);
    try {
      const results = await uploadImages(files);
      const newImageUrls = results.map(result => result.CDNurl);
      const currentImages = form.getValues(`questions.${questionIndex}.options.${optionIndex}.images`) ?? [];
      form.setValue(`questions.${questionIndex}.options.${optionIndex}.images`, [...currentImages, ...newImageUrls]);
      toast.success(`${results.length} image(s) uploaded for option ${String.fromCharCode(65 + optionIndex)}!`);
    } catch {
      toast.error("Failed to upload images for option.");
    } finally {
      setUploadingOptionImage(null);
      if (event.target) event.target.value = '';
    }
  };

  const handleRemoveImage = (imageUrl: string, optionIndex?: number) => {
    const path = (typeof optionIndex === 'number')
      ? `questions.${questionIndex}.options.${optionIndex}.images`
      : `questions.${questionIndex}.images`;
    // @ts-expect-error - Path is valid but TS can't infer it perfectly
    const currentImages = form.getValues(path) as string[] ?? [];
    // @ts-expect-error - Same as above
    form.setValue(path, currentImages.filter((img: string) => img !== imageUrl));
    toast.success("Image removed.");
  };

  useEffect(() => {
    if (
      (questionType === QuestionType.MULTIPLE_CHOICE_SINGLE || questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE) &&
      optionFields.length === 0
    ) {
      [1, 2].forEach(() => appendOption({ text: "", isCorrect: false, explanation: "", images: [] }));
    }
  }, [questionType, optionFields.length, appendOption]);

  const addOption = () => {
    appendOption({ text: "", isCorrect: false, explanation: "", images: [] });
  };

  const handleTypeChange = (newType: QuestionType) => {
    form.setValue(`questions.${questionIndex}.type`, newType, { shouldValidate: true });
    if (newType === QuestionType.SHORT_ANSWER) {
      form.setValue(`questions.${questionIndex}.options`, []);
    } else if (newType === QuestionType.MULTIPLE_CHOICE_SINGLE || newType === QuestionType.MULTIPLE_CHOICE_MULTIPLE) {
      form.setValue(`questions.${questionIndex}.shortAnswers`, []);
    } else if (newType === QuestionType.LONG_ANSWER) {
      form.setValue(`questions.${questionIndex}.options`, []);
      form.setValue(`questions.${questionIndex}.shortAnswers`, []);
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE_SINGLE: return "Multiple Choice (Single)";
      case QuestionType.MULTIPLE_CHOICE_MULTIPLE: return "Multiple Choice (Multiple)";
      case QuestionType.SHORT_ANSWER: return "Short Answer";
      case QuestionType.LONG_ANSWER: return "Long Answer";
      default: return type;
    }
  };

  return (
    <Card className={cn(
      "border-l-4 transition-colors",
      questionErrors ? "border-l-destructive" : "border-l-primary"
    )}>
      <CardContent className="pt-6 space-y-6">
        {(questionErrors?.options?.message ?? questionErrors?.shortAnswers?.message) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {questionErrors.options?.message ?? questionErrors.shortAnswers?.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Question Type, Points, Required */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <FormField control={form.control} name={`questions.${questionIndex}.type`} render={({ field }) => (
            <FormItem>
              <FormLabel>Question Type</FormLabel>
              <Select onValueChange={(value) => handleTypeChange(value as QuestionType)} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {Object.values(QuestionType).map((type) => (<SelectItem key={type} value={type}>{getQuestionTypeLabel(type)}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name={`questions.${questionIndex}.points`} render={({ field }) => (
            <FormItem>
              <FormLabel>Points</FormLabel>
              <FormControl><Input type="number" min="1" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name={`questions.${questionIndex}.required`} render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm h-full">
              <div className="space-y-0.5"><FormLabel>Required</FormLabel></div>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
        </div>

        {/* Question Text */}
        <FormField control={form.control} name={`questions.${questionIndex}.question`} render={({ field }) => (
          <FormItem>
            <FormLabel>Question</FormLabel>
            <FormControl><Textarea placeholder="Enter your question here..." className="min-h-[75px]" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Overall Question Explanation */}
        <FormField control={form.control} name={`questions.${questionIndex}.explanation`} render={({ field }) => (
          <FormItem>
            <FormLabel>Overall Explanation (Optional)</FormLabel>
            <FormControl><Textarea placeholder="Explain the correct answer after the user completes the question..." {...field} value={field.value ?? ''} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Question Image Upload and Display */}
        <div className="space-y-2">
          <Label>Question Images (Optional)</Label>
          <div className="flex flex-wrap gap-3">
            {questionImages?.map((imageUrl) => (
              <div key={imageUrl} className="relative w-24 h-24 rounded-md overflow-hidden group">
                <Image src={imageUrl} alt="Question image" fill style={{ objectFit: 'cover' }} className="transition-transform duration-200 group-hover:scale-105" />
                <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveImage(imageUrl)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <ImageUploader onUpload={handleQuestionImageUpload} isUploading={isUploadingQuestionImage} />
          </div>
        </div>

        {/* Options for Multiple Choice Questions */}
        {(questionType === QuestionType.MULTIPLE_CHOICE_SINGLE || questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Answer Options</Label>
              <Button type="button" onClick={addOption} size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" /> Add Option</Button>
            </div>
            <div className="space-y-3">
              {optionFields?.map((option, optionIndex) => {
                const optionImages = form.watch(`questions.${questionIndex}.options.${optionIndex}.images`);
                return (
                  <div key={option.id} className="flex items-start gap-3 p-4 border rounded-lg bg-background">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">{String.fromCharCode(65 + optionIndex)}</Badge>
                          <FormField control={form.control} name={`questions.${questionIndex}.options.${optionIndex}.isCorrect`} render={({ field }) => (
                            <FormItem><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" /></FormControl></FormItem>
                          )} />
                        </div>
                        <div className="flex-1">
                          <FormField control={form.control} name={`questions.${questionIndex}.options.${optionIndex}.text`} render={({ field }) => (
                            <FormItem>
                              <FormControl><Input placeholder={`Option ${String.fromCharCode(65 + optionIndex)} text`} {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>
                      <div className="pl-12">
                        <Label className="text-xs text-muted-foreground">Option Images</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {optionImages?.map((imageUrl) => (
                            <div key={imageUrl} className="relative w-24 h-24 rounded-md overflow-hidden group">
                              <Image src={imageUrl} alt="Option image" fill style={{ objectFit: 'cover' }} className="transition-transform duration-200 group-hover:scale-105" />
                              <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveImage(imageUrl, optionIndex)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <ImageUploader onUpload={(e) => handleOptionImageUpload(e, optionIndex)} isUploading={uploadingOptionImage === optionIndex} />
                        </div>
                      </div>
                      {form.watch(`questions.${questionIndex}.options.${optionIndex}.isCorrect`) && (
                        <FormField control={form.control} name={`questions.${questionIndex}.options.${optionIndex}.explanation`} render={({ field }) => (
                          <FormItem>
                            <FormControl><Textarea placeholder="Explanation for correct answer (optional)" className="min-h-[60px]" {...field} value={field.value ?? ''} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      )}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(optionIndex)} className="text-destructive hover:text-destructive mt-1" disabled={optionFields.length <= 2}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
            {questionType === QuestionType.MULTIPLE_CHOICE_SINGLE && (<p className="text-sm text-muted-foreground">ℹ️ For single choice questions, only one option should be marked as correct.</p>)}
            {questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE && (<p className="text-sm text-muted-foreground">ℹ️ For multiple choice questions, you can mark multiple options as correct.</p>)}
          </div>
        )}

        {/* Short Answer with multiple possible answers */}
        {questionType === QuestionType.SHORT_ANSWER && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-4">
            <p className="text-sm text-muted-foreground">📝 For auto-grading, the student&apos;s answer must exactly match one of the answers you provide.</p>
            {shortAnswerFields.map((field, index) => (
              <FormField key={field.id} control={form.control} name={`questions.${questionIndex}.shortAnswers.${index}.value`} render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormControl><Input placeholder={`Correct Answer #${index + 1}`} {...field} /></FormControl>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeShortAnswer(index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => appendShortAnswer({ value: "" })}>
              <Plus className="w-4 h-4 mr-2" />Add Correct Answer
            </Button>
          </div>
        )}

        {/* Long Answer (Manual Grading) */}
        {questionType === QuestionType.LONG_ANSWER && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">📄 This is a long answer question. Students will provide a detailed text response that requires manual grading.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}