
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
import { 
  ShoppingBag, Heart, User, Search, Menu, X, Instagram, Facebook, Twitter, 
  Smartphone, Trash2, Plus, Minus, ArrowRight, CheckCircle, Package, 
  Settings, BarChart3, Users, LayoutDashboard, ChevronRight, Bell, 
  CreditCard, MapPin, Truck, ChevronLeft, Upload, Type as TypeIcon, Filter,
  ExternalLink, ClipboardCheck, Edit2, Globe, ShieldCheck, Mail, Phone,
  Loader2, AlertCircle, CreditCard as CreditCardIcon, Landmark, RefreshCw
} from 'lucide-react';
import { PRODUCTS as MOCK_PRODUCTS, CATEGORIES as MOCK_CATEGORIES } from './mockData';
import { Product, CartItem, User as UserType, Category, Order } from './types';

// --- API Service Layer (Standardized for easy backend integration) ---
// To use a real backend, change BASE_URL and swap mock fallbacks for fetch() calls.
const BASE_URL = '/api/v1';

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    // In production: return fetch(`${BASE_URL}${endpoint}`, options).then(res => res.json());
    // Current: Simulating network delay and returning mock data
    await new Promise(r => setTimeout(r, 600));
    return null;
  }

  async getProducts(params?: any) {
    let items = [...MOCK_PRODUCTS];
    if (params?.category && params.category !== 'All') {
      items = items.filter(p => p.category === params.category);
    }
    return items;
  }

  async getProduct(id: string) {
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
  }

  async getCategories() {
    return MOCK_CATEGORIES;
  }

  async getProfile() {
    return { id: '1', name: 'Paperid User', email: 'user@paperid.in', phone: '+91 9876543210' };
  }

  async updateProfile(data: Partial<UserType>) {
    return { success: true, data };
  }

  async fetchAddresses() {
    return [
      { id: '1', title: 'Home Studio', street: '123 Minimalist Tower, Design District', city: 'Mumbai, Maharashtra 400001', country: 'India', primary: true }
    ];
  }

  async fetchPayments() {
    return [
      { id: '1', type: 'UPI' as const, value: 'paperid@okaxis', provider: 'PhonePe' },
      { id: '2', type: 'CARD' as const, value: '**** **** **** 4242', provider: 'Visa' }
    ];
  }

  async createOrder(order: any) {
    return { success: true, orderId: `PI-${Math.floor(Math.random() * 90000)}` };
  }
}

const api = new ApiClient();

// --- Contexts ---
const CartContext = createContext<{
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  toggleWishlist: (id: string) => void;
  addOrder: (order: Order) => void;
  totalItems: number;
  totalPrice: number;
  clearCart: () => void;
} | null>(null);

const AuthContext = createContext<{
  user: UserType | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  updateUser: (data: Partial<UserType>) => Promise<void>;
  logout: () => void;
} | null>(null);

// --- Shared UI Components ---

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4">
    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    <p className="text-[10px] font-black uppercase tracking-widest text-[#BDBDBD]">Syncing with Archive...</p>
  </div>
);

const Button = ({ children, variant = 'primary', isLoading = false, className = '', ...props }: any) => {
  const base = "px-6 md:px-8 py-3 md:py-3.5 rounded-full font-bold text-xs md:text-sm tracking-tight transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]";
  const variants: any = {
    primary: "bg-[#1A1A1A] text-white hover:bg-black shadow-sm",
    secondary: "bg-white text-[#1A1A1A] border border-[#EAEAEA] hover:bg-[#F9F9F9]",
    outline: "bg-transparent text-[#1A1A1A] border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white",
    ghost: "bg-transparent text-[#7A7A7A] hover:text-[#1A1A1A]"
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="space-y-1.5 w-full text-left">
    {label && <label className="text-[10px] font-bold uppercase tracking-widest text-[#7A7A7A] ml-1">{label}</label>}
    <input 
      className="w-full bg-[#F6F6F6] border border-transparent focus:border-[#EAEAEA] focus:bg-white rounded-xl px-4 py-2.5 md:px-5 md:py-3 text-sm transition-all outline-none placeholder:text-[#BDBDBD]"
      {...props}
    />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div className="space-y-1.5 w-full text-left">
    {label && <label className="text-[10px] font-bold uppercase tracking-widest text-[#7A7A7A] ml-1">{label}</label>}
    <select 
      className="w-full bg-[#F6F6F6] border border-transparent focus:border-[#EAEAEA] focus:bg-white rounded-xl px-4 py-2.5 md:px-5 md:py-3 text-sm transition-all outline-none cursor-pointer"
      {...props}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className={`w-10 h-5 rounded-full relative transition-all flex-shrink-0 ${active ? 'bg-indigo-600' : 'bg-[#EAEAEA]'}`}
  >
    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
  </button>
);

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const cartContext = useContext(CartContext);
  const isWishlisted = cartContext?.wishlist.includes(product.id);

  return (
    <div className="group space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] rounded-[32px] overflow-hidden bg-[#F2F2F2]">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.isNewArrival && (
            <span className="bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">New</span>
          )}
          {product.isBestSeller && (
            <span className="bg-[#1A1A1A] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">Bestseller</span>
          )}
        </div>
        <button 
          onClick={(e) => {
            e.preventDefault();
            cartContext?.toggleWishlist(product.id);
          }}
          className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-all active:scale-90 z-10"
        >
          <Heart size={16} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-[#1A1A1A]'} />
        </button>
      </Link>
      <div className="space-y-1.5 px-2">
        <div className="flex justify-between items-start gap-2">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-[11px] md:text-xs font-black uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{product.name}</h3>
          </Link>
          <p className="text-[11px] md:text-xs font-black shrink-0">₹{product.price}</p>
        </div>
        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-[#BDBDBD]">{product.category}</p>
      </div>
    </div>
  );
};

// --- Layout Components ---

const Navbar = () => {
  const cartContext = useContext(CartContext);
  const authContext = useContext(AuthContext);
  const totalItems = cartContext?.totalItems || 0;
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories);
  }, []);

  return (
    <header className="bg-white border-b border-[#EAEAEA] sticky top-0 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="hidden md:flex max-w-7xl mx-auto px-4 lg:px-8 justify-between items-center h-10 text-[11px] font-semibold text-[#7A7A7A] uppercase tracking-widest border-b border-[#F6F6F6]">
        <div className="flex space-x-6">
          <Link to="/about" className="hover:text-[#1A1A1A] transition-colors">Our Story</Link>
          <Link to="/track" className="hover:text-[#1A1A1A] transition-colors">Track Order</Link>
        </div>
        <div className="flex items-center space-x-6">
          <Link to="/cart" className="hover:text-[#1A1A1A] transition-colors flex items-center gap-1.5">
            Bag <span className="bg-[#1A1A1A] text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">{totalItems}</span>
          </Link>
          <Link to={authContext?.user ? "/account" : "/login"} className="hover:text-[#1A1A1A] transition-colors">
            {authContext?.user ? "Account" : "Login"}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsMenuOpen(true)} className="md:hidden p-2 hover:bg-[#F6F6F6] rounded-full transition-colors">
            <Menu size={20} className="text-[#1A1A1A]" />
          </button>
          <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter text-[#1A1A1A] hover:opacity-80 transition-opacity">
            PAPERID<span className="text-[#1A1A1A]">.</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-8 lg:space-x-10 text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.2em] text-[#7A7A7A]">
          {categories.map(cat => (
            <Link key={cat.name} to={`/shop?cat=${cat.name}`} className="hover:text-[#1A1A1A] transition-colors">
              {cat.name}
            </Link>
          ))}
          <Link to="/custom" className="text-indigo-600 hover:text-indigo-700 font-black">Studio</Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 hover:bg-[#F6F6F6] rounded-full transition-colors">
            <Search size={18} className="text-[#1A1A1A]" />
          </button>
          <Link to="/cart" className="md:hidden relative p-2 hover:bg-[#F6F6F6] rounded-full transition-colors">
            <ShoppingBag size={18} className="text-[#1A1A1A]" />
            {totalItems > 0 && <span className="absolute top-1 right-1 bg-[#1A1A1A] text-white w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px]">{totalItems}</span>}
          </Link>
          <Link to="/wishlist" className="hidden md:flex p-2 hover:bg-[#F6F6F6] rounded-full transition-colors">
            <Heart size={18} className="text-[#1A1A1A]" />
          </Link>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 w-[80%] max-sm bg-white p-8 animate-in slide-in-from-left duration-300 shadow-2xl overflow-y-auto">
            <div className="flex justify-between items-center mb-12">
               <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-2xl font-black tracking-tighter">PAPERID<span className="text-indigo-600">.</span></Link>
               <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-[#F6F6F6] rounded-full"><X size={18}/></button>
            </div>
            <nav className="space-y-8">
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BDBDBD]">Collections</p>
                <div className="flex flex-col gap-4">
                  <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold uppercase tracking-tight">All Archive</Link>
                  {categories.map(cat => (
                    <Link key={cat.name} to={`/shop?cat=${cat.name}`} onClick={() => setIsMenuOpen(false)} className="text-xl font-bold uppercase tracking-tight">
                      {cat.name}
                    </Link>
                  ))}
                  <Link to="/custom" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold uppercase tracking-tight text-indigo-600">Custom Studio</Link>
                </div>
              </div>
              <div className="h-px bg-[#F6F6F6]" />
              <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BDBDBD]">Account</p>
                <div className="flex flex-col gap-4">
                  <Link to="/account" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-[#7A7A7A]">My Account</Link>
                  <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-[#7A7A7A]">Wishlist</Link>
                  <Link to="/track" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-[#7A7A7A]">Track Order</Link>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      {isSearchOpen && (
        <div className="absolute inset-x-0 bg-white border-b border-[#EAEAEA] p-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="max-w-3xl mx-auto relative">
            <input 
              autoFocus
              placeholder="Search Paperid drops..." 
              className="w-full bg-[#F6F6F6] rounded-full py-3 px-6 text-sm font-medium outline-none focus:ring-1 focus:ring-[#EAEAEA]"
            />
            <button onClick={() => setIsSearchOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A7A7A]">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

// --- Page Components ---

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories()]).then(([p, c]) => {
      setProducts(p.slice(0, 4));
      setCategories(c);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="animate-in fade-in duration-700">
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black text-white px-4">
        <img src="https://picsum.photos/seed/hero-street/1920/1080" className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105" alt="Hero" />
        <div className="relative text-center space-y-8 max-w-4xl">
          <div className="space-y-2">
            <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.5em] text-indigo-400">Collection / 2024</span>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.8]">STREET<br/>SYNDICATE<span className="text-indigo-600">.</span></h1>
          </div>
          <p className="text-sm md:text-lg font-medium text-white/70 max-w-xl mx-auto">Engineered for the elite. The latest drop from the Paperid archive features high-performance fabrics and minimalist aesthetics.</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
            <Link to="/shop"><Button className="w-full md:w-auto px-10 py-5 text-base">Shop Archive</Button></Link>
            <Link to="/custom"><Button variant="secondary" className="w-full md:w-auto px-10 py-5 text-base bg-white/10 text-white border-white/20 backdrop-blur-md">Studio access</Button></Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20 md:py-32">
        <div className="flex justify-between items-end mb-12 md:mb-16">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BDBDBD]">Featured</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Latest Drops</h2>
          </div>
          <Link to="/shop" className="text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all group pb-1 border-b-2 border-[#1A1A1A]">
            View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        {isLoading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <section className="bg-[#F6F6F6] py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="mb-12 md:mb-16 text-center space-y-4">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BDBDBD]">Curated</p>
             <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Explore Cultures</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((cat) => (
              <Link key={cat.name} to={`/shop?cat=${cat.name}`} className="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 text-white space-y-1">
                  <span className="text-2xl">{cat.icon}</span>
                  <p className="text-lg font-black uppercase tracking-tight">{cat.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const ShopPage = () => {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const catParam = query.get('cat');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.getProducts({ category: catParam || 'All' }),
      api.getCategories()
    ]).then(([prodRes, catRes]) => {
      setProducts(prodRes);
      setCategories(catRes);
      setIsLoading(false);
    });
  }, [catParam]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 md:mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#BDBDBD]">
            <Link to="/">Home</Link> <ChevronRight size={10} /> <span>{catParam || 'Archive'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">{catParam || 'The Full Archive'}</h1>
        </div>
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 scrollbar-hide">
           <Link to="/shop" className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${!catParam ? 'bg-[#1A1A1A] text-white' : 'bg-[#F6F6F6] hover:bg-[#EAEAEA]'}`}>All Items</Link>
           {categories.map(cat => (
             <Link key={cat.name} to={`/shop?cat=${cat.name}`} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${catParam === cat.name ? 'bg-[#1A1A1A] text-white' : 'bg-[#F6F6F6] hover:bg-[#EAEAEA]'}`}>
               {cat.name}
             </Link>
           ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(n => <div key={n} className="aspect-[4/5] bg-[#F2F2F2] rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-10 md:gap-y-16">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {!isLoading && products.length === 0 && (
        <div className="py-40 text-center">
           <p className="text-[#BDBDBD] font-black uppercase tracking-[0.2em]">No products found in this category.</p>
        </div>
      )}
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const cartContext = useContext(CartContext);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      api.getProduct(id).then(res => {
        setProduct(res);
        setIsLoading(false);
      });
    }
  }, [id]);

  if (isLoading) return <LoadingSpinner />;
  if (!product) return <div className="py-20 text-center font-black uppercase">Drop not found.</div>;

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    cartContext?.addToCart({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      size: selectedSize,
      color: selectedColor || product.colors[0],
      image: product.images[0]
    });
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 md:py-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {product.images.map((img, i) => (
            <div key={i} className="aspect-[4/5] rounded-[24px] md:rounded-[32px] overflow-hidden bg-[#F2F2F2]">
              <img src={img} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="h-fit space-y-8 md:space-y-10 lg:sticky lg:top-32">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-[#BDBDBD]">
              <Link to="/shop">Shop</Link> <ChevronRight size={10} /> <span>{product.category}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#1A1A1A]">{product.name}</h1>
            <p className="text-xl md:text-2xl font-black">₹{product.price}.00</p>
            <p className="text-[#7A7A7A] text-sm leading-relaxed max-w-md">{product.description}</p>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest">Select Size</span>
                <button className="text-[9px] md:text-[10px] font-bold uppercase underline text-[#7A7A7A]">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {product.sizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full border text-[10px] md:text-xs font-bold transition-all ${selectedSize === size ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-[#EAEAEA] hover:border-[#1A1A1A]'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest block">Color</span>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {product.colors.map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full border text-[10px] md:text-[11px] font-bold transition-all ${selectedColor === color ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'border-[#EAEAEA] hover:border-[#1A1A1A]'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:gap-4 pt-2">
            <Button onClick={handleAddToCart} className="w-full py-4 md:py-5">Add to Bag</Button>
            {product.isCustomizable && (
              <Link to={`/custom?product=${product.id}`} className="w-full">
                <Button variant="secondary" className="w-full py-4 md:py-5">Personalize This Drop</Button>
              </Link>
            )}
            <Button variant="ghost" className="w-full py-2" onClick={() => cartContext?.toggleWishlist(product.id)}>
              <Heart size={16} className={`mr-2 ${cartContext?.wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : ''}`} /> 
              {cartContext?.wishlist.includes(product.id) ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomizationPage = () => {
  const [customText, setCustomText] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert("Image processed in Studio.");
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 md:py-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
        <div className="lg:col-span-8 bg-[#F6F6F6] rounded-[24px] md:rounded-[40px] aspect-square relative flex items-center justify-center overflow-hidden">
           <img src="https://picsum.photos/seed/blank-tee/1000/1000" className="w-full h-full object-contain mix-blend-multiply opacity-80" />
           <div 
             className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
             style={{ color: textColor }}
           >
              <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter break-words max-w-[150px] md:max-w-[200px]">{customText || "YOUR TEXT"}</h2>
           </div>
           <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 bg-white/50 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-full text-[8px] md:text-[10px] font-black tracking-widest uppercase">Studio Preview</div>
        </div>
        
        <div className="lg:col-span-4 space-y-8 md:space-y-10">
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter">Custom Studio</h1>
            <p className="text-sm text-[#7A7A7A] leading-relaxed">Design your unique Paperid drop. Add text, upload art, and make it yours.</p>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4">
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                <TypeIcon size={14} /> Text Overlay
              </span>
              <Input 
                placeholder="Enter text here..." 
                value={customText} 
                onChange={(e: any) => setCustomText(e.target.value)} 
              />
            </div>

            <div className="space-y-3 md:space-y-4">
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest">Select Color</span>
              <div className="flex gap-2 md:gap-3">
                {['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#FFD700'].map(color => (
                  <button 
                    key={color}
                    onClick={() => setTextColor(color)}
                    className={`w-7 h-7 md:w-8 md:h-8 rounded-full border-2 transition-all ${textColor === color ? 'border-[#1A1A1A] scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Upload size={14} /> Upload Graphic
              </span>
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full border-2 border-dashed border-[#EAEAEA] rounded-2xl p-6 md:p-10 text-center hover:border-[#1A1A1A] transition-all group disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="mx-auto animate-spin" /> : <Upload className="mx-auto mb-3 md:mb-4 text-[#BDBDBD] group-hover:text-[#1A1A1A] transition-colors" />}
                <span className="text-[9px] md:text-[11px] font-bold uppercase text-[#7A7A7A]">{isUploading ? 'Uploading...' : 'Drag & Drop Image'}</span>
              </button>
            </div>
          </div>

          <div className="pt-6 md:pt-10 border-t border-[#F6F6F6]">
            <Button className="w-full py-4 md:py-5">Add to Cart (+₹499)</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();

  if (!cartContext?.cart.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-[#F6F6F6] rounded-full flex items-center justify-center mx-auto mb-8">
          <ShoppingBag className="text-[#BDBDBD]" size={32} />
        </div>
        <h2 className="text-3xl font-black tracking-tighter uppercase mb-4">Your bag is empty</h2>
        <p className="text-[#7A7A7A] mb-10 max-w-sm mx-auto">Looks like you haven't grabbed any drops yet.</p>
        <Link to="/shop"><Button>Continue Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-20 animate-in fade-in duration-500">
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-12 md:mb-16">Your Bag</h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16">
        <div className="lg:col-span-8 space-y-8">
          {cartContext.cart.map(item => (
            <div key={item.id} className="flex gap-6 pb-8 border-b border-[#F6F6F6] items-center">
              <Link to={`/product/${item.productId}`} className="w-24 h-32 md:w-32 md:h-40 rounded-2xl overflow-hidden bg-[#F2F2F2] flex-shrink-0">
                <img src={item.image} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 space-y-2 md:space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base md:text-lg tracking-tight uppercase">{item.name}</h3>
                    <p className="text-[10px] md:text-xs font-bold text-[#7A7A7A] uppercase tracking-widest">{item.size} • {item.color}</p>
                  </div>
                  <button onClick={() => cartContext.removeFromCart(item.id)} className="p-2 text-red-500"><Trash2 size={16} /></button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 bg-[#F6F6F6] rounded-full px-4 py-2">
                    <button onClick={() => cartContext.updateQuantity(item.id, -1)}><Minus size={14}/></button>
                    <span className="text-xs font-black">{item.quantity}</span>
                    <button onClick={() => cartContext.updateQuantity(item.id, 1)}><Plus size={14}/></button>
                  </div>
                  <p className="font-black">₹{item.price * item.quantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-4 h-fit">
          <div className="bg-white border border-[#EAEAEA] rounded-3xl p-8 space-y-8 lg:sticky lg:top-32 shadow-sm">
            <h3 className="font-black text-xs uppercase tracking-[0.3em] text-[#BDBDBD]">Summary</h3>
            <div className="space-y-4 pt-4 border-t border-[#F6F6F6]">
              <div className="flex justify-between text-sm font-bold text-[#7A7A7A]"><span>Subtotal</span><span>₹{cartContext.totalPrice}.00</span></div>
              <div className="flex justify-between text-xl font-black pt-4 border-t border-[#F6F6F6]"><span>Total</span><span>₹{cartContext.totalPrice}.00</span></div>
            </div>
            <Button onClick={() => navigate('/checkout')} className="w-full">Secure Checkout</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const cartContext = useContext(CartContext);

  if (!cartContext?.cart.length) return <Navigate to="/cart" />;

  const handleCompleteOrder = async () => {
    setIsProcessing(true);
    try {
      const res = await api.createOrder(cartContext.cart);
      if (res.success) {
        const orderId = res.orderId;
        const newOrder: Order = {
          id: orderId,
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: 'Processing',
          total: cartContext.totalPrice,
          items: [...cartContext.cart],
          trackingNumber: `TRK${Math.floor(Math.random() * 100000000)}`
        };
        cartContext.addOrder(newOrder);
        cartContext.clearCart();
        navigate(`/order-success/${orderId}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10 md:py-20 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10 md:mb-16 max-w-[280px] md:max-w-md mx-auto relative">
         <div className="absolute top-1/2 left-0 w-full h-px bg-[#F6F6F6] -z-10" />
         {[1, 2, 3].map(s => (
           <div key={s} className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[10px] md:text-xs font-black transition-all ${step >= s ? 'bg-[#1A1A1A] text-white' : 'bg-[#F6F6F6] text-[#BDBDBD]'}`}>
             {step > s ? <CheckCircle size={14} /> : s}
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
        <div className="lg:col-span-7 space-y-8 md:space-y-12">
          {step === 1 && (
            <div className="space-y-6 md:space-y-8 animate-in slide-in-from-left-4 duration-300">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" placeholder="John" />
                <Input label="Last Name" placeholder="Doe" />
              </div>
              <Input label="Email Address" type="email" placeholder="john@example.com" />
              <Input label="Phone" placeholder="+91 98765 43210" />
              <Button onClick={() => setStep(2)} className="w-full">Continue to Shipping</Button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6 md:space-y-8 animate-in slide-in-from-left-4 duration-300">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Shipping</h2>
              <Input label="Street Address" placeholder="123 Luxury Lane" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="City" placeholder="Mumbai" />
                <Input label="Pincode" placeholder="400001" />
              </div>
              <div className="bg-[#F6F6F6] p-4 md:p-6 rounded-2xl flex justify-between items-center">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center"><Truck size={16}/></div>
                  <div>
                    <p className="text-[9px] md:text-xs font-black uppercase">Standard Shipping</p>
                    <p className="text-[8px] md:text-[10px] text-[#7A7A7A]">3-5 Business Days</p>
                  </div>
                </div>
                <span className="text-[8px] md:text-[10px] font-black text-green-600 uppercase">Free</span>
              </div>
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <Button variant="secondary" onClick={() => setStep(1)} className="w-full md:flex-1">Back</Button>
                <Button onClick={() => setStep(3)} className="w-full md:flex-[2]">Continue to Payment</Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6 md:space-y-8 animate-in slide-in-from-left-4 duration-300">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Payment</h2>
              <div className="space-y-3 md:space-y-4">
                {['UPI (Google Pay, PhonePe)', 'Credit / Debit Card', 'Cash on Delivery'].map(method => (
                  <label key={method} className="flex items-center gap-4 p-4 md:p-5 border border-[#EAEAEA] rounded-2xl cursor-pointer hover:bg-[#F9F9F9] transition-all">
                    <input type="radio" name="payment" className="w-4 h-4 accent-[#1A1A1A]" />
                    <span className="text-xs md:text-sm font-bold">{method}</span>
                  </label>
                ))}
              </div>
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <Button variant="secondary" onClick={() => setStep(2)} className="w-full md:flex-1">Back</Button>
                <Button 
                  onClick={handleCompleteOrder} 
                  className="w-full md:flex-[2]" 
                  isLoading={isProcessing}
                >
                  {isProcessing ? 'Processing Drop...' : 'Complete Order'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
           <div className="bg-white border border-[#EAEAEA] rounded-[24px] md:rounded-[32px] p-6 md:p-8 space-y-6 md:space-y-8 lg:sticky lg:top-32">
              <h3 className="font-bold text-[10px] md:text-xs uppercase tracking-widest text-[#7A7A7A]">Order Summary</h3>
              <div className="space-y-4 md:space-y-6 max-h-[250px] md:max-h-[300px] overflow-y-auto pr-2">
                {cartContext.cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-12 h-16 md:w-16 md:h-20 rounded-xl bg-[#F2F2F2] overflow-hidden flex-shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] md:text-xs font-bold truncate">{item.name}</p>
                      <p className="text-[8px] md:text-[10px] text-[#7A7A7A] uppercase">{item.size} • {item.quantity}x</p>
                    </div>
                    <span className="text-[10px] md:text-xs font-black">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 md:pt-6 border-t border-[#F6F6F6] space-y-3 md:space-y-4 text-[10px] md:text-xs font-bold">
                 <div className="flex justify-between text-[#7A7A7A]"><span>Subtotal</span><span>₹{cartContext.totalPrice}.00</span></div>
                 <div className="flex justify-between text-[#7A7A7A]"><span>Shipping</span><span className="text-green-600">FREE</span></div>
                 <div className="flex justify-between text-base md:text-lg font-black text-[#1A1A1A] pt-1 md:pt-2"><span>Total</span><span>₹{cartContext.totalPrice}.00</span></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const OrderSuccessPage = () => {
  const { id } = useParams();
  return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-10">
        <CheckCircle className="text-green-500" size={48} />
      </div>
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-4">Drop Secured.</h1>
      <p className="text-[#7A7A7A] mb-2 font-bold uppercase tracking-widest text-xs">Order ID: {id}</p>
      <p className="text-[#7A7A7A] max-w-sm mx-auto mb-12">Thank you for your support. We're processing your drop.</p>
      <div className="flex flex-col md:flex-row gap-4 justify-center">
        <Link to="/account"><Button variant="secondary">View Status</Button></Link>
        <Link to="/shop"><Button>Keep Shopping</Button></Link>
      </div>
    </div>
  );
};

const AuthPage = ({ mode }: { mode: 'login' | 'signup' }) => {
  const [email, setEmail] = useState('');
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authContext?.login(email);
    navigate('/account');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 md:py-32 animate-in fade-in duration-500">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic">{mode === 'login' ? 'Welcome' : 'Join'}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input label="Email Address" type="email" required value={email} onChange={(e: any) => setEmail(e.target.value)} />
        <Input label="Password" type="password" required />
        <Button className="w-full" type="submit">{mode === 'login' ? 'Sign In' : 'Create Account'}</Button>
      </form>
    </div>
  );
};

const AccountPage = () => {
  const auth = useContext(AuthContext);
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'settings'>('orders');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [activeSubView, setActiveSubView] = useState<string | null>(null);

  // Async States for Settings
  const [addressList, setAddressList] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [region, setRegion] = useState('IN');
  const [currency, setCurrency] = useState('INR');

  useEffect(() => {
    const initAccount = async () => {
      setIsLoadingContent(true);
      const [addr, pays] = await Promise.all([api.fetchAddresses(), api.fetchPayments()]);
      setAddressList(addr);
      setPayments(pays);
      setIsLoadingContent(false);
    };
    initAccount();
  }, []);

  if (!auth?.user) return <Navigate to="/login" />;

  const ProfileView = () => {
    const [formData, setFormData] = useState({
      name: auth.user?.name || '',
      email: auth.user?.email || '',
      phone: auth.user?.phone || '+91 '
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
      setIsSaving(true);
      await auth.updateUser(formData);
      setIsSaving(false);
      alert("Profile updated!");
    };

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
         <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Profile Information</h2>
            <p className="text-sm text-[#7A7A7A]">Manage your account credentials and contact details.</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-[32px] border border-[#EAEAEA] shadow-sm">
            <Input label="Display Name" value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})} />
            <Input label="Email Address" value={formData.email} disabled className="opacity-60 cursor-not-allowed" />
            <Input label="Contact Number" value={formData.phone} onChange={(e: any) => setFormData({...formData, phone: e.target.value})} />
            <div className="flex items-end">
              <Button onClick={handleSave} className="w-full" isLoading={isSaving}>Save Changes</Button>
            </div>
         </div>
      </div>
    );
  };

  const AddressesView = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [newAddr, setNewAddr] = useState({ title: '', street: '', city: '', country: 'India' });

    const handleAdd = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoadingContent(true);
      // In production: await api.addAddress(newAddr);
      setAddressList([...addressList, { ...newAddr, id: Date.now().toString(), primary: false }]);
      setIsAdding(false);
      setIsLoadingContent(false);
    };

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
         <div className="flex justify-between items-end">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Saved Addresses</h2>
            {!isAdding && <Button onClick={() => setIsAdding(true)} variant="secondary" className="hidden sm:flex">+ Add New</Button>}
         </div>

         {isAdding ? (
            <form onSubmit={handleAdd} className="bg-white p-8 rounded-[32px] border border-[#EAEAEA] space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Label" placeholder="Work, Studio" value={newAddr.title} onChange={(e: any) => setNewAddr({...newAddr, title: e.target.value})} required />
                  <Input label="City" placeholder="Mumbai" value={newAddr.city} onChange={(e: any) => setNewAddr({...newAddr, city: e.target.value})} required />
               </div>
               <Input label="Street" placeholder="123 Luxury Lane" value={newAddr.street} onChange={(e: any) => setNewAddr({...newAddr, street: e.target.value})} required />
               <div className="flex gap-4">
                  <Button type="submit" className="flex-1">Add Location</Button>
                  <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
               </div>
            </form>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {addressList.map(addr => (
                  <div key={addr.id} className={`p-8 rounded-[32px] border-2 bg-white space-y-4 ${addr.primary ? 'border-[#1A1A1A]' : 'border-[#EAEAEA]'}`}>
                     <div className="flex justify-between">
                        {addr.primary && <span className="px-3 py-1 bg-[#1A1A1A] text-white text-[9px] font-black uppercase tracking-widest rounded-full">Primary</span>}
                        <Trash2 size={16} className="text-[#BDBDBD] cursor-pointer hover:text-red-500" onClick={() => setAddressList(addressList.filter(a => a.id !== addr.id))} />
                     </div>
                     <p className="text-sm font-black uppercase">{addr.title}</p>
                     <p className="text-xs text-[#7A7A7A] leading-relaxed">{addr.street}, {addr.city}</p>
                  </div>
               ))}
               <button onClick={() => setIsAdding(true)} className="p-8 rounded-[32px] border-2 border-dashed border-[#EAEAEA] flex flex-col items-center justify-center text-[#BDBDBD] hover:border-[#1A1A1A] hover:text-[#1A1A1A] min-h-[160px] transition-all">
                  <Plus size={32} className="mb-2" />
                  <span className="text-[10px] font-black uppercase">Add Destination</span>
               </button>
            </div>
         )}
      </div>
    );
  };

  const SettingsView = () => {
    const [isAddingPayment, setIsAddingPayment] = useState(false);
    const [newPayment, setNewPayment] = useState<{ type: 'UPI' | 'CARD', value: string, provider: string }>({ type: 'UPI', value: '', provider: '' });

    if (activeSubView === 'region') {
      return (
        <div className="space-y-10 animate-in fade-in duration-500">
           <button onClick={() => setActiveSubView(null)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#7A7A7A] hover:text-[#1A1A1A]">
              <ChevronLeft size={16}/> Back
           </button>
           <div className="space-y-8 max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Region & Currency</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-[32px] border border-[#EAEAEA]">
                 <Select label="Your Region" value={region} onChange={(e: any) => setRegion(e.target.value)} options={[{ value: 'IN', label: 'India' }, { value: 'US', label: 'United States' }]} />
                 <Select label="Currency" value={currency} onChange={(e: any) => setCurrency(e.target.value)} options={[{ value: 'INR', label: 'INR (₹)' }, { value: 'USD', label: 'USD ($)' }]} />
                 <div className="md:col-span-2 pt-4">
                    <Button onClick={() => setActiveSubView(null)} className="w-full">Update Localization</Button>
                 </div>
              </div>
           </div>
        </div>
      );
    }

    if (activeSubView === 'payments') {
      return (
        <div className="space-y-10 animate-in fade-in duration-500">
           <button onClick={() => setActiveSubView(null)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#7A7A7A] hover:text-[#1A1A1A]">
              <ChevronLeft size={16}/> Back
           </button>
           <div className="space-y-8 max-w-2xl">
              <div className="flex justify-between items-end">
                 <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Stored Payments</h2>
                 {!isAddingPayment && <Button onClick={() => setIsAddingPayment(true)} variant="secondary" className="text-[10px] px-4 py-2">+ Add</Button>}
              </div>
              {isAddingPayment ? (
                <form onSubmit={(e) => { e.preventDefault(); setPayments([...payments, { ...newPayment, id: Date.now().toString() }]); setIsAddingPayment(false); }} className="bg-white border border-[#EAEAEA] p-8 rounded-[32px] space-y-6">
                   <div className="flex gap-4">
                      {['UPI', 'CARD'].map(t => (
                        <button key={t} type="button" onClick={() => setNewPayment({...newPayment, type: t as any})} className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs ${newPayment.type === t ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-[#F6F6F6] border-transparent'}`}>{t}</button>
                      ))}
                   </div>
                   <Input label={newPayment.type === 'UPI' ? 'UPI ID' : 'Card Number'} placeholder="xxxx@okaxis" value={newPayment.value} onChange={(e: any) => setNewPayment({...newPayment, value: e.target.value})} required />
                   <div className="flex gap-4">
                      <Button type="submit" className="flex-1">Save</Button>
                      <Button type="button" variant="secondary" onClick={() => setIsAddingPayment(false)}>Cancel</Button>
                   </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {payments.map(pay => (
                    <div key={pay.id} className="p-6 bg-white border border-[#EAEAEA] rounded-[24px] flex justify-between items-center hover:border-[#1A1A1A] transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#F6F6F6] rounded-full flex items-center justify-center text-[#7A7A7A]">
                              {pay.type === 'UPI' ? <Smartphone size={18}/> : <CreditCardIcon size={18}/>}
                          </div>
                          <div><p className="text-xs font-black uppercase">{pay.value}</p><p className="text-[10px] text-[#7A7A7A] font-bold uppercase">{pay.provider}</p></div>
                        </div>
                        <Trash2 size={16} className="text-[#BDBDBD] cursor-pointer hover:text-red-500" onClick={() => setPayments(payments.filter(p => p.id !== pay.id))} />
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>
      );
    }

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
         <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Account Hub</h2>
            <p className="text-sm text-[#7A7A7A]">Control your experience and platform preferences.</p>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div onClick={() => setActiveSubView('region')} className="p-6 md:p-8 bg-white border border-[#EAEAEA] rounded-[32px] hover:border-[#1A1A1A] transition-all group cursor-pointer space-y-4">
               <div className="w-12 h-12 bg-[#F6F6F6] rounded-2xl flex items-center justify-center text-[#7A7A7A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-all"><Globe size={20}/></div>
               <div><p className="text-xs font-black uppercase tracking-tight">Region & Currency</p><p className="text-[10px] text-[#7A7A7A] mt-1">{region} ({currency})</p></div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest">Configure <ArrowRight size={12}/></div>
            </div>
            <div onClick={() => setActiveSubView('payments')} className="p-6 md:p-8 bg-white border border-[#EAEAEA] rounded-[32px] hover:border-[#1A1A1A] transition-all group cursor-pointer space-y-4">
               <div className="w-12 h-12 bg-[#F6F6F6] rounded-2xl flex items-center justify-center text-[#7A7A7A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-all"><CreditCardIcon size={20}/></div>
               <div><p className="text-xs font-black uppercase tracking-tight">Stored Payments</p><p className="text-[10px] text-[#7A7A7A] mt-1">{payments.length} Saved Methods</p></div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-[#1A1A1A] uppercase tracking-widest">Manage <ArrowRight size={12}/></div>
            </div>
         </div>
      </div>
    );
  };

  const OrdersView = () => (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Order History</h2>
      <div className="space-y-4 md:space-y-6">
        {(cartContext?.orders || []).length > 0 ? cartContext?.orders.map((order, idx) => (
          <div key={order.id} className="border border-[#EAEAEA] rounded-[24px] md:rounded-[32px] p-6 md:p-8 space-y-4 animate-in fade-in duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
             <div className="flex justify-between items-center pb-4 border-b border-[#F6F6F6]">
                <div><p className="text-[9px] font-black uppercase text-[#BDBDBD] tracking-[0.2em]">#{order.id}</p><p className="text-xs font-bold uppercase">{order.date}</p></div>
                <span className="px-3 py-1 bg-green-50 text-green-600 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-full">{order.status}</span>
             </div>
             <div className="flex gap-4">
                {order.items.map((item, i) => <img key={i} src={item.image} className="w-12 h-16 bg-[#F2F2F2] rounded-lg object-cover" />)}
             </div>
             <div className="flex justify-between items-center pt-2">
                <p className="text-[10px] md:text-xs font-bold">Total: <span className="font-black">₹{order.total}</span></p>
                <Link to="/track"><Button variant="secondary" className="px-4 py-1.5 h-auto text-[10px]">Track</Button></Link>
             </div>
          </div>
        )) : (
          <div className="py-20 text-center space-y-4 bg-[#F6F6F6] rounded-[32px]">
             <p className="text-[#BDBDBD] font-black uppercase text-[10px] tracking-widest">No orders found yet.</p>
             <Link to="/shop"><Button variant="outline">Browse Archive</Button></Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 md:py-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-10 md:gap-16">
        <aside className="w-full md:w-72 space-y-2">
          <div className="mb-6 p-8 bg-[#F6F6F6] rounded-[32px] text-center md:text-left border border-white">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-xl font-black mb-4 mx-auto md:mx-0 shadow-sm">{auth.user?.name.charAt(0) || 'U'}</div>
             <p className="font-black text-sm uppercase tracking-tight">{auth.user.name}</p>
             <p className="text-[10px] text-[#7A7A7A] truncate mt-1">{auth.user.email}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            {[
              { id: 'orders', label: 'Orders', icon: <ShoppingBag size={14}/> },
              { id: 'profile', label: 'Profile', icon: <User size={14}/> },
              { id: 'addresses', label: 'Addresses', icon: <MapPin size={14}/> },
              { id: 'settings', label: 'Settings', icon: <Settings size={14}/> }
            ].map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setActiveSubView(null); }} className={`w-full text-left px-6 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-4 transition-all ${activeTab === tab.id ? 'bg-[#1A1A1A] text-white shadow-lg shadow-black/10' : 'hover:bg-[#F6F6F6] text-[#7A7A7A] hover:text-[#1A1A1A]'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
            <div className="h-px bg-[#F6F6F6] my-4" />
            <button onClick={() => { auth.logout(); navigate('/'); }} className="w-full text-left px-6 py-4 rounded-2xl hover:bg-red-50 text-red-500 text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-4"><X size={14}/> Logout</button>
          </div>
        </aside>

        <div className="flex-1">
          {isLoadingContent ? <LoadingSpinner /> : (
            <>
              {activeTab === 'orders' && <OrdersView />}
              {activeTab === 'profile' && <ProfileView />}
              {activeTab === 'addresses' && <AddressesView />}
              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // In production: const res = await api.trackOrder(orderId);
    await new Promise(r => setTimeout(r, 1200));
    setIsSearching(false);
    setResult({ status: 'In Transit', location: 'Bengaluru Distribution Hub', date: '24 Oct' });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 md:py-32 text-center animate-in fade-in duration-500">
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-8">Track Drop</h1>
      <form onSubmit={handleTrack} className="space-y-6">
        <Input label="Order ID" placeholder="PI-XXXXX" required value={orderId} onChange={(e: any) => setOrderId(e.target.value)} />
        <Button className="w-full" isLoading={isSearching}>Locate Package</Button>
      </form>
      {result && !isSearching && (
        <div className="mt-12 p-8 bg-white border border-[#EAEAEA] rounded-[32px] space-y-4">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">{result.status}</p>
           <h3 className="text-xl font-black uppercase">{result.location}</h3>
           <p className="text-xs text-[#7A7A7A] uppercase font-bold">Estimated Arrival: {result.date}</p>
        </div>
      )}
    </div>
  );
};

const Footer = () => (
  <footer className="bg-[#1A1A1A] text-white pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
      <div className="space-y-6">
        <Link to="/" className="text-2xl font-black tracking-tighter">PAPERID<span className="text-white">.</span></Link>
        <p className="text-[#7A7A7A] text-sm leading-relaxed">Defining the next generation of fan-driven streetwear.</p>
      </div>
      <div className="space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7A7A7A]">Navigation</h4>
        <ul className="space-y-4 text-sm font-bold uppercase tracking-tight">
          <li><Link to="/shop">The Archive</Link></li>
          <li><Link to="/custom">Studio</Link></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-10 border-t border-white/5 text-[10px] font-bold text-[#7A7A7A] uppercase tracking-widest text-center md:text-left">
      <p>© 2024 PAPERID STUDIO. ALL RIGHTS RESERVED.</p>
    </div>
  </footer>
);

// --- Root Component ---

const App = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial Auth Check / Profile Sync
    const syncAuth = async () => {
      // In production: const userData = await api.getProfile().catch(() => null);
      // setUser(userData);
      setIsLoading(false);
    };
    syncAuth();
  }, []);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };
  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const addOrder = (order: Order) => setOrders(prev => [order, ...prev]);
  const clearCart = () => setCart([]);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const updateUser = async (data: Partial<UserType>) => {
    const res = await api.updateProfile(data);
    if (res.success) setUser(prev => prev ? { ...prev, ...data } : null);
  };

  if (isLoading) return <div className="h-screen w-full flex items-center justify-center bg-white"><LoadingSpinner /></div>;

  return (
    <AuthContext.Provider value={{ user, isLoading, login: async (e) => setUser({ id: '1', name: 'Guest', email: e }), updateUser, logout: () => setUser(null) }}>
      <CartContext.Provider value={{ cart, wishlist, orders, addToCart, removeFromCart, updateQuantity, toggleWishlist, addOrder, totalItems, totalPrice, clearCart }}>
        <HashRouter>
          <div className="flex flex-col min-h-screen selection:bg-indigo-100">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/custom" element={<CustomizationPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                <Route path="/login" element={<AuthPage mode="login" />} />
                <Route path="/signup" element={<AuthPage mode="signup" />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/track" element={<TrackOrderPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </HashRouter>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;
