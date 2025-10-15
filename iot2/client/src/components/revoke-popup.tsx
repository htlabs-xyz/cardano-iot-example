import {
    Dialog, DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Button } from "./ui/button"

type RevokePopupProps = {
    onSave: () => void
    onCancel: () => void
}

export default function RevokePopup({ onSave, onCancel }: RevokePopupProps) {
    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-[425px] rounded-lg shadow-xl bg-white p-6">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-2xl font-semibold text-gray-900">
                        Remove All Authorizations
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        This action will permanently delete all existing authorizations. This cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <h1 className="text-lg font-medium text-gray-800 text-center">
                        Are you absolutely sure you want to proceed?
                    </h1>
                </div>
                <DialogFooter className="mt-6 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 rounded-md" >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={onSave}
                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 rounded-md" >
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
