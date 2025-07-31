import { blgvCompanyConfig } from "@/config/companies/blgv";
import { h100CompanyConfig } from "@/config/companies/h100";
import { lqwdCompanyConfig } from "@/config/companies/lqwd";
import { metaplanetCompanyConfig } from "@/config/companies/metaplanet";
import { Company } from "../types";

export const companies: Company[] = [
  blgvCompanyConfig,
  h100CompanyConfig,
  lqwdCompanyConfig,
  metaplanetCompanyConfig,
];

export const getCompanyById = (id: string): Company | undefined => {
  return companies.find((company) => company.id === id);
};
