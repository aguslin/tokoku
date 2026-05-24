export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  zipCode: string;
  isDefault: boolean;
}

export const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    label: 'Rumah',
    name: 'Budi Santoso',
    phone: '+62-812-3456-7890',
    street: 'Jl. Sudirman No. 123, RT 05/RW 03',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    zipCode: '10220',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Kantor',
    name: 'Budi Santoso',
    phone: '+62-856-7890-1234',
    street: 'Jl. Gatot Subroto Kav. 56, Gedung B, Lt. 15',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    zipCode: '12190',
    isDefault: false,
  },
];

export const MOCK_COURIERS = [
  { id: 'jne', name: 'JNE', service: 'REG', est: '2-3 hari', price: 50000 },
  { id: 'jt', name: 'J&T', service: 'Express', est: '1-2 hari', price: 75000 },
  { id: 'sicepat', name: 'SiCepat', service: 'REG', est: '1 hari', price: 100000 },
  { id: 'anteraja', name: 'AnterAja', service: 'Regular', est: '2-4 hari', price: 35000 },
];
