export interface HsnSacItem {
  code: string;
  description: string;
  type: 'goods' | 'services';
  category: string;
  suggestedGstRate?: number;
}

export const HSN_SAC_CATALOGUE: HsnSacItem[] = [
  // Services (SAC - 99 series)
  { code: '998311', description: 'Management consulting and management services', type: 'services', category: 'Professional Services', suggestedGstRate: 18 },
  { code: '998312', description: 'Business consulting services including public relations', type: 'services', category: 'Professional Services', suggestedGstRate: 18 },
  { code: '998313', description: 'Information technology (IT) consulting and support services', type: 'services', category: 'IT & Software', suggestedGstRate: 18 },
  { code: '998314', description: 'Information technology (IT) design and development services', type: 'services', category: 'IT & Software', suggestedGstRate: 18 },
  { code: '998315', description: 'Hosting and information technology infrastructure provisioning services', type: 'services', category: 'IT & Software', suggestedGstRate: 18 },
  { code: '998316', description: 'IT infrastructure and network management services', type: 'services', category: 'IT & Software', suggestedGstRate: 18 },
  { code: '998319', description: 'Other information technology services n.e.c.', type: 'services', category: 'IT & Software', suggestedGstRate: 18 },
  { code: '998361', description: 'Advertising services and provision of advertising space', type: 'services', category: 'Marketing & Advertising', suggestedGstRate: 18 },
  { code: '998362', description: 'Purchase or sale of advertising space or time on commission', type: 'services', category: 'Marketing & Advertising', suggestedGstRate: 18 },
  { code: '998363', description: 'Sale of advertising space in print media (other than commission)', type: 'services', category: 'Marketing & Advertising', suggestedGstRate: 5 },
  { code: '998365', description: 'Market research and public opinion polling services', type: 'services', category: 'Marketing & Advertising', suggestedGstRate: 18 },
  { code: '998391', description: 'Specialty design services including interior design and graphic design', type: 'services', category: 'Creative & Design', suggestedGstRate: 18 },
  { code: '998392', description: 'Design originals and intellectual property design', type: 'services', category: 'Creative & Design', suggestedGstRate: 18 },
  { code: '998397', description: 'Photography, videography and digital imaging services', type: 'services', category: 'Creative & Design', suggestedGstRate: 18 },
  { code: '998221', description: 'Accounting, auditing and bookkeeping services', type: 'services', category: 'Finance & Legal', suggestedGstRate: 18 },
  { code: '998222', description: 'Tax consultancy and preparation services', type: 'services', category: 'Finance & Legal', suggestedGstRate: 18 },
  { code: '998211', description: 'Legal advisory and representation services', type: 'services', category: 'Finance & Legal', suggestedGstRate: 18 },
  { code: '998411', description: 'Telephony and data transmission services', type: 'services', category: 'Telecom', suggestedGstRate: 18 },
  { code: '998412', description: 'Internet access and broadband network services', type: 'services', category: 'Telecom', suggestedGstRate: 18 },
  { code: '998541', description: 'Packaging and labeling services', type: 'services', category: 'Support Services', suggestedGstRate: 18 },
  { code: '998599', description: 'Other support services n.e.c. (virtual assistance, data entry)', type: 'services', category: 'Support Services', suggestedGstRate: 18 },
  { code: '998711', description: 'Maintenance and repair services of fabricated metal products and machinery', type: 'services', category: 'Maintenance & Repair', suggestedGstRate: 18 },
  { code: '998713', description: 'Maintenance and repair services of computers and office equipment', type: 'services', category: 'Maintenance & Repair', suggestedGstRate: 18 },
  { code: '998729', description: 'Maintenance and repair services of other goods', type: 'services', category: 'Maintenance & Repair', suggestedGstRate: 18 },
  { code: '996511', description: 'Road transport services of goods by freight', type: 'services', category: 'Logistics & Transport', suggestedGstRate: 5 },
  { code: '996512', description: 'Courier and express delivery services', type: 'services', category: 'Logistics & Transport', suggestedGstRate: 18 },
  { code: '996719', description: 'Cargo handling and freight forwarding services', type: 'services', category: 'Logistics & Transport', suggestedGstRate: 18 },
  { code: '997212', description: 'Rental or leasing services involving own or leased commercial property', type: 'services', category: 'Real Estate', suggestedGstRate: 18 },
  { code: '995411', description: 'General construction services of buildings', type: 'services', category: 'Construction', suggestedGstRate: 18 },
  { code: '999210', description: 'Commercial training and coaching services', type: 'services', category: 'Education & Training', suggestedGstRate: 18 },
  { code: '999611', description: 'Event management and convention organization services', type: 'services', category: 'Events & Hospitality', suggestedGstRate: 18 },
  { code: '996331', description: 'Restaurant, catering and food delivery services', type: 'services', category: 'Events & Hospitality', suggestedGstRate: 5 },

  // Goods (HSN)
  { code: '8471', description: 'Automatic data processing machines, computers, laptops, storage units', type: 'goods', category: 'Electronics & Computers', suggestedGstRate: 18 },
  { code: '847130', description: 'Portable automatic data processing machines (Laptops, tablets)', type: 'goods', category: 'Electronics & Computers', suggestedGstRate: 18 },
  { code: '847170', description: 'Storage units (Hard drives, SSDs, USB flash drives)', type: 'goods', category: 'Electronics & Computers', suggestedGstRate: 18 },
  { code: '8443', description: 'Printers, copying machines, facsimile machines and parts', type: 'goods', category: 'Electronics & Computers', suggestedGstRate: 18 },
  { code: '8517', description: 'Smartphones, mobile phones, routers, modems and networking apparatus', type: 'goods', category: 'Electronics & Telecom', suggestedGstRate: 18 },
  { code: '8528', description: 'Monitors, projectors, television receivers', type: 'goods', category: 'Electronics & Telecom', suggestedGstRate: 18 },
  { code: '8504', description: 'Electrical transformers, static converters (UPS, Inverters, Chargers)', type: 'goods', category: 'Electrical Equipment', suggestedGstRate: 18 },
  { code: '8544', description: 'Insulated wire, cables, optical fiber cables', type: 'goods', category: 'Electrical Equipment', suggestedGstRate: 18 },
  { code: '9403', description: 'Office furniture, wooden furniture, metal furniture', type: 'goods', category: 'Furniture & Fixtures', suggestedGstRate: 18 },
  { code: '4820', description: 'Registers, account books, notebooks, stationery paper items', type: 'goods', category: 'Paper & Stationery', suggestedGstRate: 18 },
  { code: '4802', description: 'Uncoated paper for writing, printing or photocopying', type: 'goods', category: 'Paper & Stationery', suggestedGstRate: 12 },
  { code: '9608', description: 'Ball point pens, felt tipped pens, markers', type: 'goods', category: 'Paper & Stationery', suggestedGstRate: 18 },
  { code: '6109', description: 'T-shirts, singlets and other vests, knitted or crocheted', type: 'goods', category: 'Textiles & Garments', suggestedGstRate: 5 },
  { code: '6203', description: 'Men’s or boys’ suits, trousers, blazers, jackets', type: 'goods', category: 'Textiles & Garments', suggestedGstRate: 12 },
  { code: '6403', description: 'Footwear with outer soles of rubber, plastics, leather', type: 'goods', category: 'Footwear', suggestedGstRate: 18 },
  { code: '3004', description: 'Medicaments consisting of mixed or unmixed products for therapeutic use', type: 'goods', category: 'Pharmaceuticals', suggestedGstRate: 12 },
  { code: '3304', description: 'Beauty or make-up preparations and skincare products', type: 'goods', category: 'Cosmetics', suggestedGstRate: 18 },
  { code: '3401', description: 'Soap, organic surface-active products and washing preparations', type: 'goods', category: 'FMCG & Hygiene', suggestedGstRate: 18 },
  { code: '2106', description: 'Food preparations n.e.c., health supplements, packaged snacks', type: 'goods', category: 'Food & Groceries', suggestedGstRate: 18 },
  { code: '1905', description: 'Bread, pastry, cakes, biscuits, wafers', type: 'goods', category: 'Food & Groceries', suggestedGstRate: 18 },
  { code: '0902', description: 'Tea, whether or not flavored', type: 'goods', category: 'Food & Groceries', suggestedGstRate: 5 },
  { code: '0901', description: 'Coffee, whether or not roasted or decaffeinated', type: 'goods', category: 'Food & Groceries', suggestedGstRate: 5 },
  { code: '7326', description: 'Other articles of iron or steel', type: 'goods', category: 'Metals & Hardware', suggestedGstRate: 18 },
  { code: '8708', description: 'Parts and accessories of motor vehicles', type: 'goods', category: 'Automotive', suggestedGstRate: 28 },
  { code: '3923', description: 'Articles for the conveyance or packing of goods, of plastics (Boxes, bags)', type: 'goods', category: 'Packaging Materials', suggestedGstRate: 18 },
  { code: '4819', description: 'Cartons, boxes, cases, bags of paper or paperboard', type: 'goods', category: 'Packaging Materials', suggestedGstRate: 18 }
];

export function searchHsnSac(query: string): HsnSacItem[] {
  if (!query || query.trim() === '') return HSN_SAC_CATALOGUE.slice(0, 15);
  const q = query.toLowerCase().trim();
  return HSN_SAC_CATALOGUE.filter(
    (item) =>
      item.code.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
  );
}
