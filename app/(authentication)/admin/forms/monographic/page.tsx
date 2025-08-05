import { MonographicInstructions } from "@/components/instructions/monographic"

const page = () => {
  return (
    <div>
      <h1>Monographic Acquisitions</h1>
      <div className="flex flex-row gap-4">
        <div className="w-1/4">
          <MonographicInstructions />
        </div>
        <div className="w-3/4">
          <h2>Form</h2>
        </div>
      </div>
    </div>
  )
}

export default page