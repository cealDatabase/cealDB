
import { MonographicInstructions } from "@/components/instructions/monographic"
import MonographicForm from "@/components/forms/monographic-form"

const page = () => {
  return (
    <div>
      <h1>Monographic Acquisitions</h1>
      <div className="flex flex-row gap-4">
        <div className="w-1/4">
          <MonographicInstructions />
        </div>
        <div className="w-3/4 pr-4 max-w-[1200px]">
          <MonographicForm />
        </div>
      </div>
    </div>
  )
}

export default page