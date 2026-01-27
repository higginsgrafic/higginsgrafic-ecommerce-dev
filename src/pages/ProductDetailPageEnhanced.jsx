import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  Share2,
  ShoppingCart,
  Truck,
  Shield,
  Package,
  AlertCircle,
  Loader2,
  Check,
  Info,
  Star,
  Leaf,
  Zap,
  Clock,
  Ruler,
  Droplet,
  Coffee,
  ThermometerSun,
  MessageCircle,
  Gift,
  RotateCcw,
  BadgeCheck,
  ChevronDown,
  Globe
} from 'lucide-react';
import { productsService } from '@/api/supabase-products';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';
import { useProductContext } from '@/contexts/ProductContext';
import EpisodeControls from '@/components/EpisodeControls';
import EpisodeDisplay from '@/components/EpisodeDisplay';
import { formatPrice } from '@/utils/formatters';

const EPISODES_VERSION = '1.1';

const STAR_TREK_EPISODES = [
  { season: 1, episode: 28, title: 'LA CIUTAT A LA FRONTERA DEL FUTUR', text: "McCoy desapareix, com si res,  per un portal temporal i, amb ell, tot record de la Federació. Així, Kirk troba l'amor perdut en una època inexistent. T'atreveixes a ser part d'aquesta història?" },
  { season: 1, episode: 22, title: "LA LLAVOR DE L'ESPAI", text: "Khan, el superhome del passat, té grans somnis i es desperta amb fam de conquesta. Traïció, seducció i ambició. El preu del poder serà molt car. T'atreveixes a ser part d'aquesta història?" },
  { season: 2, episode: 5, title: "L'ÈPOCA DE L'AMOK", text: "Es trenca l'amistat quan has de lluitar fins a la mort? El foc de Vulcà, ancestral, crema dins de Spock. L'hora greu tomba sobre el combat ritual. T'atreveixes a ser part d'aquesta història?" },
  { season: 2, episode: 10, title: 'MIRALLET, MIRALLET', text: "I si existís un lloc on la Federació és un Imperi brutal i cruel que conquereix amb violència tot allò que vol? Kirk n'haurà de fugir per poder tornar a casa. T'atreveixes a ser part d'aquesta història?" },
  { season: 2, episode: 13, title: 'EL PROBLEMA DELS TRIBBLES', text: "Avui, unes entranyables boles de pèl han començat a envair cada racó de la nau. Es multipliquen sense parar i consumeixen tot el que troben. T'atreveixes a ser part d'aquesta història?" },
  { season: 1, episode: 14, title: "L'EQUILIBRI DE LA POR", text: "Una nau fantasma travessa la fosca de l'espai tot trencant el silenci. Els Romulans han tornat cent anys després! Què deuen tramar aquests, ara. T'atreveixes a ser part d'aquesta història?" },
  { season: 1, episode: 18, title: 'ARENA', text: "Kirk s'enfronta, en una platja, enmig del no-res, a un Gorn -la il·lustració contra l'instint. Ha de superar el repte de l'explorador: sobreviure. T'atreveixes a ser part d'aquesta història?" },
  { season: 2, episode: 6, title: 'LA MÀQUINA DEL JUDICI FINAL', text: "Decker, capità desaparegut mesos enrere i obsessionat amb venjar la seva tripulació, vol, com sigui, destruir l'arma \"devoradora de planetes\". T'atreveixes a ser part d'aquesta història?" },
  { season: 2, episode: 15, title: 'VIATGE A BABEL', text: "Sarek i Spock naveguen en silenci mentre un assassí vaga entre els ambaixadors. L'honor contra l'amor xoquen amb força. T'atreveixes a ser part d'aquesta història?" },
  { season: 1, episode: 25, title: 'EL MONSTRE AMAGAT', text: "A Janus VI hi passen coses estranyes, no ho has pas sentit? Hi ha accidents misteriosos. La Federació creu que hi ha d'haver una explicació. T'atreveixes a ser part d'aquesta història?" },
  { season: 1, episode: 27, title: 'ELS SALVADORS, SALVATS', text: "La guerra contra els Klingon, ja és aquí. La Federació arriba a Orgània per oferir ajut defensiu, malgrat que, la gent, no sembli gens preocupada. T'atreveixes a ser part d'aquesta història?" },
  { season: 1, episode: 11, title: 'EL ZOO', text: "Spock navega cap a un món prohibit on la mort és el càstig segur. La lleialtat supera la freda lògica. L'amistat crida des del dolor intens. T'atreveixes a ser part d'aquesta història?" }
];

export default function ProductDetailPageEnhanced() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { addToCart, isInWishlist, toggleWishlist } = useProductContext();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [expandedSection, setExpandedSection] = useState('specs');

  const [episodeIndex, setEpisodeIndex] = useState(0);
  const [editableEpisodes, setEditableEpisodes] = useState(STAR_TREK_EPISODES);
  const [isEditingEpisodeText, setIsEditingEpisodeText] = useState(false);
  const [editedEpisodeText, setEditedEpisodeText] = useState('');

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    if (!product?.id) return;
    const key = `starTrekEpisodes_${product.id}`;
    const versionKey = `starTrekEpisodesVersion_${product.id}`;
    const savedVersion = localStorage.getItem(versionKey);
    const saved = localStorage.getItem(key);

    if (savedVersion === EPISODES_VERSION && saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEditableEpisodes(parsed);
        } else {
          setEditableEpisodes(STAR_TREK_EPISODES);
        }
      } catch {
        setEditableEpisodes(STAR_TREK_EPISODES);
      }
    } else {
      localStorage.setItem(versionKey, EPISODES_VERSION);
      setEditableEpisodes(STAR_TREK_EPISODES);
    }

    const idxKey = `starTrekEpisodeIndex_${product.id}`;
    const savedIndex = localStorage.getItem(idxKey);
    const idx = savedIndex ? parseInt(savedIndex) : 0;
    setEpisodeIndex(Number.isFinite(idx) ? Math.max(0, Math.min(idx, STAR_TREK_EPISODES.length - 1)) : 0);
  }, [product?.id]);

  useEffect(() => {
    if (!product?.id) return;
    localStorage.setItem(`starTrekEpisodes_${product.id}`, JSON.stringify(editableEpisodes));
  }, [editableEpisodes, product?.id]);

  useEffect(() => {
    if (!product?.id) return;
    localStorage.setItem(`starTrekEpisodeIndex_${product.id}`, episodeIndex.toString());
  }, [episodeIndex, product?.id]);

  const currentEpisode = editableEpisodes[episodeIndex] || editableEpisodes[0];

  const handleEpisodePrevious = () => {
    setEpisodeIndex(prev => Math.max(0, prev - 1));
    setIsEditingEpisodeText(false);
  };

  const handleEpisodeNext = () => {
    setEpisodeIndex(prev => Math.min(editableEpisodes.length - 1, prev + 1));
    setIsEditingEpisodeText(false);
  };

  const handleEpisodeDoubleClick = () => {
    setIsEditingEpisodeText(true);
    setEditedEpisodeText(currentEpisode?.text || '');
  };

  const handleEpisodeSave = () => {
    setEditableEpisodes(prev => {
      const next = [...prev];
      if (next[episodeIndex]) {
        next[episodeIndex] = { ...next[episodeIndex], text: editedEpisodeText };
      }
      return next;
    });
    setIsEditingEpisodeText(false);
  };

  const handleEpisodeCancel = () => {
    setIsEditingEpisodeText(false);
    setEditedEpisodeText('');
  };

  useEffect(() => {
    if (!product || !product.variants || product.variants.length === 0) return;

    const availableVariants = product.variants.filter(v => v.isAvailable);
    if (availableVariants.length > 0) {
      const firstVariant = availableVariants[0];
      setSelectedSize(firstVariant.size);
      setSelectedColor(firstVariant.color);
      setSelectedVariant(firstVariant);
    }
  }, [product]);

  useEffect(() => {
    if (!product || !selectedSize || !selectedColor) return;

    const variant = product.variants.find(
      v => v.size === selectedSize && v.color === selectedColor
    );

    if (variant) {
      setSelectedVariant(variant);
    }
  }, [selectedSize, selectedColor, product]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const productData = await productsService.getProductById(id);

      if (!productData) {
        setError('Producte no trobat');
        return;
      }

      setProduct(productData);
    } catch (err) {
      console.error('Error loading product:', err);
      setError(err?.message || 'Error carregant el producte');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSizes = () => {
    if (!product || !product.variants) return [];
    const sizes = [...new Set(product.variants.map(v => v.size))];
    return sizes.filter(size =>
      product.variants.some(v => v.size === size && v.isAvailable)
    );
  };

  const getAvailableColorsForSize = (size) => {
    if (!product || !product.variants) return [];
    return product.variants.filter(v => v.size === size && v.isAvailable);
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    const availableColors = getAvailableColorsForSize(size);
    if (availableColors.length > 0) {
      setSelectedColor(availableColors[0].color);
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      showError('Selecciona una variant abans d\'afegir al cistell');
      return;
    }

    addToCart(product, selectedSize, quantity);
    success('Producte afegit al cistell');
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
    const inWishlist = isInWishlist(product.id);
    success(inWishlist ? 'Eliminat de favorits' : 'Afegit a favorits');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Enllaç copiat al porta-retalls');
    }
  };

  const openGallery = (index) => {
    setSelectedImageIndex(index);
    setShowGalleryModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setShowGalleryModal(false);
    document.body.style.overflow = 'auto';
  };

  const nextGalleryImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevGalleryImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gray-900 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-roboto">Carregant producte...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="font-oswald text-2xl font-bold text-gray-900 mb-2">
            {error || 'Producte no trobat'}
          </h2>
          <Button
            onClick={() => navigate('/fulfillment')}
            className="mt-4"
            style={{ backgroundColor: '#141414', color: '#FFFFFF' }}
          >
            Tornar al catàleg
          </Button>
        </div>
      </div>
    );
  }

  const availableSizes = getAvailableSizes();
  const availableColors = selectedSize ? getAvailableColorsForSize(selectedSize) : [];
  const currentPrice = selectedVariant?.price || product.price;

  const productSpecs = {
    capacity: selectedSize === '11oz' ? '325ml' : '444ml',
    height: selectedSize === '11oz' ? '9.5cm' : '11.9cm',
    diameter: selectedSize === '11oz' ? '8.2cm' : '8.2cm',
    weight: selectedSize === '11oz' ? '312g' : '445g',
    material: 'Ceràmica blanca de primera qualitat',
    finish: 'Acabat brillant amb impressió sublimada',
    dishwasher: 'Apte per rentavaixelles (cicle superior)',
    microwave: 'Apte per microones',
    printArea: 'Impressió envoltant completa de 360°',
    durability: 'Impressió resistent a ratllades i esvaïment',
    origin: 'Fabricat a Europa (print on demand)',
    packaging: 'Embalatge protector amb materials reciclats'
  };

  const reviews = [
    {
      id: 1,
      author: 'Maria S.',
      rating: 5,
      date: '15 de novembre, 2024',
      comment: 'Qualitat excepcional! La impressió és perfecta i els colors són vibrants. Molt millor del que esperava.',
      verified: true
    },
    {
      id: 2,
      author: 'Joan P.',
      rating: 5,
      date: '8 de novembre, 2024',
      comment: 'M\'encanta aquesta tassa! El disseny és preciós i la qualitat és molt bona. Perfecta per al meu cafè del matí.',
      verified: true
    },
    {
      id: 3,
      author: 'Anna M.',
      rating: 4,
      date: '2 de novembre, 2024',
      comment: 'Molt bona tassa, però va trigar una mica a arribar. La qualitat compensa l\'espera.',
      verified: true
    }
  ];

  const faqs = [
    {
      question: 'És segura per microones i rentavaixelles?',
      answer: 'Sí, aquesta tassa és completament segura per microones i rentavaixelles. Recomanem utilitzar el cicle superior del rentavaixelles per mantenir la impressió en perfecte estat durant més temps.'
    },
    {
      question: 'Quina és la diferència entre 11oz i 15oz?',
      answer: 'La tassa de 11oz (325ml) és ideal per cafè o te, mentre que la de 15oz (444ml) ofereix més capacitat, perfecta per infusions o begudes grans. Ambdues tenen la mateixa qualitat i disseny.'
    },
    {
      question: 'Es pot personalitzar amb el meu propi disseny?',
      answer: 'Actualment aquest producte està disponible amb el disseny oficial de la col·lecció Austen. Contacta\'ns si estàs interessat en personalitzacions per comandes especials.'
    },
    {
      question: 'Quant de temps triga la producció?',
      answer: 'Com que utilitzem print on demand, cada tassa s\'imprimeix específicament per a tu. El procés de producció triga 2-5 dies laborables, més el temps d\'enviament.'
    },
    {
      question: 'Què passa si la tassa arriba trencada?',
      answer: 'Si el producte arriba danyat, contacta\'ns en un termini de 7 dies i t\'enviarem una substitució gratuïta. La teva satisfacció és la nostra prioritat.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>{product.name} | GRÀFIC</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.images[0]} />
      </Helmet>

      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <nav className="pt-[17px] lg:pt-[25px] pb-4 ml-[5px]">
            <ol className="flex items-center space-x-2 text-sm uppercase">
              <li><Link to="/" className="text-gray-500 hover:text-gray-900 transition-colors">Inici</Link></li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li><Link to="/fulfillment" className="text-gray-500 hover:text-gray-900 transition-colors">Catàleg</Link></li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li><Link to={`/${product.collection}`} className="text-gray-500 hover:text-gray-900 transition-colors">{product.collection}</Link></li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li className="text-gray-900 font-medium truncate">{product.name}</li>
            </ol>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <div
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group relative"
                onClick={() => openGallery(selectedImageIndex)}
              >
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.svg';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-oswald uppercase">
                    ★ 4.8 (127 valoracions)
                  </span>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-oswald uppercase">
                    Print on Demand
                  </span>
                </div>
              </div>

              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === selectedImageIndex
                          ? 'border-gray-900'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - Vista ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.svg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <Leaf className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <p className="text-xs font-oswald font-semibold text-green-900">ECO-FRIENDLY</p>
                  <p className="text-xs text-green-700">Producció sostenible</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <BadgeCheck className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-xs font-oswald font-semibold text-blue-900">GARANTIA</p>
                  <p className="text-xs text-blue-700">100% satisfacció</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-oswald uppercase text-muted-foreground">
                    {product.collection}
                  </span>
                  <span className="inline-block px-3 py-1 bg-green-100 rounded-full text-xs font-oswald uppercase text-green-600">
                    BEST SELLER
                  </span>
                </div>
                <h1 className="font-oswald text-4xl lg:text-5xl font-bold uppercase mb-3 text-foreground">
                  {product.name}
                </h1>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm font-roboto text-muted-foreground">4.8 (127 valoracions)</span>
                </div>

                <div className="flex items-baseline gap-3 mb-6">
                  <p className="font-oswald text-4xl font-normal text-foreground">
                    {formatPrice(currentPrice)}
                  </p>
                  {selectedVariant && selectedVariant.price !== product.price && (
                    <p className="font-roboto text-xl text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <EpisodeControls
                    currentEpisode={currentEpisode}
                    onPrevious={handleEpisodePrevious}
                    onNext={handleEpisodeNext}
                    layout="mobile"
                  />
                  <EpisodeDisplay
                    currentEpisode={currentEpisode}
                    isEditing={isEditingEpisodeText}
                    editedText={editedEpisodeText}
                    onTextChange={setEditedEpisodeText}
                    onSave={handleEpisodeSave}
                    onCancel={handleEpisodeCancel}
                    onDoubleClick={handleEpisodeDoubleClick}
                    layout="mobile"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-oswald font-semibold text-sm text-yellow-900 mb-1">OFERTA ESPECIAL</p>
                      <p className="text-sm font-roboto text-yellow-800">Enviament gratuït en comandes de 50€ o més. Només avui!</p>
                    </div>
                  </div>
                </div>
              </div>

              {availableSizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-oswald font-semibold text-lg uppercase text-foreground">
                      Capacitat
                    </h3>
                    {selectedSize && (
                      <span className="text-sm font-roboto text-muted-foreground">
                        {productSpecs.capacity} ({selectedSize})
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map((size) => {
                      const sizePrice = product.variants.find(v => v.size === size)?.price || product.price;
                      return (
                        <button
                          key={size}
                          onClick={() => handleSizeChange(size)}
                          className={`flex-1 min-w-[140px] px-4 py-4 border-2 rounded-lg transition-all ${
                            selectedSize === size
                              ? 'border-foreground bg-foreground text-white'
                              : 'border-gray-300 hover:border-foreground'
                          }`}
                        >
                          <div className="font-oswald font-bold text-lg">{size}</div>
                          <div className={`text-xs ${selectedSize === size ? 'text-gray-300' : 'text-muted-foreground'}`}>
                            {size === '11oz' ? '325ml' : '444ml'} • {formatPrice(sizePrice)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {availableColors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-oswald font-semibold text-lg uppercase text-foreground">
                      Color
                    </h3>
                    {selectedColor && (
                      <span className="text-sm font-roboto text-muted-foreground">
                        {selectedColor}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((variant) => (
                      <button
                        key={`${variant.size}-${variant.color}`}
                        onClick={() => handleColorChange(variant.color)}
                        className={`group relative transition-all ${
                          selectedColor === variant.color ? 'scale-110' : ''
                        }`}
                        title={`${variant.color} - ${formatPrice(variant.price)}`}
                      >
                        <div
                          className={`w-14 h-14 rounded-lg border-4 transition-all ${
                            selectedColor === variant.color
                              ? 'border-gray-900 shadow-lg'
                              : 'border-gray-300 group-hover:border-gray-500'
                          }`}
                          style={{ backgroundColor: variant.colorHex }}
                        />
                        {selectedColor === variant.color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-7 h-7 text-white drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.6))' }} />
                          </div>
                        )}
                        {variant.stock < 10 && variant.stock > 0 && (
                          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-oswald">
                            {variant.stock}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedVariant && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-oswald font-bold text-base uppercase text-gray-900">
                      Resum de la teva selecció
                    </h4>
                    <Info className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm font-roboto">
                    <div>
                      <p className="text-gray-700 mb-1">Talla / Capacitat</p>
                      <p className="font-semibold text-gray-900">{selectedVariant.size} ({productSpecs.capacity})</p>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-1">Color</p>
                      <p className="font-semibold text-gray-900">{selectedVariant.color}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-1">Preu</p>
                      <p className="font-semibold text-gray-900">{formatPrice(selectedVariant.price)}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 mb-1">Disponibilitat</p>
                      <p className="font-semibold text-green-600 flex items-center gap-1">
                        <Check className="w-4 h-4" /> En estoc
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-700">SKU: <span className="font-mono">{selectedVariant.sku}</span></p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-roboto text-gray-600">Quantitat:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-oswald font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!selectedVariant}
                    className="flex-1 h-14 text-base font-oswald uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#141414', color: '#FFFFFF' }}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Afegir al Cistell
                  </Button>
                  <Button
                    onClick={handleWishlistToggle}
                    variant="outline"
                    className="h-14 px-5 border-2"
                    style={{ borderColor: '#141414', color: '#141414' }}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="h-14 px-5 border-2"
                    style={{ borderColor: '#141414', color: '#141414' }}
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <Truck className="w-10 h-10 mx-auto mb-2" style={{ color: '#141414' }} />
                  <p className="text-xs font-roboto font-medium mb-1" style={{ color: '#141414' }}>
                    Enviament Gratuït
                  </p>
                  <p className="text-xs text-gray-600">comandes +50€</p>
                </div>
                <div className="text-center">
                  <Clock className="w-10 h-10 mx-auto mb-2" style={{ color: '#141414' }} />
                  <p className="text-xs font-roboto font-medium mb-1" style={{ color: '#141414' }}>
                    Producció 2-5 dies
                  </p>
                  <p className="text-xs text-gray-600">print on demand</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-10 h-10 mx-auto mb-2" style={{ color: '#141414' }} />
                  <p className="text-xs font-roboto font-medium mb-1" style={{ color: '#141414' }}>
                    Devolucions 30 dies
                  </p>
                  <p className="text-xs text-gray-600">sense preguntes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 space-y-6">
            <div className="border-b border-gray-200">
              <div className="flex gap-8">
                {['description', 'specs', 'reviews', 'faq'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 font-oswald font-semibold uppercase tracking-wider transition-colors ${
                      activeTab === tab
                        ? 'border-b-2 border-foreground text-foreground'
                        : 'text-gray-500 hover:text-foreground'
                    }`}
                  >
                    {tab === 'description' && 'Descripció'}
                    {tab === 'specs' && 'Especificacions'}
                    {tab === 'reviews' && 'Valoracions'}
                    {tab === 'faq' && 'Preguntes'}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h2 className="font-oswald text-2xl font-bold mb-4">Sobre aquest producte</h2>
                <div className="mb-4">
                  <EpisodeControls
                    currentEpisode={currentEpisode}
                    onPrevious={handleEpisodePrevious}
                    onNext={handleEpisodeNext}
                    layout="mobile"
                  />
                  <EpisodeDisplay
                    currentEpisode={currentEpisode}
                    isEditing={isEditingEpisodeText}
                    editedText={editedEpisodeText}
                    onTextChange={setEditedEpisodeText}
                    onSave={handleEpisodeSave}
                    onCancel={handleEpisodeCancel}
                    onDoubleClick={handleEpisodeDoubleClick}
                    layout="mobile"
                  />
                </div>
                <h3 className="font-oswald text-xl font-semibold mb-3">Característiques destacades</h3>
                <ul className="space-y-2 font-roboto">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Impressió sublimada d'alta qualitat amb colors vibrants que no s'esvaeixen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Ceràmica premium de primera qualitat amb acabat brillant professional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Apte per microones i rentavaixelles per a una màxima comoditat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Disseny envoltant de 360° per gaudir de la imatge des de qualsevol angle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Producció sostenible amb materials i processos respectuosos amb el medi ambient</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Embalatge protector amb materials reciclats per garantir una arribada perfecta</span>
                  </li>
                </ul>

                <div className="mt-8 grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <Coffee className="w-8 h-8 text-blue-600 mb-3" />
                    <h4 className="font-oswald font-bold text-lg mb-2 text-blue-900">Perfecta per a cada moment</h4>
                    <p className="text-sm font-roboto text-blue-800">
                      Ja sigui per al teu cafè del matí, el te de la tarda o una xocolata calenta abans de dormir, aquesta tassa és la companya perfecta per a totes les teves begudes preferides.
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <Gift className="w-8 h-8 text-green-600 mb-3" />
                    <h4 className="font-oswald font-bold text-lg mb-2 text-green-900">Regal ideal</h4>
                    <p className="text-sm font-roboto text-green-800">
                      Un detall únic i especial per als amants de Jane Austen i la literatura clàssica. Perfecte per aniversaris, Nadal o qualsevol ocasió especial.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-4">
                <h2 className="font-oswald text-2xl font-bold mb-6">Especificacions tècniques</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-oswald font-semibold text-lg uppercase mb-4 text-gray-900">Dimensions i capacitat</h3>
                    {Object.entries({
                      'Capacitat': productSpecs.capacity,
                      'Alçada': productSpecs.height,
                      'Diàmetre': productSpecs.diameter,
                      'Pes': productSpecs.weight
                    }).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-roboto text-gray-600">{key}</span>
                        <span className="font-roboto font-semibold text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-oswald font-semibold text-lg uppercase mb-4 text-gray-900">Materials i acabats</h3>
                    {Object.entries({
                      'Material': productSpecs.material,
                      'Acabat': productSpecs.finish,
                      'Zona d\'impressió': productSpecs.printArea,
                      'Durabilitat': productSpecs.durability
                    }).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-roboto text-gray-600">{key}</span>
                        <span className="font-roboto font-semibold text-gray-900 text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h3 className="font-oswald font-semibold text-lg uppercase mb-4 flex items-center gap-2">
                    <Droplet className="w-5 h-5 text-blue-600" />
                    Instruccions de cura
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-oswald font-semibold mb-2 text-green-600 flex items-center gap-2">
                        <Check className="w-4 h-4" /> Recomanat
                      </h4>
                      <ul className="space-y-2 text-sm font-roboto">
                        <li>✓ Rentar a mà amb sabó suau per una major durabilitat</li>
                        <li>✓ Utilitzar el cicle superior del rentavaixelles</li>
                        <li>✓ Escalfar líquids al microones fins a 2 minuts</li>
                        <li>✓ Deixar refredar abans de rentar</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-oswald font-semibold mb-2 text-red-600 flex items-center gap-2">
                        <X className="w-4 h-4" /> Evitar
                      </h4>
                      <ul className="space-y-2 text-sm font-roboto">
                        <li>✗ No utilitzar esponges abrasives</li>
                        <li>✗ No exposar a canvis bruscos de temperatura</li>
                        <li>✗ No escalfar buit al microones</li>
                        <li>✗ No utilitzar en el forn convencional</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <ThermometerSun className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <p className="font-oswald font-semibold text-sm text-blue-900">MICROONES</p>
                    <p className="text-xs text-blue-700">Apte i segur</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <Droplet className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="font-oswald font-semibold text-sm text-green-900">RENTAVAIXELLES</p>
                    <p className="text-xs text-green-700">Cicle superior</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p className="font-oswald font-semibold text-sm text-slate-900">ORIGEN</p>
                    <p className="text-xs text-slate-700">{productSpecs.origin}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-oswald text-2xl font-bold">Valoracions dels clients</h2>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      <span className="font-oswald text-2xl font-bold">4.8</span>
                    </div>
                    <span className="text-sm font-roboto text-gray-600">(127 valoracions)</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-5 gap-4 mb-8 p-6 bg-gray-50 rounded-lg">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-sm font-roboto text-gray-700">{stars}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: stars === 5 ? '75%' : stars === 4 ? '20%' : stars === 3 ? '3%' : stars === 2 ? '1%' : '1%'
                          }}
                        />
                      </div>
                      <span className="text-xs font-roboto text-gray-600">
                        {stars === 5 ? '95' : stars === 4 ? '25' : stars === 3 ? '4' : stars === 2 ? '2' : '1'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-oswald font-semibold text-lg">{review.author}</span>
                            {review.verified && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-oswald">
                                ✓ VERIFICAT
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-roboto text-gray-500">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="font-roboto text-base text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    className="border-2"
                    style={{ borderColor: '#141414', color: '#141414' }}
                  >
                    Veure totes les valoracions
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div>
                <h2 className="font-oswald text-2xl font-bold mb-6">Preguntes freqüents</h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleSection(`faq-${index}`)}
                        className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-oswald font-semibold text-left">{faq.question}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-600 transition-transform flex-shrink-0 ml-4 ${
                            expandedSection === `faq-${index}` ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedSection === `faq-${index}` && (
                        <div className="p-5 pt-0 font-roboto text-gray-700">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <MessageCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-oswald font-bold text-lg mb-2 text-blue-900">
                        No trobes la resposta?
                      </h3>
                      <p className="font-roboto text-sm text-blue-800 mb-3">
                        El nostre equip està aquí per ajudar-te. Contacta'ns i et respondrem el més aviat possible.
                      </p>
                      <Button
                        variant="outline"
                        className="border-2"
                        style={{ borderColor: '#1E40AF', color: '#1E40AF' }}
                        onClick={() => navigate('/contact')}
                      >
                        Contactar amb suport
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-16 pt-12 border-t border-gray-200">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <Shield className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <h3 className="font-oswald font-bold text-sm uppercase mb-2">Compra Segura</h3>
                <p className="text-sm font-roboto text-gray-600">
                  Pagament encriptat i protegit
                </p>
              </div>
              <div className="text-center">
                <Truck className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <h3 className="font-oswald font-bold text-sm uppercase mb-2">Enviament Ràpid</h3>
                <p className="text-sm font-roboto text-gray-600">
                  Gratuït en comandes +50€
                </p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <h3 className="font-oswald font-bold text-sm uppercase mb-2">Devolució Fàcil</h3>
                <p className="text-sm font-roboto text-gray-600">
                  30 dies per canviar d'opinió
                </p>
              </div>
              <div className="text-center">
                <Leaf className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <h3 className="font-oswald font-bold text-sm uppercase mb-2">Sostenible</h3>
                <p className="text-sm font-roboto text-gray-600">
                  Producció responsable
                </p>
              </div>
            </div>
          </div>
        </div>

        {showGalleryModal && (
          <div className="fixed inset-0 z-[20000] bg-black/95 flex items-center justify-center">
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
              aria-label="Tancar galeria"
            >
              <X className="h-6 w-6 text-white" />
            </button>

            <button
              onClick={prevGalleryImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
              aria-label="Imatge anterior"
            >
              <ChevronLeft className="h-8 w-8 text-white" />
            </button>

            <div className="max-w-7xl max-h-[90vh] mx-auto px-4">
              <img
                src={product.images[selectedImageIndex]}
                alt={`${product.name} - Vista ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain"
                onError={(e) => {
                  e.target.src = '/placeholder-product.svg';
                }}
              />
              <div className="text-white text-center mt-4 font-oswald">
                {selectedImageIndex + 1} / {product.images.length}
              </div>
            </div>

            <button
              onClick={nextGalleryImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
              aria-label="Imatge següent"
            >
              <ChevronRight className="h-8 w-8 text-white" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-3 rounded-lg max-w-[90vw] overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded overflow-hidden transition-all flex-shrink-0 ${
                    idx === selectedImageIndex ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
