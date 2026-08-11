import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { sendRealSms, sendRealEmail } from "@/lib/sms";
import { z } from "zod";
import crypto from "crypto";

const sendResetLinkSchema = z.object({
  identifier: z.string().min(3),
  type: z.enum(["email", "phone"]),
});

const executeResetSchema = z.object({
  token: z.string().min(6),
  identifier: z.string().min(3),
  type: z.enum(["email", "phone"]),
  newPassword: z.string().min(4).max(50),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "send-link";

    // 1. Send Password Reset Link
    if (action === "send-link") {
      const { identifier, type } = sendResetLinkSchema.parse(body);
      const cleanIdentifier = identifier.trim();

      let user =
        type === "phone"
          ? await db.user.findUnique({ where: { phoneNumber: cleanIdentifier } })
          : await db.user.findUnique({ where: { email: cleanIdentifier.toLowerCase() } });

      if (!user) {
        // Create user record if new
        user =
          type === "phone"
            ? await db.user.create({
                data: {
                  phoneNumber: cleanIdentifier,
                  name: `User ${cleanIdentifier.slice(-4)}`,
                  image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanIdentifier}`,
                },
              })
            : await db.user.create({
                data: {
                  email: cleanIdentifier.toLowerCase(),
                  name: cleanIdentifier.split("@")[0],
                  image: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanIdentifier}`,
                },
              });
      }

      // Generate a secure, unique password reset token
      const resetToken = crypto.randomBytes(24).toString("hex");
      const tokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour validity

      await db.user.update({
        where: { id: user.id },
        data: {
          otpCode: resetToken,
          otpExpires: tokenExpires,
        },
      });

      const host = req.headers.get("host") || "localhost:3000";
      const protocol = req.headers.get("x-forwarded-proto") || "http";
      const resetUrl = `${protocol}://${host}/reset-password?token=${resetToken}&identifier=${encodeURIComponent(
        cleanIdentifier
      )}&type=${type}`;

      if (type === "phone") {
        await sendRealSms(
          cleanIdentifier,
          `Reset your MarioTube password here: ${resetUrl}`
        );
      } else {
        await sendRealEmail(
          cleanIdentifier.toLowerCase(),
          `Reset your password here: ${resetUrl}`
        );
      }

      console.log(`\n======================================================`);
      console.log(`🔗 [PASSWORD RESET LINK] Sent to ${cleanIdentifier}`);
      console.log(`👉 Link: ${resetUrl}`);
      console.log(`======================================================\n`);

      return successResponse({
        message: `Password reset link sent to your ${type === "phone" ? "phone number" : "email"}!`,
        resetUrl, // Provided for direct navigation in local dev
      });
    }

    // 2. Execute Password Reset via Token
    if (action === "execute-reset") {
      const { token, identifier, type, newPassword } = executeResetSchema.parse(body);
      const cleanIdentifier = identifier.trim();

      const user =
        type === "phone"
          ? await db.user.findUnique({ where: { phoneNumber: cleanIdentifier } })
          : await db.user.findUnique({ where: { email: cleanIdentifier.toLowerCase() } });

      if (!user) {
        return errorResponse("User account not found", 404);
      }

      if (!user.otpCode || user.otpCode !== token.trim()) {
        return errorResponse("Invalid or expired password reset link.", 400);
      }

      if (user.otpExpires && new Date() > user.otpExpires) {
        return errorResponse("This password reset link has expired. Please request a new link.", 400);
      }

      // Update password and invalidate token
      await db.user.update({
        where: { id: user.id },
        data: {
          password: newPassword,
          otpCode: null,
          otpExpires: null,
        },
      });

      return successResponse({
        message: "Password reset successful! You can now log in with your new password.",
      });
    }

    return errorResponse("Invalid action", 400);
  } catch (error: any) {
    console.error("Reset link error:", error);
    return errorResponse(error.message || "Operation failed", 400);
  }
}
