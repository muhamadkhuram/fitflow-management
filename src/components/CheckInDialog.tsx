import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Search } from "lucide-react";
import { useCheckIn } from "@/hooks/useAttendance";
import { GymMember } from "@/hooks/useGym";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CheckInDialogProps {
  gymId: string;
  members: GymMember[];
  activeCheckIns: string[]; // member IDs that are already checked in
}

export function CheckInDialog({ gymId, members, activeCheckIns }: CheckInDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<GymMember | null>(null);
  const [notes, setNotes] = useState("");

  const checkIn = useCheckIn();

  const availableMembers = members.filter(
    (m) => m.is_active && !activeCheckIns.includes(m.id)
  );

  const filteredMembers = availableMembers.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!selectedMember) return;

    checkIn.mutate(
      { gymId, memberId: selectedMember.id, notes: notes || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          setSelectedMember(null);
          setNotes("");
          setSearch("");
        },
      }
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedMember(null);
      setNotes("");
      setSearch("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Check In Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Check In Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedMember ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

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
                      <button
                        key={member.id}
                        onClick={() => setSelectedMember(member)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors text-left"
                      >
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
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedMember.avatar_url || undefined} />
                  <AvatarFallback>
                    {selectedMember.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedMember.full_name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {selectedMember.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedMember(null)}
                >
                  Change
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any notes about this visit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={checkIn.isPending}>
                  {checkIn.isPending ? "Checking in..." : "Check In"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
