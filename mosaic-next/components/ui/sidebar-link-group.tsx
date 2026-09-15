import { useState } from "react";

interface SidebarLinkGroupProps {
  children: (handleClick: () => void, openGroup: boolean) => React.ReactNode;
  open?: boolean;
}

export default function SidebarLinkGroup({ children, open = false }: SidebarLinkGroupProps) {
  const [openGroup, setOpenGroup] = useState<boolean>(open);

  const handleClick = () => {
    setOpenGroup(!openGroup);
  };

  return (
    <li
      className={`group is-link-group mb-0.5 rounded-lg bg-linear-to-r py-2 pr-3 pl-4 last:mb-0 ${open && "from-violet-500/[0.12] to-violet-500/[0.04] dark:from-violet-500/[0.24]"}`}
    >
      {children(handleClick, openGroup)}
    </li>
  );
}
