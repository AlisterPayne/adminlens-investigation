import type { Chart, Plugin } from "chart.js";

import { chartColors } from "@/components/charts/chartjs-config";
import { getCssVariable } from "@/components/utils/utils";

// Resolve Mosaic chart colours for the current theme
export const themeColors = (darkMode: boolean) => {
  const pick = (c: { light: string; dark: string }) => (darkMode ? c.dark : c.light);
  return {
    text: pick(chartColors.textColor),
    grid: pick(chartColors.gridColor),
    backdrop: pick(chartColors.backdropColor),
    tooltip: {
      titleColor: pick(chartColors.tooltipTitleColor),
      bodyColor: pick(chartColors.tooltipBodyColor),
      backgroundColor: pick(chartColors.tooltipBgColor),
      borderColor: pick(chartColors.tooltipBorderColor),
    },
  };
};

// Mosaic palette, read from the template's CSS variables
export const mosaic = (name: string) => getCssVariable(`--color-${name}`);

// Mosaic-style HTML legend: ring marker + label, click toggles the dataset
export const htmlLegend = (getList: () => HTMLUListElement | null, valueFor?: (c: Chart, i: number) => string): Plugin => ({
  id: "htmlLegend",
  afterUpdate(c) {
    const ul = getList();
    if (!ul) return;
    while (ul.firstChild) ul.firstChild.remove();
    const items = c.options.plugins?.legend?.labels?.generateLabels?.(c) ?? [];
    items.forEach((item) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "inline-flex items-center";
      button.style.opacity = item.hidden ? ".3" : "";
      button.onclick = () => {
        c.setDatasetVisibility(item.datasetIndex!, !c.isDatasetVisible(item.datasetIndex!));
        c.update();
      };
      const box = document.createElement("span");
      box.className = "mr-2 block h-3 w-3 rounded-full border-[3px] pointer-events-none";
      box.style.borderColor = typeof item.fillStyle === "string" ? item.fillStyle : (item.strokeStyle as string);
      const label = document.createElement("span");
      label.className = "text-sm text-gray-500 dark:text-gray-400";
      label.textContent = item.text;
      button.append(box);
      if (valueFor) {
        const value = document.createElement("span");
        value.className = "mr-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100";
        value.textContent = valueFor(c, item.datasetIndex!);
        button.append(value);
      }
      button.append(label);
      li.append(button);
      ul.append(li);
    });
  },
});
