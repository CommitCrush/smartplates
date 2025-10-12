"use client";


import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";


type Product = {
  id: string | number;
  title: string;
  description: string;
  image: string;
  url: string;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/products.json");
        if (!res.ok) {
          throw new Error("Fehler beim Laden der Produkte");
        }
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("API Fehler:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
  <h1 className="text-2xl font-bold mb-12 text-center">Kitchen essentials</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <li
            key={product.id}
            className="border rounded-2xl p-4 shadow hover:shadow-lg transition flex flex-col h-full"
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-72 object-cover rounded-xl mb-3"
            />
            <h2 className="font-semibold text-lg mb-2">{product.title}</h2>
            <p className="text-sm text-gray-400 mb-3 flex-1">{product.description}</p>
            <div className="mt-auto pt-2 flex justify-center">
              <Button
                asChild
                className="w-[60%] bg-coral-500 hover:bg-coral-600 text-white focus:outline-none focus:ring-2 focus:ring-coral-300 focus:ring-offset-2 font-medium px-4 py-2 rounded-xl"
                variant={undefined}
                size={undefined}
              >
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${product.title} on Amazon`}
                >
                  Buy on Amazon
                </a>
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <footer className="text-center text-xs text-gray-500 mt-10">
        <p>All links lead to Amazon products, without affiliate tracking</p>
      </footer>
    </div>
  );
}
