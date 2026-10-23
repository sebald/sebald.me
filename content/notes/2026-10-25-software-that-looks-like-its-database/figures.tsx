import type { PropsWithChildren } from 'react';

import { Figure } from '@/ui/figure';
import { Text } from '@/ui/text';

// Drawing helpers
// ---------------
// Each panel is drawn in its own fixed coordinate space and scales with the
// column. Font sizes are user units, so the text scales with the drawing.

interface PanelProps extends PropsWithChildren {
  label: string;
  width: number;
  height: number;
  /**
   * What the drawing shows, read out instead of it
   */
  alt: string;
}

const Panel = ({ label, width, height, alt, children }: PanelProps) => (
  <div className="grid gap-2">
    <Text as="span" size="caption" variant="muted">
      {label}
    </Text>
    {/* A described inline drawing is an image, there is no `img` tag for it */}
    {/* oxlint-disable jsx-a11y/prefer-tag-over-role */}
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={alt}
      className="h-auto w-full"
    >
      {children}
    </svg>
    {/* oxlint-enable jsx-a11y/prefer-tag-over-role */}
  </div>
);

const Panels = ({ children }: PropsWithChildren) => (
  <div className="grid items-start gap-8 sm:grid-cols-2 sm:gap-6">
    {children}
  </div>
);

interface CardProps extends PropsWithChildren {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
}

const Card = ({ x, y, width, height, title, children }: CardProps) => (
  <g>
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={8}
      className="fill-mist-800 stroke-mist-700"
    />
    <text x={x + 16} y={y + 24} fontSize={13} className="fill-mist-100">
      {title}
    </text>
    {children}
  </g>
);

interface InputProps {
  x: number;
  y: number;
  width: number;
  value: string;
  highlight?: boolean;
}

const Input = ({ x, y, width, value, highlight }: InputProps) => (
  <g>
    <rect
      x={x}
      y={y}
      width={width}
      height={22}
      rx={4}
      className={
        highlight
          ? 'fill-mist-900 stroke-highlight'
          : 'fill-mist-900 stroke-mist-600'
      }
    />
    <text x={x + 8} y={y + 15} fontSize={11} className="fill-mist-200">
      {value}
    </text>
  </g>
);

interface FieldProps extends InputProps {
  label: string;
}

const Field = ({ label, x, y, ...input }: FieldProps) => (
  <g>
    <text x={x} y={y} fontSize={10} className="fill-mist-400">
      {label}
    </text>
    <Input x={x} y={y + 6} {...input} />
  </g>
);

const SIZES = ['250 g', '500 g', '1 kg'];
const STANDARD = ['9.50', '17.00', '30.00'];

// New bean form
// ---------------
// Only the field above the prices is kept, the comparison is in the part below
export const PriceListFormFigure = () => (
  <Figure caption="The form she expected and the one she got.">
    <Panels>
      <Panel
        label="What she wanted"
        width={340}
        height={196}
        alt="A new bean form with a name field and three price fields for 250 g, 500 g and 1 kg right below."
      >
        <Card x={8} y={8} width={324} height={180} title="New bean">
          <Field x={24} y={52} width={292} label="Name" value="Guji Highland" />
          <text x={24} y={92} fontSize={10} className="fill-mist-400">
            Prices
          </text>
          {SIZES.map((size, i) => (
            <g key={size}>
              <text
                x={24}
                y={113 + i * 28}
                fontSize={11}
                className="fill-mist-300"
              >
                {size}
              </text>
              <Input
                x={90}
                y={98 + i * 28}
                width={80}
                value={STANDARD[i]}
                highlight
              />
            </g>
          ))}
        </Card>
      </Panel>

      <Panel
        label="What she got"
        width={340}
        height={304}
        alt="The same form, but instead of prices a dropdown of price list names: Standard, Standard (old) and 2025 list. An arrow leads to a separate price lists page, where the Standard list holds the prices."
      >
        <Card x={8} y={8} width={324} height={196} title="New bean">
          <Field x={24} y={52} width={292} label="Name" value="Guji Highland" />
          <Field
            x={24}
            y={92}
            width={160}
            label="Price list"
            value="Standard"
          />
          <path d="M166 107 h8 l-4 5 z" className="fill-mist-400" />
          {/* The open dropdown */}
          <rect
            x={24}
            y={124}
            width={160}
            height={66}
            rx={4}
            className="fill-mist-900 stroke-mist-600"
          />
          {['Standard', 'Standard (old)', '2025 list'].map((name, i) => (
            <text
              key={name}
              x={32}
              y={140 + i * 18}
              fontSize={11}
              className="fill-mist-200"
            >
              {name}
            </text>
          ))}
        </Card>

        {/* The side quest */}
        <path
          d="M104 190 V 226"
          strokeDasharray="3 3"
          className="stroke-mist-500"
        />
        <path d="M99 226 H 109 L 104 234 Z" className="fill-mist-500" />

        <Card x={8} y={238} width={324} height={60} title="Price lists">
          {SIZES.map((size, i) => (
            <text
              key={size}
              x={190 + i * 60}
              y={262}
              fontSize={10}
              textAnchor="middle"
              className="fill-mist-400"
            >
              {size}
            </text>
          ))}
          <text x={24} y={282} fontSize={11} className="fill-mist-300">
            Standard
          </text>
          {STANDARD.map((price, i) => (
            <text
              key={i}
              x={190 + i * 60}
              y={282}
              fontSize={11}
              textAnchor="middle"
              className="fill-highlight"
            >
              {price}
            </text>
          ))}
        </Card>
      </Panel>
    </Panels>
  </Figure>
);

// Beans and price lists
// ---------------
// One bean a month, a bag in a cubby each, like the header
const BEANS = Array.from({ length: 12 }, (_, i) => i);
const BEAN = { width: 24, height: 26, gap: 4, y: 8 };
const beanX = (i: number) => 4 + i * (BEAN.width + BEAN.gap);
const beanCenter = (i: number) => beanX(i) + BEAN.width / 2;
const beanBottom = BEAN.y + BEAN.height;
const LIST = { width: 120, height: 68, y: 112 };

interface BeansProps {
  /**
   * Index of the bean drawn in the highlight colour
   */
  highlight?: number;
}

const Beans = ({ highlight }: BeansProps) =>
  BEANS.map(i => {
    const active = i === highlight;
    const x = beanX(i);
    const y = BEAN.y;
    return (
      <g key={i}>
        <rect
          x={x}
          y={y}
          width={BEAN.width}
          height={BEAN.height}
          rx={4}
          className={
            active
              ? 'fill-highlight/15 stroke-highlight'
              : 'fill-mist-800 stroke-mist-600'
          }
        />
        {/* The bag: a folded top over a rounded body */}
        <rect
          x={x + 9}
          y={y + 5}
          width={6}
          height={4}
          rx={1}
          className={active ? 'fill-highlight' : 'fill-mist-500'}
        />
        <path
          d={`M${x + 6} ${y + 11} q0 -2 2 -2 h8 q2 0 2 2 v9 q0 2 -2 2 h-8 q-2 0 -2 -2 z`}
          className={active ? 'fill-highlight' : 'fill-mist-500'}
        />
      </g>
    );
  });

interface LinksProps {
  /**
   * Beans linked to the list at `to`
   */
  beans: number[];
  to: number;
  highlight?: boolean;
}

const Links = ({ beans, to, highlight }: LinksProps) =>
  beans.map(i => (
    <line
      key={i}
      x1={beanCenter(i)}
      y1={beanBottom}
      x2={to}
      y2={LIST.y}
      strokeWidth={highlight ? 1.5 : 1}
      className={highlight ? 'stroke-highlight' : 'stroke-mist-600'}
    />
  ));

interface PriceListProps {
  x: number;
  name: string;
  prices: string[];
  highlight?: boolean;
}

const PriceList = ({ x, name, prices, highlight }: PriceListProps) => (
  <g>
    <rect
      x={x}
      y={LIST.y}
      width={LIST.width}
      height={LIST.height}
      rx={6}
      className={
        highlight
          ? 'fill-mist-800 stroke-highlight'
          : 'fill-mist-800 stroke-mist-600'
      }
    />
    <text
      x={x + LIST.width / 2}
      y={LIST.y + 18}
      fontSize={11}
      textAnchor="middle"
      className="fill-mist-100"
    >
      {name}
    </text>
    {SIZES.map((size, i) => (
      <g key={size}>
        <text
          x={x + 14}
          y={LIST.y + 36 + i * 14}
          fontSize={10}
          className="fill-mist-400"
        >
          {size}
        </text>
        <text
          x={x + LIST.width - 14}
          y={LIST.y + 36 + i * 14}
          fontSize={10}
          textAnchor="end"
          className={highlight ? 'fill-highlight' : 'fill-mist-200'}
        >
          {prices[i]}
        </text>
      </g>
    ))}
  </g>
);

// This month's bean, the one that goes on its own list
const THIS_MONTH = 9;

export const PriceListLinksFigure = () => (
  <Figure>
    <Panels>
      <Panel
        label="One price list for every bean"
        width={340}
        height={190}
        alt="Twelve bags of beans in a row, each with a line to the same price list called Standard."
      >
        <Links beans={BEANS} to={170} />
        <Beans />
        <PriceList x={110} name="Standard" prices={STANDARD} />
      </Panel>

      <Panel
        label="One bean at its own price"
        width={340}
        height={190}
        alt="The same twelve bags. Eleven still link to Standard, one links to a second list, Standard (air), with higher prices."
      >
        <Links beans={BEANS.filter(i => i !== THIS_MONTH)} to={96} />
        <Links beans={[THIS_MONTH]} to={250} highlight />
        <Beans highlight={THIS_MONTH} />
        <PriceList x={36} name="Standard" prices={STANDARD} />
        <PriceList
          x={190}
          name="Standard (air)"
          prices={['11.50', '21.00', '38.00']}
          highlight
        />
      </Panel>
    </Panels>
  </Figure>
);
