"use client";

import { useState } from "react";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: {
    genres?: string[];
    countries?: string[];
    year?: number | null;
    minYear?: number;
    maxYear?: number;
    type?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };
  onApplyFilters: (filters: any) => void;
  isMobile?: boolean;
}

const genresList = [
  { id: "1", name: "Hành động", slug: "hanh-dong" },
  { id: "2", name: "Tình cảm", slug: "tinh-cam" },
  { id: "3", name: "Hài hước", slug: "hai-huoc" },
  { id: "4", name: "Kinh dị", slug: "kinh-di" },
  { id: "5", name: "Viễn tưởng", slug: "vien-tuong" },
  { id: "6", name: "Phiêu lưu", slug: "phieu-luu" },
  { id: "7", name: "Hoạt hình", slug: "hoat-hinh" },
  { id: "8", name: "Tài liệu", slug: "tai-lieu" },
  { id: "9", name: "Âm nhạc", slug: "am-nhac" },
  { id: "10", name: "Gia đình", slug: "gia-dinh" },
];

const countriesList = [
  { code: "us", name: "Mỹ", slug: "my" },
  { code: "kr", name: "Hàn Quốc", slug: "han-quoc" },
  { code: "jp", name: "Nhật Bản", slug: "nhat-ban" },
  { code: "cn", name: "Trung Quốc", slug: "trung-quoc" },
  { code: "vn", name: "Việt Nam", slug: "viet-nam" },
  { code: "th", name: "Thái Lan", slug: "thai-lan" },
  { code: "in", name: "Ấn Độ", slug: "an-do" },
  { code: "uk", name: "Anh", slug: "anh" },
  { code: "fr", name: "Pháp", slug: "phap" },
  { code: "de", name: "Đức", slug: "duc" },
];

const movieTypes = [
  { value: "movie", label: "Phim lẻ" },
  { value: "series", label: "Phim bộ" },
  { value: "tv_show", label: "TV Show" },
  { value: "anime", label: "Anime" },
];

const sortOptions = [
  { value: "relevance", label: "Liên quan nhất" },
  { value: "modified.time", label: "Mới nhất" },
  { value: "year", label: "Năm sản xuất" },
  { value: "rating", label: "Đánh giá cao" },
  { value: "views", label: "Xem nhiều" },
];

export default function FilterSidebar({
  isOpen,
  onClose,
  activeFilters,
  onApplyFilters,
  isMobile = false,
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState(activeFilters);
  const [expandedSections, setExpandedSections] = useState({
    genres: true,
    countries: true,
    year: true,
    type: true,
    sort: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCheckboxChange = (
    type: "genres" | "countries",
    value: string
  ) => {
    const current = localFilters[type] || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    setLocalFilters((prev) => ({ ...prev, [type]: updated }));
  };

  const handleTypeChange = (value: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      type: prev.type === value ? undefined : value,
    }));
  };

  const handleSortChange = (field: string, order: "asc" | "desc") => {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: order,
    }));
  };

  const handleYearChange = (min?: number, max?: number) => {
    setLocalFilters((prev) => ({
      ...prev,
      minYear: min,
      maxYear: max,
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    if (isMobile) onClose();
  };

  const handleReset = () => {
    const resetFilters = {};
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <div
      className={`${isMobile ? "h-full" : "lg:block hidden"} w-full lg:w-64`}
    >
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-5 border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Bộ lọc</h3>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Genres Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection("genres")}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="font-medium">Thể loại</span>
            {expandedSections.genres ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.genres && (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {genresList.map((genre) => (
                <label
                  key={genre.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={localFilters.genres?.includes(genre.slug) || false}
                    onChange={() => handleCheckboxChange("genres", genre.slug)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                  />
                  <span className="text-sm">{genre.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Countries Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection("countries")}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="font-medium">Quốc gia</span>
            {expandedSections.countries ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.countries && (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {countriesList.map((country) => (
                <label
                  key={country.code}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={
                      localFilters.countries?.includes(country.slug) || false
                    }
                    onChange={() =>
                      handleCheckboxChange("countries", country.slug)
                    }
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                  />
                  <span className="text-sm">{country.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Year Range Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection("year")}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="font-medium">Năm sản xuất</span>
            {expandedSections.year ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.year && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Từ năm"
                  value={localFilters.minYear || ""}
                  onChange={(e) =>
                    handleYearChange(
                      Number(e.target.value),
                      localFilters.maxYear
                    )
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Đến năm"
                  value={localFilters.maxYear || ""}
                  onChange={(e) =>
                    handleYearChange(
                      localFilters.minYear,
                      Number(e.target.value)
                    )
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[2024, 2023, 2022].map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearChange(year, year)}
                    className={`py-2 text-sm rounded ${
                      localFilters.minYear === year &&
                      localFilters.maxYear === year
                        ? "bg-blue-500 text-white"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Type Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection("type")}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="font-medium">Loại phim</span>
            {expandedSections.type ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.type && (
            <div className="space-y-2">
              {movieTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeChange(type.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    localFilters.type === type.value
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "hover:bg-gray-700/50"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Section */}
        <div className="mb-8">
          <button
            onClick={() => toggleSection("sort")}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="font-medium">Sắp xếp</span>
            {expandedSections.sort ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.sort && (
            <div className="space-y-3">
              {sortOptions.map((option) => (
                <div key={option.value} className="space-y-1">
                  <button
                    onClick={() => handleSortChange(option.value, "desc")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      localFilters.sortBy === option.value &&
                      localFilters.sortOrder === "desc"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "hover:bg-gray-700/50"
                    }`}
                  >
                    {option.label} (Giảm dần)
                  </button>
                  <button
                    onClick={() => handleSortChange(option.value, "asc")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      localFilters.sortBy === option.value &&
                      localFilters.sortOrder === "asc"
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "hover:bg-gray-700/50"
                    }`}
                  >
                    {option.label} (Tăng dần)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleApply}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Áp dụng bộ lọc
          </button>

          <button
            onClick={handleReset}
            className="w-full bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
}
