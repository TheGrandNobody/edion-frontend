
import React, { useEffect } from 'react';
import Header from '../components/Header';
import Logo from '../components/Logo';
import Search from '../components/Search';
import ActionCards from '../components/ActionCards';
import MainContainer from '../components/MainContainer';

const Index = () => {
  useEffect(() => {
    // Smooth page transition effect on load
    document.body.style.opacity = '0';
    setTimeout(() => {
      document.body.style.transition = 'opacity 0.5s ease';
      document.body.style.opacity = '1';
    }, 100);
    
    return () => {
      document.body.style.opacity = '';
      document.body.style.transition = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="mb-4">
          <Logo />
        </div>
        
        <MainContainer>
          <div className="space-y-6">
            <Search />
            <div className="pt-4">
              <ActionCards />
            </div>
          </div>
        </MainContainer>
      </main>
    </div>
  );
};

export default Index;
