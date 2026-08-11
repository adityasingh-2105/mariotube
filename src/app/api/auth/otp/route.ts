import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { z } from "zod";

const sendOtpSchema = z.object({
  action: z.literal("send-otp"),
  identifier: z.string().min(3),
  type: z.enum(["phone", "email"]),
  mode: z.enum(["login", "reset"]).optional(),
});

const resetPasswordSchema = z.object({
  action: z.literal("reset-password"),
  identifier: z.string().min(3),
  type: z.enum(["phone", "email"]),
  otp: z.string().min(4).max(8),
  newPassword: z.string().min(4).max(50),
});

import { sendRealSms, sendRealEmail } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Send OTP Flow
    if (body.action === "send-otp") {
      const { identifier, type } = sendOtpSchema.parse(body);

      // Generate secure 6-digit OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

      const cleanIdentifier = identifier.trim();

      if (type === "phone") {
        await db.user.upsert({
          where: { phoneNumber: cleanIdentifier },
          update: { otpCode, otpExpires },
          create: {
            phoneNumber: cleanIdentifier,
            name: `User ${cleanIdentifier.slice(-4)}`,
            image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanIdentifier}`,
            otpCode,
            otpExpires,
          },
        });

        // Trigger Real SMS dispatch directly to mobile number
        await sendRealSms(cleanIdentifier, otpCode);

        return successResponse({
          message: `Verification code sent to your mobile number ${cleanIdentifier}`,
        });
      } else {
        await db.user.upsert({
          where: { email: cleanIdentifier.toLowerCase() },
          update: { otpCode, otpExpires },
          create: {
            email: cleanIdentifier.toLowerCase(),
            name: cleanIdentifier.split("@")[0],
            image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanIdentifier}`,
            otpCode,
            otpExpires,
          },
        });

        // Trigger Real Email dispatch directly to inbox
        await sendRealEmail(cleanIdentifier.toLowerCase(), otpCode);

        return successResponse({
          message: `Verification code sent to your email ${cleanIdentifier}`,
        });
      }
    }

    // 2. Reset Password Flow
    if (body.action === "reset-password") {
      const { identifier, type, otp, newPassword } = resetPasswordSchema.parse(body);
      const cleanIdentifier = identifier.trim();

      const user =
        type === "phone"
          ? await db.user.findUnique({ where: { phoneNumber: cleanIdentifier } })
          : await db.user.findUnique({ where: { email: cleanIdentifier.toLowerCase() } });

      if (!user) {
        return errorResponse("Account not found with that identifier", 404);
      }

      if (!user.otpCode || user.otpCode !== otp.trim()) {
        return errorResponse("Invalid verification code (OTP)", 400);
      }

      if (user.otpExpires && new Date() > user.otpExpires) {
        return errorResponse("Verification code has expired. Please request a new one.", 400);
      }

      // Update password and clear OTP
      await db.user.update({
        where: { id: user.id },
        data: {
          password: newPassword,
          otpCode: null,
          otpExpires: null,
        },
      });

      return successResponse({
        message: "Password reset successfully! You can now sign in with your new password.",
      });
    }

    return errorResponse("Invalid action", 400);
  } catch (error: any) {
    console.error("Auth OTP route error:", error);
    return errorResponse(error.message || "Operation failed", 400);
  }
}
