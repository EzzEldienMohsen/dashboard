export interface SchoolProfile {
  id: string;
  name: string;
  nameAr: string | null;
  mission: string;
  missionAr: string | null;
  foundedYear: number;
  address: string;
  contactEmail: string;
  contactPhone: string | null;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  titleAr: string | null;
  body: string;
  bodyAr: string | null;
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

export interface Creator {
  id: string;
  name: string;
  nameAr: string | null;
  role: string;
  roleAr: string | null;
  bio: string;
  bioAr: string | null;
  skills: string[];
  email: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  updatedAt: string;
}
