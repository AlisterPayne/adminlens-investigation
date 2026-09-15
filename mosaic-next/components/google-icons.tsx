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

export function GoogleProductIcon({
  service,
  className = "w-5 h-5",
}: {
  service: string;
  className?: string;
}) {
  const s = (service || "").toLowerCase();
  if (s.includes("gmail") || s.includes("mail")) {
    return <GmailIcon className={className} />;
  }
  if (s.includes("drive") || s.includes("docs") || s.includes("sheets") || s.includes("slides")) {
    return <GoogleDriveIcon className={className} />;
  }
  if (s.includes("admin") || s.includes("directory") || s.includes("device") || s.includes("groups")) {
    return <GoogleAdminIcon className={className} />;
  }
  if (s.includes("calendar") || s.includes("schedule")) {
    return <GoogleCalendarIcon className={className} />;
  }
  if (s.includes("classroom") || s.includes("course") || s.includes("roster")) {
    return <GoogleClassroomIcon className={className} />;
  }
  if (s.includes("contact") || s.includes("people")) {
    return <GoogleContactsIcon className={className} />;
  }
  return null;
}
