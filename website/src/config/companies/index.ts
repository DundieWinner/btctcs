import { blgvCompanyConfig } from "@/config/companies/blgv";
import { h100CompanyConfig } from "@/config/companies/h100";
import { metaplanetCompanyConfig } from "@/config/companies/metaplanet";
import { Company } from "../types";

export const companies: Company[] = [
  blgvCompanyConfig,
  h100CompanyConfig,
  metaplanetCompanyConfig,
];

export const getCompanyById = (id: string): Company | undefined => {
  return companies.find((company) => company.id === id);
};
