// src/ui-components/Selector.js
import React from 'react';

const Selector = ({ title, options, labels, onChange, selectedOption, disabledOptions = [], defaultSelected = '', name }) => {
  return (
    <div className="react-selector">
      {title && <h3 className="react-selector-header">{title}</h3>}
      <div className="react-selector-options">
        {options.map((option, index) => (
          <label key={index} className={`react-selector-option ${disabledOptions.includes(option) ? 'disabled' : ''}`}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={selectedOption ? selectedOption === option : defaultSelected === option}
              onChange={() => onChange(option)}
              disabled={disabledOptions.includes(option)}
            />
            {labels ? labels[index] : option}
          </label>
        ))}
      </div>
    </div>
  );
};

export default Selector;
