import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes safely
// Usage: cn("px-4", isActive && "bg-lime-400", className)
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Format number as Indian Rupees
// Example: formatCurrency(24999) → "₹24,999"
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style:                 "currency",
    currency:              "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Convert text to URL-friendly slug
// Example: generateSlug("My EV Store!") → "my-ev-store"
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 100);
}

// Format date for display
// Example: formatDate(new Date()) → "11 Mar 2026"
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  }).format(new Date(date));
}

// Calculate tax amount
// Example: calculateTax(10000, 18) → 1800
export function calculateTax(amount: number, taxRate: number): number {
  return Math.round((amount * taxRate) / 100);
}

// Shorten long text with ellipsis
// Example: truncate("Long text here", 10) → "Long tex..."
export function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.substring(0, max - 3) + "...";
}

// Calculate 30% token amount
// Example: getTokenAmount(50000) → 15000
export function getTokenAmount(totalAmount: number): number {
  return Math.round((totalAmount * 30) / 100);
}

// Calculate remaining 70% final payment
// Example: getFinalAmount(50000) → 35000
export function getFinalAmount(totalAmount: number): number {
  return Math.round((totalAmount * 70) / 100);
}

// Calculate 10% admin commission
// Example: getCommission(50000) → 5000
export function getCommission(totalAmount: number): number {
  return Math.round((totalAmount * 10) / 100);
}

// Calculate refund amount when cancel after pickup (token minus 3%)
// Example: getRefundAfterPickup(15000) → 14550
export function getRefundAfterPickup(tokenAmount: number): number {
  const deduction = Math.round((tokenAmount * 3) / 100);
  return tokenAmount - deduction;
}