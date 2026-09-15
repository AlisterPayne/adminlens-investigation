export const metadata = {
  title: "Profile - Mosaic",
  description: "Page description",
};

import { FlyoutProvider } from "@/app/flyout-context";

import ProfileBody from "./profile-body";
import ProfileSidebar from "./profile-sidebar";

function ProfileContent() {
  return (
    <div className="relative flex">
      {/* Profile sidebar */}
      <ProfileSidebar />

      {/* Profile body */}
      <ProfileBody />
    </div>
  );
}

export default function Profile() {
  return (
    <FlyoutProvider>
      <ProfileContent />
    </FlyoutProvider>
  );
}
