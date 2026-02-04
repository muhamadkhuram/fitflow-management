import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LogOut } from "lucide-react";
import { useBulkCheckOut, Attendance } from "@/hooks/useAttendance";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface BulkCheckOutDialogProps {
  gymId: string;
  activeCheckIns: Attendance[];
}

export function BulkCheckOutDialog({ gymId, activeCheckIns }: BulkCheckOutDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const bulkCheckOut = useBulkCheckOut();

  const toggleRecord = (recordId: string) => {
    setSelectedIds((prev) =>
      prev.includes(recordId)
        ? prev.filter((id) => id !== recordId)
        : [...prev, recordId]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === activeCheckIns.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(activeCheckIns.map((a) => a.id));
    }
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) return;

    bulkCheckOut.mutate(
      { gymId, attendanceIds: selectedIds },
      {
        onSuccess: () => {
          setOpen(false);
          setSelectedIds([]);
        },
      }
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedIds([]);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={activeCheckIns.length === 0}>
          <LogOut className="h-4 w-4 mr-2" />
          Bulk Check Out
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Check Out</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {activeCheckIns.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.length === activeCheckIns.length && activeCheckIns.length > 0}
                  onCheckedChange={toggleAll}
                />
                <span className="text-sm text-muted-foreground">Select all</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedIds.length} selected
              </span>
            </div>
          )}

          <ScrollArea className="h-64">
            <div className="space-y-2">
              {activeCheckIns.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No members currently checked in
                </p>
              ) : (
                activeCheckIns.map((record) => (
                  <label
                    key={record.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedIds.includes(record.id)}
                      onCheckedChange={() => toggleRecord(record.id)}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={record.member?.avatar_url || undefined} />
                      <AvatarFallback>
                        {record.member?.full_name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{record.member?.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        In since {formatTime(record.check_in_time)}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                      Present
                    </Badge>
                  </label>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedIds.length === 0 || bulkCheckOut.isPending}
            >
              {bulkCheckOut.isPending
                ? "Checking out..."
                : `Check Out (${selectedIds.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
