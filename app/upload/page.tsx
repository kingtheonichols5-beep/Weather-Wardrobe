"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function UploadPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to closet page since upload is integrated there
    router.push("/closet")
  }, [router])

  return null
}
