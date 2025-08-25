"use client";

import { useEffect, useState } from "react";
import { api } from '~/trpc/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

export function NotificationPromptModal() {
  const [showModal, setShowModal] = useState(false);
  const saveSubscription = api.push.saveSubscription.useMutation();

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      void navigator.serviceWorker.ready.then(() => {
        if (Notification.permission === "default") {
          setShowModal(true);
        }
      });
    }
  }, []);

  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const { endpoint, keys } = sub.toJSON();

      await saveSubscription.mutateAsync({
        endpoint: endpoint!,
        p256dh: keys?.p256dh ?? "",
        auth: keys?.auth ?? "",
      });
    }
    setShowModal(false);
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enable Notifications</DialogTitle>
          <DialogDescription>
            Get notified about announcements, events, and updates.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowModal(false)}
          >
            Later
          </Button>
          <Button
            onClick={requestPermission}
            disabled={saveSubscription.isPending}
          >
            {saveSubscription.isPending ? "Enabling..." : "Enable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
