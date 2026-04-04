import React from 'react';

import tnoBronze from '../tno-bronze.png';
import tnoSilver from '../tno-silver.png';
import tnoGold from '../tno-gold.png';
import tnoDiamond from '../tno-diamond.png';

const createTnoCard = (locationId, imageSrc) => {
  return () => (
    <div id={locationId}>
      <img src={imageSrc} alt={`TNO ${locationId}`} className="tno-card-custom custom-padding" />
    </div>
  );
};

// versions
const TnoCard1 = createTnoCard('Location1', tnoBronze);
const TnoCard2 = createTnoCard('Location2', tnoSilver);
const TnoCard3 = createTnoCard('Location3', tnoGold);
const TnoCard4 = createTnoCard('Location4', tnoDiamond);

// passed ID
const TnoCards = ({ id }) => {
  if (id === 'Location1') return <TnoCard1 />;
  if (id === 'Location2') return <TnoCard2 />;
  if (id === 'Location3') return <TnoCard3 />;
  if (id === 'Location4') return <TnoCard4 />;
  // No default case
};

export default TnoCards;