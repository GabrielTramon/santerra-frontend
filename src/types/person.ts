export type Person = {
  id: string;
  name: string;
  nationalId: string | null;
  phoneNumber: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PersonInput = Pick<Person, 'name' | 'nationalId' | 'phoneNumber' | 'email'>;

export type PersonType = 'employee' | 'producer';
