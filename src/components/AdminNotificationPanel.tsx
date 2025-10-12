import { Card, CardContent } from "@/components/ui/card";

export const AdminNotificationPanel = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Admin functionality will be implemented with Firebase authentication
        </CardContent>
      </Card>
    </div>
  );
};