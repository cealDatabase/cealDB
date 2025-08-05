import { VolumeHoldingsInstructions } from "@/components/instructions/volumeHoldings"

const page = () => {
    return (
        <div>
            <h1>Physical Volume Holdings</h1>
            <div className="flex flex-row gap-4">
                <div className="w-1/4">
                    <VolumeHoldingsInstructions />
                </div>
                <div className="w-3/4">
                    <h2>Form</h2>
                </div>
            </div>
        </div>
    )
}

export default page