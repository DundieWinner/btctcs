import { blgvCompanyConfig } from "@/config/companies/blgv";
import { h100CompanyConfig } from "@/config/companies/h100";
import { metaplanetCompanyConfig } from "@/config/companies/metaplanet";
import { Company } from "../types";
import { coinsiliumCompanyConfig } from "@/config/companies/coinsilium";
import { locateCompanyConfig } from "@/config/companies/locate";
import { sequansCompanyConfig } from "@/config/companies/sequans";

export const companies: Company[] = [
  blgvCompanyConfig,
  coinsiliumCompanyConfig,
  h100CompanyConfig,
  metaplanetCompanyConfig,
  locateCompanyConfig,
  sequansCompanyConfig,
];

export const getCompanyById = (id: string): Company | undefined => {
  return companies.find((company) => company.id === id);
};
