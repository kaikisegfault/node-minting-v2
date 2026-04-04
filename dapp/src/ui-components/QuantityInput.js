import React, { useState, useEffect, useRef } from 'react';

const QuantityInput = ({ maxQuantity, onQuantityChange }) => {
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState('1');
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(quantity.toString());
    onQuantityChange(quantity);
  }, [quantity, onQuantityChange]);

  const handleIncrease = () => {
    setQuantity(prevQuantity => Math.min(prevQuantity + 1, maxQuantity));
  };

  const handleDecrease = () => {
    setQuantity(prevQuantity => Math.max(prevQuantity - 1, 1));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;

    if (/^\d*$/.test(value) && (value === '' || parseInt(value, 10) <= maxQuantity * 10)) {
      setInputValue(value);

      const parsedValue = parseInt(value, 10);
      if (!isNaN(parsedValue)) {
        setQuantity(Math.min(parsedValue, maxQuantity));
      } else {
        setQuantity(0);
      }
    }
  };

  const adjustQuantity = () => {
    const adjustedQuantity = Math.min(Math.max(parseInt(inputValue, 10) || 0, 1), maxQuantity);
    setQuantity(adjustedQuantity);
    setInputValue(adjustedQuantity.toString());
  };

  const handleBlur = () => {
    adjustQuantity();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adjustQuantity();
      inputRef.current.blur();
    }
  };

  return (
    <div className="react-quantity-input-container">
      <button
        className="react-quantity-button react-quantity-decrease"
        onClick={handleDecrease}
        disabled={quantity <= 1}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M416 208H32c-17.7 0-32 14.3-32 32v32c0 17.7 14.3 32 32 32h384c17.7 0 32-14.3 32-32v-32c0-17.7-14.3-32-32-32z" /></svg>
      </button>
      <input
        ref={inputRef}
        type="text"
        className="react-quantity-input"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        min="1"
        max={maxQuantity * 10}
        pattern="\d*"
        inputMode="numeric"
      />
      <button
        className="react-quantity-button react-quantity-increase"
        onClick={handleIncrease}
        disabled={quantity >= maxQuantity}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M416 208H272V64c0-17.7-14.3-32-32-32h-32c-17.7 0-32 14.3-32 32v144H32c-17.7 0-32 14.3-32 32v32c0 17.7 14.3 32 32 32h144v144c0 17.7 14.3 32 32 32h32c17.7 0 32-14.3 32-32V304h144c17.7 0 32-14.3 32-32v-32c0-17.7-14.3-32-32-32z" /></svg>
      </button>
    </div>
  );
};

export default QuantityInput;