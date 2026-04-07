import React from "react";
import { User } from "lucide-react";
import { cn } from "./ui/utils";

interface DefaultAvatarProps {
    className?: string;     // Wrapper div className
    iconClassName?: string; // Icon className
}

export function DefaultAvatar({ className, iconClassName }: DefaultAvatarProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-center w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20",
                className
            )}
        >
            <User className={cn("w-[60%] h-[60%] text-primary", iconClassName)} />
        </div>
    );
}
