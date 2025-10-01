"use client";

import { useEffect, useState } from "react";


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
      <h1 className="text-2xl font-bold mb-6">Küchen-Essentials</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <li
            key={product.id}
            className="border rounded-2xl p-4 shadow hover:shadow-lg transition"
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-48 object-contain mb-3"
            />
            <h2 className="font-semibold text-lg mb-2">{product.title}</h2>
            <p className="text-sm text-gray-600 mb-3">{product.description}</p>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-4 py-2 rounded-xl"
            >
              Auf Amazon ansehen
            </a>
          </li>
        ))}
      </ul>
      <footer className="text-center text-xs text-gray-500 mt-10">
        <p>All links lead to Amazon products, without affiliate tracking</p>
      </footer>
    </div>
  );
}
