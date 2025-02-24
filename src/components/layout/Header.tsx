"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  FaUser,
  FaHeart,
  FaBars,
  FaTimes,
  FaShoppingBag,
} from "react-icons/fa";
import CartDropdown from "../cart/CartDropdown";
import ThemeToggle from "../ui/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useFavorites } from "@/app/hooks/useFavorites";
import Logo from "./Logo";

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { favorites, isLoading: loadingFavorites } = useFavorites();

  // Memoizar el handler del scroll
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const navigationItems = [
    { href: "/", label: "Inicio" },
    { href: "/catalogo", label: "Catálogo" },
    { href: "/categorias", label: "Categorías" },
    { href: "/ofertas", label: "Ofertas" },
    { href: "/nosotros", label: "Nosotros" },
  ];

  const dropdownVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
  };

  const renderUserMenu = () => {
    if (status === "loading") {
      return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />;
    }

    if (session?.user) {
      const displayName = session.user.nombre
        ? `${session.user.nombre} ${session.user.apellido || ""}`
        : session.user.email?.split("@")[0];

      return (
        <div className="relative group">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="flex items-center">
              <FaUser className="w-5 h-5" />
              <span className="ml-2">{displayName}</span>
            </div>
          </motion.button>

          <motion.div
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
          >
            {session.user.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-pink-50 dark:hover:bg-gray-700"
              >
                <FaShoppingBag className="w-4 h-4 text-pink-500" />
                <span>Panel Admin</span>
              </Link>
            )}
            <Link
              href="/perfil"
              className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-pink-50 dark:hover:bg-gray-700"
            >
              <FaUser className="w-4 h-4 text-pink-500" />
              <span>Mi Perfil</span>
            </Link>
            <Link
              href="/perfil/pedidos"
              className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-pink-50 dark:hover:bg-gray-700"
            >
              <FaShoppingBag className="w-4 h-4 text-pink-500" />
              <span>Mis Pedidos</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <FaTimes className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </motion.div>
        </div>
      );
    }

    return (
      <Link
        href="/login"
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 hover:text-pink-500"
      >
        <div className="flex items-center">
          <FaUser className="w-5 h-5" />
          <span className="ml-2">Iniciar sesión</span>
        </div>
      </Link>
    );
  };

  const renderAdminButton = () => {
    if (session?.user?.role === "ADMIN") {
      return (
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          <FaShoppingBag className="w-4 h-4" />
          <span>Panel Admin</span>
        </Link>
      );
    }
    return null;
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-md"
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          {/* Logo y Menú Móvil */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMenuOpen ? "close" : "open"}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  exit={{ rotate: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMenuOpen ? (
                    <FaTimes className="h-5 w-5" />
                  ) : (
                    <FaBars className="h-5 w-5" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>
            <Logo />
          </div>

          {/* Navegación Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="relative text-gray-700 dark:text-gray-200 hover:text-pink-500 dark:hover:text-pink-400 transition-colors group"
              >
                {label}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
              </Link>
            ))}
          </div>

          {/* Iconos y Acciones */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Botón de Admin */}
            <div className="hidden md:block">{renderAdminButton()}</div>

            <Link
              href="/favoritos"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative group"
              aria-label="Favoritos"
            >
              <FaHeart className="w-5 h-5 group-hover:text-pink-500" />
              {!loadingFavorites && favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            <div className="hidden sm:block">{renderUserMenu()}</div>
            <div className="sm:hidden">
              <Link
                href="/login"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                aria-label="Cuenta de usuario"
              >
                <FaUser className="w-5 h-5" />
              </Link>
            </div>

            <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <CartDropdown />
            </div>
          </div>
        </nav>
      </div>

      {/* Menú Móvil */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
            className="md:hidden border-t border-gray-200 dark:border-gray-700"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-3">
                {session?.user?.role === "ADMIN" && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center space-x-2 text-white bg-pink-500 hover:bg-pink-600 p-3 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaShoppingBag className="w-4 h-4" />
                    <span>Panel Admin</span>
                  </Link>
                )}
                {navigationItems.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-pink-500 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{label}</span>
                  </Link>
                ))}
                {session?.user && (
                  <>
                    <Link
                      href="/perfil"
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-pink-500 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaUser className="w-4 h-4" />
                      <span>Mi Perfil</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 text-red-600 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                    >
                      <FaTimes className="w-4 h-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
