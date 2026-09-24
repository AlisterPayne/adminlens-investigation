import React from "react";

export function GmailIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <GoogleProductIcon service="Gmail" className={className} />;
}

export function GoogleDriveIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <GoogleProductIcon service="Drive" className={className} />;
}

export function GoogleAdminIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <GoogleProductIcon service="Google Workspace Admin" className={className} />;
}

export function GoogleCalendarIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <GoogleProductIcon service="Calendar" className={className} />;
}

export function GoogleClassroomIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <GoogleProductIcon service="Classroom" className={className} />;
}

export function GoogleContactsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <GoogleProductIcon service="Contacts" className={className} />;
}

export function GoogleAppsScriptIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <GoogleProductIcon service="Apps Script Runtime" className={className} />;
}

export function GoogleAccountIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <GoogleProductIcon service="Google sign-in" className={className} />;
}

export function GoogleChatIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <GoogleProductIcon service="Chat" className={className} />;
}

export function GoogleTasksIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <GoogleProductIcon service="Tasks" className={className} />;
}

export function GoogleVaultIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <GoogleProductIcon service="Vault" className={className} />;
}

export function GoogleCloudIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <GoogleProductIcon service="Cloud Platform" className={className} />;
}

export function GoogleGroupsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <GoogleProductIcon service="Groups" className={className} />;
}

export function GoogleMeetIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <GoogleProductIcon service="Meet" className={className} />;
}

export function getServiceIconPath(service: string): string {
  const getPath = (): string => {
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
  };

  return `${getPath()}?v=2026.2`;
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


