import { KeyStatistic } from "@/config/types";

interface KeyStatisticsProps {
  keyStatistics: KeyStatistic[];
}

export default function KeyStatistics({ keyStatistics }: KeyStatisticsProps) {
  if (!keyStatistics || keyStatistics.length === 0) return null;

  // Sort by order (lower numbers first), then by id for consistency
  const sortedStats = [...keyStatistics].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.id.localeCompare(b.id);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2 md:gap-4 mb-8">
      {sortedStats.map((stat) => {
        const defaultStyle = {
          backgroundColor: "rgb(3, 7, 18, 0.9)",
          textColor: "rgb(209, 213, 219)",
          accentColor: "rgb(249, 115, 22)", // Orange accent
        };

        const style = { ...defaultStyle, ...stat.style };

        // Format the value with prefix/suffix/unit
        let displayValue = stat.value.toString();
        if (stat.prefix) displayValue = stat.prefix + displayValue;
        if (stat.suffix) displayValue = displayValue + stat.suffix;
        if (stat.unit && !stat.suffix)
          displayValue = displayValue + " " + stat.unit;

        return (
          <div
            key={stat.id}
            className="rounded-lg border border-gray-700 px-4 py-3"
            style={{ backgroundColor: style.backgroundColor }}
          >
            <div
              className="text-sm font-medium mb-2"
              style={{ color: style.textColor }}
            >
              {stat.label}
            </div>
            <div
              className={`text-xl md:text-2xl xl:text-3xl font-bold ${stat.description ? "mb-2" : ""}`}
              style={{ color: style.accentColor }}
            >
              {displayValue}
            </div>
            {stat.description && (
              <div className="text-xs" style={{ color: style.textColor }}>
                {stat.link ? (
                  <a
                    href={stat.link.url}
                    target={stat.link.external !== false ? "_blank" : "_self"}
                    rel={
                      stat.link.external !== false
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="text-orange-500 hover:text-orange-400 underline transition-colors"
                  >
                    {stat.link.text || stat.description}
                  </a>
                ) : (
                  stat.description
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
