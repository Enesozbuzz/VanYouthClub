import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Site Ayarları</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Sitede görünen temel bilgileri yönet.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
