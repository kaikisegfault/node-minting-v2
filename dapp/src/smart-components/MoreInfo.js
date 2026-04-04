import React from 'react';

const MoreInfo = () => {
  return (
    <div className="more-info">
      <i className="more-info-text">*to learn more visit </i>
      <i className="more-info-text-small">*learn more: </i>
      <a 
        href="https://docs.expl.one/"
        target="_blank"
        rel="noreferrer"
        className="more-info-link"
      >
        <span className="more-info-text documentation-link">documentation</span>
        <span className="more-info-text-small documentation-link">documentation</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{ width: '1em', height: '1em', verticalAlign: 'middle', marginLeft: '0.2em' }}>
          <path d="M432 320H400a16 16 0 0 0 -16 16V448H64V128H208a16 16 0 0 0 16-16V80a16 16 0 0 0 -16-16H48A48 48 0 0 0 0 112V464a48 48 0 0 0 48 48H400a48 48 0 0 0 48-48V336A16 16 0 0 0 432 320zM488 0h-128c-21.4 0-32.1 25.9-17 41l35.7 35.7L135 320.4a24 24 0 0 0 0 34L157.7 377a24 24 0 0 0 34 0L435.3 133.3 471 169c15 15 41 4.5 41-17V24A24 24 0 0 0 488 0z" />
        </svg>
      </a>
    </div>
  );
};

export default MoreInfo;