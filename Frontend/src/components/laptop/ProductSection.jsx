import ProductCard from "./ProductCard";

function ProductSection({ products }) {
  // Ensure products is array
  const productList = Array.isArray(products) ? products : [];
  
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {productList.map((item) => (
        <ProductCard
          key={item.id}
          {...item}
        />
      ))}
    </div>
  );
}

export default ProductSection;