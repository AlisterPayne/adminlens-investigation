import type { Transaction } from "@/app/(alternative)/finance/transactions/transactions-table";
import Image01 from "@/public/images/transactions-image-01.svg";
import Image02 from "@/public/images/transactions-image-02.svg";
import Image04 from "@/public/images/transactions-image-03.svg";
import Image05 from "@/public/images/transactions-image-04.svg";
import Image06 from "@/public/images/transactions-image-05.svg";
import Image07 from "@/public/images/transactions-image-06.svg";
import Image08 from "@/public/images/transactions-image-07.svg";
import Image09 from "@/public/images/transactions-image-08.svg";
import Image03 from "@/public/images/user-36-05.jpg";

export const transactions: Transaction[] = [
  { id: 0, image: Image01, name: "Form Builder CP", date: "22/01/2024", status: "Pending", amount: "-$1,299.22" },
  { id: 1, image: Image02, name: "Imperial Hotel ****", date: "22/01/2024", status: "Completed", amount: "-$1,029.77" },
  { id: 2, image: Image03, name: "Aprilynne Pills", date: "22/01/2024", status: "Pending", amount: "+$499.99" },
  { id: 3, image: Image04, name: "Google Limited UK", date: "22/01/2024", status: "Completed", amount: "-$1,029.77" },
  { id: 4, image: Image05, name: "Acme LTD UK", date: "22/01/2024", status: "Pending", amount: "+$2,179.36" },
  { id: 5, image: Image04, name: "Google Limited UK", date: "22/01/2024", status: "Canceled", amount: "-$1,029.77" },
  { id: 6, image: Image06, name: "Uber", date: "22/01/2024", status: "Completed", amount: "-$272.88" },
  { id: 7, image: Image07, name: "PublicOne Inc.", date: "22/01/2024", status: "Completed", amount: "-$199.87" },
  { id: 8, image: Image08, name: "Github Inc.", date: "22/01/2024", status: "Completed", amount: "-$42.87" },
  { id: 9, image: Image09, name: "Form Builder PRO", date: "22/01/2024", status: "Completed", amount: "-$112.44" },
];

export function getTransactionById(id: number): Transaction | undefined {
  return transactions.find((transaction) => transaction.id === id);
}
