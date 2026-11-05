import { House, type LucideIcon } from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
};

export const NAV_ITEMS: NavItem[] = [{ title: 'Início', href: '/admin', icon: House }];

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
