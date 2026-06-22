"use server";

import { db } from "@/5-shared/lib/db";
import { profiles } from "@/5-shared/lib/db/schema/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireProfile } from "@/5-shared/lib/auth/authorization";

export async function updateProfile(data: { name: string }) {
  const profile = await requireProfile();

  await db
    .update(profiles)
    .set({ name: data.name, updatedAt: new Date() })
    .where(eq(profiles.id, profile.id));

  revalidatePath("/[locale]/dashboard/account", "page");
  return { success: true };
}
