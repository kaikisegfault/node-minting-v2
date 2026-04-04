import React from 'react';
import nodeVideo from './nodeVideo.mp4';

/* TEMPORARY: Static MP4 video instead of dynamic IPFS PNG.
   Original code fetched node image from IPFS based on totalSupply.
   Restore from git history when ready to switch back. */

const NodeImage = () => {
  return (
    <div>
      <video
        src={nodeVideo}
        autoPlay
        loop
        muted
        playsInline
        className="tno-card-custom custom-padding"
        style={{ objectFit: 'contain' }}
      />
    </div>
  );
};

export default NodeImage;