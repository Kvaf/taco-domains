"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "./profile-form";
import { KeyRound } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-anybody)] text-2xl font-bold">
          Settings
        </h1>
        <p className="text-sm text-text2">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardHeader>
            <h2 className="font-[family-name:var(--font-anybody)] text-lg font-bold">
              Profile
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar name={userName} image={userImage} size="lg" />
              <div>
                <p className="font-medium text-text">{userName}</p>
                <p className="text-xs text-text3">
                  Avatar upload coming soon
                </p>
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-text2">
                Email
              </label>
              <p className="rounded-[var(--radius-sm)] border border-border bg-bg2/50 px-3 py-2 text-sm text-text3">
                {userEmail}
              </p>
            </div>

            {/* Editable name */}
            <ProfileForm initialName={userName} />
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <h2 className="font-[family-name:var(--font-anybody)] text-lg font-bold">
              Security
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-[var(--radius-xs)] bg-surface2 p-2.5 text-text2">
                <KeyRound className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-text">Password</p>
                <p className="mb-3 text-xs text-text3">
                  Update your password to keep your account secure
                </p>
                <Link href="/forgot-password">
                  <Button variant="secondary" size="sm">
                    Change Password
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
