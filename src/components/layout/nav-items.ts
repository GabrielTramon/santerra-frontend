import { House, type LucideIcon, Users } from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

const HOME_HREF = '/admin';

export const NAV_GROUPS: NavGroup[] = [
  { items: [{ title: 'Início', href: HOME_HREF, icon: House }] },
  {
    label: 'Cadastros',
    items: [{ title: 'Pessoas', href: '/admin/persons', icon: Users, permission: 'persons.read' }],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

export function getVisibleNavGroups(permissions: string[]): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || permissions.includes(item.permission)),
  })).filter((group) => group.items.length > 0);
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === HOME_HREF) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
