import {
  Boxes,
  BriefcaseBusiness,
  CalendarDays,
  Contact,
  Gauge,
  Handshake,
  House,
  Layers,
  type LucideIcon,
  Settings,
  ShieldCheck,
  Store,
  Tractor,
  Users,
  UsersRound,
} from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string | string[];
};

export type NavGroup = {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
};

export type NavEntry = NavItem | NavGroup;

export type NavSection = {
  label?: string;
  entries: NavEntry[];
};

const HOME_HREF = '/admin';

export const NAV_SECTIONS: NavSection[] = [
  { entries: [{ title: 'Início', href: HOME_HREF, icon: House }] },
  {
    label: 'Módulos',
    entries: [
      {
        title: 'Entidades',
        icon: Contact,
        items: [
          { title: 'Pessoas', href: '/admin/persons', icon: Users, permission: 'persons.read' },
          {
            title: 'Funcionários',
            href: '/admin/employees',
            icon: BriefcaseBusiness,
            permission: ['persons.read', 'employees.read'],
          },
          {
            title: 'Produtores',
            href: '/admin/producers',
            icon: Tractor,
            permission: ['persons.read', 'producers.read'],
          },
          {
            title: 'Revendas',
            href: '/admin/resellers',
            icon: Store,
            permission: 'resellers.read',
          },
        ],
      },
      {
        title: 'Comercial',
        icon: Handshake,
        items: [
          {
            title: 'Eventos',
            href: '/admin/events',
            icon: CalendarDays,
            permission: 'events.read',
          },
        ],
      },
      {
        title: 'Catálogo',
        icon: Boxes,
        items: [
          {
            title: 'Grupos de produtos',
            href: '/admin/groups',
            icon: Layers,
            permission: 'groups.read',
          },
        ],
      },
      {
        title: 'Configurações',
        icon: Settings,
        items: [
          {
            title: 'Potenciais',
            href: '/admin/potentials',
            icon: Gauge,
            permission: 'potentials.read',
          },
          {
            title: 'Equipe',
            href: '/admin/members',
            icon: UsersRound,
            permission: 'members.read',
          },
          {
            title: 'Cargos',
            href: '/admin/roles',
            icon: ShieldCheck,
            permission: 'roles.read',
          },
        ],
      },
    ],
  },
];

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry;
}

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((section) =>
  section.entries.flatMap((entry) => (isNavGroup(entry) ? entry.items : [entry])),
);

function hasEveryPermission(granted: string[], required: NavItem['permission']): boolean {
  return [required ?? []].flat().every((permission) => granted.includes(permission));
}

function getVisibleEntry(entry: NavEntry, permissions: string[]): NavEntry | null {
  if (!isNavGroup(entry)) {
    return hasEveryPermission(permissions, entry.permission) ? entry : null;
  }

  const items = entry.items.filter((item) => hasEveryPermission(permissions, item.permission));

  return items.length > 0 ? { ...entry, items } : null;
}

export function getVisibleNavSections(permissions: string[]): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    entries: section.entries
      .map((entry) => getVisibleEntry(entry, permissions))
      .filter((entry) => entry !== null),
  })).filter((section) => section.entries.length > 0);
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === HOME_HREF) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isNavGroupActive(pathname: string, group: NavGroup): boolean {
  return group.items.some((item) => isNavItemActive(pathname, item.href));
}
