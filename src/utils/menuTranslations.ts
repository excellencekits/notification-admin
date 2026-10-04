// Menu translations
export const menuTranslations: Record<string, Record<string, string>> = {
  // Common
  home: {
    en: 'Home',
    ar: 'الرئيسية',
    fr: 'Accueil',
    es: 'Inicio'
  },
  Home: {
    en: 'Home',
    ar: 'الرئيسية',
    fr: 'Accueil',
    es: 'Inicio'
  },

  // Groups
  'Items Administration': {
    en: 'Items Administration',
    ar: 'إدارة العناصر',
    fr: 'Administration des articles',
    es: 'Administración de artículos'
  },
  'Vendor Administration': {
    en: 'Vendor Administration',
    ar: 'إدارة البائعين',
    fr: 'Administration des vendeurs',
    es: 'Administración de vendedores'
  },
  Dashboard: {
    en: 'Dashboard',
    ar: 'لوحة التحكم',
    fr: 'Tableau de bord',
    es: 'Panel de control'
  },
  'Orders Management': {
    en: 'Orders Management',
    ar: 'إدارة الطلبات',
    fr: 'Gestion des commandes',
    es: 'Gestión de pedidos'
  },

  // Menu items
  'Products Catalog': {
    en: 'Products Catalog',
    ar: 'كتالوج المنتجات',
    fr: 'Catalogue de produits',
    es: 'Catálogo de productos'
  },
  Categories: {
    en: 'Categories',
    ar: 'الفئات',
    fr: 'Catégories',
    es: 'Categorías'
  },
  'Filter Management': {
    en: 'Filter Management',
    ar: 'إدارة الفلاتر',
    fr: 'Gestion des filtres',
    es: 'Gestión de filtros'
  },
  'Vendor Management': {
    en: 'Vendor Management',
    ar: 'إدارة البائعين',
    fr: 'Gestion des vendeurs',
    es: 'Gestión de vendedores'
  },
  Orders: {
    en: 'Orders',
    ar: 'الطلبات',
    fr: 'Commandes',
    es: 'Pedidos'
  },
  Analytics: {
    en: 'Analytics',
    ar: 'التحليلات',
    fr: 'Analytique',
    es: 'Analítica'
  },
  Items: {
    en: 'Items',
    ar: 'العناصر',
    fr: 'Articles',
    es: 'Artículos'
  },
  Products: {
    en: 'Products',
    ar: 'المنتجات',
    fr: 'Produits',
    es: 'Productos'
  },
  Vendors: {
    en: 'Vendors',
    ar: 'البائعون',
    fr: 'Vendeurs',
    es: 'Vendedores'
  },
  Sales: {
    en: 'Sales',
    ar: 'المبيعات',
    fr: 'Ventes',
    es: 'Ventas'
  },
  'Pending Orders': {
    en: 'Pending Orders',
    ar: 'الطلبات المعلقة',
    fr: 'Commandes en attente',
    es: 'Pedidos pendientes'
  },
  'Completed Orders': {
    en: 'Completed Orders',
    ar: 'الطلبات المكتملة',
    fr: 'Commandes terminées',
    es: 'Pedidos completados'
  },
  'My Store': {
    en: 'My Store',
    ar: 'متجري',
    fr: 'Ma boutique',
    es: 'Mi tienda'
  },
  'Products & Store Management': {
    en: 'Products & Store Management',
    ar: 'إدارة المنتجات والمتجر',
    fr: 'Gestion des produits et du magasin',
    es: 'Gestión de productos y tienda'
  }
};

// Helper function to get menu translation
export function getMenuTranslation(key: string, language: string): string {
  return menuTranslations[key]?.[language] || key;
}
