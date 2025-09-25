import Spinner from "@/app/(loading)/components/spinner";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";

export default function TemplateStep({
  stepper,
  metadataTemplate,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stepper: any;
  metadataTemplate: Record<string, string> | null;
}) {
  useEffect(() => {
    if (metadataTemplate) {
      stepper.next();
    }
  }, [metadataTemplate, stepper]);

  if (metadataTemplate) {
    return <Spinner />;
  }

  return (
    <div className="h-full m-auto flex flex-col">
      <div className="flex-wrap gap-3 space-y-5">
        <div className="mt-2 grid gap-4 grid-cols-3 max-md:grid-cols-2">
          <Card className="h-full cursor-pointer hover:bg-slate900" onClick={stepper.next}>
            <AspectRatio ratio={5 / 3} className="bg-muted flex items-center justify-center opacity-70 border-dashed">
              <svg viewBox="0 0 24 24" width="80" height="80">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 1.573a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75Zm.83 5.128 4 1.825c.11.05.214.11.31.177L12 11.47 6.86 8.703c.096-.068.2-.127.31-.177l4-1.825a2 2 0 0 1 1.66 0ZM6.037 9.964a2 2 0 0 0-.037.382V15.3a2 2 0 0 0 1.17 1.82l4 1.824.08.035V12.77L6.037 9.964Zm6.713 9.015.08-.035 4-1.824A2 2 0 0 0 18 15.3v-4.954c0-.13-.013-.258-.037-.382L12.75 12.77v6.208Zm0 2.344a.75.75 0 1 0-1.5 0v1a.75.75 0 0 0 1.5 0v-1ZM20.601 3.72a.75.75 0 0 1 0 1.061l-.707.707a.75.75 0 0 1-1.06-1.06l.707-.708a.75.75 0 0 1 1.06 0ZM5.166 20.217a.75.75 0 0 0-1.06-1.06l-.707.706a.75.75 0 0 0 1.06 1.061l.707-.707Zm17.584-7.894a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1a.75.75 0 0 1 .75.75ZM3 13.073a.75.75 0 0 0 0-1.5H2a.75.75 0 1 0 0 1.5h1Zm17.601 7.851a.75.75 0 0 1-1.06 0l-.707-.707a.75.75 0 1 1 1.06-1.06l.707.706a.75.75 0 0 1 0 1.061ZM4.106 5.49a.75.75 0 0 0 1.06-1.06L4.46 3.72A.75.75 0 0 0 3.4 4.782l.707.707Z"
                  fill="currentColor"
                ></path>
              </svg>
            </AspectRatio>
            <div className="flex flex-col items-center justify-start gap-3 self-stretch px-4 py-2">
              <div className="font-semibol self-stretch text-center text-base">Start from Scratch</div>
              <div className="font- self-stretch text-center text-sm text-secondary">Begin your journey with a blank slate</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
