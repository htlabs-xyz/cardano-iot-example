import React from "react";

export default function ButtonDropdown({
  children,
  isDarkMode = false,
  hideMenuList = false,
  setHideMenuList,
  onMouseEnter,
  onMouseLeave,
}: {
  children: React.ReactNode;
  isDarkMode?: boolean;
  hideMenuList?: boolean;
  setHideMenuList?: (hideMenuList: boolean) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <button
      className={`mr-menu-list flex w-60 items-center justify-center rounded-t-md border px-4 py-2 text-lg font-normal shadow-sm ${isDarkMode ? `bg-neutral-950	text-neutral-50` : `bg-neutral-50	text-neutral-950`}`}
      onClick={() => setHideMenuList && setHideMenuList(!hideMenuList)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </button>
  );
}
