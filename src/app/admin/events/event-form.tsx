// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Trash } from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { api, type RouterOutputs } from "~/trpc/react";
import { EventColor, EventMode } from "@prisma/client";
import { eventInputSchema } from '~/server/api/routers/event';

type EventFormValues = z.infer<typeof eventInputSchema>;
type EventData = NonNullable<RouterOutputs['event']['getEventById']>;
type CourseData = RouterOutputs['course']['getCoursesForSelection'];

interface EventFormProps {
  existingEvent?: EventData;
  courses: CourseData;
}

export default function EventForm({ existingEvent, courses }: EventFormProps) {
  const router = useRouter();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventInputSchema),
    defaultValues: {
      title: existingEvent?.title ?? "",
      description: existingEvent?.description ?? "",
      start: existingEvent ? new Date(existingEvent.start) : new Date(),
      end: existingEvent ? new Date(existingEvent.end) : new Date(),
      allDay: existingEvent?.allDay ?? false,
      location: existingEvent?.location ?? "",
      scope: existingEvent?.courseId ? 'course' : existingEvent?.userId ? 'personal' : 'global',
      courseId: existingEvent?.courseId ?? undefined,
      eventMode: existingEvent?.eventMode ?? EventMode.BASIC,
      rsvpRequiresApproval: existingEvent?.rsvpRequiresApproval ?? false,
      presenceRequiresApproval: existingEvent?.presenceRequiresApproval ?? false,
      hasTimeline: existingEvent?.hasTimeline ?? false,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      timeline: existingEvent?.timeline ? (existingEvent.timeline).map(t => ({ ...t, time: new Date(t.time) })) : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "timeline",
  });

  const updateEventMutation = api.event.updateEvent.useMutation({
    onSuccess: (data) => {
      toast.success("Event updated successfully!");
      router.push(`/admin/events/${data.id}`);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // You would also define a createEventMutation here for a create form
  // const createEventMutation = api.event.createEvent.useMutation(...)

  function onSubmit(data: EventFormValues) {
    if (existingEvent) {
      updateEventMutation.mutate({ ...data, id: existingEvent.id });
    } else {
      // createEventMutation.mutate(data);
    }
  }

  const scope = form.watch("scope");
  const eventMode = form.watch("eventMode");
  const hasTimeline = form.watch("hasTimeline");
  const isLoading = updateEventMutation.isPending; // || createEventMutation.isLoading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader><CardTitle>Core Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField name="title" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl><Input placeholder="e.g., Final Project Showcase" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Provide a brief summary of the event..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Date and Time</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField name="start" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn(!field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="end" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn(!field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField name="allDay" control={form.control} render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>All Day Event</FormLabel>
                  <FormDescription>Does this event last for the entire day?</FormDescription>
                </div>
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Event Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField name="location" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl><Input placeholder="e.g., Campus Auditorium" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="color" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a color" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {Object.values(EventColor).map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="scope" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Scope</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select scope" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="personal">Personal (Admin Only)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            {scope === 'course' && (
              <FormField name="courseId" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {courses.map(course => <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Interactivity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField name="eventMode" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Event Mode</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {Object.values(EventMode).map(mode => <SelectItem key={mode} value={mode}>{mode.replace(/_/g, " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormDescription>Controls RSVP and Attendance features.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            {(eventMode === 'RSVP_ONLY' || eventMode === 'RSVP_AND_ATTENDANCE') && (
              <FormField name="rsvpRequiresApproval" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>RSVP Requires Approval</FormLabel>
                    <FormDescription>Admins must approve each RSVP response.</FormDescription>
                  </div>
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
            )}
            {(eventMode === 'ATTENDANCE_ONLY' || eventMode === 'RSVP_AND_ATTENDANCE') && (
              <FormField name="presenceRequiresApproval" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Attendance Requires Approval</FormLabel>
                    <FormDescription>Admins must approve each check-in.</FormDescription>
                  </div>
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FormField name="hasTimeline" control={form.control} render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Event Timeline</FormLabel>
                  <FormDescription>Add a detailed schedule for the event.</FormDescription>
                </div>
                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />
          </CardHeader>
          {hasTimeline && (
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                  <FormField control={form.control} name={`timeline.${index}.time`} render={({ field: timeField }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...timeField} value={timeField.value ? format(new Date(timeField.value), "yyyy-MM-dd'T'HH:mm") : ''} onChange={e => timeField.onChange(new Date(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`timeline.${index}.title`} render={({ field: titleField }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl><Input placeholder="e.g., Opening Remarks" {...titleField} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`timeline.${index}.description`} render={({ field: descField }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea placeholder="Details about this timeline item..." {...descField} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ time: new Date(), title: "", description: "" })}>
                Add Timeline Item
              </Button>
            </CardContent>
          )}
        </Card>

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {existingEvent ? 'Save Changes' : 'Create Event'}
        </Button>
      </form>
    </Form>
  );
}
