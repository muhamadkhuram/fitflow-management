import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EquipmentStatus } from "@/hooks/useEquipment";

interface EquipmentStatusBadgeProps {
  status: EquipmentStatus;
}

const statusConfig: Record<EquipmentStatus, { label: string; className: string }> = {
  working: {
    label: "Working",
    className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  },
  needs_maintenance: {
    label: "Needs Maintenance",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
  },
  maintenance: {
    label: "Under Maintenance",
    className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  },
  out_of_order: {
    label: "Out of Order",
    className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  },
};

export function EquipmentStatusBadge({ status }: EquipmentStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge variant="outline" className={cn("font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}
