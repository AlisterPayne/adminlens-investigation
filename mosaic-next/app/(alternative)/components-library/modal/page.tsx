export const metadata = {
  title: "Modal - Mosaic",
  description: "Page description",
};

import BasicExamples from "./basic-examples";
import FeedbackExamples from "./feedback-examples";
import ProductExamples from "./product-examples";

export default function ModalLibrary() {
  return (
    <div className="relative h-full bg-white dark:bg-gray-900">
      <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl dark:text-gray-100">Modal</h1>
        </div>

        <div>
          {/* Components */}
          <div className="mt-8 space-y-8">
            {/* Basic */}
            <BasicExamples />

            {/* Feedback */}
            <FeedbackExamples />

            {/* Product */}
            <ProductExamples />
          </div>
        </div>
      </div>
    </div>
  );
}
