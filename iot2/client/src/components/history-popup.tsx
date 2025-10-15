'use client'
import {
    Dialog, DialogContent, DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { useCurrentWallet } from "@/contexts/app-context";
import { format } from "date-fns";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import lockApiRequest from "../api/lock.api";
import { LockInfoRequest, LockStatusResponse } from "../types/lock.type";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // In a real app, you would show a toast notification here
}

type HistoryPopupProps = {
    onCancel: () => void,
    open: boolean
}

export default function HistoryPopup({ onCancel, open }: HistoryPopupProps) {
    const [isLoading, setLoading] = useState(false);
    const [historyList, setHistoryList] = useState<LockStatusResponse[]>();
    const { currentWallet } = useCurrentWallet();
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const query: LockInfoRequest = {
                    lock_name: currentWallet.lockName ?? "",
                    owner_addr: currentWallet.ownerAddress ?? "",
                }
                const historyData = await lockApiRequest.getAllLockHistory(query);
                if (historyData.status && historyData.data) {
                    setHistoryList(historyData.data ?? [])
                }
            } catch { }
            finally { setLoading(false); }

        }
        fetchData();

    }, [open])

    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-[600px] rounded-lg shadow-xl bg-white p-0">
                <DialogHeader className="space-y-2 p-3 pb-0">
                    <DialogTitle className="text-2xl font-semibold text-gray-900">
                        History of updated lock status
                    </DialogTitle>
                </DialogHeader>
                <div className="p-0">
                    {isLoading ? (
                        <Card className="border rounded-lg bg-card h-[400px] overflow-hidden flex flex-col">
                            <CardHeader>
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-4 w-1/4" />
                            </CardHeader>
                            <CardContent className="p-0">
                                <Skeleton className="h-[300px] w-full" />
                            </CardContent>
                        </Card>

                    ) : (
                        <div className="border rounded-lg bg-card h-[400px] overflow-hidden flex flex-col">
                            <div className="p-2 border-b bg-muted/50">
                                <h3 className="font-medium">Lock status records</h3 >
                            </div >
                            <div className="overflow-auto flex-1">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-card z-10">
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Time</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Transaction</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {historyList && historyList.map((item, index) => (
                                            item && <TableRow
                                                key={index}
                                                className={""}>
                                                <TableCell>{format(new Date(item.time), "MM/dd/yyyy")}</TableCell>
                                                <TableCell>{format(new Date(item.time), "h:mm:ss")}</TableCell>
                                                {<TableCell>
                                                    <span className="font-medium">
                                                        {item.lock_status
                                                            ? `Locked`
                                                            : 'Unlocked'}
                                                    </span>
                                                </TableCell>}
                                                <TableCell>
                                                    <div className="flex items-center gap-2 ">
                                                        <a
                                                            href={item.tx_ref}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 hover:underline truncate max-w-[300px] inline-block"
                                                        >
                                                            {item.tx_ref.split("/").pop()?.substring(0, 30)}...
                                                        </a>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => copyToClipboard(item.tx_ref)}
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                            <span className="sr-only">Copy URL</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div >
                    )}
                </div>
                <DialogFooter className="flex justify-end gap-3 p-3 pt-0">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 rounded-md" >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
