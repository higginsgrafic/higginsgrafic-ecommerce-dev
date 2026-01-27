import { cn } from '@/lib/utils';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Viewport
		ref={ref}
		className={cn(
			'fixed top-0 left-1/2 -translate-x-1/2 z-[100] flex max-h-screen w-full flex-col p-4 md:max-w-2xl',
			className,
		)}
		{...props}
	/>
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
	'group relative pointer-events-auto flex w-full items-start space-x-4 overflow-hidden rounded-xl p-6 pr-8 shadow-2xl transition-all data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-top-full',
	{
		variants: {
			variant: {
				default: 'bg-white/50 backdrop-blur-md border-none text-gray-900',
				destructive: 'bg-red-600 border-red-700 text-white',
        info: 'bg-blue-600 border-blue-700 text-white',
        warning: 'bg-yellow-500 border-yellow-600 text-white',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
	return (
		<ToastPrimitives.Root
			ref={ref}
			className={cn(toastVariants({ variant }), className)}
			{...props}
		/>
	);
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Action
		ref={ref}
		className={cn(
			'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-destructive/30 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
			className,
		)}
		{...props}
	/>
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Close
		ref={ref}
		className={cn(
			'absolute right-2 top-2 rounded-md p-1 text-inherit/70 opacity-0 transition-opacity hover:text-inherit focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
			className,
		)}
		toast-close=""
		{...props}
	>
		<X className="h-5 w-5" />
	</ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Title
		ref={ref}
		className={cn('text-lg font-normal', className)}
		{...props}
	/>
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
	<ToastPrimitives.Description
		ref={ref}
		className={cn('text-base opacity-90 whitespace-pre-wrap break-words max-h-[60vh] overflow-auto', className)}
		{...props}
	/>
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

const ToastIcon = ({ variant }) => {
  const iconMap = {
    default: <CheckCircle className="h-8 w-8 text-green-600" />,
    destructive: <XCircle className="h-8 w-8 text-white" />,
    info: <Info className="h-8 w-8 text-white" />,
    warning: <AlertTriangle className="h-8 w-8 text-white" />,
  };
  return iconMap[variant] || <CheckCircle className="h-8 w-8 text-green-600" />;
};

export {
	Toast,
	ToastAction,
	ToastClose,
	ToastDescription,
  ToastIcon,
	ToastProvider,
	ToastTitle,
	ToastViewport,
};