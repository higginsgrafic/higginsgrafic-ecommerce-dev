import React from 'react';
import CartIcon from '@/components/ui/CartIcon';
import SizeButton from '@/components/ui/SizeButton';

const TDP_CARD_WIDTH = 350;
const TDP_CARD_HEIGHT = (TDP_CARD_WIDTH * 2130) / 1538;
const TDP_TEXT_COLOR = '#475059';
const TDP_TITLE_COLOR = 'rgba(71, 80, 89, 0.88)';
const TDP_DESCRIPTION_COLOR = 'rgba(71, 80, 89, 0.72)';
const TDP_WHITE_RECT_STYLE = { left: '21.111px', top: '-20px', width: '307.778px', bottom: '21.294px', borderRadius: '0px' };
const TDP_GRAY_RECT_STYLE = { left: '20.611px', top: '-20.5px', width: '308.778px', bottom: '20.794px', borderRadius: '0px' };

function ProductTdpCard({
  title = 'NCC-1701',
  description = '',
  imageSrc,
  imageAlt = title,
  frameImageSrc,
  frameImageAlt = '',
  frameImageStyle,
  price = '15,50',
  currency = '€',
  sizes = ['S', 'M', 'L', 'XL', 'XXL'],
  selectedSize = 'M',
  cartCount = 0,
  onSizeChange,
  onAddToCart,
  className = ''
}) {
  return (
    <div className={`relative shrink-0 overflow-visible ${className}`} style={{ width: `${TDP_CARD_WIDTH}px`, height: `${TDP_CARD_HEIGHT}px` }}>
      <div
        className="absolute bg-background"
        style={{ ...TDP_WHITE_RECT_STYLE, zIndex: 0 }}
      />
      {frameImageSrc ? (
        <div
          className="pointer-events-none absolute overflow-hidden"
          style={{ ...TDP_GRAY_RECT_STYLE, zIndex: 1 }}
        >
          <img
            src={frameImageSrc}
            alt={frameImageAlt}
            className="h-full w-full object-cover"
            style={frameImageStyle}
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : (
        <div
          className="pointer-events-none absolute bg-transparent"
          style={{ ...TDP_GRAY_RECT_STYLE, outline: '2px solid #F9FAFB', zIndex: 1 }}
        />
      )}
      <img
        src={imageSrc}
        alt={imageAlt}
        className="absolute left-1/2 top-[0px] -translate-x-1/2 object-contain"
        style={{
          zIndex: 2,
          width: '267.778px',
          opacity: 0.85
        }}
        loading="lazy"
        decoding="async"
      />
      <div
        className="absolute left-1/2 grid -translate-x-1/2 grid-cols-5"
        style={{
          bottom: 'calc(4.6% + 19px)',
          zIndex: 2,
          width: '265.355px',
          gap: '5px'
        }}
      >
        {sizes.map((size) => (
          <div
            key={size}
            className="overflow-hidden"
            style={{
              height: 'calc(100% - 0.5px)',
              width: 'calc(100% + 1px)',
              marginLeft: '-0.5px',
              marginRight: '-0.5px'
            }}
          >
            <SizeButton
              size={size}
              selected={selectedSize === size}
              onClick={() => onSizeChange?.(size)}
              className={`${selectedSize === size ? '!font-bold !bg-[#475059]' : '!font-light !bg-muted'}`}
              labelClassName={`${selectedSize === size ? '!text-whiteStrong' : '!text-[#475059] group-hover:!text-muted-foreground'} text-[calc(clamp(0.75rem,3.2vw,1.25rem)-0.1667rem)]`}
            />
          </div>
        ))}
      </div>
      <div
        className="absolute left-1/2 grid -translate-x-1/2 grid-cols-5 items-center"
        style={{
          bottom: 'calc(4.6% + 63px)',
          zIndex: 2,
          width: '265.355px',
          gap: '5px'
        }}
      >
        <span
          className="relative inline-flex justify-self-center font-oswald font-light leading-none"
          style={{ color: TDP_TEXT_COLOR, fontSize: '23.67px', transform: 'translateY(2px)', width: '4ch', justifyContent: 'center' }}
        >
          <span>{price}</span>
          <span className="absolute left-full">{currency}</span>
        </span>
        <div className="col-start-5 justify-self-center" style={{ transform: 'translateY(6.5px) scale(1.25)', transformOrigin: 'bottom center' }}>
          <CartIcon
            count={cartCount}
            onClick={onAddToCart}
            iconSize="21px"
            className="!bg-transparent !text-[#475059]"
          />
        </div>
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 overflow-hidden font-roboto font-light"
        style={{
          bottom: 'calc(4.6% + 102px + 9pt + 1px - 6pt)',
          color: TDP_DESCRIPTION_COLOR,
          zIndex: 2,
          width: '265.355px',
          height: '36pt',
          fontSize: '10pt',
          lineHeight: '12pt'
        }}
      >
        {description}
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 text-center font-oswald font-normal uppercase leading-none"
        style={{
          bottom: 'calc(4.6% + 102px + 9pt + 1px - 6pt + 56px)',
          color: TDP_TITLE_COLOR,
          zIndex: 2,
          width: '265.355px',
          fontSize: '14pt'
        }}
      >
        {title}
      </div>
    </div>
  );
}

export default ProductTdpCard;
