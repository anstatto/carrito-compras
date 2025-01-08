"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CartButton() {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
    >
      <Link
        href="/carrito"
        className="flex items-center justify-center w-14 h-14 bg-pink-600 text-white rounded-full shadow-lg hover:bg-pink-700 transition-colors"
      >
        <span className="sr-only">Carrito</span>
        🛒
      </Link>
    </motion.div>
  );
} 