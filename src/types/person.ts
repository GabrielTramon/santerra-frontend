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

// A pessoa não tem campo de tipo: ela é funcionário ou produtor pelo vínculo em /employees ou /producers.
export type PersonType = 'employee' | 'producer';
