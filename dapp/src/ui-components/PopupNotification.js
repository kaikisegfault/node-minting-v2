// src/ui-components/PopupNotification.js
// src/ui-components/PopupNotification.js
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const PopupNotification = ({ message, onClose }) => {
  useEffect(() => {
    // Disable FullPage.js scrolling when the popup is open
    if (window.fullpage_api) {
      window.fullpage_api.setAllowScrolling(false);
      window.fullpage_api.setKeyboardScrolling(false);
    }

    // Re-enable FullPage.js scrolling when the component unmounts
    return () => {
      if (window.fullpage_api) {
        window.fullpage_api.setAllowScrolling(true);
        window.fullpage_api.setKeyboardScrolling(true);
      }
    };
  }, []);

  const handleOverlayClick = (e) => {
    // Prevent clicks on the overlay from closing the popup
    e.stopPropagation();
  };

  return ReactDOM.createPortal(
    <div className="react-popup-overlay" onClick={handleOverlayClick}>
      <div className="react-popup-content">
        <button className="react-close-button" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
            <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
          </svg>
        </button>
        <div className="react-popup-message">
          {typeof message === 'string' ? message : message}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PopupNotification;
