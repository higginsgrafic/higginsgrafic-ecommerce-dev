import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Download,
  Apple,
  Terminal,
  FileCode,
  ExternalLink,
  CheckCircle,
  Info,
  Zap,
  ChevronDown,
  ChevronUp,
  History
} from 'lucide-react';
import MarkdownViewer from '@/components/MarkdownViewer';

function AppsPage() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState({});

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

  // Toggle versions history
  const toggleVersions = (appId) => {
    setExpandedVersions(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
  };

  const apps = [
    {
      id: 'copy-script',
      name: 'copy-to-project.js',
      platform: 'Node.js',
      icon: Terminal,
      color: '#2563eb',
      currentVersion: '1.0.0',
      size: '3 KB',
      description: 'Script per copiar imatges organitzades del teu ordinador al projecte Same automàticament.',
      features: [
        'Còpia automàtica a public/products/',
        'Manté estructura de carpetes',
        'Progrés visual en temps real',
        'Validació de rutes',
        'Molt ràpid (60 imatges en segons)',
        'Sense dependències'
      ],
      requirements: [
        'Node.js 14+ instal·lat',
        'Carpeta imatges-organitzades/ generada',
        'Ruta del projecte Same'
      ],
      docsUrl: '/.same/GUIA-COPIAR-IMATGES.md',
      needsCompilation: false,
      usageSteps: [
        'Descarrega copy-to-project.js',
        'Col·loca al mateix directori que imatges-organitzades/',
        'node copy-to-project.js /ruta/al/projecte'
      ],
      versions: [
        {
          version: '1.0.0',
          date: '04/12/2024',
          downloadUrl: '/.same/scripts/copy-to-project.js',
          changelog: [
            'Primera versió',
            'Còpia recursiva de totes les imatges',
            'Validació de rutes origen i destí',
            'Progrés visual cada 10 imatges',
            'Gestió d\'errors completa'
          ]
        }
      ]
    },
    {
      id: 'macos-app',
      name: 'Renominador 1.1',
      platform: 'macOS',
      icon: Apple,
      color: '#141414',
      currentVersion: '1.1.0',
      size: '~200 MB',
      description: 'Aplicació nativa amb interfície gràfica per organitzar les 60 imatges automàticament.',
      features: [
        'Interfície gràfica moderna',
        'Drag & drop de directori',
        'Detecció de subcarpetes amb colors',
        'Noms complets: col·lecció-color1-color2-001.png',
        'Progrés visual per cada color',
        'Suport Intel + Apple Silicon',
        'No requereix Node.js'
      ],
      requirements: [
        'macOS 10.13 (High Sierra) o superior',
        'Intel (x64) o Apple Silicon (ARM64)',
        '500 MB espai lliure'
      ],
      docsUrl: '/.same/GUIA-APP-MACOS.md',
      buildInstructions: '/.same/macos-app/README.md',
      needsCompilation: true,
      compilationSteps: [
        'cd .same/macos-app',
        'npm install',
        'npm run build:mac'
      ],
      // Historial de versions (més nova primer)
      versions: [
        {
          version: '1.1.0',
          date: '04/12/2024',
          downloadUrl: '/renominador-1.1-macos-app.zip',
          changelog: [
            'Detecció de subcarpetes amb colors dins de col·leccions',
            'Noms de fitxer amb col·lecció + colors complets',
            'Format: col·lecció-color-samarreta-color-tinta-001.png',
            'Suport per colors en català i anglès',
            'Progrés visual per cada combinació de color'
          ]
        },
        {
          version: '1.0.0',
          date: '03/12/2024',
          downloadUrl: '/renominador-1.0-macos-app.zip',
          changelog: [
            'Primera versió',
            'Interfície gràfica completa',
            'Suport Intel + Apple Silicon',
            'Detecció automàtica de 5 col·leccions',
            'Progrés visual en temps real'
          ]
        }
      ]
    },
    {
      id: 'node-script',
      name: 'rename-images.js',
      platform: 'Node.js',
      icon: Terminal,
      color: '#68A063',
      currentVersion: '1.1.4',
      size: '5 KB',
      description: 'Script de terminal lleuger i ràpid per organitzar imatges. Multiplataforma.',
      features: [
        'Lleuger (5 KB)',
        'Multiplataforma (macOS, Windows, Linux)',
        'Molt ràpid',
        'Fàcil de modificar',
        'Sense dependències',
        'Detecció intel·ligent de col·leccions',
        'Suporta estructures de mockups complexes',
        'Colors en català i anglès',
        'Evita processar duplicats'
      ],
      requirements: [
        'Node.js 14+ instal·lat',
        'Terminal/Command prompt',
        'Coneixements bàsics de terminal'
      ],
      docsUrl: '/.same/GUIA-SCRIPT-LOCAL.md',
      needsCompilation: false,
      usageSteps: [
        'Descarrega rename-images.js',
        'Col·loca al directori amb imatges',
        'node rename-images.js'
      ],
      // Historial de versions (més nova primer)
      versions: [
        {
          version: '1.1.4',
          date: '04/12/2024',
          downloadUrl: '/.same/scripts/rename-images.js',
          changelog: [
            'Noms de fitxer amb col·lecció + colors complets',
            'Detecta subcarpetes amb colors dins de col·leccions',
            'Processa cada combinació de colors individualment',
            'Format: col·lecció-color-samarreta-color-tinta-001.png',
            'Estadístiques detallades per cada color'
          ]
        },
        {
          version: '1.1.3',
          date: '04/12/2024',
          downloadUrl: '/.same/scripts/rename-images-v1.1.3-backup.js',
          changelog: [
            'Detecció intel·ligent de col·leccions (cerca flexible)',
            'Suporta estructures de mockups complexes',
            'Colors en català i anglès barrejats',
            'Evita processar subcarpetes duplicades',
            'Millor gestió de noms de carpeta llargs'
          ]
        },
        {
          version: '1.1.2',
          date: '04/12/2024',
          downloadUrl: '/.same/scripts/rename-images-v1.1.2-backup.js',
          changelog: [
            'Cerca recursiva de TOTS els directoris',
            'Processa directoris al mateix nivell i inferiors',
            'Troba carpetes a qualsevol profunditat',
            'No cal tenir tot al primer nivell',
            'Detecció automàtica completa'
          ]
        },
        {
          version: '1.1.1',
          date: '04/12/2024',
          downloadUrl: '/.same/scripts/rename-images-v1.1.1.js',
          changelog: [
            'Detecció de colors de samarreta i tinta',
            'Format: NomCol·lecció-ColorSamarreta-ColorTinta',
            'Crea subcarpetes per combinació de colors',
            'Estadístiques per color al final',
            'Noms de fitxer amb colors inclosos'
          ]
        },
        {
          version: '1.1.0',
          date: '04/12/2024',
          downloadUrl: '/.same/scripts/rename-images-v1.1.0.js',
          changelog: [
            'Cerca recursiva d\'imatges en subdirectoris',
            'Mostra rutes relatives',
            'Comptador d\'imatges trobades',
            'Millor feedback visual'
          ]
        },
        {
          version: '1.0.0',
          date: '03/12/2024',
          downloadUrl: '/.same/scripts/rename-images-v1.0.0.js',
          changelog: [
            'Primera versió',
            'Detecció automàtica de col·leccions',
            'Reanomenament intel·ligent',
            'Multiplataforma'
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-oswald text-[32pt] lg:text-[42pt] font-bold uppercase" style={{ color: '#141414' }}>
                Aplicacions
              </h1>
              <p className="font-roboto text-[14pt] text-gray-600 mt-2">
                Organitza les teves imatges amb interfície gràfica o terminal
              </p>
            </div>
            <Link
              to="/"
              className="font-roboto text-[12pt] text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
            >
              ← Tornar
            </Link>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-roboto text-[13pt] text-blue-900 font-medium">
                2 Opcions Disponibles
              </p>
              <p className="font-roboto text-[12pt] text-blue-700 mt-1">
                App macOS amb interfície gràfica o script Node.js per terminal. Tria segons les teves necessitats.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {apps.map((app, index) => {
            const Icon = app.icon;
            const latestVersion = app.versions[0]; // Primera versió = més nova

            return (
              <motion.div
                key={app.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {/* App Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${app.color}15` }}
                    >
                      <Icon className="w-8 h-8" style={{ color: app.color }} />
                    </div>
                    <div className="flex-grow">
                      <h2 className="font-oswald text-[20pt] font-bold" style={{ color: '#141414' }}>
                        {app.name}
                      </h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="font-roboto text-[11pt] text-gray-600">
                          v{app.currentVersion}
                        </span>
                        <span className="font-roboto text-[11pt] text-gray-400">•</span>
                        <span className="font-roboto text-[11pt] text-gray-600">
                          {app.size}
                        </span>
                        <span
                          className="font-roboto text-[10pt] font-medium px-2 py-1 rounded text-white"
                          style={{ backgroundColor: app.color }}
                        >
                          {app.platform}
                        </span>
                        <span className="bg-green-100 text-green-800 text-[10pt] font-medium px-2 py-1 rounded">
                          Última versió
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="font-roboto text-[13pt] text-gray-700 mt-4 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                {/* Features */}
                <div className="p-6 bg-gray-50 border-b border-gray-100">
                  <h3 className="font-oswald text-[14pt] font-bold mb-3" style={{ color: '#141414' }}>
                    Característiques
                  </h3>
                  <ul className="space-y-2">
                    {app.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="font-roboto text-[12pt] text-gray-700">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements */}
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-oswald text-[14pt] font-bold mb-3" style={{ color: '#141414' }}>
                    Requeriments
                  </h3>
                  <ul className="space-y-2">
                    {app.requirements.map((req, i) => (
                      <li key={i} className="font-roboto text-[12pt] text-gray-600 flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Download/Compilation Section */}
                <div className="p-6 border-b border-gray-100">
                  {app.needsCompilation ? (
                    <div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-roboto text-[12pt] text-yellow-900 font-medium">
                              Cal compilar abans d'usar
                            </p>
                            <p className="font-roboto text-[11pt] text-yellow-700 mt-1">
                              Aquesta app es compila localment al teu ordinador
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-900 rounded-lg p-4 mb-4">
                        <p className="font-roboto text-[11pt] text-gray-400 mb-2">Compilació:</p>
                        {app.compilationSteps.map((step, i) => (
                          <div key={i} className="font-mono text-[11pt] text-green-400">
                            $ {step}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <a
                          href={latestVersion.downloadUrl}
                          download
                          className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-lg font-roboto text-[13pt] font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Descarregar v{app.currentVersion}
                        </a>
                        <button
                          onClick={() => setSelectedDoc(app.buildInstructions)}
                          className="bg-white border-2 border-gray-900 text-gray-900 px-4 py-3 rounded-lg font-roboto text-[13pt] font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <FileCode className="w-5 h-5" />
                          Instruccions
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-gray-900 rounded-lg p-4 mb-4">
                        <p className="font-roboto text-[11pt] text-gray-400 mb-2">Ús:</p>
                        {app.usageSteps.map((step, i) => (
                          <div key={i} className="font-mono text-[11pt] text-green-400">
                            {i + 1}. {step}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <a
                          href={latestVersion.downloadUrl}
                          download
                          className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-lg font-roboto text-[13pt] font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-5 h-5" />
                          Descarregar v{app.currentVersion}
                        </a>
                        <button
                          onClick={() => setSelectedDoc(app.docsUrl)}
                          className="bg-white border-2 border-gray-900 text-gray-900 px-4 py-3 rounded-lg font-roboto text-[13pt] font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <FileCode className="w-5 h-5" />
                          Guia
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Versions History */}
                <div className="p-6">
                  <button
                    onClick={() => toggleVersions(app.id)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-gray-600" />
                      <span className="font-oswald text-[14pt] font-bold" style={{ color: '#141414' }}>
                        Historial de Versions
                      </span>
                      <span className="bg-gray-200 text-gray-700 text-[10pt] font-medium px-2 py-0.5 rounded">
                        {app.versions.length}
                      </span>
                    </div>
                    {expandedVersions[app.id] ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {expandedVersions[app.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      {app.versions.map((version, vIndex) => (
                        <div
                          key={version.version}
                          className={`p-4 rounded-lg border-2 ${
                            vIndex === 0
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-oswald text-[14pt] font-bold" style={{ color: '#141414' }}>
                                v{version.version}
                              </span>
                              {vIndex === 0 && (
                                <span className="bg-green-600 text-white text-[9pt] font-medium px-2 py-0.5 rounded">
                                  Actual
                                </span>
                              )}
                            </div>
                            <span className="font-roboto text-[11pt] text-gray-600">
                              {version.date}
                            </span>
                          </div>

                          <ul className="space-y-1 mb-3">
                            {version.changelog.map((change, cIndex) => (
                              <li key={cIndex} className="font-roboto text-[11pt] text-gray-700 flex items-start gap-2">
                                <span className="text-gray-400">•</span>
                                {change}
                              </li>
                            ))}
                          </ul>

                          <a
                            href={version.downloadUrl}
                            download
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-roboto text-[12pt] font-medium transition-colors ${
                              vIndex === 0
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <Download className="w-4 h-4" />
                            Descarregar v{version.version}
                          </a>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-oswald text-[16pt] font-bold mb-3" style={{ color: '#141414' }}>
            💡 Flux de Treball Recomanat
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="font-oswald text-[14pt] font-bold text-blue-600">1.</span>
              <div>
                <p className="font-roboto text-[13pt] font-medium text-gray-900">Organitza les imatges</p>
                <p className="font-roboto text-[12pt] text-gray-600">Usa <strong>rename-images.js</strong> per generar la carpeta "imatges-organitzades"</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-oswald text-[14pt] font-bold text-blue-600">2.</span>
              <div>
                <p className="font-roboto text-[13pt] font-medium text-gray-900">Copia al projecte</p>
                <p className="font-roboto text-[12pt] text-gray-600">Usa <strong>copy-to-project.js</strong> per copiar-les a public/products/</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-oswald text-[14pt] font-bold text-blue-600">3.</span>
              <div>
                <p className="font-roboto text-[13pt] font-medium text-gray-900">Reinicia el servidor</p>
                <p className="font-roboto text-[12pt] text-gray-600">Les imatges ja estaran disponibles al web! 🎉</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h2 className="font-oswald text-[20pt] font-bold" style={{ color: '#141414' }}>
              Comparativa
            </h2>
            <p className="font-roboto text-[13pt] text-gray-600 mt-1">
              Quina eina et convé més per organitzar?
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 text-left font-oswald text-[13pt] font-bold" style={{ color: '#141414' }}>
                    Característica
                  </th>
                  <th className="p-4 text-center font-oswald text-[13pt] font-bold" style={{ color: '#141414' }}>
                    App macOS
                  </th>
                  <th className="p-4 text-center font-oswald text-[13pt] font-bold" style={{ color: '#141414' }}>
                    rename-images.js
                  </th>
                  <th className="p-4 text-center font-oswald text-[13pt] font-bold" style={{ color: '#141414' }}>
                    copy-to-project.js
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Funció', app: 'Organitza imatges', rename: 'Organitza imatges', copy: 'Copia al projecte' },
                  { label: 'Interfície', app: '✅ Gràfica (UI)', rename: '❌ Terminal (CLI)', copy: '❌ Terminal (CLI)' },
                  { label: 'Node.js necessari', app: '❌ No', rename: '✅ Sí', copy: '✅ Sí' },
                  { label: 'Mida', app: '⚠️ ~200 MB', rename: '✅ 5 KB', copy: '✅ 3 KB' },
                  { label: 'Plataformes', app: '🍎 Només macOS', rename: '🌍 Totes', copy: '🌍 Totes' },
                  { label: 'Facilitat d\'ús', app: '⭐⭐⭐⭐⭐', rename: '⭐⭐⭐', copy: '⭐⭐⭐⭐' },
                  { label: 'Velocitat', app: '⚡ Ràpid', rename: '⚡⚡ Més ràpid', copy: '⚡⚡⚡ Instantani' }
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-roboto text-[12pt] font-medium text-gray-900">
                      {row.label}
                    </td>
                    <td className="p-4 font-roboto text-[12pt] text-center text-gray-700">
                      {row.app}
                    </td>
                    <td className="p-4 font-roboto text-[12pt] text-center text-gray-700">
                      {row.rename}
                    </td>
                    <td className="p-4 font-roboto text-[12pt] text-center text-gray-700">
                      {row.copy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <Link
              to="/documentation"
              className="font-roboto text-[13pt] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              Veure tota la documentació
              <ExternalLink className="w-4 h-4" />
            </Link>
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

export default AppsPage;
