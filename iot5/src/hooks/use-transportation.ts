/* eslint-disable @typescript-eslint/no-explicit-any */
import { Media } from "@prisma/client";
import { isEmpty } from "lodash";
import { create } from "zustand";

interface ITransportationStore {
    startLocation: string;
    endLocation: string;
    waypoints: string[];
    media?: { url: string; type: string };
    error: string;
    init: (data: Record<string, any>) => void;
    getJsonResult: () => Record<string, any>;
    setStartLocation: (location: string) => void;
    setEndLocation: (location: string) => void;
    addWaypoint: (waypoint: string) => void;
    removeWaypoint: (index: number) => void;
    updateWaypoint: (index: number, value: string) => void;
    addMediaField: (file: Media) => void;
    setErrors: (error: string) => void;
}

export const useTransportation = create<ITransportationStore>((set, get) => ({
    startLocation: "",
    endLocation: "",
    waypoints: [],
    media: undefined,
    error: "",
    init: (data) => {
        if (isEmpty(data)) {
            return set({
                startLocation: "Da Nang",
                endLocation: "",
                waypoints: [],
                media: undefined,
                error: "",
            });
        }
        set({
            startLocation: data?.startLocation || "",
            endLocation: data?.endLocation || "",
            waypoints: data?.waypoints ? data?.waypoints : [],
            media: data?.media || undefined,
            error: "",
        });
    },
    getJsonResult: () => {
        const { startLocation, endLocation, waypoints, media } = get();
        const json: Record<string, any> = {
            startLocation,
            endLocation,
            waypoints,
        };
        if (media) {
            json.media = media;
        }
        return json;
    },
    setStartLocation: (location) => {
        set((state) => {
            const newState = { ...state, startLocation: location };
            const error = validateFields(newState);
            return { ...newState, error };
        });
    },
    setEndLocation: (location) => {
        set((state) => {
            const newState = { ...state, endLocation: location };
            const error = validateFields(newState);
            return { ...newState, error };
        });
    },
    addWaypoint: (waypoint) => {
        set((state) => {
            const newWaypoints = [...state.waypoints, waypoint || ""];
            const newState = { ...state, waypoints: newWaypoints };
            const error = validateFields(newState);
            return { ...newState, error };
        });
    },
    removeWaypoint: (index) => {
        set((state) => {
            const newWaypoints = state.waypoints.filter((_, i) => i !== index);
            const newState = { ...state, waypoints: newWaypoints };
            const error = validateFields(newState);
            return { ...newState, error };
        });
    },
    updateWaypoint: (index, value) => {
        set((state) => {
            const newWaypoints = [...state.waypoints];
            newWaypoints[index] = value;
            const newState = { ...state, waypoints: newWaypoints };
            const error = validateFields(newState);
            return { ...newState, error };
        });
    },
    addMediaField: (file: Media) => {
        set((state) => ({
            ...state,
            media: { url: file.url, type: file.type },
        }));
    },
    setErrors: (error) => {
        set({ error });
    },
}));

const validateFields = (state: { startLocation: string; endLocation: string; waypoints: string[] }): string => {
    if (isEmpty(state.startLocation)) {
        return "Start location cannot be empty";
    }
    if (isEmpty(state.endLocation)) {
        return "End location cannot be empty";
    }
    if (state.waypoints.some((wp) => isEmpty(wp))) {
        return "Waypoints cannot be empty";
    }
    return "";
};
