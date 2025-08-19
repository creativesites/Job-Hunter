import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date))
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function generatePersonalizedEmail(lead: any, template: string) {
  return template
    .replace(/{{first_name}}/g, lead.first_name || 'there')
    .replace(/{{last_name}}/g, lead.last_name || '')
    .replace(/{{company}}/g, lead.company || '')
    .replace(/{{title}}/g, lead.title || '')
    .replace(/{{city}}/g, lead.city || '')
    .replace(/{{state}}/g, lead.state || '')
}