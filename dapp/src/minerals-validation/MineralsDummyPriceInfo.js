import React from 'react';

const MineralsDummyPriceInfo = () => {
  return (
    <div className="price-info-box n">
      <div className="price-info-section">
        <div className="price-info-fixed-price minerals-dummy-note-shape">
          only{' '}
          <a 
            href="https://world.expl.one" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600"
          >
            ONE world
          </a>
          {' '}Validated Blue Minerals can awaken the Mandrills
        </div>
      </div>

      <div className='price-bottom'>
        <p className="price-info-fixed-price"></p>
      </div>
    </div>
  );
};

export default MineralsDummyPriceInfo;