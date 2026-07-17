export interface SchoolProfile {
  id: string;
  name: string;
  mission: string;
  foundedYear: number;
  address: string;
  contactEmail: string;
  contactPhone: string | null;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: string;
  publishedAt: string;
}

export interface PaginatedAnnouncements {
  items: Announcement[];
  total: number;
  page: number;
  limit: number;
}

export interface PublicStats {
  schoolsCount: number;
  studentsCount: number;
  teachersCount: number;
}
