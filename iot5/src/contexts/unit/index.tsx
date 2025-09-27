/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { createContext, useContext, useEffect } from "react";
import { defineStepper } from "@stepperize/react";
import { toast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import { isEmpty, isNil } from "lodash";
import { useQuery } from "@tanstack/react-query";
import { getAssetInfo } from "@/services/blockchain/getAssetInfo";
import { AssetDetailsWithTransactionHistory, TxHistory } from "@/types";
import useUnitStore, { UnitStore } from "./store";
import { redirect } from "next/navigation";
import { createBurnTransaction } from "@/services/contract/burn";
import { deserializeAddress, hexToString } from "@meshsdk/core";
import { createUpdateTransaction } from "@/services/contract/update";
import { getAssetTxHistory } from "@/services/blockchain/get-asset-tx-history";
import { submitTx } from "@/services/blockchain/submitTx";
import { parseError } from "@/utils/error/parse-error";
import NotFound from "@/app/not-found";
import Loading from "@/app/(loading)/loading";

const { useStepper: useUpdateStepper, steps: updateSteps } = defineStepper(
  { id: "metadata", title: "Metadata" },
  { id: "preview", title: "Preview" },
  { id: "transaction", title: "Transaction" },
  { id: "result", title: "Result" },
);

const { useStepper: useBurnStepper, steps: burnSteps } = defineStepper(
  { id: "basic", title: "basic" },
  { id: "transaction", title: "Transaction" },
  { id: "result", title: "Result" },
);

type UnitContextType = UnitStore & {
  unit: string;
  assetTxHistory: TxHistory[];
  isAuthor: boolean;
  assetDetails: AssetDetailsWithTransactionHistory;
  updateStepper: ReturnType<typeof useUpdateStepper>;
  updateSteps: typeof updateSteps;
  burnStepper: ReturnType<typeof useBurnStepper>;
  burnSteps: typeof burnSteps;
  handleUpdate: () => void;
  handleBurn: () => void;
  startUpdating: () => void;
  startBurning: () => void;
};

export default function UnitProvider({ unit, children }: { unit: string; children: React.ReactNode }) {
  const { signTx, address } = useWallet();

  const updateStepper = useUpdateStepper();
  const burnStepper = useBurnStepper();

  const {
    metadataToUpdate,
    setMetadataToUpdate,
    loading,
    setLoading,
    tasks,
    updateTaskState,
    txhash,
    setTxHash,
    txCurrentPage,
    txTotalPages,
    setTxCurrentPage,
    resetTasks,
    quantityToBurn,
    setQuantityToBurn,
  } = useUnitStore();

  const { data: assetData, isLoading: assetLoading } = useQuery({
    queryKey: ["getAssetInfo", unit],
    queryFn: () => getAssetInfo(unit),
    enabled: !isNil(unit) && !isEmpty(unit),
  });

  const { data: assetTxHistory, isLoading: txLoading } = useQuery({
    queryKey: ["getAssetTxHistory", unit, txCurrentPage],
    queryFn: () =>
      getAssetTxHistory({
        unit: unit,
        page: txCurrentPage,
        limit: 8,
      }),
    enabled: !isNil(unit),
  });

  useEffect(() => {
    if (assetData?.data && !isNil(assetData.data.metadata)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _pk, ...metadata } = assetData.data.metadata;
      setMetadataToUpdate(metadata);
    } else {
      setMetadataToUpdate({});
      setQuantityToBurn({ quantity: 1 });
    }
  }, [assetData, assetLoading]);

  const pubKeyHash = !isNil(address) && deserializeAddress(address)?.pubKeyHash;

  const isAuthor = !!(
    (!isNil(assetData?.data?.metadata?._pk) && pubKeyHash && assetData?.data?.metadata?._pk.includes(pubKeyHash)) ||
    (pubKeyHash && assetData?.data?.metadata?._pk && pubKeyHash.includes(assetData.data.metadata._pk))
  );

  const handleUpdate = () => {
    redirect(`/dashboard/asset/${unit}/update`);
  };

  const handleBurn = () => {
    redirect(`/dashboard/asset/${unit}/burn`);
  };

  const startUpdating = async () => {
    resetTasks();
    updateStepper.goTo("transaction");
    try {
      updateTaskState("inprogress", "validate", "Validating Data");

      if (isNil(address)) {
        throw new Error("Wallet not connected");
      }
      // check assetName is unique
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const assetName = hexToString((assetData?.data?.asset_name ?? "").replace(/^000643b0/, ""));

      const input = {
        assetName: assetName,
        metadata: metadataToUpdate,
      };

      updateTaskState("inprogress", "create_transaction", "Creating Transaction");
      const {
        data: tx,
        message,
        result,
      } = await createUpdateTransaction({
        address: address,
        input: [
          {
            assetName: input.assetName,
            metadata: input.metadata ?? {},
          },
        ],
      });
      if (!result || isNil(tx)) {
        throw new Error(message);
      }
      // await new Promise((resolve) => setTimeout(resolve, 2000));

      // wait for confirmation
      updateTaskState("inprogress", "sign_transaction", "Waiting for  sign Tx");
      const signedTx = await signTx(tx);
      updateTaskState("inprogress", "submit_transaction", "Submitting Transaction");
      // // submit transaction
      const { data: txHash, result: txResult, message: txMessage } = await submitTx(signedTx);
      if (!txResult || isNil(txHash)) {
        throw new Error(txMessage);
      }
      setTxHash(txHash);
      updateTaskState("success");
      // show result
      updateStepper.goTo("result");
      // create transaction
    } catch (e) {
      updateTaskState("error", "", parseError(e));
      toast({
        title: "Error",
        description: parseError(e),
        variant: "destructive",
      });
    }
  };

  const startBurning = async () => {
    resetTasks();
    burnStepper.goTo("transaction");
    try {
      updateTaskState("inprogress", "validate", "Validating Data");

      if (isNil(address)) {
        throw new Error("Wallet not connected");
      }

      if (isNil(assetData?.data?.asset_name)) {
        throw new Error("Asset not found");
      }
      // check assetName is unique
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(assetData?.data);
      const assetName = hexToString((assetData?.data?.asset_name ?? "").replace(/^000643b0/, ""));
      const quantityInput = quantityToBurn >= Number(assetData.data.quantity) ? assetData.data.quantity : quantityToBurn;
      const input = {
        assetName: assetName,
        quantity: `-${quantityInput}`,
      };

      updateTaskState("inprogress", "create_transaction", "Creating Transaction");

      const {
        data: tx,
        message,
        result,
      } = await createBurnTransaction({
        address: address,
        input: [input],
      });

      if (!result || isNil(tx)) {
        throw new Error(message);
      }
      // await new Promise((resolve) => setTimeout(resolve, 2000));

      // wait for confirmation
      updateTaskState("inprogress", "sign_transaction", "Waiting for  sign Tx");
      const signedTx = await signTx(tx);
      updateTaskState("inprogress", "submit_transaction", "Submitting Transaction");
      // submit transaction
      const { data: txHash, result: txResult, message: txMessage } = await submitTx(signedTx);
      if (!txResult || isNil(txHash)) {
        throw new Error(txMessage);
      }
      setTxHash(txHash);
      updateTaskState("success");
      // show result
      burnStepper.goTo("result");
      // create transaction
    } catch (e) {
      updateTaskState("error", "", parseError(e));
      toast({
        title: "Error",
        description: parseError(e),
        variant: "destructive",
      });
    }
  };
  if (loading || assetLoading || txLoading) return <Loading />;
  if (isNil(assetData?.data)) return <NotFound />;

  return (
    <UnitContext.Provider
      value={{
        unit,
        isAuthor,
        assetDetails: assetData?.data || null!,
        loading: loading || assetLoading || txLoading,
        assetTxHistory: assetTxHistory?.data || [],
        setLoading,
        metadataToUpdate,
        setMetadataToUpdate,
        quantityToBurn,
        setQuantityToBurn,
        tasks,
        resetTasks,
        updateTaskState,
        txhash,
        setTxHash,
        updateStepper,
        updateSteps,
        burnStepper,
        burnSteps,
        handleUpdate,
        handleBurn,
        startUpdating,
        startBurning,
        txCurrentPage,
        txTotalPages,
        setTxCurrentPage,
      }}
    >
      {children}
    </UnitContext.Provider>
  );
}

const UnitContext = createContext<UnitContextType>(null!);
export const useUnitContext = function () {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error("useUnitContext must be used within a UnitProvider");
  }
  return context;
};
