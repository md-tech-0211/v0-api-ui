"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FlaskConical, TestTubeDiagonal } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon">
        <SidebarHeader className="px-2 pt-2">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FlaskConical className="size-4" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <div className="truncate text-sm font-semibold leading-tight">LUMOS AI Analyzer</div>
              <div className="truncate text-xs text-sidebar-foreground/70 leading-tight">Protocols & tests</div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/test"} tooltip="Test">
                    <Link href="/test" className={cn("flex items-center gap-2")}>
                      <TestTubeDiagonal className="size-4" />
                      <span>Test</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border/60 bg-background/70 px-4 py-2 backdrop-blur">
          <SidebarTrigger />
          <div className="text-sm font-medium text-foreground">
            {pathname === "/test" ? "Protocols test" : "LUMOS AI Analyzer"}
          </div>
        </div>

        <div className={cn("min-h-[calc(100svh-41px)]")}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

