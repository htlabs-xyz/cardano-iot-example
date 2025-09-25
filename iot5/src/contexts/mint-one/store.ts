import { Task } from "@/types";
import { isEmpty } from "lodash";
import { create } from "zustand";

export type MintOneStore = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  collectionToSave: string;
  setCollectionToSave: (collection: string) => void;
  metadataToMint: Record<string, string> | null;
  setMetadataToMint: (metadata: Record<string, string>) => void;
  basicInfoToMint: {
    assetName: string;
    quantity: string;
  };
  setBasicInfoToMint: (basicInfo: { assetName: string; quantity: string }) => void;
  tasks: Task[];
  resetTasks: () => void;
  updateTaskState: (status: "todo" | "inprogress" | "success" | "error", name?: string, content?: string) => void;
  txhash: string;
  setTxHash: (txhash: string) => void;
};

const useMintOneStore = create<MintOneStore>((set) => ({
  loading: false,
  metadataToMint: null,
  basicInfoToMint: {
    assetName: "",
    quantity: "1",
  },
  txhash: "",
  tasks: [],
  collectionToSave: "",
  setCollectionToSave: (collection) => set({ collectionToSave: collection }),
  resetTasks: () => set({ tasks: [] }),
  setTxHash: (txhash) => set({ txhash }),
  setBasicInfoToMint: (basicInfo) => set({ basicInfoToMint: basicInfo }),
  setLoading: (loading) => set({ loading }),
  setMetadataToMint: (metadata) => set({ metadataToMint: metadata }),
  updateTaskState: (status, name = "", content = "") => {
    set((state) => {
      const tasks = [...state.tasks];
      if (status === "error" || isEmpty(name)) {
        const lastTaskIndex = tasks.length - 1;
        if (lastTaskIndex >= 0) {
          tasks[lastTaskIndex] = {
            ...tasks[lastTaskIndex],
            status,
          };
        }
      } else {
        const taskIndex = tasks.findIndex((task) => task.name === name);
        if (taskIndex < 0) {
          if (tasks.length !== 0) {
            const lastTaskIndex = tasks.length - 1;
            tasks[lastTaskIndex] = {
              ...tasks[lastTaskIndex],
              status: "success",
            };
          }
          tasks.push({ name, content, status });
        } else {
          if (taskIndex > 0) {
            tasks[taskIndex - 1] = {
              ...tasks[taskIndex - 1],
              status: "success",
            };
          }
          if (isEmpty(content)) {
            tasks[taskIndex] = { ...tasks[taskIndex], status };
          } else {
            tasks[taskIndex] = { ...tasks[taskIndex], status, content };
          }
        }
      }

      return { tasks };
    });
  },
}));

export default useMintOneStore;
