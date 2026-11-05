'use client';

import { LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';

import { isNavItemActive, NAV_ITEMS } from './nav-items';

type AppSidebarProps = {
  companyName: string;
  permissions: string[];
};

export function AppSidebar({ companyName, permissions }: AppSidebarProps) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const items = NAV_ITEMS.filter(
    (item) => !item.permission || permissions.includes(item.permission),
  );

  function closeMobileMenu() {
    setOpenMobile(false);
  }

  return (
    <Sidebar collapsible='icon' variant='inset'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size='lg'
              className='hover:bg-transparent active:bg-transparent'
            >
              <Link href='/admin' onClick={closeMobileMenu}>
                <Image
                  src='/logo.png'
                  alt=''
                  width={32}
                  height={32}
                  priority
                  className='size-8 shrink-0 rounded-full shadow-md shadow-brand-600/20'
                />
                <span className='grid min-w-0 leading-tight'>
                  <span className='truncate text-base font-bold tracking-tight text-foreground'>
                    WebUp!
                  </span>
                  <span className='truncate text-xs text-muted-foreground'>{companyName}</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ title, href, icon: Icon }) => {
                const isActive = isNavItemActive(pathname, href);

                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={title}
                      className='h-9 font-medium data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground data-active:shadow-md data-active:shadow-brand-600/25 data-active:hover:bg-sidebar-primary data-active:hover:text-sidebar-primary-foreground'
                    >
                      <Link
                        href={href}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={closeMobileMenu}
                      >
                        <Icon />
                        <span>{title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip='Sair'
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className='h-9 font-medium hover:bg-destructive/10 hover:text-destructive active:bg-destructive/10 active:text-destructive'
            >
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
