import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Search } from "lucide-react";
import { useBulkCheckIn } from "@/hooks/useAttendance";
import { GymMember } from "@/hooks/useGym";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BulkCheckInDialogProps {
  gymId: string;
  members: GymMember[];
  activeCheckIns: string[];
}

export function BulkCheckInDialog({ gymId, members, activeCheckIns }: BulkCheckInDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const bulkCheckIn = useBulkCheckIn();

  const availableMembers = members.filter(
    (m) => m.is_active && !activeCheckIns.includes(m.id)
  );

  const filteredMembers = availableMembers.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMember = (memberId: string) => {
    setSelectedIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMembers.map((m) => m.id));
    }
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) return;

    bulkCheckIn.mutate(
      { gymId, memberIds: selectedIds },
      {
        onSuccess: () => {
          setOpen(false);
          setSelectedIds([]);
          setSearch("");
        },
      }
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedIds([]);
      setSearch("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Bulk Check In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Check In</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredMembers.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.length === filteredMembers.length && filteredMembers.length > 0}
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
              {filteredMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {availableMembers.length === 0
                    ? "All members are already checked in"
                    : "No members found"}
                </p>
              ) : (
                filteredMembers.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedIds.includes(member.id)}
                      onCheckedChange={() => toggleMember(member.id)}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{member.full_name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
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
              disabled={selectedIds.length === 0 || bulkCheckIn.isPending}
            >
              {bulkCheckIn.isPending
                ? "Checking in..."
                : `Check In (${selectedIds.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
