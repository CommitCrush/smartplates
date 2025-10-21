import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SmartPlatesLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "xxl";
  width?: number;
  height?: number;
  className?: string;
}

const sizeVariants = {
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 },
  xxl: { width: 96, height: 96 }
};

export const SmartPlatesLogo = forwardRef<HTMLDivElement, SmartPlates_Logo.jpgLogoProps>(
  ({ className, size = "md", width, height, ...props }, ref) => {
    // Use direct width/height if provided, otherwise use size variant
    const dimensions = {
      width: width || sizeVariants[size].width,
      height: height || sizeVariants[size].height
    };
    
    return (
      <div
        ref={ref}
        className={cn("flex-shrink-0", className)}
        {...props}
      >
        <Image
          src="/SmartPlates_Logo.jpg"
          alt="SmartPlates Logo"
          width={dimensions.width}
          height={dimensions.height}
          className="rounded-lg object-contain"
          priority={dimensions.width > 64 || dimensions.height > 64}
        />
      </div>
    );
  }
);

SmartPlatesLogo.displayName = "SmartPlatesLogo";