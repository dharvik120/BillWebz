export const countriesList = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'OTHER', name: 'Other / None' }
];

export const statesByCountry: Record<string, string[]> = {
  IN: [
    'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 
    'Uttar Pradesh', 'West Bengal', 'Telangana', 'Rajasthan', 'Bihar', 
    'Punjab', 'Haryana', 'Madhya Pradesh', 'Kerala', 'Andhra Pradesh', 
    'Assam', 'Chhattisgarh', 'Jharkhand', 'Odisha', 'Uttarakhand', 
    'Himachal Pradesh', 'Jammu & Kashmir', 'Goa', 'NONE'
  ],
  US: [
    'California', 'New York', 'Texas', 'Florida', 'Illinois', 
    'Pennsylvania', 'Ohio', 'Georgia', 'North Carolina', 'Michigan', 'NONE'
  ],
  GB: [
    'England', 'Scotland', 'Wales', 'Northern Ireland', 'NONE'
  ],
  AE: [
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 
    'Ras Al Khaimah', 'Fujairah', 'NONE'
  ],
  CA: [
    'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 
    'Saskatchewan', 'Nova Scotia', 'NONE'
  ],
  AU: [
    'New South Wales', 'Victoria', 'Queensland', 'Western Australia', 
    'South Australia', 'Tasmania', 'NONE'
  ],
  OTHER: [
    'NONE'
  ]
};

// Fallback states list (combination of all popular states) for general default initialization
export const fallbackStates = statesByCountry.IN;
