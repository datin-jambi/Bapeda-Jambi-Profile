import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Pertanyaan yang sering diajukan seputar layanan BAPENDA Provinsi Jambi",
};

export default async function FaqPage() {
  const categories = await prisma.faqCategory.findMany({
    include: {
      faqs: {
        where: { isPublished: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      },
    },
    orderBy: { name: "asc" },
  });

  const allFaqs = categories.filter((c) => c.faqs.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold font-poppins text-primary">Pertanyaan Umum (FAQ)</h1>
        <p className="text-gray-500 mt-2">Temukan jawaban atas pertanyaan yang sering diajukan</p>
      </div>

      {allFaqs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Belum ada FAQ</div>
      ) : (
        <div className="space-y-10">
          {allFaqs.map((cat) => (
            <div key={cat.id}>
              <h2 className="text-lg font-bold text-primary mb-4 pb-2 border-b-2 border-secondary/30">{cat.name}</h2>
              <div className="space-y-3">
                {cat.faqs.map((faq) => (
                  <details key={faq.id} className="group border border-gray-200 rounded-xl overflow-hidden">
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                      <span className="font-medium text-gray-800 text-sm pr-4">{faq.question}</span>
                      <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
