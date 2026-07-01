import laptop from "../../assets/hero.png";

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto mt-8 px-4">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl p-10">

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          <div>
            <span className="bg-white px-4 py-2 rounded-full text-blue-600 font-semibold">
              #1 Marketplace Laptop
            </span>

            <h1 className="text-6xl font-bold mt-6 leading-tight">
              Cari Laptop Impianmu
              <br />
              Harga{" "}
              <span className="text-blue-600">
                Terbaik
              </span>
            </h1>

            <p className="mt-6 text-xl text-gray-600">
              Temukan laptop baru maupun bekas berkualitas
              dengan harga terbaik dan garansi terpercaya.
            </p>

            <div className="flex gap-4 mt-8">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl">
                Belanja Sekarang
              </button>

              <button className="border px-8 py-4 rounded-xl">
                Jual Laptop
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-10">
              <Feature
                title="Garansi Aman"
                desc="Barang bergaransi"
              />

              <Feature
                title="Pengiriman Cepat"
                desc="Seluruh Indonesia"
              />

              <Feature
                title="Transaksi Aman"
                desc="100% Terpercaya"
              />
            </div>
          </div>

          <div className="relative">
            <img
              src={laptop}
              alt="Laptop"
              className="w-full"
            />

            <div className="absolute top-20 right-0 bg-white rounded-3xl p-6 shadow-lg">
              <h3 className="text-blue-600 font-semibold">
                Diskon Hingga
              </h3>

              <h2 className="text-6xl font-bold text-blue-600">
                30%
              </h2>

              <p className="text-gray-500">
                Untuk semua laptop
              </p>

              <button className="mt-4 bg-black text-white px-5 py-3 rounded-full">
                Lihat Promo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="flex gap-3">
      <div className="w-12 h-12 bg-white rounded-xl"></div>

      <div>
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
    </div>
  );
}