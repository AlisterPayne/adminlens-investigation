import Image from "next/image";

import OnboardingBg from "@/public/images/onboarding-image.jpg";

export default function OnboardingImage() {
  return (
    <div className="absolute top-0 right-0 bottom-0 hidden md:block md:w-1/2" aria-hidden="true">
      <Image
        className="h-full w-full object-cover object-center"
        src={OnboardingBg}
        priority
        width={760}
        height={1024}
        alt="Onboarding"
      />
    </div>
  );
}
