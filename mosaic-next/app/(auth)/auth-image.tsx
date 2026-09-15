import Image from "next/image";

import AuthBg from "@/public/images/auth-image.jpg";

export default function AuthImage() {
  return (
    <div className="absolute top-0 right-0 bottom-0 hidden md:block md:w-1/2" aria-hidden="true">
      <Image
        className="h-full w-full object-cover object-center"
        src={AuthBg}
        priority
        width={760}
        height={1024}
        alt="Authentication"
      />
    </div>
  );
}
