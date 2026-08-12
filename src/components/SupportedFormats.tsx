import React from 'react';
import { motion } from 'motion/react';

export const SupportedFormats: React.FC = () => {
  const sections = [
    {
      title: 'Download File dengan Mudah',
      description:
        'Savely membantu mengunduh berbagai jenis file dan media langsung dari URL, tanpa aplikasi tambahan.',
    },
    {
      title: 'Berbagai Format File',
      description:
        'Unduh video, audio, gambar, dokumen, hingga arsip dalam berbagai format yang didukung.',
    },
    {
      title: 'Cepat dan Praktis',
      description:
        'Cukup tempel URL file yang dapat diakses publik, lalu tekan Download untuk memulai.',
    },
    {
      title: 'Download Langsung dari Browser',
      description:
        'Tidak perlu instal aplikasi atau menyimpan file secara permanen di server. Proses download dilakukan melalui layanan Savely.',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-2xl mx-auto px-4 sm:px-6 my-16 space-y-10 text-center"
    >
      {sections.map((sec) => (
        <div key={sec.title} className="space-y-2">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100 tracking-tight">
            {sec.title}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            {sec.description}
          </p>
        </div>
      ))}
    </motion.section>
  );
};



