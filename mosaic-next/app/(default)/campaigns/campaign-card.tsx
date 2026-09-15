import Image, { StaticImageData } from "next/image";
import Link from "next/link";

import { CampaignProperties } from "./campaigns-properties";

interface Campaign {
  id: number;
  category: string;
  members: {
    name: string;
    image: StaticImageData;
    link: string;
  }[];
  title: string;
  link: string;
  content: string;
  dates: {
    from: string;
    to: string;
  };
  type: string;
}

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { typeColor, categoryIcon } = CampaignProperties();

  return (
    <div className="col-span-full rounded-xl bg-white shadow-sm sm:col-span-6 xl:col-span-4 dark:bg-gray-800">
      <div className="flex h-full flex-col p-5">
        <header>
          <div className="flex items-center justify-between">
            {categoryIcon(campaign.category)}
            <div className="-ml-px flex shrink-0 -space-x-3">
              {campaign.members.map((member) => {
                return (
                  <Link key={member.name} className="block" href={member.link}>
                    <Image
                      className="box-content rounded-full border-2 border-white dark:border-gray-800"
                      src={member.image}
                      width={28}
                      height={28}
                      alt={member.name}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </header>
        <div className="mt-2 grow">
          <Link
            className="mb-1 inline-flex text-gray-800 hover:text-gray-900 dark:text-gray-100 dark:hover:text-white"
            href={campaign.link}
          >
            <h2 className="text-xl leading-snug font-semibold">{campaign.title}</h2>
          </Link>
          <div className="text-sm">{campaign.content}</div>
        </div>
        <footer className="mt-5">
          <div className="mb-2 text-sm font-medium text-gray-500">
            {campaign.dates.from} <span className="text-gray-400 dark:text-gray-600">-&gt;</span> {campaign.dates.to}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div
                className={`inline-flex rounded-full px-2.5 py-1 text-center text-xs font-medium ${typeColor(campaign.type)}`}
              >
                {campaign.type}
              </div>
            </div>
            <div>
              <Link
                className="text-sm font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
                href={campaign.link}
              >
                View -&gt;
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
