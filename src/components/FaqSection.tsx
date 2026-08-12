import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'Apakah Savely perlu aplikasi?',
      answer: 'Tidak. Savely dapat digunakan langsung melalui browser tanpa perlu memasang aplikasi tambahan.',
    },
    {
      question: 'File apa saja yang bisa diunduh?',
      answer: 'Savely mendukung berbagai format video, audio, gambar, dokumen, dan arsip yang dapat diakses melalui URL.',
    },
    {
      question: 'Bagaimana cara menggunakan Savely?',
      answer: 'Cukup tempel URL file atau media pada kolom yang tersedia, kemudian tekan tombol Download.',
    },
    {
      question: 'Apakah file saya disimpan di server?',
      answer: 'Savely tidak menyimpan file pengguna secara permanen di server.',
    },
    {
      question: 'Apakah Savely bisa digunakan di HP?',
      answer: 'Ya. Savely dirancang agar dapat digunakan melalui browser di smartphone, tablet, maupun desktop.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-2xl mx-auto px-4 sm:px-6 my-16 pt-10 border-t border-slate-800/60"
    >
      {/* Help header before FAQ */}
      <div className="text-center mb-10 space-y-1.5">
        <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
          Butuh bantuan?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          Temukan jawaban dari pertanyaan yang sering ditanyakan tentang Savely.
        </p>
      </div>

      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        FAQ
      </h3>

      <div className="divide-y divide-slate-800/60 border-b border-slate-800/60">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.question} className="py-1">
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="w-full text-left flex items-center justify-between gap-4 py-3 text-slate-200 hover:text-white transition duration-150 focus:outline-none group cursor-pointer"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="text-base font-medium text-slate-400 group-hover:text-slate-200 w-5 h-5 flex items-center justify-center select-none inline-flex"
                >
                  {isOpen ? '−' : '+'}
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="pb-3 pt-0.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
};

