"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SuggestionsProps = ComponentProps<"div">;

export const Suggestions = ({
  className,
  children,
  ...props
}: SuggestionsProps) => (
  <div
    className={cn(
      "mx-auto grid max-w-4xl grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export type SuggestionProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  suggestion: string;
  onClick?: (suggestion: string) => void;
};

export const Suggestion = ({
  suggestion,
  onClick,
  className,
  variant = "outline",
  size = "sm",
  children,
  ...props
}: SuggestionProps) => {
  const handleClick = () => {
    onClick?.(suggestion);
  };

  return (
    <Button
      className={cn(
        "cursor-pointer rounded-full px-3 py-2 text-center text-sm sm:px-4",
        className
      )}
      onClick={handleClick}
      size={size}
      type="button"
      variant={variant}
      {...props}
    >
      {children || suggestion}
    </Button>
  );
};
