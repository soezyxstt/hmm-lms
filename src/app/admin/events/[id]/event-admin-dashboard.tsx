'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { api } from '~/trpc/react';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { PresenceStatus, ApprovalStatus } from '@prisma/client';
import { ThumbsUp, ThumbsDown, CheckCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { format } from 'date-fns';

export default function EventAdminDashboard({ eventId }: { eventId: string }) {
  const [showRsvpConfirm, setShowRsvpConfirm] = useState(false);
  const [showAttendanceConfirm, setShowAttendanceConfirm] = useState(false);

  const { data, isLoading, refetch } = api.event.getEventManagementData.useQuery({ eventId });

  const { mutate: updateRsvp, isPending: isUpdatingRsvp } = api.event.updateRsvpApproval.useMutation({
    onSuccess: async () => { toast.success("RSVP status updated"); await refetch(); },
    onError: (err) => toast.error(err.message)
  });

  const { mutate: updatePresence, isPending: isUpdatingPresence } = api.event.updatePresenceStatus.useMutation({
    onSuccess: async () => { toast.success("Presence status updated"); await refetch(); },
    onError: (err) => toast.error(err.message)
  });

  const { mutate: approveAllRsvps, isPending: isApprovingAllRsvps } = api.event.approveAllRsvps.useMutation({
    onSuccess: async () => { toast.success("All pending RSVPs approved."); await refetch(); },
    onError: (err) => toast.error(err.message),
    onSettled: () => setShowRsvpConfirm(false),
  });

  const { mutate: approveAllAttendances, isPending: isApprovingAllAttendances } = api.event.approveAllAttendances.useMutation({
    onSuccess: async () => { toast.success("All pending attendances approved."); await refetch(); },
    onError: (err) => toast.error(err.message),
    onSettled: () => setShowAttendanceConfirm(false),
  });

  const pendingAttendancesCount = useMemo(() =>
    data?.presenceRecords.filter(p => p.status === PresenceStatus.PENDING_APPROVAL).length ?? 0,
    [data?.presenceRecords]);

  const pendingRsvpsCount = useMemo(() =>
    data?.rsvpResponses.filter(r => r.approvalStatus === ApprovalStatus.PENDING).length ?? 0,
    [data?.rsvpResponses]);

  if (isLoading) return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader><CardTitle>Admin Dashboard</CardTitle></CardHeader>
      <CardContent><p>Loading management data...</p></CardContent>
    </Card>
  );

  return (
    <>
      <Card className="max-w-5xl mx-auto">
        <CardHeader><CardTitle>Admin Dashboard</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="attendance">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="attendance">Attendance ({data?.presenceRecords.length})</TabsTrigger>
              <TabsTrigger value="rsvp">RSVPs ({data?.rsvpResponses.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="mt-4">
              {pendingAttendancesCount > 0 && (
                <div className="flex justify-end mb-4">
                  <Button size="sm" onClick={() => setShowAttendanceConfirm(true)}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Approve All Pending ({pendingAttendancesCount})
                  </Button>
                </div>
              )}
              <div className="space-y-4">
                {data?.presenceRecords.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarImage src={p.user.image ?? ''} /><AvatarFallback>{p.user.name?.charAt(0)}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium">{p.user.name}</p>
                        {p.checkedInAt && <p className="text-xs text-muted-foreground">Checked in at {format(new Date(p.checkedInAt), 'p')}</p>}
                      </div>
                    </div>
                    <Select onValueChange={(val) => updatePresence({ presenceId: p.id, status: val as PresenceStatus })} defaultValue={p.status} disabled={isUpdatingPresence}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Set status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(PresenceStatus).map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                {data?.presenceRecords.length === 0 && <p className="text-muted-foreground text-center p-4">No attendance records yet.</p>}
              </div>
            </TabsContent>

            <TabsContent value="rsvp" className="mt-4">
              {pendingRsvpsCount > 0 && (
                <div className="flex justify-end mb-4">
                  <Button size="sm" onClick={() => setShowRsvpConfirm(true)}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Approve All Pending ({pendingRsvpsCount})
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                {data?.rsvpResponses.map(r => (
                  <div key={r.id} className="flex flex-wrap items-center justify-between p-3 border rounded-lg gap-2">
                    <div className="flex items-center gap-3">
                      <Avatar><AvatarImage src={r.user?.image ?? ''} /><AvatarFallback>{r.user?.name?.charAt(0)}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-medium">{r.user?.name}</p>
                        <Badge variant={r.status === 'YES' ? 'default' : 'secondary'}>{r.status}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.approvalStatus === 'APPROVED' ? 'default' : r.approvalStatus === 'REJECTED' ? 'destructive' : 'secondary'}>{r.approvalStatus}</Badge>
                      {r.approvalStatus === 'PENDING' && (
                        <>
                          <Button size="icon" variant="outline" onClick={() => updateRsvp({ responseId: r.id, status: 'APPROVED' })} disabled={isUpdatingRsvp}>
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline" onClick={() => updateRsvp({ responseId: r.id, status: 'REJECTED' })} disabled={isUpdatingRsvp}>
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {data?.rsvpResponses.length === 0 && <p className="text-muted-foreground text-center p-4">No RSVP responses yet.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Approve All RSVPs Confirmation */}
      <AlertDialog open={showRsvpConfirm} onOpenChange={setShowRsvpConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve all pending RSVPs?</AlertDialogTitle>
            <AlertDialogDescription>
              This will approve {pendingRsvpsCount} pending RSVP response(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApprovingAllRsvps}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => approveAllRsvps({ eventId })} disabled={isApprovingAllRsvps}>
              {isApprovingAllRsvps && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve All Attendances Confirmation */}
      <AlertDialog open={showAttendanceConfirm} onOpenChange={setShowAttendanceConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve all pending attendances?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark {pendingAttendancesCount} user(s) as &apos;PRESENT&apos;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApprovingAllAttendances}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => approveAllAttendances({ eventId })} disabled={isApprovingAllAttendances}>
              {isApprovingAllAttendances && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

