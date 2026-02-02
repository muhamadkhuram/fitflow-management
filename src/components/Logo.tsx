import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const textClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className={`${sizeClasses[size]} rounded-xl bg-primary flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300`}>
        <Dumbbell className="h-5 w-5 text-primary-foreground" />
      </div>
      {showText && (
        <span className={`${textClasses[size]} font-bold text-foreground`}>
          M4<span className="text-primary">Gym</span>
        </span>
      )}
    </Link>
  );
}
