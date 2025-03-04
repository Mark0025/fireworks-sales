import React from 'react';

const FireworksStand: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section with Patriotic Colors */}
      <div className="bg-gradient-to-b from-blue-700 via-white to-red-700 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block text-blue-800">Welcome to</span>
          <span className="block text-red-700 mt-1">Robert's Fireworks Stand</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-800 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Family owned and operated in Mustang, Oklahoma
        </p>
        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
          <div className="rounded-md shadow">
            <a
              href="#products"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 md:py-4 md:text-lg md:px-10"
            >
              Shop Now
            </a>
          </div>
          <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
            <a
              href="#about"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              About Us
            </a>
          </div>
        </div>
      </div>

      {/* Decorative Fireworks Animation */}
      <div className="relative overflow-hidden py-12">
        <div className="absolute inset-0 flex justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDuration: '3s', left: '20%', top: '30%' }}></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" style={{ animationDuration: '2.5s', left: '40%', top: '20%' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '4s', left: '60%', top: '40%' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" style={{ animationDuration: '3.5s', left: '80%', top: '25%' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Celebrate with the Best Fireworks in Oklahoma
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              We've been lighting up the skies for over 20 years with quality fireworks for all occasions.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div id="products" className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-gray-900">Featured Products</h2>
          <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {/* Product cards would go here */}
            <div className="group relative">
              <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                <div className="w-full h-full flex items-center justify-center text-lg font-medium text-gray-500">
                  Product Image
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <span aria-hidden="true" className="absolute inset-0" />
                    Aerial Finale
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">Red, White, and Blue</p>
                </div>
                <p className="text-sm font-medium text-gray-900">$49.99</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="bg-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-red-600 font-semibold tracking-wide uppercase">Our Story</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Family Tradition Since 2000
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Robert's Fireworks Stand has been a staple in the Mustang community for generations, providing quality fireworks and creating lasting memories.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold">Robert's Fireworks Stand</h3>
              <p className="mt-2">1234 Main Street, Mustang, OK 73064</p>
              <p>(405) 555-1234</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Hours</h4>
              <p>June 15 - July 5: 9am - 10pm</p>
              <p>December 15 - January 1: 9am - 10pm</p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Robert's Fireworks Stand. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FireworksStand; 