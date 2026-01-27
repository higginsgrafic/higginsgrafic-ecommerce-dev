import React from 'react';
import {
  User,
  UserCircle,
  UserCircle2,
  UserCog,
  UserRound,
  UserSquare,
  UserSquare2,
  CircleUser,
  CircleUserRound,
  Contact
} from 'lucide-react';

const icons = [
  { name: 'User', Icon: User, description: 'Icona actual - Silueta simple' },
  { name: 'UserCircle', Icon: UserCircle, description: 'Usuari amb cercle al voltant' },
  { name: 'UserCircle2', Icon: UserCircle2, description: 'Usuari amb cercle sòlid' },
  { name: 'UserCog', Icon: UserCog, description: 'Usuari amb engranatge (perfil)' },
  { name: 'UserRound', Icon: UserRound, description: 'Usuari amb línies arrodonides' },
  { name: 'UserSquare', Icon: UserSquare, description: 'Usuari en quadrat' },
  { name: 'UserSquare2', Icon: UserSquare2, description: 'Usuari en quadrat sòlid' },
  { name: 'CircleUser', Icon: CircleUser, description: 'Cercle amb usuari dins' },
  { name: 'CircleUserRound', Icon: CircleUserRound, description: 'Cercle amb usuari arrodonit' },
  { name: 'Contact', Icon: Contact, description: 'Icona de contacte tipus agenda' }
];

export default function UserIconPicker() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Tria la Teva Icona d'Usuari
          </h1>
          <p className="text-gray-600">
            Fes clic sobre la icona que més t'agradi per veure'n el nom
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {icons.map(({ name, Icon, description }) => (
            <div
              key={name}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 flex flex-col items-center justify-center group cursor-pointer border-2 border-transparent hover:border-gray-900"
              onClick={() => {
                navigator.clipboard.writeText(name);
                alert(`Copiat: ${name}\n\n${description}`);
              }}
            >
              <div className="mb-4 p-6 bg-gray-50 rounded-full group-hover:bg-gray-900 transition-colors duration-300">
                <Icon className="h-12 w-12 text-gray-900 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 text-center mb-2">
                {name}
              </h3>
              <p className="text-xs text-gray-500 text-center">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Com triar una icona
          </h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold text-gray-900 mr-2">1.</span>
              <span>Fes clic sobre la icona que t'agradi per copiar-ne el nom</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-gray-900 mr-2">2.</span>
              <span>Digue'm quin nom has triat (per exemple: "UserCircle")</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-gray-900 mr-2">3.</span>
              <span>Jo la canviaré automàticament al Header i al UserSidebar</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
