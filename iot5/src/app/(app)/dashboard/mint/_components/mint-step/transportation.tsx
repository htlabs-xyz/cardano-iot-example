"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { isEmpty, isNil } from "lodash";
import { useTransportation } from "@/hooks/use-transportation";
import { motion } from "framer-motion";

export default function TransportationStep({
    stepper,
    setTransportationToMint,
    transportationToMint,
}: {
    stepper: { next: () => void; prev: () => void; isFirst: boolean };
    setTransportationToMint: (transportation: Record<string, any>) => void;
    transportationToMint: Record<string, any> | null;
}) {
    const {
        init,
        getJsonResult,
        setErrors,
        startLocation,
        endLocation,
        waypoints,
        setStartLocation,
        setEndLocation,
        addWaypoint,
        updateWaypoint,
        removeWaypoint,
        error,
    } = useTransportation();

    useEffect(() => {
        init(transportationToMint || {});
    }, [init, transportationToMint]);

    const handleNext = () => {
        const json = getJsonResult();
        if (
            isEmpty(json.startLocation) ||
            isEmpty(json.endLocation) ||
            json.waypoints.some((wp: string) => isEmpty(wp))
        ) {
            setErrors("Please fill all fields");
            return;
        }
        setTransportationToMint(json);
        stepper.next();
    };

    return (
        <div className="h-full py-8 m-auto flex w-full gap-4">
            <motion.div
                className="rounded-md flex-1 pb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-2xl font-bold mb-4">Transportation Builder</h2>
                {error && (
                    <motion.p
                        className="text-red-500 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {error}
                    </motion.p>
                )}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Location</label>
                        <Input
                            value={startLocation}
                            onChange={(e) => setStartLocation(e.target.value)}
                            placeholder="Enter start location (e.g., Da Nang)"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Location</label>
                        <Input
                            value={endLocation}
                            onChange={(e) => setEndLocation(e.target.value)}
                            placeholder="Enter end location (e.g., Hanoi)"
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Waypoints</label>
                        {waypoints.map((waypoint, index) => (
                            <motion.div
                                key={index}
                                className="flex items-center gap-2 mb-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Input
                                    value={waypoint}
                                    onChange={(e) => updateWaypoint(index, e.target.value)}
                                    placeholder={`Waypoint ${index + 1}`}
                                    className="flex-1"
                                />
                                <Button variant="destructive" onClick={() => removeWaypoint(index)} className="px-3">
                                    Remove
                                </Button>
                            </motion.div>
                        ))}
                        <Button variant="outline" onClick={() => addWaypoint("")} className="mt-2">
                            Add Waypoint
                        </Button>
                    </div>
                </div>
                <div className="z-10 max-h-16 w-full mt-8">
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
            </motion.div>
        </div>
    );
}
