import React from "react";
import { User } from "lucide-react";
import { cn } from "./ui/utils";

interface DefaultAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    iconClassName?: string; // Icon className
}

export const DefaultAvatar = React.forwardRef<HTMLDivElement, DefaultAvatarProps>(
    ({ className, iconClassName, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20",
                    className
                )}
                {...props}
            >
                <User className={cn("w-[60%] h-[60%] text-primary", iconClassName)} />
            </div>
        );
    }
);

DefaultAvatar.displayName = "DefaultAvatar";
