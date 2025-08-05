"use client"

import { useState } from "react"
import { MonographicInstructions } from "@/components/instructions/monographic"
import MonographicForm from "@/components/forms/monographic-form"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { BookOpen, X } from "lucide-react"
import { Container } from "@/components/Container"


const MonographicPage = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900">
        Monographic Acquisitions
      </h1>
      <Container>
        <div className="flex items-center justify-between mb-6">
          <Drawer open={open} onOpenChange={setOpen} direction="left">
            <DrawerTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 text-md bg-black text-white font-bold" size="lg">
                <BookOpen className="h-4 w-4" />
                View Instructions
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-full w-[800px] mt-0 rounded-none">
              <DrawerHeader className="text-left">
                <DrawerTitle>Monographic Acquisitions Form (Required)</DrawerTitle>
                <DrawerDescription>
                  Guidelines and requirements for completing the monographic acquisitions form.
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-4 overflow-y-auto flex-1">
                <MonographicInstructions />
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Close Instructions
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="max-w-[1200px]">
          <MonographicForm />
        </div>
      </Container>
    </>
  )
}

export default MonographicPage