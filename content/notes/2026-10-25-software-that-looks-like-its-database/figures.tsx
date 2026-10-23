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

// The three fields both forms share
const BeanFields = () => (
  <>
    <Field x={24} y={52} width={292} label="Name" value="Guji Highland" />
    <Field x={24} y={92} width={292} label="Origin" value="Ethiopia" />
    <Field
      x={24}
      y={132}
      width={292}
      label="Tasting notes"
      value="Blueberry, jasmine"
    />
  </>
);

const SIZES = ['250 g', '500 g', '1 kg'];

// New bean form
// ---------------
export const PriceListFormFigure = () => (
  <Figure caption="The form she expected and the one she got. Products and prices are two tables, so the prices live on another page and the form only knows the lists by name.">
    <Panels>
      <Panel
        label="What she wanted"
        width={340}
        height={300}
        alt="A new bean form with name, origin and tasting notes, and three price fields for 250 g, 500 g and 1 kg right below."
      >
        <Card x={8} y={8} width={324} height={284} title="New bean">
          <BeanFields />
          <text x={24} y={172} fontSize={10} className="fill-mist-400">
            Prices
          </text>
          {[
            ['250 g', '9.50'],
            ['500 g', '17.00'],
            ['1 kg', '30.00'],
          ].map(([size, price], i) => (
            <g key={size}>
              <text
                x={24}
                y={193 + i * 28}
                fontSize={11}
                className="fill-mist-300"
              >
                {size}
              </text>
              <Input
                x={90}
                y={178 + i * 28}
                width={80}
                value={price}
                highlight
              />
            </g>
          ))}
        </Card>
      </Panel>

      <Panel
        label="What she got"
        width={340}
        height={430}
        alt="The same form, but instead of prices a dropdown of price list names: Standard, Standard (old) and 2025 list. An arrow leads to a separate price lists page, where the prices behind each name are listed."
      >
        <Card x={8} y={8} width={324} height={284} title="New bean">
          <BeanFields />
          <Field
            x={24}
            y={172}
            width={160}
            label="Price list"
            value="Standard"
          />
          <path d="M166 187 h8 l-4 5 z" className="fill-mist-400" />
          {/* The open dropdown */}
          <rect
            x={24}
            y={204}
            width={160}
            height={66}
            rx={4}
            className="fill-mist-900 stroke-mist-600"
          />
          {['Standard', 'Standard (old)', '2025 list'].map((name, i) => (
            <text
              key={name}
              x={32}
              y={220 + i * 18}
              fontSize={11}
              className="fill-mist-200"
            >
              {name}
            </text>
          ))}
        </Card>

        {/* The side quest */}
        <path
          d="M104 270 V 306"
          strokeDasharray="3 3"
          className="stroke-mist-500"
        />
        <path d="M99 306 H 109 L 104 314 Z" className="fill-mist-500" />

        <Card x={8} y={318} width={324} height={104} title="Price lists">
          {SIZES.map((size, i) => (
            <text
              key={size}
              x={190 + i * 60}
              y={354}
              fontSize={10}
              textAnchor="middle"
              className="fill-mist-400"
            >
              {size}
            </text>
          ))}
          {[
            ['Standard', ['9.50', '17.00', '30.00'], true],
            ['Standard (old)', ['9.00', '16.00', '28.00'], false],
            ['2025 list', ['8.50', '15.00', '26.00'], false],
          ].map(([name, prices, highlight], row) => (
            <g key={name as string}>
              <text
                x={24}
                y={374 + row * 18}
                fontSize={11}
                className="fill-mist-300"
              >
                {name as string}
              </text>
              {(prices as string[]).map((price, i) => (
                <text
                  key={i}
                  x={190 + i * 60}
                  y={374 + row * 18}
                  fontSize={11}
                  textAnchor="middle"
                  className={highlight ? 'fill-highlight' : 'fill-mist-200'}
                >
                  {price}
                </text>
              ))}
            </g>
          ))}
        </Card>
      </Panel>
    </Panels>
  </Figure>
);

// Beans and price lists
// ---------------
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const BEAN = { width: 24, height: 26, gap: 4, y: 8 };
const beanX = (i: number) => 4 + i * (BEAN.width + BEAN.gap);
const beanCenter = (i: number) => beanX(i) + BEAN.width / 2;
const beanBottom = BEAN.y + BEAN.height;
const LIST = { width: 120, height: 68, y: 112 };

interface BeansProps {
  /**
   * Index of the month drawn in the highlight colour
   */
  highlight?: number;
}

const Beans = ({ highlight }: BeansProps) =>
  MONTHS.map((month, i) => {
    const active = i === highlight;
    return (
      <g key={month}>
        <rect
          x={beanX(i)}
          y={BEAN.y}
          width={BEAN.width}
          height={BEAN.height}
          rx={4}
          className={
            active
              ? 'fill-highlight/15 stroke-highlight'
              : 'fill-mist-800 stroke-mist-600'
          }
        />
        <text
          x={beanCenter(i)}
          y={BEAN.y + 17}
          fontSize={9}
          textAnchor="middle"
          className={active ? 'fill-highlight' : 'fill-mist-300'}
        >
          {month}
        </text>
      </g>
    );
  });

interface LinksProps {
  /**
   * Months linked to the list at `to`
   */
  months: number[];
  to: number;
  highlight?: boolean;
}

const Links = ({ months, to, highlight }: LinksProps) =>
  months.map(i => (
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

const ALL_MONTHS = MONTHS.map((_, i) => i);
// This month's bean, the one that goes on its own list
const OCTOBER = 9;
const STANDARD = ['9.50', '17.00', '30.00'];

export const PriceListLinksFigure = () => (
  <Figure caption="Every bean links to the same price list, so editing it reprices all twelve. One bean at its own price needs a list of its own.">
    <Panels>
      <Panel
        label="One price list for every bean"
        width={340}
        height={190}
        alt="Twelve bean cards, January to December, each with a line to the same price list called Standard."
      >
        <Links months={ALL_MONTHS} to={170} />
        <Beans />
        <PriceList x={110} name="Standard" prices={STANDARD} />
      </Panel>

      <Panel
        label="One bean at its own price"
        width={340}
        height={190}
        alt="The same twelve beans. Eleven still link to Standard, October links to a second list, Standard (air), with higher prices."
      >
        <Links months={ALL_MONTHS.filter(i => i !== OCTOBER)} to={96} />
        <Links months={[OCTOBER]} to={250} highlight />
        <Beans highlight={OCTOBER} />
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
