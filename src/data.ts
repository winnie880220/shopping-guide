import { Category, Product } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'mattress',
    name: '床墊',
    description: '專業支撐，舒適入眠',
    image: '/src/assets/images/mattress_double_1779274923685.png',
  },
  {
    id: 'sofas',
    name: '沙發',
    description: '居家生活的放鬆核心',
    image: '/src/assets/images/living_room_inspiration_1779274975609.png',
  },
  {
    id: 'chairs',
    name: '椅子與餐椅',
    description: '兼具美感與人體工學',
    image: '/src/assets/images/nordic_chair_white_bg_1779277500873.png',
  },
  {
    id: 'coffee-tables',
    name: '茶几與邊桌',
    description: '客廳美學的靈魂角色',
    image: '/src/assets/images/coffee_table_wood_1779274939585.png',
  },
  {
    id: 'dining-tables',
    name: '餐桌',
    description: '相聚時光的溫潤陪伴',
    image: '/src/assets/images/dining_table_white_bg_1779277518370.png',
  },
  {
    id: 'lighting',
    name: '燈具',
    description: '氣氛與光影的完美調和',
    image: '/src/assets/images/side_table_modern_1779274959832.png',
  },
  {
    id: 'desks',
    name: '書桌與辦公',
    description: '激發靈感的創意空間',
    image: '/src/assets/images/bedroom_inspiration_1779274993139.png',
  },
  {
    id: 'storage',
    name: '衣櫃與收納',
    description: '秩序感的北歐收納哲學',
    image: '/src/assets/images/mattress_double_1779274923685.png',
  },
  {
    id: 'rugs',
    name: '地毯',
    description: '腳尖上的柔軟觸感',
    image: '/src/assets/images/nordic_rug_white_bg_1779277550962.png',
  },
  {
    id: 'decor',
    name: '家飾配件',
    description: '點亮空間的驚喜細節',
    image: '/src/assets/images/minimalist_vase_white_bg_1779277533786.png',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'm1',
    name: 'VALEVÅG 獨立筒彈簧床墊',
    categoryId: 'mattress',
    price: 8900,
    description: '這張獨立筒彈簧床墊能為身體提供絕佳支撐，讓你整晚舒心好眠。',
    image: '/src/assets/images/mattress_double_1779274923685.png',
    details: [
      '適合雙人使用',
      '偏硬支撐',
      '獨立筒彈簧，減少翻身干擾',
    ],
    specs: [
      { label: '尺寸', value: '150x200 公分 (雙人)' },
      { label: '材質', value: '鋼鐵, 聚氨酯泡棉' },
      { label: '軟硬度', value: '偏硬' },
    ],
    stock: [
      { location: '內湖店', status: 'in-stock' },
      { location: '新莊店', status: 'in-stock' },
    ],
    tags: ['偏硬支撐', '適合雙人'],
    sizeDisplay: '雙人',
    material: '獨立筒彈簧',
    aiReason: '偏硬支撐，呵護脊椎',
  },
  {
    id: 'm2',
    name: 'ÅKREHAMN 泡棉床墊',
    categoryId: 'mattress',
    price: 12900,
    description: '三層不同密度的泡棉，提供溫和的支撐感。',
    image: '/src/assets/images/mattress_double_1779274923685.png', // Reusing same generic mattress image
    details: [
      '絕佳支撐感',
      '適合偏好泡棉質感者',
      '易於拆洗床罩',
    ],
    specs: [
      { label: '尺寸', value: '150x200 公分 (雙人)' },
      { label: '材質', value: '高彈性泡棉' },
      { label: '軟硬度', value: '適中' },
    ],
    stock: [
      { location: '內湖店', status: 'low-stock' },
    ],
    tags: ['泡棉', '絕佳支撐'],
    sizeDisplay: '雙人',
    material: '泡棉',
    aiReason: '包覆感佳，放鬆肌肉',
  },
  {
    id: 'c1',
    name: 'LACK 咖啡桌',
    categoryId: 'coffee-tables',
    price: 499,
    description: '輕便且堅固，這款簡約的咖啡桌適合任何空間。',
    image: '/src/assets/images/coffee_table_wood_1779274939585.png',
    details: [
      '適合小客廳',
      '易於組裝',
      '極簡設計',
    ],
    specs: [
      { label: '尺寸', value: '90x55 公分' },
      { label: '材質', value: '纖維板, 壓克力漆' },
    ],
    stock: [
      { location: '內湖店', status: 'in-stock' },
    ],
    tags: ['適合小客廳', '熱銷款'],
    sizeDisplay: '中',
    material: '木質',
    aiReason: '適合小客廳，桌面耐磨',
  },
  {
    id: 'c2',
    name: 'GLADOM 托盤桌',
    categoryId: 'coffee-tables',
    price: 399,
    description: '靈巧的設計，桌面可拆下作為托盤使用。',
    image: '/src/assets/images/side_table_modern_1779274959832.png',
    details: [
      '桌面可作為托盤',
      '現代簡約風格',
      '多功能用途',
    ],
    specs: [
      { label: '尺寸', value: '45x53 公分' },
      { label: '材質', value: '鋼鐵, 環氧粉末塗料' },
    ],
    stock: [
      { location: '內湖店', status: 'in-stock' },
    ],
    tags: ['現代簡約', '多功能'],
    sizeDisplay: '小',
    material: '金屬',
    aiReason: '多功能用途，輕型便利',
  },
];
