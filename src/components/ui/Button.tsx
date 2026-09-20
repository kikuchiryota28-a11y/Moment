"use client";
import {forwardRef,ButtonHTMLAttributes} from "react";
import {cn} from "@/lib/utils";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{variant?:"primary"|"secondary"|"ghost"|"danger";size?:"sm"|"md"|"lg";loading?:boolean;icon?:React.ReactNode;iconPosition?:"left"|"right";fullWidth?:boolean}
const variants={primary:"bg-[var(--color-ink)] text-white hover:opacity-90",secondary:"border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[var(--color-elevated)]",ghost:"bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface)]",danger:"bg-[var(--color-danger)] text-white hover:opacity-90"};
const sizes={sm:"min-h-9 rounded-[10px] px-3 text-sm gap-2",md:"min-h-11 rounded-[12px] px-5 text-sm gap-2",lg:"min-h-12 rounded-[12px] px-6 text-base gap-2"};
export const Button=forwardRef<HTMLButtonElement,ButtonProps>(({className,variant="primary",size="md",loading,icon,iconPosition="left",fullWidth,disabled,children,...props},ref)=>{
 const isDisabled=disabled||loading;
 return <button ref={ref} disabled={isDisabled} aria-busy={loading||undefined} className={cn("inline-flex items-center justify-center font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",variants[variant],sizes[size],fullWidth&&"w-full",className)} {...props}>{loading?<span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"/>:icon&&iconPosition==="left"?<span>{icon}</span>:null}<span>{children}</span>{icon&&iconPosition==="right"&&!loading?<span>{icon}</span>:null}</button>;
});
Button.displayName="Button";
