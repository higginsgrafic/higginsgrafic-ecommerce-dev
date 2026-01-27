import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Breadcrumbs from '@/components/Breadcrumbs';
import EpisodeControls from '@/components/EpisodeControls';
import EpisodeDisplay from '@/components/EpisodeDisplay';

// Star Trek: The Original Series - Els 12 episodis més antològics de la temporada 1
const STAR_TREK_EPISODES = [
  { season: 1, episode: 3, title: "Where No Man Has Gone Before", text: "After the Enterprise attempts to cross the Great Barrier at the edge of the galaxy, crew members Gary Mitchell and Elizabeth Dehner develop \"godlike\" psychic powers, which threaten the safety of the crew." },
  { season: 1, episode: 4, title: "The Naked Time", text: "A strange, intoxicating infection, which lowers the crew's emotional inhibitions, spreads throughout the Enterprise. As the madness spreads, the entire ship is endangered." },
  { season: 1, episode: 5, title: "The Enemy Within", text: "While beaming up from planet Alpha 177, a transporter accident splits Captain Kirk into two beings: one \"good\", who is weak and indecisive, and one \"evil\", who is overly aggressive and domineering." },
  { season: 1, episode: 10, title: "The Corbomite Maneuver", text: "The Enterprise is menaced by a gigantic alien ship whose commander condemns the crew to death. The alien ship appears all-powerful, and the alien commander refuses all attempts at negotiation, forcing Kirk to employ an unorthodox strategy to save the ship." },
  { season: 1, episode: 11, title: "The Menagerie, Part I", text: "Spock hijacks the Enterprise to take his crippled former captain, Christopher Pike, to the forbidden world of Talos IV. He then demands a court martial, where he uses the events to tell the tale of Pike's captivity on the planet years earlier." },
  { season: 1, episode: 12, title: "The Menagerie, Part II", text: "After witnessing the Talosians' capabilities of mental illusion, Kirk realizes that Spock intends to return Pike to the planet to live a life of illusion, unencumbered by his crippled condition." },
  { season: 1, episode: 14, title: "Balance of Terror", text: "While investigating a series of destroyed outposts, the Enterprise discovers a lone Romulan vessel with a cloaking device. The Romulans, having never been seen by humans, are revealed to visually resemble Vulcans, casting doubt on Mr. Spock's loyalty." },
  { season: 1, episode: 18, title: "Arena", text: "The Enterprise comes under attack by unknown aliens while investigating the near-destruction of the Cestus III colony. While chasing the aliens into unexplored space, both ships are captured by the powerful Metrons, who force Kirk and the alien captain to trial by combat." },
  { season: 1, episode: 22, title: "Space Seed", text: "The Enterprise discovers an ancient sleeper ship, the SS Botany Bay, which escaped from Earth's Eugenics Wars in the late 20th century. The genetically engineered passengers, led by war criminal Khan Noonien Singh, seize control of the Enterprise and attempt to destroy the ship." },
  { season: 1, episode: 24, title: "This Side of Paradise", text: "Despite exposure to fatal radiation, the Federation colony on Omicron Ceti III appears to be thriving. A landing party from the Enterprise investigates, finding strange flowers that impose a state of pure bliss and perfect health on all exposed to its spores, but at the cost of ambition and self-discipline." },
  { season: 1, episode: 25, title: "The Devil in the Dark", text: "Dispatched to the mining colony on Janus VI, the Enterprise is to investigate rumors of a strange, subterranean creature responsible for destruction of equipment and the deaths of 50 miners. Kirk and Spock discover a silicon-based life form, a Horta, which lives in the surrounding rock." },
  { season: 1, episode: 28, title: "The City on the Edge of Forever", text: "After accidentally overdosing on a powerful stimulant, Dr. McCoy becomes unbalanced and disappears through the Guardian of Forever, a newly discovered time portal on a remote planet. Kirk and Spock follow after learning that McCoy somehow changed history. Arriving in the 1930s, Kirk finds himself falling in love with Edith Keeler, but Spock discovers that Keeler must die to restore the timeline." }
];

function GraficPage() {
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  const currentEpisode = STAR_TREK_EPISODES[currentEpisodeIndex];

  const handlePrevious = () => {
    if (currentEpisodeIndex > 0) {
      setCurrentEpisodeIndex(currentEpisodeIndex - 1);
      setIsEditing(false);
    }
  };

  const handleNext = () => {
    if (currentEpisodeIndex < STAR_TREK_EPISODES.length - 1) {
      setCurrentEpisodeIndex(currentEpisodeIndex + 1);
      setIsEditing(false);
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditedText(currentEpisode.text);
  };

  const handleSave = () => {
    STAR_TREK_EPISODES[currentEpisodeIndex].text = editedText;
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedText('');
  };

  useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isEditing]);

  return (
    <>
      <Helmet>
        <title>Higgins Gràfic | GRÀFIC</title>
        <meta name="description" content="Higgins Gràfic - On el disseny gràfic troba el seu missatge. Explora la nostra marca i filosofia de disseny amb propòsit." />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gray-900 text-white py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="mb-8">
              <Breadcrumbs
                items={[
                  { label: 'Higgins Gràfic' }
                ]}
                lightMode={true}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="font-oswald text-[48pt] lg:text-[64pt] font-bold uppercase mb-6">
                Higgins Gràfic
              </h1>
              <p className="font-roboto text-[16pt] lg:text-[18pt] text-gray-300 max-w-3xl mx-auto italic">
                "Design that speaks louder than words."
              </p>
            </motion.div>
          </div>
        </div>

        {/* Brand Logo Section with Episode Viewer */}
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl p-12 lg:p-16 mb-16 relative"
          >
            {/* Desktop Layout */}
            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src="/logo_higgins_grafic_quadrat.svg"
                  alt="Higgins Gràfic Logo - Star Trek: The Original Series"
                  className="w-full h-auto"
                  loading="eager"
                  style={{ maxWidth: 'none' }}
                />
                <EpisodeControls
                  currentEpisode={currentEpisode}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  layout="desktop"
                />
                <EpisodeDisplay
                  currentEpisode={currentEpisode}
                  isEditing={isEditing}
                  editedText={editedText}
                  onTextChange={setEditedText}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onDoubleClick={handleDoubleClick}
                  layout="desktop"
                />
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden">
              <div className="flex justify-center mb-8">
                <img
                  src="/logo_higgins_grafic_quadrat.svg"
                  alt="Higgins Gràfic Logo - Star Trek: The Original Series"
                  className="w-full max-w-md h-auto"
                  loading="eager"
                />
              </div>

              <div className="space-y-4">
                <EpisodeControls
                  currentEpisode={currentEpisode}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  layout="mobile"
                />
                <EpisodeDisplay
                  currentEpisode={currentEpisode}
                  isEditing={isEditing}
                  editedText={editedText}
                  onTextChange={setEditedText}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  onDoubleClick={handleDoubleClick}
                  layout="mobile"
                />
              </div>
            </div>
          </motion.div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="prose max-w-none"
          >
            <h2 className="font-oswald text-[32pt] lg:text-[42pt] font-bold mb-6" style={{ color: '#141414' }}>
              La Marca
            </h2>
            <p className="font-roboto text-[14pt] lg:text-[16pt] text-gray-700 leading-relaxed mb-6">
              Higgins Gràfic és més que una marca de roba. És una declaració visual amb propòsit,
              una filosofia de disseny que uneix art, missatge i identitat.
            </p>
            <p className="font-roboto text-[14pt] lg:text-[16pt] text-gray-700 leading-relaxed mb-6">
              Cada peça que creem porta amb si una història, un missatge que transcendeix el
              tèxtil per convertir-se en una declaració de qui ets i què defenses.
            </p>

            <div className="bg-gray-50 rounded-lg p-8 mt-12 mb-12">
              <h3 className="font-oswald text-[24pt] font-bold mb-4" style={{ color: '#141414' }}>
                La Nostra Filosofia
              </h3>
              <ul className="space-y-4 font-roboto text-[13pt] lg:text-[14pt] text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-gray-900 font-bold">•</span>
                  <span>Disseny amb propòsit: Cada element visual té una raó de ser</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-900 font-bold">•</span>
                  <span>Missatge abans que moda: No seguim tendències, creem identitat</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-900 font-bold">•</span>
                  <span>Art portable: Les teves idees mereixen ser visibles</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-900 font-bold">•</span>
                  <span>Qualitat artesanal: Cada peça és creada amb atenció al detall</span>
                </li>
              </ul>
            </div>

            <h3 className="font-oswald text-[24pt] font-bold mb-6" style={{ color: '#141414' }}>
              Les Nostres Col·leccions
            </h3>
            <p className="font-roboto text-[14pt] lg:text-[16pt] text-gray-700 leading-relaxed mb-8">
              Sota la marca Higgins Gràfic trobaràs diverses col·leccions, cadascuna amb la seva
              pròpia narrativa i univers visual. Des de la ciència-ficció de <em>First Contact</em>
              fins a la força feminista d'<em>Austen</em>, cada col·lecció és una exploració única
              de la condició humana.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-12">
              <Link
                to="/first-contact"
                className="bg-gray-900 text-white px-8 py-4 rounded-lg font-roboto text-[14pt] font-medium hover:bg-gray-800 transition-colors text-center"
              >
                Explorar Col·leccions
              </Link>
              <Link
                to="/"
                className="bg-white border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-lg font-roboto text-[14pt] font-medium hover:bg-gray-50 transition-colors text-center"
              >
                Veure Productes
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default GraficPage;
