import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGyms, useGymMembers, useDeleteMember } from "@/hooks/useGym";
import { AddMemberDialog } from "@/components/AddMemberDialog";
 import { MemberTagBadge } from "@/components/MemberTagBadge";
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Phone,
  Trash2,
  UserX,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function Members() {
  const navigate = useNavigate();
  const { data: gyms } = useGyms();
  const activeGym = gyms?.[0];
  const { data: members, isLoading } = useGymMembers(activeGym?.id);
  const deleteMember = useDeleteMember();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMembers = members?.filter(member => 
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleRemoveMember = (memberId: string) => {
    if (activeGym && confirm("Are you sure you want to remove this member?")) {
      deleteMember.mutate({ id: memberId, gymId: activeGym.id });
    }
  };

  if (!activeGym) {
    return (
      <DashboardLayout title="Members">
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Please create a gym profile first.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Members" 
      description="Manage your gym members"
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Members</CardTitle>
              <CardDescription>
                {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""} total
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <AddMemberDialog gymId={activeGym.id} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <UserX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "No members match your search" : "No members yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header - Desktop */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground">
                <div>Name</div>
                <div>Tag</div>
                <div>Email</div>
                <div>Phone</div>
                <div>Joined</div>
                <div className="text-right">Actions</div>
              </div>
              
              {/* Member Rows */}
              {filteredMembers.map((member) => (
                <div 
                  key={member.id}
                  className="flex flex-col md:grid md:grid-cols-6 gap-2 md:gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/dashboard/members/${member.id}`)}
                >
                  {/* Name */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.full_name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-medium text-primary">
                          {member.full_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{member.full_name}</p>
                      <p className="text-sm text-muted-foreground md:hidden truncate">{member.email}</p>
                    </div>
                  </div>
                  
                  {/* Tag - Desktop */}
                  <div className="hidden md:flex items-center">
                    <MemberTagBadge tag={member.tag} />
                  </div>
                  
                  {/* Email - Desktop */}
                  <div className="hidden md:flex items-center">
                    <span className="truncate">{member.email}</span>
                  </div>
                  
                  {/* Phone */}
                  <div className="hidden md:flex items-center text-muted-foreground">
                    {member.phone || "-"}
                  </div>
                  
                  {/* Joined */}
                  <div className="hidden md:flex items-center text-muted-foreground">
                    {format(new Date(member.joined_at), "MMM d, yyyy")}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-2 mt-2 md:mt-0" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2 md:hidden">
                      <span className={`text-xs px-2 py-1 rounded-full ${member.is_active ? 'badge-approved' : 'badge-rejected'}`}>
                        {member.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/members/${member.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `mailto:${member.email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        {member.phone && (
                          <DropdownMenuItem onClick={() => window.location.href = `tel:${member.phone}`}>
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
