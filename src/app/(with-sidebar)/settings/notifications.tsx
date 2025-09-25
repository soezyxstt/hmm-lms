'use client';

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Bell, BellOff, Send } from "lucide-react";
import { useNotifications } from '~/hooks/use-notifications';
import { Alert, AlertDescription } from "~/components/ui/alert";
import { LoadingSpinner } from '~/components/ui/loading-spinner';

export default function NotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    permission,
    requestPermission,
    unsubscribe,
    isLoading,
    testNotification,
  } = useNotifications();

  if (!isSupported) {
    return (
      <Alert>
        <AlertDescription>
          Push notifications are not supported in your browser.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>
          Get notified about announcements, events, tryouts, and more
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <Bell className="h-5 w-5 text-green-500" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium">
                {isSubscribed ? 'Notifications Enabled' : 'Notifications Disabled'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isSubscribed
                  ? 'You will receive push notifications'
                  : 'Enable to receive important updates'}
              </p>
            </div>
          </div>

          <Button
            variant={isSubscribed ? "destructive" : "default"}
            onClick={isSubscribed ? unsubscribe : requestPermission}
          >
            {isLoading ? (<LoadingSpinner size='sm' />) : isSubscribed ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {isSubscribed && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={testNotification}
              className="w-full"
              disabled={isLoading}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Test Notification
            </Button>
          </div>
        )}

        {permission === 'denied' && (
          <Alert className="mt-4">
            <AlertDescription>
              You have blocked notifications. Please enable them in your browser settings to receive updates.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}