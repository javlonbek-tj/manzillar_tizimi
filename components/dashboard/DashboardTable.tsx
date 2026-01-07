import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardItem, TabType, Address, Region, District } from "@/types/dashboard";
import type { Mahalla, Street } from "@/types/dashboard";

interface DashboardTableProps {
  activeTab: TabType;
  data: DashboardItem[];
  currentPage: number;
  itemsPerPage: number;
  onEdit: (item: DashboardItem) => void;
  onDelete: (item: DashboardItem) => void;
}

export function DashboardTable({
  activeTab,
  data,
  currentPage,
  itemsPerPage,
  onEdit,
  onDelete,
}: DashboardTableProps) {
  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto"
      style={{ height: "60vh" }}
    >
      <table className="relative w-full">
        <thead className="sticky top-0 z-10 font-extrabold leading-tight bg-slate-50 dark:bg-gray-700 border-b border-slate-200 dark:border-none">
          <tr>
            <th className="px-6 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              T/R
            </th>

            {activeTab === "addresses" ? (
              <>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                  Hudud
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                  Tuman
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                  Mahalla
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                  Ko'cha
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                  Uy raqami
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                  Koordinatalar
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                  Qo'shimcha ma'lumot
                </th>
              </>
            ) : activeTab === "mahallas" ? (
              <>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                  Viloyat
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                  Tuman
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                  UzKad nomi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                  Geonames nomi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                  UzKad kodi
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider">
                  APU kodi
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  1C kodi
                </th>
              </>
            ) : activeTab === "streets" ? (
              <>
                <th className="px-6 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Viloyat
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Tuman
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Nomi
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Turi
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Kodi
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Mahalla bog'lanishi
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Avvalgi nomi
                </th>
              </>
            ) : (
              <>
                <th className="px-6 py-3 text-left text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Nomi
                </th>
                <th className="px-6 py-3 text-right text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Soato kodi
                </th>
              </>
            )}
            <th className="px-6 py-3 text-center text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Amallar
            </th>
          </tr>
        </thead>

        <tbody className="divide-y font-[300] font-roboto leading-tight divide-gray-200 dark:divide-gray-700">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={
                  activeTab === "addresses" ? 9 : activeTab === "mahallas" ? 9 : activeTab === "streets" ? 9 : 4
                }
                className="px-6 py-12 text-center"
              >
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Ma'lumot topilmadi
                </div>
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const isHidden =
                activeTab === "mahallas" && (item as Mahalla).hidden;
              return (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    isHidden
                      ? "bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <td
                    className="px-6 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                  >
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>

                  {activeTab === "addresses" ? (
                    <>
                      <td
                        className="px-6 py-3 text-sm text-gray-900 dark:text-white"
                      >
                        {(item as Address).regionName || "—"}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Address).districtName || "—"}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Address).mahallaName || "—"}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Address).streetName || "—"}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Address).houseNumber || "—"}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {(item as Address).latitude.toFixed(6)}, {(item as Address).longitude.toFixed(6)}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Address).description || "—"}
                      </td>
                    </>
                  ) : activeTab === "mahallas" ? (
                    <>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Mahalla).district.region.nameUz}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Mahalla).district.nameUz}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Mahalla).uzKadName || "—"}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Mahalla).nameUz}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Mahalla).code}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Mahalla).geoCode || "—"}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Mahalla).oneId || "—"}
                      </td>
                    </>
                  ) : activeTab === "streets" ? (
                    <>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Street).district.region.nameUz}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Street).district.nameUz}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Street).nameUz}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Street).type || "—"}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Street).code}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Street)?.mahalla?.nameUz || "—"}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Street).oldName || "—"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {(item as Region | District).nameUz}
                      </td>
                      <td
                        className="px-6 py-3 text-sm text-right text-gray-500 dark:text-gray-400"
                      >
                        {(item as Region | District).code}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEdit(item)}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDelete(item)}
                          className="hover:bg-red-50 text-red-600 dark:hover:bg-red-900/20 dark:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
