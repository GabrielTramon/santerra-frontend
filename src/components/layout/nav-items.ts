import { House, type LucideIcon, Users } from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
};

// Todas as páginas do painel ficam dentro de /admin.
const HOME_HREF = '/admin';

export const NAV_ITEMS: NavItem[] = [
  { title: 'Início', href: HOME_HREF, icon: House },
  { title: 'Pessoas', href: '/admin/persons', icon: Users, permission: 'persons.read' },
];

export function isNavItemActive(pathname: string, href: string): boolean {
  // O início é prefixo de todas as rotas: só fica ativo na própria página.
  if (href === HOME_HREF) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
