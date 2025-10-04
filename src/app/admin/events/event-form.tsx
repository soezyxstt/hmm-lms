// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, type RouterOutputs } from '~/trpc/react';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Checkbox } from '~/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { EventMode, EventColor } from '@prisma/client';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

type EventDetail = NonNullable<RouterOutputs['event']['getEventById']>;

const timelineItemSchema = z.object({
  time: z.string().min(1, 'Time is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isCompleted: z.boolean().default(false),
});

const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start: z.string().min(1, 'Start date is required'),
  end: z.string().min(1, 'End date is required'),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  color: z.nativeEnum(EventColor).default(EventColor.SKY),
  hasTimeline: z.boolean().default(false),
  timeline: z.array(timelineItemSchema).optional(),
  scope: z.enum(['personal', 'course', 'global']),
  courseId: z.string().optional(),
  eventMode: z.nativeEnum(EventMode).default(EventMode.BASIC),
  rsvpDeadline: z.string().optional().nullable(),
  rsvpRequiresApproval: z.boolean().default(false),
  rsvpAllowMaybe: z.boolean().default(true),
  rsvpMaxAttendees: z.number().optional().nullable(),
  rsvpPublic: z.boolean().default(false),
  presenceCheckInRadius: z.number().optional().nullable(),
  presenceAutoCheckOut: z.boolean().default(true),
  presenceRequiresApproval: z.boolean().default(false),
  presenceAllowLateCheckIn: z.boolean().default(true),
  presenceCheckInBuffer: z.number().optional().nullable(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: EventDetail;
  mode: 'create' | 'edit';
}

export default function EventForm({ event, mode }: EventFormProps) {
  const router = useRouter();
  const [timelineItems, setTimelineItems] = useState<z.infer<typeof timelineItemSchema>[]>(
    event?.timeline ? (event.timeline as z.infer<typeof timelineItemSchema>[]) : []
  );

  const { data: courses } = api.course.getAllCourses.useQuery();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event
      ? {
        title: event.title,
        description: event.description ?? '',
        start: new Date(event.start).toISOString().slice(0, 16),
        end: new Date(event.end).toISOString().slice(0, 16),
        allDay: event.allDay,
        location: event.location ?? '',
        color: event.color,
        hasTimeline: event.hasTimeline,
        timeline: event.timeline as z.infer<typeof timelineItemSchema>[] | undefined,
        scope: event.courseId ? 'course' : event.userId ? 'personal' : 'global',
        courseId: event.courseId ?? undefined,
        eventMode: event.eventMode,
        rsvpDeadline: event.rsvpDeadline
          ? new Date(event.rsvpDeadline).toISOString().slice(0, 16)
          : null,
        rsvpRequiresApproval: event.rsvpRequiresApproval,
        rsvpAllowMaybe: event.rsvpAllowMaybe,
        rsvpMaxAttendees: event.rsvpMaxAttendees,
        rsvpPublic: event.rsvpPublic,
        presenceCheckInRadius: event.presenceCheckInRadius,
        presenceAutoCheckOut: event.presenceAutoCheckOut,
        presenceRequiresApproval: event.presenceRequiresApproval,
        presenceAllowLateCheckIn: event.presenceAllowLateCheckIn,
        presenceCheckInBuffer: event.presenceCheckInBuffer,
      }
      : {
        title: '',
        description: '',
        start: '',
        end: '',
        allDay: false,
        location: '',
        color: EventColor.SKY,
        hasTimeline: false,
        timeline: [],
        scope: 'global',
        eventMode: EventMode.BASIC,
        rsvpRequiresApproval: false,
        rsvpAllowMaybe: true,
        rsvpPublic: false,
        presenceAutoCheckOut: true,
        presenceRequiresApproval: false,
        presenceAllowLateCheckIn: true,
      },
  });

  const createEvent = api.event.createEvent.useMutation({
    onSuccess: () => {
      toast.success('Event created successfully!');
      router.push('/admin/events');
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateEvent = api.event.updateEvent.useMutation({
    onSuccess: () => {
      toast.success('Event updated successfully!');
      router.push('/admin/events');
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (data: EventFormValues) => {
    const payload = {
      ...data,
      start: new Date(data.start),
      end: new Date(data.end),
      rsvpDeadline: data.rsvpDeadline ? new Date(data.rsvpDeadline) : undefined,
      timeline: data.hasTimeline ? timelineItems : undefined,
    };

    if (mode === 'create') {
      createEvent.mutate(payload);
    } else if (event) {
      updateEvent.mutate({ ...payload, id: event.id });
    }
  };

  const scope = form.watch('scope');
  const eventMode = form.watch('eventMode');
  const hasTimeline = form.watch('hasTimeline');

  const showRsvpOptions = eventMode === EventMode.RSVP_ONLY || eventMode === EventMode.RSVP_AND_ATTENDANCE;
  const showPresenceOptions =
    eventMode === EventMode.ATTENDANCE_ONLY || eventMode === EventMode.RSVP_AND_ATTENDANCE;

  const addTimelineItem = () => {
    setTimelineItems([...timelineItems, { time: '', title: '', description: '', isCompleted: false }]);
  };

  const removeTimelineItem = (index: number) => {
    setTimelineItems(timelineItems.filter((_, i) => i !== index));
  };

  const updateTimelineItem = (index: number, field: keyof z.infer<typeof timelineItemSchema>, value: string | boolean) => {
    const updated = [...timelineItems];
    updated[index] = { ...updated[index]!, [field]: value };
    setTimelineItems(updated);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Event description" {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Event location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="allDay"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">All day event</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(EventColor).map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Scope Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Event Scope</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scope</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Global events are visible to everyone, course events are visible to course members only
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {scope === 'course' && (
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses?.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title} ({course.classCode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Event Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Event Mode</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="eventMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={EventMode.BASIC}>Basic (No tracking)</SelectItem>
                      <SelectItem value={EventMode.RSVP_ONLY}>RSVP Only</SelectItem>
                      <SelectItem value={EventMode.ATTENDANCE_ONLY}>Attendance Only</SelectItem>
                      <SelectItem value={EventMode.RSVP_AND_ATTENDANCE}>RSVP & Attendance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose how participants interact with this event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* RSVP Settings */}
        {showRsvpOptions && (
          <Card>
            <CardHeader>
              <CardTitle>RSVP Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="rsvpDeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RSVP Deadline</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>Leave empty for no deadline</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rsvpMaxAttendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Attendees</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="No limit"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rsvpRequiresApproval"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Require approval for RSVPs</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rsvpAllowMaybe"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Allow &quot;Maybe&quot; response</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rsvpPublic"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Make RSVP list public</FormLabel>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Presence Settings */}
        {showPresenceOptions && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="presenceCheckInRadius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Radius (meters)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="No location restriction"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum distance from event location to allow check-in
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="presenceCheckInBuffer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in Buffer (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormDescription>
                      Allow check-in this many minutes before event starts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="presenceAutoCheckOut"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Auto check-out when event ends</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="presenceRequiresApproval"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Require approval for attendance</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="presenceAllowLateCheckIn"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="!mt-0">Allow late check-in</FormLabel>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="hasTimeline"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Enable timeline</FormLabel>
                </FormItem>
              )}
            />

            {hasTimeline && (
              <div className="space-y-4">
                {timelineItems.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="space-y-3 pt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Item {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimelineItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3">
                        <Input
                          placeholder="Time (e.g., 09:00)"
                          value={item.time}
                          onChange={(e) => updateTimelineItem(index, 'time', e.target.value)}
                        />
                        <Input
                          placeholder="Title"
                          value={item.title}
                          onChange={(e) => updateTimelineItem(index, 'title', e.target.value)}
                        />
                        <Textarea
                          placeholder="Description"
                          value={item.description ?? ''}
                          onChange={(e) => updateTimelineItem(index, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={addTimelineItem} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Timeline Item
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/events')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
            {(createEvent.isPending || updateEvent.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {mode === 'create' ? 'Create Event' : 'Update Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
