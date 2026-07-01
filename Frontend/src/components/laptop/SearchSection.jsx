import ProductCard from "./ProductCard";
import laptop from "../../assets/hero.png";

const products = [
  {
    title: "ASUS VivoBook 14",
    spec: "i5 • 16GB • 512GB SSD",
    price: "Rp 7.299.000",
    image: laptop,
  },
  {
    title: "ASUS ROG Zephyrus G14",
    spec: "Ryzen 7 • RTX 4050",
    price: "Rp 16.999.000",
    image: laptop,
  },
  {
    title: "Acer Aspire 5",
    spec: "i5 • 16GB • 512GB SSD",
    price: "Rp 6.799.000",
    image: laptop,
  },
  {
    title: "ThinkPad X1 Carbon",
    spec: "i7 • 16GB • 512GB SSD",
    price: "Rp 8.999.000",
    image: laptop,
  },
];

export default function SearchSection() {
  return (
    <section className="max-w-7xl mx-auto py-10 px-4">

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Cari laptop idamanmu..."
          className="flex-1 border rounded-xl px-5 py-4"
        />

        <button className="bg-blue-600 text-white px-10 rounded-xl">
          Cari
        </button>
      </div>

      <h2 className="text-3xl font-bold mt-10 mb-6">
        Rekomendasi Laptop
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((item, index) => (
          <ProductCard
            key={item.title}
            {...item}
          />
        ))}
      </div>

    </section>
  );
}