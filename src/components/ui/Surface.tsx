"use client";
import {forwardRef,HTMLAttributes} from "react";
import {cn} from "@/lib/utils";
export interface SurfaceProps extends HTMLAttributes<HTMLDivElement>{elevation?:"ground"|"surface"|"elevated"|"overlay";padding?:"none"|"sm"|"md"|"lg";interactive?:boolean}
const elevations={ground:"bg-[var(--color-canvas)]",surface:"border border-[var(--color-line)] bg-[var(--color-surface)]",elevated:"border border-[var(--color-line)] bg-[var(--color-elevated)] shadow-[var(--shadow-soft)]",overlay:"border border-[var(--color-line)] bg-[var(--color-overlay)] shadow-[var(--shadow-deep)]"};
const paddings={none:"",sm:"p-4",md:"p-5",lg:"p-6"};
export const Surface=forwardRef<HTMLDivElement,SurfaceProps>(({className,elevation="surface",padding="md",interactive,children,...props},ref)=><div ref={ref} className={cn("rounded-[var(--radius-surface)]",elevations[elevation],paddings[padding],interactive&&"transition-colors duration-150 hover:bg-[var(--color-elevated)]",className)} {...props}>{children}</div>);
Surface.displayName="Surface";
export interface CardProps extends HTMLAttributes<HTMLDivElement>{variant?:"default"|"interactive"|"outlined";padding?:"none"|"sm"|"md"|"lg"}
const cardVariants={default:"border border-[var(--color-line)] bg-[var(--color-surface)]",interactive:"border border-[var(--color-line)] bg-[var(--color-surface)] transition-colors duration-150 hover:bg-[var(--color-elevated)]",outlined:"border border-[var(--color-line)] bg-transparent"};
export const Card=forwardRef<HTMLDivElement,CardProps>(({className,variant="default",padding="md",children,...props},ref)=><div ref={ref} className={cn("rounded-[var(--radius-surface)]",cardVariants[variant],paddings[padding],className)} {...props}>{children}</div>);
Card.displayName="Card";
