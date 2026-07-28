import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import loginIllustration from '../assets/login1.png';

export default function Login() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!username || !password) return;

        const result = await login(username, password);
        if (!result.success) {
            setError('Invalid username or password');
        }
    }
  return (
    <div className="min-h-screen flex w-full bg-white font-sans">
     
      <div id="login-screen" className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative">
        <div className="absolute top-10 left-8 sm:left-16 md:left-24 xl:left-32">
          <img src={logo} alt="PrediFlow Logo" className="h-15" />
        </div>

        <div className="mt-20 lg:mt-0 mb-10 pt-15">
          <h1 className="text-3xl font-bold text-[#424A75] mb-2">Connexion</h1>
          <p className="text-gray-500 text-lg">Ravi de vous revoir sur votre espace</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md" id="login-form">
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              nom d'utilisateur
            </label>
            <input
              type="text"
              placeholder="Entrer votre nom d'utilisateur.."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#6B76B9] focus:ring-1 focus:ring-[#6B76B9] transition-colors placeholder-gray-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              placeholder="Entrer votre mot de passe.."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#6B76B9] focus:ring-1 focus:ring-[#6B76B9] transition-colors placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

            {error && <p id="login-error" className="text-[#ff0000] py-3">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#6B76B9] hover:bg-[#58639F] text-white font-semibold py-3.5 px-4 rounded-lg transition-colors text-lg shadow-sm"
          >
            Se connecter
          </button>
          
        </form>
      </div>

      <div className="hidden lg:flex lg:w-1/2 p-4 h-screen">
        <div className="w-full h-full bg-[#EBEFFF] rounded-4xl p-12 flex flex-col relative overflow-hidden">
          
          <div className="flex-1 flex items-center justify-center">
            <img 
              src={loginIllustration} 
              alt="Graphique 3D" 
              className="max-w-[80%] max-h-[50vh] object-contain drop-shadow-xl"
            />
          </div>

          <div className="mb-8">
            <h2 className="text-[2.25rem] leading-tight font-bold text-[#4A5485] mb-4">
              Ne gérez plus <br />
              vos stocks, anticipez-les
            </h2>
            <p className="text-[#6471A1] text-lg leading-relaxed max-w-md">
              La plateforme de gestion d'intrants propulsée par un Système Multi-Agents pour ne plus jamais être à court d'idées... ni de stocks
            </p>
          </div>

        </div>
      </div>

    </div>
  );

}
