import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardItem, TabType, Address } from "@/types/dashboard";
import type { Mahalla, Street } from "@/types/dashboard";

interface DashboardTableProps {
  activeTab: TabType;
  data: DashboardItem[];
  currentPage: number;
  itemsPerPage: number;
  darkMode: boolean;
  onEdit: (item: DashboardItem) => void;
  onDelete: (item: DashboardItem) => void;
}

export function DashboardTable({
  activeTab,
  data,
  currentPage,
  itemsPerPage,
  darkMode,
  onEdit,
  onDelete,
}: DashboardTableProps) {
  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto"
      style={{ height: "60vh" }}
    >
      <table className="relative w-full">
        <thead
          className={`sticky top-0 z-10 font-extrabold leading-tight ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          <tr>
            <th
              className={`px-6 py-3 text-left text-xs ${
                darkMode ? "text-gray-300" : "text-gray-700"
              } uppercase tracking-wider`}
            >
              T/R
            </th>

            {activeTab === "addresses" ? (
              <>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Hudud
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Tuman
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Mahalla
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Ko'cha
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Uy raqami
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Koordinatalar
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Qo'shimcha ma'lumot
                </th>
              </>
            ) : activeTab === "mahallas" ? (
              <>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Viloyat
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Tuman
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  UzKad nomi
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Geonames nomi
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  UzKad kodi
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  APU kodi
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  1C kodi
                </th>
              </>
            ) : activeTab === "streets" ? (
              <>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Viloyat
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Tuman
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Nomi
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Turi
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Kodi
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Mahalla bog&apos;lanishi
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Avvalgi nomi
                </th>
              </>
            ) : (
              <>
                <th
                  className={`px-6 py-3 text-left text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  } uppercase tracking-wider`}
                >
                  Nomi
                </th>
                <th
                  className={`px-6 py-3 text-right text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }                   uppercase tracking-wider`}
                >
                  Soato kodi
                </th>
              </>
            )}
            <th
              className={`px-6 py-3 text-center text-xs ${
                darkMode ? "text-gray-300" : "text-gray-700"
              } uppercase tracking-wider`}
            >
              Amallar
            </th>
          </tr>
        </thead>

        <tbody
          className={`divide-y font-[300] font-roboto leading-tight ${
            darkMode ? "divide-gray-700" : "divide-gray-200"
          }`}
        >
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={
                  activeTab === "addresses" ? 9 : activeTab === "mahallas" ? 9 : activeTab === "streets" ? 9 : 4
                }
                className="px-6 py-12 text-center"
              >
                <div
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Ma&apos;lumot topilmadi
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
                  className={`${
                    isHidden
                      ? darkMode
                        ? "bg-red-900/20 hover:bg-red-900/30"
                        : "bg-red-50 hover:bg-red-100"
                      : darkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-50"
                  } transition-colors`}
                >
                  <td
                    className={`px-6 py-3 whitespace-nowrap text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>

                  {activeTab === "addresses" ? (
                    <>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Address).regionName || "—"}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Address).districtName || "—"}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Address).mahallaName || "—"}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Address).streetName || "—"}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Address).houseNumber || "—"}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {(item as Address).latitude.toFixed(6)}, {(item as Address).longitude.toFixed(6)}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Address).description || "—"}
                      </td>
                    </>
                  ) : activeTab === "mahallas" ? (
                    <>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Mahalla).district.region.nameUz}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Mahalla).district.nameUz}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Mahalla).uzKadName || "—"}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.nameUz}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.code}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Mahalla).geoCode || "—"}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Mahalla).oneId || "—"}
                      </td>
                    </>
                  ) : activeTab === "streets" ? (
                    <>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Street).district.region.nameUz}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Street).district.nameUz}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.nameUz}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Street).type || "—"}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.code}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Street)?.mahalla?.nameUz || "—"}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {(item as Street).oldName || "—"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td
                        className={`px-6 py-3 text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.nameUz}
                      </td>
                      <td
                        className={`px-6 py-3 text-sm text-right ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {item.code}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-3 whitespace-nowrap text-center">
                    {activeTab === "addresses" ? (
                      <div className="text-sm text-gray-400">
                        Xaritadan qo'shildi
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEdit(item)}
                          className={
                            darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                          }
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDelete(item)}
                          className={`${
                            darkMode
                              ? "hover:bg-red-900/20 text-red-400"
                              : "hover:bg-red-50 text-red-600"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
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
