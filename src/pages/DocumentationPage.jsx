import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Globe,
  ShoppingBag,
  Code,
  Settings,
  BookOpen,
  ChevronRight,
  Download,
  Search,
  Folder,
  File,
  Terminal,
  Smartphone
} from 'lucide-react';
import MarkdownViewer from '@/components/MarkdownViewer';

function DocumentationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Tancar amb ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && selectedDoc) {
        setSelectedDoc(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [selectedDoc]);

  // Classificació de la documentació
  const documentation = {
    wordpress: {
      title: 'Integració WordPress',
      icon: ShoppingBag,
      color: '#8B5CF6', // Purple
      files: [
        {
          name: 'WordPress Integration - Guia Principal',
          file: 'wordpress-integration.md',
          description: 'Arquitectura, API REST, Netlify Functions',
          size: '20 KB',
          updated: '28/11/2024'
        },
        {
          name: 'WordPress Setup Steps',
          file: 'wordpress-setup-steps.md',
          description: 'Passos d\'instal·lació i configuració',
          size: '10 KB',
          updated: '28/11/2024'
        },
        {
          name: 'WordPress Integration Guide',
          file: 'wordpress-integration-guide.md',
          description: 'Guia completa d\'integració',
          size: '15 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Test WordPress Local',
          file: 'TEST-WORDPRESS-LOCAL.md',
          description: 'Com testejar WordPress localment',
          size: '12 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Resum Sessió WordPress',
          file: 'RESUM-SESSIO-WORDPRESS.md',
          description: 'Resum tècnic detallat de la integració',
          size: '18 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Resum Final Integració',
          file: 'RESUM-FINAL-INTEGRACIO.md',
          description: 'Integració 100% completada, 64 productes',
          size: '25 KB',
          updated: '28/11/2024'
        },
        {
          name: 'WordPress Resum',
          file: 'wordpress-resum.md',
          description: 'Resum executiu WordPress + WooCommerce',
          size: '8 KB',
          updated: '28/11/2024'
        },
        {
          name: 'LLEGEIX-ME WordPress',
          file: 'LLEGEIX-ME-WORDPRESS.md',
          description: 'Instruccions ràpides WordPress',
          size: '6 KB',
          updated: '28/11/2024'
        }
      ]
    },
    gelato: {
      title: 'Gelato Print-on-Demand',
      icon: FileText,
      color: '#10B981', // Green
      files: [
        {
          name: 'Gelato Integration - API',
          file: 'gelato-integration.md',
          description: 'API Gelato, hooks React, sincronització catàleg',
          size: '22 KB',
          updated: '27/11/2024'
        },
        {
          name: 'Gelato WordPress Setup',
          file: 'gelato-wordpress-setup.md',
          description: 'Plugin eBotiga, auto-fulfillment, dissenys 300 DPI',
          size: '30 KB',
          updated: '03/12/2024'
        },
        {
          name: 'Gelato Quick Start',
          file: 'gelato-quick-start.md',
          description: 'Començar en 1 hora, 5 passos essencials',
          size: '8 KB',
          updated: '03/12/2024'
        },
        {
          name: 'Test Ràpid Gelato - 1 Producte',
          file: 'GELATO-TEST-RAPID.md',
          description: 'Test en 30 min amb 1 producte de prova',
          size: '5 KB',
          updated: '03/12/2024'
        }
      ]
    },
    images: {
      title: 'Imatges i Catàleg',
      icon: Download,
      color: '#F97316', // Orange-red
      files: [
        {
          name: '🔧 Opcions Organitzar Imatges',
          file: 'OPCIONS-ORGANITZAR-IMATGES.md',
          description: 'Comparativa: App macOS vs Script Node.js - Quina triar?',
          size: '12 KB',
          updated: '03/12/2024'
        },
        {
          name: 'Opcions Pujada Imatges',
          file: 'OPCIONS-PUJADA-IMATGES.md',
          description: '3 mètodes per pujar imatges: script, Drive, ZIPs',
          size: '5 KB',
          updated: '03/12/2024'
        },
        {
          name: 'Guia Script Local',
          file: 'GUIA-SCRIPT-LOCAL.md',
          description: 'Executar script Node.js per reanomenar imatges (terminal)',
          size: '7 KB',
          updated: '03/12/2024'
        },
        {
          name: 'Guia Pujar Imatges',
          file: 'GUIA-PUJAR-IMATGES.md',
          description: 'Nomenclatura obligatòria, especificacions, checklist 60 productes',
          size: '6 KB',
          updated: '03/12/2024'
        },
        {
          name: 'Contingut Pendent',
          file: 'CONTINGUT-PENDENT.md',
          description: 'Planificació: noms, descripcions, SEO, legals (post-imatges)',
          size: '6 KB',
          updated: '03/12/2024'
        },
        {
          name: 'Guia Imatges',
          file: 'GUIA-IMATGES.md',
          description: 'Gestió general d\'imatges del catàleg',
          size: '5 KB',
          updated: '03/12/2024'
        }
      ]
    },
    applications: {
      title: 'Aplicacions Natives',
      icon: Smartphone,
      color: '#8B5CF6', // Purple
      files: [
        {
          name: 'Organitzador d\'Imatges - Resum Executiu',
          file: 'APP-MACOS-RESUM.md',
          description: 'App macOS: característiques, compilació, distribució DMG',
          size: '12 KB',
          updated: '03/12/2024'
        },
        {
          name: 'Organitzador d\'Imatges - Guia Usuari',
          file: 'GUIA-APP-MACOS.md',
          description: 'Com usar l\'app: descarregar, instal·lar, executar, processar',
          size: '10 KB',
          updated: '03/12/2024'
        },
        {
          name: 'Organitzador d\'Imatges - README Desenvolupador',
          file: 'macos-app/README.md',
          description: 'Compilar amb Electron, personalitzar, signar, distribuir',
          size: '8 KB',
          updated: '03/12/2024'
        },
        {
          name: 'Organitzador d\'Imatges - Instruccions Ràpides',
          file: 'macos-app/INSTRUCTIONS.md',
          description: 'Compilació ràpida: npm install → npm run build:mac',
          size: '1 KB',
          updated: '03/12/2024'
        }
      ]
    },
    scripts: {
      title: 'Scripts Node.js',
      icon: Terminal,
      color: '#A855F7', // Light Purple
      files: [
        {
          name: 'Scripts Disponibles - Guia Completa',
          file: 'SCRIPTS-DISPONIBLES.md',
          description: 'Documentació completa scripts locals, ús terminal, troubleshooting',
          size: '8 KB',
          updated: '03/12/2024'
        },
        {
          name: 'Script: Reanomenar Imatges',
          file: 'scripts/rename-images.js',
          description: 'Node.js - Organitza i reanomena 60 imatges (requereix terminal)',
          size: '4 KB',
          updated: '03/12/2024'
        },
        {
          name: 'README Scripts',
          file: 'scripts/README.md',
          description: 'Introducció ràpida als scripts locals Node.js',
          size: '2 KB',
          updated: '03/12/2024'
        }
      ]
    },
    deployment: {
      title: 'Desplegament i Producció',
      icon: Settings,
      color: '#F59E0B', // Orange
      files: [
        {
          name: 'Deploy Guide',
          file: 'DEPLOY-GUIDE.md',
          description: 'Guia completa de desplegament a Netlify',
          size: '15 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Desplegament',
          file: 'desplegament.md',
          description: 'Instruccions de desplegament',
          size: '10 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Instruccions Finals',
          file: 'INSTRUCCIONS-FINALS.md',
          description: 'Checklist pre-deploy',
          size: '8 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Publicació Checklist',
          file: 'publicacio-checklist.md',
          description: 'Tot el que cal revisar abans de publicar',
          size: '6 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Configurar .env Local',
          file: 'configurar-env-local.md',
          description: 'Variables d\'entorn per desenvolupament',
          size: '5 KB',
          updated: '28/11/2024'
        }
      ]
    },
    technical: {
      title: 'Notes Tècniques',
      icon: Code,
      color: '#EF4444', // Red
      files: [
        {
          name: 'Notes Tècniques',
          file: 'NOTES-TECNIQUES.md',
          description: 'Arquitectura, decisions tècniques',
          size: '12 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Implementation Summary',
          file: 'implementation-summary.md',
          description: 'Resum de la implementació',
          size: '10 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Typography Guide',
          file: 'typography-guide.md',
          description: 'Sistema de tipografia Oswald + Roboto',
          size: '8 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Mides Text',
          file: 'mides-text.md',
          description: 'Taules de mides de text',
          size: '4 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Analytics Info',
          file: 'ANALYTICS-INFO.md',
          description: 'Google Analytics, tracking',
          size: '6 KB',
          updated: '28/11/2024'
        }
      ]
    },
    guides: {
      title: 'Guies i Tutorials',
      icon: BookOpen,
      color: '#EC4899', // Pink
      files: [
        {
          name: '🔄 Flux Complet Imatges',
          file: 'FLUX-COMPLET-IMATGES.md',
          description: 'Guia completa: De mockups desorganitzats a web (App + Scripts)',
          size: '22 KB',
          updated: '04/12/2024'
        },
        {
          name: 'Guia Ràpida',
          file: 'guia-rapida.md',
          description: 'Començar ràpidament amb el projecte',
          size: '8 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Galeria Guia',
          file: 'galeria-guia.md',
          description: 'Com gestionar la galeria d\'imatges',
          size: '6 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Importació Etsy - Guia',
          file: 'guia-importacio-etsy.md',
          description: 'Importar productes des d\'Etsy',
          size: '10 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Importació Manual',
          file: 'guia-importacio-manual.md',
          description: 'Afegir productes manualment',
          size: '8 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Estat Importació Etsy',
          file: 'importacio-etsy-estat.md',
          description: 'Estat de la importació de productes',
          size: '5 KB',
          updated: '28/11/2024'
        }
      ]
    },
    progress: {
      title: 'Progrés i TODOs',
      icon: Folder,
      color: '#6366F1', // Indigo
      files: [
        {
          name: 'Categories de Documentació',
          file: 'CATEGORIES-DOCUMENTACIO.md',
          description: 'Organització de les 11 categories, 85+ documents, guia completa',
          size: '15 KB',
          updated: '03/12/2024'
        },
        {
          name: 'TODOs',
          file: 'todos.md',
          description: 'Estat actual del projecte, tasques pendents',
          size: '15 KB',
          updated: '03/12/2024'
        },
        {
          name: 'Bloc A Progress',
          file: 'bloc-a-progress.md',
          description: 'Progrés del bloc A',
          size: '6 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Bloc B Progress',
          file: 'bloc-b-progress.md',
          description: 'Progrés del bloc B',
          size: '6 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Backups',
          file: 'backups.md',
          description: 'Informació sobre backups',
          size: '4 KB',
          updated: '28/11/2024'
        }
      ]
    },
    versions: {
      title: 'Resums de Versions',
      icon: File,
      color: '#14B8A6', // Teal
      files: [
        {
          name: '📱 Resum App macOS v1.1.0',
          file: 'RESUM-APP-MACOS-V1.1.0.md',
          description: 'Versió 417 - App macOS amb noms complets i colors',
          size: '18 KB',
          updated: '04/12/2024'
        },
        {
          name: '🔧 Resum Script v1.1.3',
          file: 'RESUM-SCRIPT-V1.1.3.md',
          description: 'Versió 413 - Script amb detecció intel·ligent per mockups',
          size: '12 KB',
          updated: '04/12/2024'
        },
        {
          name: 'Resum Final',
          file: 'RESUM-FINAL.md',
          description: 'Resum final del projecte',
          size: '12 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Resum v348',
          file: 'resum-versio-348.md',
          description: 'Versió 348 - Multi-idioma inicial',
          size: '10 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Resum v359',
          file: 'resum-versio-359.md',
          description: 'Versió 359',
          size: '8 KB',
          updated: '28/11/2024'
        },
        {
          name: 'Resum v360',
          file: 'resum-versio-360.md',
          description: 'Versió 360',
          size: '8 KB',
          updated: '28/11/2024'
        }
      ]
    }
  };

  // Filtrar fitxers segons cerca i categoria
  const getFilteredFiles = () => {
    let allFiles = [];

    Object.entries(documentation).forEach(([key, category]) => {
      if (selectedCategory === 'all' || selectedCategory === key) {
        category.files.forEach(file => {
          allFiles.push({
            ...file,
            categoryKey: key,
            categoryTitle: category.title,
            categoryIcon: category.icon,
            categoryColor: category.color
          });
        });
      }
    });

    if (searchTerm) {
      allFiles = allFiles.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.categoryTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return allFiles;
  };

  const filteredFiles = getFilteredFiles();

  // Comptar fitxers per categoria
  const getCategoryCount = (categoryKey) => {
    if (categoryKey === 'all') {
      return Object.values(documentation).reduce((sum, cat) => sum + cat.files.length, 0);
    }
    return documentation[categoryKey]?.files.length || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-oswald text-[32pt] lg:text-[42pt] font-bold uppercase" style={{ color: '#141414' }}>
                Repositori de Documentació
              </h1>
              <p className="font-roboto text-[14pt] text-gray-600 mt-2">
                Tota la documentació del projecte GRÀFIC ben classificada i accessible
              </p>
            </div>
            <Link
              to="/"
              className="font-roboto text-[12pt] text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
            >
              ← Tornar
            </Link>
          </div>

          {/* Cerca */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cercar documentació..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg font-roboto text-[14pt] focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
              <h2 className="font-oswald text-[16pt] font-bold mb-4" style={{ color: '#141414' }}>
                Categories
              </h2>

              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full flex items-center justify-between p-3 rounded-lg mb-2 transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="font-roboto text-[12pt] font-medium">Totes</span>
                <span className="font-roboto text-[11pt] font-bold">
                  {getCategoryCount('all')}
                </span>
              </button>

              {Object.entries(documentation).map(([key, category]) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === key;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg mb-2 transition-colors ${
                      isSelected
                        ? 'text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                    style={isSelected ? { backgroundColor: category.color } : {}}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="font-roboto text-[11pt] font-medium text-left">
                        {category.title}
                      </span>
                    </div>
                    <span className="font-roboto text-[11pt] font-bold">
                      {getCategoryCount(key)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content - Files */}
          <div className="lg:col-span-3">
            {filteredFiles.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="font-roboto text-[14pt] text-gray-600">
                  No s'han trobat documents amb "{searchTerm}"
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFiles.map((file, index) => {
                  const Icon = file.categoryIcon;

                  return (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedDoc(`/.same/${file.file}`)}
                      className="w-full text-left bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all group cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="p-3 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: `${file.categoryColor}15` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: file.categoryColor }} />
                        </div>

                        <div className="flex-grow">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="font-oswald text-[16pt] font-bold group-hover:text-gray-900" style={{ color: '#141414' }}>
                              {file.name}
                            </h3>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                          </div>

                          <p className="font-roboto text-[12pt] text-gray-600 mb-3">
                            {file.description}
                          </p>

                          <div className="flex items-center gap-4 flex-wrap">
                            <span
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-white font-roboto text-[10pt] font-medium"
                              style={{ backgroundColor: file.categoryColor }}
                            >
                              <Icon className="w-3 h-3" />
                              {file.categoryTitle}
                            </span>
                            <span className="font-roboto text-[10pt] text-gray-500">
                              {file.size}
                            </span>
                            <span className="font-roboto text-[10pt] text-gray-500">
                              Actualitzat: {file.updated}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Stats Footer */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="font-oswald text-[24pt] font-bold" style={{ color: '#141414' }}>
                    {getCategoryCount('all')}
                  </div>
                  <div className="font-roboto text-[11pt] text-gray-600">
                    Documents totals
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-oswald text-[24pt] font-bold" style={{ color: '#141414' }}>
                    {Object.keys(documentation).length}
                  </div>
                  <div className="font-roboto text-[11pt] text-gray-600">
                    Categories
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-oswald text-[24pt] font-bold" style={{ color: '#141414' }}>
                    v417
                  </div>
                  <div className="font-roboto text-[11pt] text-gray-600">
                    Versió actual
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-oswald text-[24pt] font-bold" style={{ color: '#141414' }}>
                    04/12
                  </div>
                  <div className="font-roboto text-[11pt] text-gray-600">
                    Última actualització
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Markdown Viewer Modal */}
      {selectedDoc && (
        <MarkdownViewer
          filePath={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}

export default DocumentationPage;
