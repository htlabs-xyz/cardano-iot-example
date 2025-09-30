import JsonBuilder from "@/components/json-builder";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { isEmpty, isNil } from "lodash";
import { useTransportation } from "@/hooks/use-transportation";

export default function TransportationStep({
    stepper,
    setTransportationToMint,
    transportationToMint,
}: {
    stepper: { next: () => void; prev: () => void; isFirst: boolean };
    setTransportationToMint: (transportation: Record<string, string>) => void;
    transportationToMint: Record<string, string> | null;
}) {
    const { init, getJsonResult, setErrors } = useTransportation();

    useEffect(() => {
        init(transportationToMint || {});
    }, [init, transportationToMint]);

    const handleNext = () => {
        const json = getJsonResult();

        if (isEmpty(json) || isNil(json) || Object.values(json).some((value) => isEmpty(value))) {
            setErrors("Please fill all fields");
            return;
        }

        setTransportationToMint(json);
        stepper.next();
    };
    return (
        <div className="h-full py-8 m-auto flex w-full gap-4">
            <div className="rounded-md flex-1 pb-4">
                <JsonBuilder title="Transportation Builder" className="flex h-full justify-between w-full" />
                <div className=" z-10 max-h-16 w-full ">
                    <div className="ml-4 flex h-16 items-center">
                        <div className="flex flex-1 items-center justify-end space-x-2">
                            <Button
                                className="w-1/4"
                                variant="secondary"
                                onClick={stepper.prev}
                                disabled={stepper.isFirst}
                            >
                                Back
                            </Button>
                            <Button className="w-1/4" onClick={handleNext}>
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
