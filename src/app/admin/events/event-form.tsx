/* eslint-disable */
// @ts-nocheck

'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Trash, Plus, Clock } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { api, type RouterOutputs } from "~/trpc/react";
import { EventColor, EventMode } from "@prisma/client";

// Simplified form schema
const eventFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  start: z.date({
    required_error: "Start date is required",
  }),
  end: z.date({
    required_error: "End date is required",
  }),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  color: z.nativeEnum(EventColor).default(EventColor.SKY),
  scope: z.enum(['global', 'course', 'personal']),
  courseId: z.string().optional(),
  eventMode: z.nativeEnum(EventMode).default(EventMode.BASIC),
  hasTimeline: z.boolean().default(false),
  timeline: z.array(z.object({
    time: z.string(),
    title: z.string().min(1, "Timeline title is required"),
    description: z.string().optional(),
    isCompleted: z.boolean().default(false),
  })).optional(),
}).refine(data => data.end >= data.start, {
  message: "End date must be after start date",
  path: ["end"],
}).refine(data => {
  if (data.scope === 'course') {
    return !!data.courseId;
  }
  return true;
}, {
  message: "Please select a course",
  path: ["courseId"],
});

type EventFormValues = z.infer<typeof eventFormSchema>;
type EventData = NonNullable<RouterOutputs['event']['getEventById']>;
type CourseData = RouterOutputs['course']['getCoursesForSelection'];

interface EventFormProps {
  existingEvent?: EventData;
  courses: CourseData;
}

export default function EventForm({ existingEvent, courses }: EventFormProps) {
  const router = useRouter();
  const utils = api.useUtils();

  // Parse existing timeline data safely
  const parseTimeline = (timeline: unknown) => {
    if (!Array.isArray(timeline)) return [];

    return timeline.map((item: any) => ({
      time: typeof item.time === 'string'
        ? item.time
        : new Date(item.time).toISOString(),
      title: item.title ?? '',
      description: item.description ?? '',
      isCompleted: item.isCompleted ?? false,
    }));
  };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: existingEvent?.title ?? "",
      description: existingEvent?.description ?? "",
      start: existingEvent ? new Date(existingEvent.start) : new Date(),
      end: existingEvent ? new Date(existingEvent.end) : (() => {
        const date = new Date();
        date.setHours(date.getHours() + 1);
        return date;
      })(),
      allDay: existingEvent?.allDay ?? false,
      location: existingEvent?.location ?? "",
      color: existingEvent?.color ?? EventColor.SKY,
      scope: existingEvent?.courseId
        ? 'course'
        : existingEvent?.userId
          ? 'personal'
          : 'global',
      courseId: existingEvent?.courseId ?? undefined,
      eventMode: existingEvent?.eventMode ?? EventMode.BASIC,
      hasTimeline: existingEvent?.hasTimeline ?? false,
      timeline: existingEvent?.timeline
        ? parseTimeline(existingEvent.timeline)
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "timeline",
  });

  const createEventMutation = api.event.createEvent.useMutation({
    onSuccess: (data) => {
      toast.success("Event created successfully!");
      void utils.event.getAllEventsAdmin.invalidate();
      router.push(`/admin/events/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const updateEventMutation = api.event.updateEvent.useMutation({
    onSuccess: (data) => {
      toast.success("Event updated successfully!");
      void utils.event.getAllEventsAdmin.invalidate();
      void utils.event.getEventById.invalidate({ id: data.id });
      router.push(`/admin/events/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  function onSubmit(data: EventFormValues) {
    // Prepare submission data
    const submitData = {
      ...data,
      courseId: data.scope === 'course' ? data.courseId : undefined,
      userId: data.scope === 'personal' ? undefined : undefined, // Will be set on server
      timeline: data.hasTimeline && data.timeline ? data.timeline : undefined,
    };

    if (existingEvent) {
      updateEventMutation.mutate({
        ...submitData,
        id: existingEvent.id
      });
    } else {
      createEventMutation.mutate(submitData);
    }
  }

  const scope = form.watch("scope");
  const eventMode = form.watch("eventMode");
  const hasTimeline = form.watch("hasTimeline");
  const isLoading = createEventMutation.isPending || updateEventMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about your event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Final Project Showcase"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a brief summary of the event..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Give attendees a clear understanding of what to expect
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="location"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Campus Auditorium, Room 301"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Date and Time */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>When will this event take place?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                name="start"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date & Time *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP HH:mm")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Input
                            type="time"
                            value={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':');
                              const newDate = new Date(field.value ?? new Date());
                              newDate.setHours(parseInt(hours ?? '0'), parseInt(minutes ?? '0'));
                              field.onChange(newDate);
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="end"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date & Time *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP HH:mm")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                          <Input
                            type="time"
                            value={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':');
                              const newDate = new Date(field.value ?? new Date());
                              newDate.setHours(parseInt(hours ?? '0'), parseInt(minutes ?? '0'));
                              field.onChange(newDate);
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              name="allDay"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>All Day Event</FormLabel>
                    <FormDescription>
                      This event lasts for the entire day(s)
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Event Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Event Configuration</CardTitle>
            <CardDescription>Define who can see this event and how they interact with it</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                name="color"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calendar Color</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(EventColor).map(color => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "h-4 w-4 rounded-full",
                                color === EventColor.SKY && "bg-sky-500",
                                color === EventColor.AMBER && "bg-amber-500",
                                color === EventColor.VIOLET && "bg-violet-500",
                                color === EventColor.ROSE && "bg-rose-500",
                                color === EventColor.EMERALD && "bg-emerald-500",
                                color === EventColor.ORANGE && "bg-orange-500",
                              )} />
                              {color}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="scope"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility Scope *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select scope" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="global">
                          Global - All users
                        </SelectItem>
                        <SelectItem value="course">
                          Course - Specific course members
                        </SelectItem>
                        <SelectItem value="personal">
                          Personal - Admin only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {scope === 'course' && (
              <FormField
                name="courseId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Course *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title} ({course.classCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Only members of this course will see the event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              name="eventMode"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interaction Mode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(EventMode).map(mode => (
                        <SelectItem key={mode} value={mode}>
                          {mode.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {eventMode === EventMode.BASIC && "Simple event without RSVP or attendance"}
                    {eventMode === EventMode.RSVP_ONLY && "Users can RSVP to the event"}
                    {eventMode === EventMode.ATTENDANCE_ONLY && "Track attendance with check-ins"}
                    {eventMode === EventMode.RSVP_AND_ATTENDANCE && "Full RSVP and attendance tracking"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Event Timeline</CardTitle>
                <CardDescription>Add a detailed schedule for the event</CardDescription>
              </div>
              <FormField
                name="hasTimeline"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Enable Timeline</FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </CardHeader>

          {hasTimeline && (
            <CardContent className="space-y-4">
              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No timeline items yet. Add your first item below.</p>
                </div>
              )}

              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => remove(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>

                  <FormField
                    control={form.control}
                    name={`timeline.${index}.time`}
                    render={({ field: timeField }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            value={timeField.value ?? ''}
                            onChange={(e) => timeField.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`timeline.${index}.title`}
                    render={({ field: titleField }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Opening Remarks"
                            {...titleField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`timeline.${index}.description`}
                    render={({ field: descField }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Details about this timeline item..."
                            rows={2}
                            {...descField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({
                  time: "09:00",
                  title: "",
                  description: "",
                  isCompleted: false
                })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Timeline Item
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingEvent ? 'Save Changes' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
