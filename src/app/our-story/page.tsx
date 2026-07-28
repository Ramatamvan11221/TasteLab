import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants/site";

export const metadata: Metadata = {
  title: "Cerita Kami",
  description: `Kenali misi ${SITE_CONFIG.name} dalam membangun transparansi produk makanan.`,
};

export default function OurStoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <span className="brutal-card inline-block bg-tastelab-yellow px-3 py-1 text-xs font-bold">
        Cerita Kami
      </span>
      <h1 className="mt-4 font-heading text-4xl font-extrabold">Kenapa TasteLab Ada?</h1>
      <div className="mt-6 space-y-4 text-tastelab-black/80">
        <p>
          TasteLab lahir dari satu pertanyaan sederhana: kenapa produk makanan yang kita beli di rak toko
          tidak punya ruang untuk berbicara balik kepada kita? Kita terbiasa membaca ulasan sebelum membeli
          apa pun secara online, tapi begitu produk itu ada di tangan kita secara fisik, jejak digitalnya
          menghilang.
        </p>
        <p>
          Kami membangun TasteLab bukan sebagai platform pemesanan atau pengantaran makanan. TasteLab adalah
          jembatan antara kemasan fisik dan pengalaman digital — cukup dengan satu kali scan QR Code, kamu
          bisa melihat informasi nutrisi lengkap, membaca deskripsi produk, dan membaca ulasan jujur dari
          pembeli lain.
        </p>
        <p>
          Kami percaya kepercayaan dibangun dari transparansi. Setiap rating yang kamu berikan selalu
          dihitung secara terbuka. Setiap ulasan bisa kamu tulis secara publik atau privat, sepenuhnya
          pilihanmu. Dan setiap dapur mitra kami berkomitmen untuk terus mendengarkan, bukan menyembunyikan.
        </p>
        <p className="font-bold text-tastelab-black">Know What You Eat. Share What You Think.</p>
      </div>
    </div>
  );
}
