import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils.js';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = ({ children, ...props }) => (
  <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>
);

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      style={{
        zIndex: 99999,
        borderRadius: '6px',
        backgroundColor: '#141414',
        padding: '4px 10px',
        fontSize: '12px',
        fontFamily: 'Roboto, sans-serif',
        color: '#ffffff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        whiteSpace: 'nowrap',
      }}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
