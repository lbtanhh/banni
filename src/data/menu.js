/**
 * Menu — gia VND (19 = 19_000). Ten mon phai duy nhat de gop gio.
 * Nhom tieu de dung emoji nhu bang gia.
 */

export const MENU_CATEGORIES = [
  {
    id: "tra-sua",
    title: "\u{1F9CB} TR\u00C0 S\u1EEEA",
    items: [
      {
        name: "Tr\u00E0 s\u1EEFa truy\u1EC1n th\u1ED1ng",
        defaultPrice: 20_000,
        note: "+1 ph\u1EA7n tc \u0111en/tr\u1EAFng",
      },
      {
        name: "Tr\u00E0 s\u1EEFa Olong l\u00E0i",
        defaultPrice: 25_000,
        note: "+1 ph\u1EA7n tc \u0111en/tr\u1EAFng",
      },
      {
        name: "Tr\u00E0 s\u1EEFa g\u1EA1o rang",
        defaultPrice: 25_000,
        note: "+1 ph\u1EA7n tc \u0111en/tr\u1EAFng",
      },
    ],
  },
  {
    id: "latte",
    title: "\u2615 LATTE",
    items: [
      {
        name: "Matcha latte",
        defaultPrice: 25_000,
        note: "TH Milk, S\u1EEFa G\u1EA5u, S\u1EEFa Oatside",
      },
      {
        name: "Cacao latte",
        defaultPrice: 25_000,
        note: "TH Milk, S\u1EEFa G\u1EA5u, S\u1EEFa Oatside",
      },
      {
        name: "S\u1EEFa t\u01B0\u01A1i TC \u0111\u01B0\u1EDDng \u0111en",
        defaultPrice: 25_000,
      },
    ],
  },
  {
    id: "topping",
    title: "\u{1F9CB} TOPPING",
    items: [
      { name: "Tr\u00E2n ch\u00E2u tr\u1EAFng", defaultPrice: 5_000 },
      { name: "Tr\u00E2n ch\u00E2u \u0111en", defaultPrice: 5_000 },
      { name: "Tr\u00E2n ch\u00E2u kh\u00F4ng l\u1ED7", defaultPrice: 7_000 },
      { name: "Th\u1EA1ch matcha", defaultPrice: 5_000 },
      { name: "Th\u1EA1ch cacao", defaultPrice: 5_000 },
      { name: "Kh\u00FAc b\u1EA1ch", defaultPrice: 7_000 },
      { name: "Donut / Ch\u00E2n m\u00E8o", defaultPrice: 7_000 },
    ],
  },
  {
    id: "tra-trai-cay",
    title: "\u{1F379} TR\u00C0 TR\u00C1I C\u00C2Y",
    items: [
      {
        name: "Tr\u00E0 tr\u00E1i c\u00E2y nhi\u1EC7t \u0111\u1EDBi",
        defaultPrice: 25_000,
        note: "+1 ph\u1EA7n tc tr\u1EAFng",
      },
      {
        name: "Tr\u00E0 xo\u00E0i chanh d\u00E2y",
        defaultPrice: 25_000,
        note: "+1 ph\u1EA7n tc tr\u1EAFng",
      },
      {
        name: "Tr\u00E0 m\u0103ng c\u1EA7u",
        defaultPrice: 25_000,
        note: "+1 ph\u1EA7n tc tr\u1EAFng",
      },
      {
        name: "Tr\u00E0 \u0111\u00E0o mi\u1EBFng/\u0111\u1EADm",
        defaultPrice: 25_000,
        note: "+1 ph\u1EA7n tc tr\u1EAFng",
      },
      {
        name: "Tr\u00E0 v\u1EA3i",
        defaultPrice: 25_000,
        note: "+1 ph\u1EA7n tc tr\u1EAFng",
      },
      {
        name: "Tr\u00E0",
        defaultPrice: 25_000,
        note: "+1 ph\u1EA7n tc tr\u1EAFng",
      },
    ],
  },
  {
    id: "soda",
    title: "\u{1F964} SODA",
    items: [
      { name: "Soda chanh", defaultPrice: 25_000 },
      { name: "Soda xo\u00E0i", defaultPrice: 25_000 },
      { name: "Soda d\u00E2u", defaultPrice: 25_000 },
      { name: "Soda vi\u1EC7t qu\u1EA5t", defaultPrice: 25_000 },
    ],
  },
  {
    id: "do-an-vat",
    title: "\u{1F35F} \u0110\u1ED2 \u0102N V\u1EB6T",
    items: [
      {
        name: "B\u00E1nh tr\u00E1ng tr\u1ED9n",
        defaultPrice: 20_000,
        note: "Kho\u1EA3ng 20\u201325k",
      },
      {
        name: "B\u00E1nh tr\u00E1ng cu\u1ED1n",
        defaultPrice: 20_000,
        note: "Kho\u1EA3ng 20\u201325k",
      },
      {
        name: "M\u00EC tr\u1ED9n topping",
        defaultPrice: 20_000,
        note: "Kho\u1EA3ng 15\u201330k",
      },
      {
        name: "C\u00E1 vi\u00EAn chi\u00EAn",
        defaultPrice: 10_000,
        note: "Kho\u1EA3ng 6\u201312k",
      },
    ],
  },
];

export const ALL_MENU_ITEMS = MENU_CATEGORIES.flatMap((c) => c.items);
