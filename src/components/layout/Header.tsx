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
  FaHome,
  FaStore,
  FaTags,
  FaPercent,
  FaInfoCircle,
  FaDoorOpen,
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
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const navigationItems = [
    { href: "/", label: "Inicio", icon: FaHome },
    { href: "/catalogo", label: "Catálogo", icon: FaStore },
    { href: "/categorias", label: "Categorías", icon: FaTags },
    { href: "/ofertas", label: "Ofertas", icon: FaPercent },
    { href: "/nosotros", label: "Nosotros", icon: FaInfoCircle },
  ];

  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  const renderUserMenu = () => {
    if (status === "loading") {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="w-20 h-4 bg-gray-200 animate-pulse rounded" />
        </div>
      );
    }

    if (session?.user) {
      const displayName = session.user.nombre
        ? `${session.user.nombre} ${session.user.apellido || ""}`
        : session.user.email?.split("@")[0];

      return (
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white">
                <FaUser className="w-4 h-4" />
              </div>
              <span className="ml-2 hidden sm:inline">{displayName}</span>
            </div>
          </motion.button>

          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={dropdownVariants}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 z-50"
              >
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center space-x-2 px-4 py-3 text-sm hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FaShoppingBag className="w-4 h-4 text-pink-500" />
                    <span>Panel Admin</span>
                  </Link>
                )}
                <Link
                  href="/perfil"
                  className="flex items-center space-x-2 px-4 py-3 text-sm hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaUser className="w-4 h-4 text-pink-500" />
                  <span>Mi Perfil</span>
                </Link>
                <Link
                  href="/perfil/pedidos"
                  className="flex items-center space-x-2 px-4 py-3 text-sm hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaShoppingBag className="w-4 h-4 text-pink-500" />
                  <span>Mis Pedidos</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        href="/login"
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center">
          <FaDoorOpen className="w-5 h-5 group-hover:text-pink-500 transition-colors" />
        </div>
        <span className="text-sm font-medium group-hover:text-pink-500">
          Iniciar sesión
        </span>
      </Link>
    );
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
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo y Menú Móvil */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2
                    ${isActive 
                      ? "text-pink-500 bg-pink-50 dark:bg-pink-500/10" 
                      : "text-gray-700 dark:text-gray-200 hover:text-pink-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Iconos y Acciones */}
          <div className="flex items-center space-x-2">
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <FaShoppingBag className="w-4 h-4" />
                <span className="hidden xl:inline">Panel Admin</span>
              </Link>
            )}

            <Link
              href="/favoritos"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 relative group"
              aria-label="Favoritos"
            >
              <FaHeart className="w-5 h-5 group-hover:text-pink-500 transition-colors" />
              {!loadingFavorites && favorites.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                >
                  {favorites.length}
                </motion.span>
              )}
            </Link>

            {/* Usuario en Desktop */}
            <div className="hidden sm:block">
              {renderUserMenu()}
            </div>

            {/* Usuario en Móvil */}
            <div className="sm:hidden">
              {session?.user ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white">
                    <FaUser className="w-4 h-4" />
                  </div>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={dropdownVariants}
                        className="fixed top-16 right-4 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 z-50"
                      >
                        {session.user.role === "ADMIN" && (
                          <Link
                            href="/admin/dashboard"
                            className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <FaShoppingBag className="w-4 h-4 text-pink-500" />
                            <span>Panel Admin</span>
                          </Link>
                        )}
                        <Link
                          href="/perfil"
                          className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaUser className="w-4 h-4 text-pink-500" />
                          <span>Mi Perfil</span>
                        </Link>
                        <Link
                          href="/perfil/pedidos"
                          className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaShoppingBag className="w-4 h-4 text-pink-500" />
                          <span>Mis Pedidos</span>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <FaTimes className="w-4 h-4" />
                          <span>Cerrar sesión</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    <FaDoorOpen className="w-5 h-5 group-hover:text-pink-500 transition-colors" />
                  </div>
                  <span className="text-sm font-medium group-hover:text-pink-500">
                    Iniciar sesión
                  </span>
                </Link>
              )}
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
            className="lg:hidden border-t border-gray-200 dark:border-gray-700"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-2">
                {navigationItems.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
                        ${isActive
                          ? "text-pink-500 bg-pink-50 dark:bg-pink-500/10"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                    </Link>
                  );
                })}

                {session?.user && (
                  <>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                    
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center space-x-3 p-3 text-white bg-gradient-to-r from-pink-500 to-violet-500 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <FaShoppingBag className="w-5 h-5" />
                        <span>Panel Admin</span>
                      </Link>
                    )}

                    <Link
                      href="/perfil"
                      className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaUser className="w-5 h-5" />
                      <span>Mi Perfil</span>
                    </Link>

                    <Link
                      href="/perfil/pedidos"
                      className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaShoppingBag className="w-5 h-5" />
                      <span>Mis Pedidos</span>
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg w-full"
                    >
                      <FaTimes className="w-5 h-5" />
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
