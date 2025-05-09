"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Heart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PasswordProtectionProps {
  onUnlock: () => void
}

export function PasswordProtection({ onUnlock }: PasswordProtectionProps) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const CORRECT_PASSWORD = process.env.LETTER_PASSWORD

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          onUnlock();
        } else {
          setError("Mật khẩu không chính xác");
        }
      } else {
        setError("Mật khẩu không chính xác");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      setError("Đã xảy ra lỗi, vui lòng thử lại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-4">
          <Lock className="h-8 w-8 text-pink-400" />
        </div>
        <h3 className="text-xl font-medium mb-2 text-pink-500">Bức thư này được bảo vệ</h3>
        <p className="text-gray-600">Vui lòng nhập mật khẩu để xem</p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-xs space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className="w-full pr-10 border-pink-100 focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
            autoFocus
          />
          <Heart className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pink-300" />
        </div>

        <Button
          type="submit"
          className="w-full bg-pink-500 hover:bg-pink-600 text-white transition-all duration-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang kiểm tra..." : "Mở khoá thư"}
        </Button>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-500 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  )
}
