import { SidebarFooter } from './sidebar-footer';
import { SidebarMenu } from './sidebar-menu';

export function Sidebar() {
    return (
        <div className="flex flex-col items-stretch shrink-0 w-(--sidebar-width) border-e border-border">
            <SidebarMenu />
            <SidebarFooter />
        </div>
    );
}
