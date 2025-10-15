/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
export function MenuItem({ icon, label, action }: { icon?: string; label: string; action: () => void; active: boolean }) {
  return (
    <div className="flex cursor-pointer items-center px-4 py-2 opacity-80 hover:opacity-100 h-16" onClick={action}>
      {icon && <img className="pr-2 m-1 h-8" src={icon} />}
      <span className="mr-menu-item text-xl font-normal text-neutral-700 hover:text-black">
        {label
          .split(" ")
          .map((word: string) => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          })
          .join(" ")}
      </span>
    </div>
  );
}
