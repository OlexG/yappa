"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Sidebar() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!session) return null;

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200 flex justify-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Image
            src="/yappa.png"
            alt="Yappa Logo"
            width={37}
            height={37}
            className="object-contain"
          />
          <h1 className="text-xl font-bold font-space-grotesk tracking-wider text-black">Yappa</h1>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link 
              href="/learn" 
              className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <span>Learn</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/try" 
              className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <span>Try</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/about" 
              className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <span>About</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Account Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session.user?.email}
              </p>
            </div>
            <span className="text-gray-400">▼</span>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-lg shadow-lg border border-gray-200">
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 