"use client"

import { useState, useEffect, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button } from "@/components/ui/button"
import { Loader2, Camera, X } from "lucide-react"

interface QRScannerProps {
  onScan: (data: string) => void
  onClose?: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [portalElement, setPortalElement] = useState<HTMLDivElement | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(true)

  // Generate a unique ID for this scanner instance
  const scannerId = useRef(`qr-reader-${Math.random().toString(36).substring(2, 11)}`)

  // Create portal element on mount
  useEffect(() => {
    const el = document.createElement("div")
    el.id = scannerId.current
    el.style.width = "100%"
    el.style.height = "100%"
    setPortalElement(el)

    return () => {
      // Ensure we clean up on unmount
      setPortalElement(null)
    }
  }, [])

  // Track component mount status
  useEffect(() => {
    mountedRef.current = true

    // Clean up on unmount with a delay to ensure all async operations complete
    return () => {
      mountedRef.current = false

      // First stop the scanner if it's running
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(console.error)
          }
        } catch (e) {
          console.error("Error stopping scanner during cleanup:", e)
        }
        scannerRef.current = null
      }

      // Use a timeout to ensure all async operations complete
      setTimeout(() => {
        try {
          // Remove the portal element from its parent if it exists
          if (portalElement && portalElement.parentNode) {
            portalElement.parentNode.removeChild(portalElement)
          }
        } catch (e) {
          console.error("Error removing portal element:", e)
        }
      }, 300)
    }
  }, [portalElement])

  // Completely clean up the scanner
  const cleanupScanner = async () => {
    try {
      // First stop the scanner if it's running
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop()
          }
        } catch (e) {
          console.error("Error stopping scanner:", e)
        }
        scannerRef.current = null
      }

      // Clear the container's contents
      if (portalElement) {
        try {
          // Remove all child elements
          while (portalElement.firstChild) {
            portalElement.removeChild(portalElement.firstChild)
          }
        } catch (e) {
          console.error("Error clearing portal element:", e)
        }
      }
    } catch (error) {
      console.error("Error in cleanupScanner:", error)
    }
  }

  const startScanner = async () => {
    setError(null)
    setIsInitializing(true)

    try {
      // Clean up any existing scanner
      await cleanupScanner()

      // Exit if component unmounted during cleanup
      if (!mountedRef.current || !portalElement) {
        setIsInitializing(false)
        return
      }

      // Create a fresh scanner instance
      const html5QrCode = new Html5Qrcode(scannerId.current)
      scannerRef.current = html5QrCode

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (mountedRef.current) {
              onScan(decodedText)
              stopScanner()
            }
          },
          () => {}, // Ignore errors during scanning
        )

        if (mountedRef.current) {
          setIsScanning(true)
          setIsInitializing(false)
        }
      } catch (err) {
        console.error("Error starting scanner:", err)

        if (mountedRef.current) {
          setError("Could not access camera. Please ensure camera permissions are granted.")
          setIsInitializing(false)
        }

        await cleanupScanner()
      }
    } catch (err) {
      console.error("Scanner initialization error:", err)

      if (mountedRef.current) {
        setError("Failed to initialize scanner. Please try again.")
        setIsInitializing(false)
      }

      await cleanupScanner()
    }
  }

  const stopScanner = async () => {
    setIsScanning(false)
    await cleanupScanner()
  }

  // Attach portal element to container when both are available
  useEffect(() => {
    if (containerRef.current && portalElement && !portalElement.parentNode) {
      try {
        // Clear container first
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild)
        }

        // Append portal element
        containerRef.current.appendChild(portalElement)
      } catch (e) {
        console.error("Error attaching portal element:", e)
      }
    }
  }, [portalElement])

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-sm">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 z-10 text-white bg-black/50 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Container for the scanner */}
        <div
          ref={containerRef}
          className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
        >
          {!isScanning && !isInitializing && !portalElement && (
            <div className="flex flex-col items-center justify-center">
              <Camera className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Camera will appear here</p>
            </div>
          )}

          {isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-10">
              <Loader2 className="h-12 w-12 text-gray-400 mb-2 animate-spin" />
              <p className="text-sm text-gray-500">Initializing camera...</p>
            </div>
          )}
        </div>

        {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
      </div>

      <div className="mt-4 flex gap-4">
        {!isScanning && !isInitializing ? (
          <Button onClick={startScanner} className="bg-[#b12025] hover:bg-[#b12025]/90">
            <Camera className="mr-2 h-4 w-4" />
            Start Scanner
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="outline" disabled={isInitializing}>
            {isInitializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

