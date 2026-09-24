import React from "react";

export function GmailIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34.9 448h81.5V250.2L0 163v250.2C0 432.5 15.7 448 34.9 448z" fill="#4285F4" />
      <path d="M395.6 448h81.5c19.3 0 34.9-15.7 34.9-34.9V163l-116.4 87.3v197.7z" fill="#34A853" />
      <path d="M395.6 99v151.3L512 163v-46.5c0-43.2-49.3-67.8-83.8-41.9L395.6 99z" fill="#FBBC04" />
      <path d="M116.4 250.2V99L256 203.7 395.6 99v151.3L256 355 116.4 250.2z" fill="#EA4335" />
      <path d="M0 116.4V163l116.4 87.3V99L83.8 74.5C49.2 48.6 0 73.2 0 116.4z" fill="#C5221F" />
    </svg>
  );
}

export function GoogleDriveIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="m38.7 419.3 22.6 39c4.7 8.2 11.4 14.7 19.4 19.4l80.6-139.6H0c0 9.1 2.3 18.2 7 26.4z" fill="#0066DA" />
      <path d="M256 173.9 175.4 34.3c-7.9 4.7-14.7 11.1-19.4 19.4L7 311.7c-4.6 8-7 17.1-7 26.4h161.3z" fill="#00AC47" />
      <path d="M431.4 477.7c7.9-4.7 14.7-11.1 19.4-19.4l9.4-16.1 44.9-77.7c4.7-8.2 7-17.3 7-26.4H350.7l34.3 67.4z" fill="#EA4335" />
      <path d="m256 173.9 80.6-139.6c-7.9-4.7-17-7-26.4-7H201.8c-9.4 0-18.5 2.6-26.4 7z" fill="#00832D" />
      <path d="M350.7 338.1H161.3L80.6 477.7c7.9 4.7 17 7 26.4 7h298c9.4 0 18.5-2.6 26.4-7z" fill="#2684FC" />
      <path d="M430.5 182.7 356 53.7c-4.7-8.2-11.4-14.7-19.4-19.4L256 173.9l94.7 164.2h161c0-9.1-2.3-18.2-7-26.4z" fill="#FFBA00" />
    </svg>
  );
}

export function GoogleAdminIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="20.63 45.33 471.4 421.34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="m65.414 346.668 55.172 95.57a48.83 48.83 0 0 0 42.293 24.43h117.496l-21.148-64.188-50.829-55.812-71.492-12.43Zm420.078-115.094-53.57-92.8-46.082 51.011L358.64 256l29.548 70.852 43.386 46.933 53.918-93.36a48.87 48.87 0 0 0 0-48.85M280.398 45.332H162.906a48.82 48.82 0 0 0-42.293 24.43l-55.199 95.57 71.492 12.43 71.492-12.43 52.188-55.812Zm0 0" fill="#1967D2" />
      <path d="m154 256 54.398-90.668H65.414l-38.242 66.242a48.89 48.89 0 0 0 0 48.852l38.242 66.242h142.984Zm150.238-90.668L358.641 256l73.254-117.227-39.84-69.011a48.83 48.83 0 0 0-42.293-24.43h-69.364l-72 120Zm0 0" fill="#4285F4" />
      <path d="M304.238 346.668h-95.84l72 120h69.364a48.83 48.83 0 0 0 42.293-24.43l39.52-68.453L358.64 256Zm0 0" fill="#4285F4" />
    </svg>
  );
}

export function GoogleCalendarIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M387 117.5 265.7 104l-148.2 13.5L104 252.2 117.5 387l134.7 16.8L387 387l13.5-138.1z" fill="#FFF" transform="translate(3.75 3.75)" />
      <path d="M176.55 330.35c-10.1-6.8-17-16.7-20.9-29.9l23.4-9.6c2.1 8.1 5.8 14.3 11.1 18.8 5.3 4.4 11.7 6.6 19.1 6.6 7.6 0 14.2-2.3 19.7-7s8.3-10.6 8.3-17.8q0-10.95-8.7-18c-5.8-4.6-13.1-7-21.8-7h-13.5v-23.1h12.1c7.5 0 13.8-2 18.9-6.1 5.1-4 7.7-9.6 7.7-16.6q0-9.45-6.9-15c-4.6-3.7-10.4-5.6-17.4-5.6-6.9 0-12.3 1.8-16.4 5.5-4 3.7-7 8.2-8.8 13.5l-23.1-9.6c3.1-8.7 8.7-16.4 16.9-23 8.3-6.6 18.8-10 31.6-10 9.5 0 18 1.8 25.5 5.5s13.5 8.8 17.8 15.2c4.3 6.5 6.4 13.8 6.4 21.9 0 8.3-2 15.2-6 21q-6 8.55-14.7 13.2v1.4c7.6 3.2 13.9 8.1 18.8 14.7s7.3 14.4 7.3 23.6-2.3 17.3-7 24.5c-4.6 7.2-11.1 12.8-19.2 16.9-8.2 4.1-17.4 6.2-27.6 6.2-11.6 0-22.5-3.4-32.6-10.2m143.4-116-25.5 18.6-12.8-19.5 46-33.2h17.7v156.7h-25.3v-122.6z" fill="#1A73E8" />
      <path d="M387 508.2 508.2 387l-60.6-27-60.6 27-27 60.6z" fill="#EA4335" transform="translate(3.75 3.75)" />
      <path d="m90.6 447.6 26.9 60.6H387V387H117.5z" fill="#34A853" transform="translate(3.75 3.75)" />
      <path d="M36.7-3.8C14.3-3.8-3.8 14.3-3.8 36.7V387l60.6 26.9 60.6-26.9V117.5H387l26.9-60.6L387-3.8z" fill="#4285F4" transform="translate(3.75 3.75)" />
      <path d="M-3.8 387v80.8c0 22.3 18.1 40.4 40.4 40.4h80.8V387z" fill="#188038" transform="translate(3.75 3.75)" />
      <path d="M387 117.5V387h121.3V117.5l-60.6-26.9z" fill="#FBBC04" transform="translate(3.75 3.75)" />
      <path d="M508.2 117.5V36.7c0-22.3-18.1-40.4-40.4-40.4H387v121.3h121.2z" fill="#1967D2" transform="translate(3.75 3.75)" />
    </svg>
  );
}

export function GoogleClassroomIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 578.9 500" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#0F9D58" d="M52.6 52.6h473.7v394.7H52.6z" />
      <path fill="#57BB8A" d="M394.7 263.2c16.4 0 29.6-13.3 29.6-29.6S411 204 394.7 204s-29.6 13.3-29.6 29.6 13.3 29.6 29.6 29.6m0 19.7c-31.7 0-65.8 16.8-65.8 37.6v21.6h131.6v-21.6c0-20.8-34.1-37.6-65.8-37.6m-210.5-19.7c16.4 0 29.6-13.3 29.6-29.6S200.5 204 184.2 204s-29.6 13.3-29.6 29.6 13.3 29.6 29.6 29.6m0 19.7c-31.7 0-65.8 16.8-65.8 37.6v21.6H250v-21.6c0-20.8-34.1-37.6-65.8-37.6" />
      <path fill="#F7F7F7" d="M289.5 236.8c21.8 0 39.5-17.7 39.4-39.5 0-21.8-17.7-39.5-39.5-39.4-21.8 0-39.4 17.7-39.4 39.5s17.7 39.4 39.5 39.4m0 26.4c-44.4 0-92.1 23.6-92.1 52.6v26.3h184.2v-26.3c0-29.1-47.7-52.6-92.1-52.6" />
      <path fill="#F1F1F1" d="M342.1 421.1h118.4v26.3H342.1z" />
      <path fill="#F4B400" d="M539.5 0h-500C17.7 0 0 17.7 0 39.5v421.1C0 482.3 17.7 500 39.5 500h500c21.8 0 39.5-17.7 39.5-39.5v-421C578.9 17.7 561.3 0 539.5 0m-13.2 447.4H52.6V52.6h473.7z" />
    </svg>
  );
}

export function GoogleContactsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="256" cy="256" r="256" fill="#1A73E8" />
      <path d="M340.4 384H174.6c-20.1 0-37.8-12.1-37.8-31.9v14.5c0 19.9 17.7 34.9 37.8 34.9h165.8c20.1 0 37.8-15.1 37.8-34.9v-14.5c0 19.8-17.8 31.9-37.8 31.9" fill="#185ABC" />
      <path d="M256 232.8c-30-.1-53.7-20.9-55.3-49.5V195c0 29.6 24.8 55.3 55.3 55.3s55.3-25.7 55.3-55.3v-11.7c-2.4 28.8-25.3 49.6-55.3 49.5" fill="#185ABC" />
      <path d="M256 267.7c-58.4 0-119.3 28.5-119.3 66.9V352c0 19.9 16.3 34.9 36.4 34.9h168.7c20.1 0 36.4-15.1 36.4-34.9v-17.4c0-38.6-63.8-66.9-122.2-66.9" fill="#FFF" />
      <circle cx="256" cy="180.3" r="55.3" fill="#FFF" />
    </svg>
  );
}

export function GoogleAppsScriptIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#EA4335" x="27.53" y="328.9" width="373" height="107" rx="53.5" />
      <rect fill="#FBBC04" x="53.33" y="250.94" width="373" height="107" rx="53.5" transform="translate(254.91 691.72) rotate(-144)" />
      <rect fill="#34A853" x="120.53" y="201.9" width="373" height="107" rx="53.5" transform="translate(455.05 -115.53) rotate(72)" />
      <rect fill="#4285F4" x="202.53" y="201.9" width="373" height="107" rx="53.5" transform="translate(25.92 546.46) rotate(-72)" />
      <circle cx="265.84" cy="129.28" r="26.7" fill="#FFFFFF" />
      <circle cx="131.44" cy="225.44" r="26.7" fill="#FFFFFF" />
      <circle cx="81.36" cy="382.6" r="26.7" fill="#FFFFFF" />
      <circle cx="348.22" cy="381.64" r="26.7" fill="#FFFFFF" />
      <circle cx="430.67" cy="127.89" r="26.7" fill="#FFFFFF" />
    </svg>
  );
}

export function GoogleAccountIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1961 2500" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4688f1" d="M42.99 270.9C355.36 180.76 667.68 90.43 980.07.41c24.09 6.4 47.98 13.77 71.99 20.55 302.98 87.51 605.97 174.97 908.94 262.52v661.39c-1.34 45.42-3.45 90.83-7.87 136.07-13.84 144.67-43.27 287.88-87.96 426.18-33.19 102.47-75 202.2-125.96 297.12-43.9 81.49-94.45 159.46-151.7 232.22-91.4 116.34-200.04 219.11-321.35 303.81-51.9 36.57-106.38 69.38-162.19 99.6-17.88 9.18-35.53 18.8-53.74 27.32-22.96 11.32-46.27 21.92-69.68 32.27.03.14.09.41.12.54h-.34c.03-.13.08-.38.11-.51-121.05-52.37-236.12-118.87-340.8-199.18-93.71-71.91-178.88-154.94-253.12-246.81-97.07-119.56-175.51-253.81-235.29-395.62-34.39-81.09-62.53-164.78-85.26-249.85-23.74-89.39-41.4-180.39-52.71-272.19C5.79 1075.08 1.08 1013.96 0 952.75V283.43c14.27-4.39 28.67-8.32 42.99-12.53m778.96 197.89c-39.48 10.63-78.06 24.96-114.37 43.83-15.61 7.76-30.85 16.25-45.6 25.53-31.92 20.27-62.26 43.12-89.81 69.04-19.2 17.5-36.67 36.79-53.39 56.65-20.87 25.35-39.62 52.46-56.05 80.89-34.35 59.27-57.9 124.71-69.62 192.19-5.67 34.37-9.24 69.25-8.1 104.12.02 51.24 6.86 102.47 20.24 151.93 21.02 77.28 58.03 150.16 108.14 212.64 3.83 4.65 7.37 9.79 11.97 13.63.58 2.64 3.39 4.31 4.93 6.52 72.92 83.72 170.1 146.01 276.69 177.15 91.75 27.31 190.2 31.21 283.98 12.3 43.93-9.04 86.84-22.99 127.63-41.64 72.53-33.09 138.1-81.23 191.55-140.37 3.86-4.69 8.52-8.88 11.8-13.95 1.44-.98 2.57-2.31 3.62-3.67 24.39-29.42 46.23-61.01 64.54-94.57 43.35-78.59 68.01-167.32 71.81-256.98.13-11.34 1.34-22.69.18-34-.62-24.32-2.06-48.65-5.55-72.74-5.96-46.22-18.08-91.55-35-134.94-14.42-36.92-32.95-72.16-54.38-105.48-41.28-63.13-94.57-118.4-156.4-161.64-70.66-49.78-152.61-83.37-237.82-97.79-83.21-13.87-169.4-10.25-250.99 11.35z"/>
      <path fill="#3566b8" d="M821.95 468.79c81.59-21.6 167.78-25.22 250.99-11.35 85.21 14.42 167.16 48.01 237.82 97.79 61.83 43.24 115.12 98.51 156.4 161.64 21.43 33.32 39.96 68.56 54.38 105.48 16.92 43.39 29.04 88.72 35 134.94 3.49 24.09 4.93 48.42 5.55 72.74 1.16 11.31-.05 22.66-.18 34-3.8 89.66-28.46 178.39-71.81 256.98-18.31 33.56-40.15 65.15-64.54 94.57-1.05 1.36-2.18 2.69-3.62 3.67-2.59-20.23-10.13-39.69-21.65-56.5-18.69-27.44-44.94-48.78-72.71-66.52-30.98-19.58-64.49-34.86-98.72-47.79-44.43-16.42-90.31-28.88-136.88-37.55-41.86-7.68-84.37-12.94-127.01-12.2-47.13 1.11-93.91 8.36-139.92 18.35-43.66 9.92-86.77 22.71-128.2 39.78-33.2 13.78-65.63 29.99-94.85 51.07-23.43 16.87-45.15 37.04-60.04 62.01-8.87 15.02-15.3 31.84-16.6 49.34-4.6-3.84-8.14-8.98-11.97-13.63-50.11-62.48-87.12-135.36-108.14-212.64-13.38-49.46-20.22-100.69-20.24-151.93-1.14-34.87 2.43-69.75 8.1-104.12 11.72-67.48 35.27-132.92 69.62-192.19 16.43-28.43 35.18-55.54 56.05-80.89 16.72-19.86 34.19-39.15 53.39-56.65 27.55-25.92 57.89-48.77 89.81-69.04 14.75-9.28 29.99-17.77 45.6-25.53 36.31-18.87 74.89-33.2 114.37-43.83m142.5 138.78c-57.15 1.97-112.96 27.14-152.54 68.37-37.1 38.16-59.93 89.87-62.74 143.06-.96 24.57 1.36 49.39 7.98 73.12 14.09 51.45 47.41 97.27 91.83 126.76 35.86 24.02 78.81 37.32 121.98 37.57 43.6.63 87.24-12 123.86-35.65 30.45-19.56 56-46.64 73.91-78.07 19.86-34.98 30.38-75.47 28.98-115.73-.83-38.62-11.67-77.04-31.59-110.17-19.65-32.95-47.87-60.75-81.17-79.81-36.33-20.92-78.61-31.27-120.5-29.45z"/>
      <path fill="#fff" d="M964.45 607.57c41.89-1.82 84.17 8.53 120.5 29.45 33.3 19.06 61.52 46.86 81.17 79.81 19.92 33.13 30.76 71.55 31.59 110.17 1.4 40.26-9.12 80.75-28.98 115.73-17.91 31.43-43.46 58.51-73.91 78.07-36.62 23.65-80.26 36.28-123.86 35.65-43.17-.25-86.12-13.55-121.98-37.57-44.42-29.49-77.74-75.31-91.83-126.76-6.62-23.73-8.94-48.55-7.98-73.12 2.81-53.19 25.64-104.9 62.74-143.06 39.58-41.23 95.39-66.4 152.54-68.37zm-139.4 609.47c46.01-9.99 92.79-17.24 139.92-18.35 42.64-.74 85.15 4.52 127.01 12.2 46.57 8.67 92.45 21.13 136.88 37.55 34.23 12.93 67.74 28.21 98.72 47.79 27.77 17.74 54.02 39.08 72.71 66.52 11.52 16.81 19.06 36.27 21.65 56.5-3.28 5.07-7.94 9.26-11.8 13.95-53.45 59.14-119.02 107.28-191.55 140.37-40.79 18.65-83.7 32.6-127.63 41.64-93.78 18.91-192.23 15.01-283.98-12.3-106.59-31.14-203.77-93.43-276.69-177.15-1.54-2.21-4.35-3.88-4.93-6.52 1.3-17.5 7.73-34.32 16.6-49.34 14.89-24.97 36.61-45.14 60.04-62.01 29.22-21.08 61.65-37.29 94.85-51.07 41.43-17.07 84.54-29.86 128.2-39.78z"/>
    </svg>
  );
}

export function GoogleChatIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M400 48H112C76.7 48 48 76.7 48 112v224c0 35.3 28.7 64 64 64h224l96 64V112c0-35.3-28.7-64-64-64z" fill="#00AC47" />
      <path d="M224 288c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm80 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm80 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z" fill="#FFFFFF" />
    </svg>
  );
}

export function GoogleTasksIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="256" cy="256" r="224" fill="#1A73E8" />
      <path d="M208 344L128 264l32-32 48 48 144-144 32 32-176 176z" fill="#FFFFFF" />
    </svg>
  );
}

export function GoogleVaultIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M256 32L64 117.3v149.3c0 119.5 81.9 231.5 192 261.4 110.1-29.9 192-141.9 192-261.4V117.3L256 32z" fill="#4285F4" />
      <path d="M256 213.3c-23.6 0-42.7 19.1-42.7 42.7 0 17.7 10.7 32.8 26 39.5L224 352h64l-15.3-56.5c15.3-6.7 26-21.8 26-39.5 0-23.6-19.1-42.7-42.7-42.7z" fill="#FFFFFF" />
    </svg>
  );
}

export function GoogleCloudIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M394.5 214.3c-7.9-52.9-53.5-93.3-108.5-93.3-43.2 0-80.8 24.8-99.3 61.1-6.9-3.2-14.7-5-22.7-5-30.9 0-56 25.1-56 56 0 4.1.4 8.1 1.3 11.9C64.9 253.9 32 291 32 336c0 53 43 96 96 96h256c44.2 0 80-35.8 80-80 0-40.4-30-73.8-69.5-77.7z" fill="#4285F4" />
      <path d="M128 432h256c44.2 0 80-35.8 80-80 0-40.4-30-73.8-69.5-77.7-7.9-52.9-53.5-93.3-108.5-93.3-16 0-31.2 3.5-44.8 9.8l88.8 88.8v64H240l-48 48h-64z" fill="#34A853" opacity="0.3" />
    </svg>
  );
}

export function GoogleGroupsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="192" cy="160" r="80" fill="#1A73E8" />
      <path d="M192 272c-70.7 0-213.3 35.5-213.3 106.7V432H405.3v-53.3C405.3 307.5 262.7 272 192 272z" fill="#1A73E8" />
      <circle cx="384" cy="160" r="53.3" fill="#4285F4" opacity="0.8" />
      <path d="M384 272c-15.6 0-37.3 3-61.3 8.3 34.1 24.5 50.7 54.1 50.7 85V432H512v-66.7C512 307.5 440 272 384 272z" fill="#4285F4" opacity="0.8" />
    </svg>
  );
}

export function GoogleMeetIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M320 160v192l128 96V64L320 160z" fill="#00AC47" />
      <rect x="64" y="96" width="256" height="320" rx="32" fill="#00832D" />
      <path d="M320 352l-96 64H96c-17.7 0-32-14.3-32-32v-96l160-32 96 96z" fill="#EA4335" opacity="0.4" />
    </svg>
  );
}

export function getServiceIconPath(service: string): string {
  const s = (service || "").trim();
  const lower = s.toLowerCase();

  // Google Workspace (Lockup)
  if (lower.includes("workspace lockup") || lower === "google workspace" || lower === "workspace") {
    return "/images/services/workspace.svg";
  }

  // Google Docs
  if (lower.includes("docs") || lower.includes("document")) {
    return "/images/services/docs.svg";
  }

  // Google Sheets
  if (lower.includes("sheets") || lower.includes("spreadsheet")) {
    return "/images/services/sheets.svg";
  }

  // Google Slides
  if (lower.includes("slides") || lower.includes("presentation")) {
    return "/images/services/slides.svg";
  }

  // Google Forms
  if (lower.includes("forms")) {
    return "/images/services/forms.svg";
  }

  // Google Drive (2026 SVG)
  if (s === "Drive" || lower.includes("drive")) {
    return "/images/services/drive.svg";
  }

  // Gmail (2026 SVG)
  if (s === "Gmail" || lower.includes("gmail") || lower.includes("mail")) {
    return "/images/services/gmail.svg";
  }

  // Google Calendar (2026 SVG)
  if (s === "Calendar" || lower.includes("calendar") || lower.includes("schedule")) {
    return "/images/services/calendar.svg";
  }

  // Google Meet (2026 SVG)
  if (s === "Meet" || lower.includes("meet")) {
    return "/images/services/meet.svg";
  }

  // Google Chat (2026 SVG)
  if (s === "Chat" || lower.includes("chat")) {
    return "/images/services/chat.svg";
  }

  // Google Keep (2026 SVG)
  if (lower.includes("keep") || lower.includes("notes")) {
    return "/images/services/keep.svg";
  }

  // Google Sites (2026 SVG)
  if (lower.includes("sites")) {
    return "/images/services/sites.svg";
  }

  // Google Tasks (2026 SVG)
  if (s === "Tasks" || lower.includes("tasks")) {
    return "/images/services/tasks.svg";
  }

  // Google Vids (2024/2026 SVG)
  if (lower.includes("vids")) {
    return "/images/services/vids.svg";
  }

  // Google Voice (2026 SVG)
  if (lower.includes("voice")) {
    return "/images/services/voice.svg";
  }

  // Google Contacts (2022/2026 SVG)
  if (s === "Contacts" || lower.includes("contact") || lower.includes("people")) {
    return "/images/services/contacts.svg";
  }

  // AppSheet
  if (lower.includes("appsheet")) {
    return "/images/services/appsheet.svg";
  }

  // Google Classroom
  if (s === "Classroom" || lower.includes("classroom") || lower.includes("course") || lower.includes("roster")) {
    return "/images/services/classroom.svg";
  }

  // Google Workspace Admin / Admin SDK
  if (s === "Google Workspace Admin" || lower.includes("workspace admin") || lower.includes("directory") || lower.includes("admin")) {
    return "/images/services/admin.svg";
  }

  // Google Vault
  if (s === "Vault" || lower.includes("vault") || lower.includes("ediscovery")) {
    return "/images/services/vault.png";
  }

  // Cloud Search
  if (s === "Cloud Search" || lower.includes("cloud search")) {
    return "/images/services/cloud-search.svg";
  }

  // Cloud Billing
  if (s === "Cloud Billing" || lower.includes("billing")) {
    return "/images/services/cloud.png";
  }

  // Cloud Machine Learning
  if (s === "Cloud Machine Learning" || lower.includes("machine learning")) {
    return "/images/services/cloud.png";
  }

  // Cloud Platform
  if (s === "Cloud Platform" || lower.includes("cloud platform") || lower.includes("gcp") || lower.includes("cloud")) {
    return "/images/services/cloud.png";
  }

  // Apps Script Runtime & Apps Script API
  if (s === "Apps Script Runtime" || s === "Apps Script API" || lower.includes("apps script") || lower.includes("script") || lower.includes("workflows") || lower.includes("flexible-api")) {
    return "/images/services/apps-script.svg";
  }

  // Groups
  if (s === "Groups" || lower.includes("groups")) {
    return "/images/services/groups.png";
  }

  // Google sign-in
  if (s === "Google sign-in" || lower.includes("sign-in") || lower.includes("signin") || lower.includes("identity") || lower.includes("sso") || lower.includes("account") || lower.includes("profile") || lower.includes("userinfo") || lower.includes("openid") || lower.includes("auth")) {
    return "/images/services/google-signin.svg";
  }

  return "/images/services/admin.svg";
}

export function GoogleProductIcon({
  service,
  className = "w-5 h-5",
}: {
  service: string;
  className?: string;
}) {
  const iconSrc = getServiceIconPath(service);
  return (
    <img
      src={iconSrc}
      alt={service || "Google Service"}
      className={`${className} object-contain inline-block flex-shrink-0`}
      loading="lazy"
    />
  );
}


