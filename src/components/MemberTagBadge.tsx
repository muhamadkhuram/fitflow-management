 import { Badge } from "@/components/ui/badge";
 import { Crown, Star, User } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface MemberTagBadgeProps {
   tag: "beginner" | "regular" | "vip" | null;
   className?: string;
 }
 
 export function MemberTagBadge({ tag, className }: MemberTagBadgeProps) {
   const config = {
     beginner: {
       label: "Beginner",
       icon: User,
       className: "bg-muted text-muted-foreground border-muted-foreground/20",
     },
     regular: {
       label: "Regular",
       icon: Star,
       className: "bg-primary/10 text-primary border-primary/20",
     },
     vip: {
       label: "VIP",
       icon: Crown,
       className: "bg-warning/10 text-warning border-warning/20",
     },
   };
 
   const tagConfig = config[tag || "regular"];
   const Icon = tagConfig.icon;
 
   return (
     <Badge variant="outline" className={cn(tagConfig.className, className)}>
       <Icon className="h-3 w-3 mr-1" />
       {tagConfig.label}
     </Badge>
   );
 }